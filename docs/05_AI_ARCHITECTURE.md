# TPMForge — AI Architecture

**Goal:** Free-first LLM strategy on OpenRouter. Zero per-request generation. Deterministic scoring where possible. Rate-limit-proof client.

---

## Design Principles

1. **LLM is a tool, not the product.** Content is pre-generated offline. User requests retrieve, they don't generate.
2. **Deterministic scoring first.** MCQs and rubric math run in code. LLM only maps free-text answers → rubric dimensions.
3. **Free-first, cache-heavy.** OpenRouter free models only. Aggressive caching. Queue + backoff for rate limits.
4. **Graph is the only source of facts.** Agents never invent questions, competencies, or roadmap steps. RAG over graph assets only.
5. **PII acknowledged.** User's own resume data, consent stored. Free-model logging accepted.
6. **Model routing is config, not code.** Swapping a delisted free model = edit YAML, not deploy.

---

## Model Routing Configuration

```yaml
# packages/core/config/models.yaml
# OpenRouter free models only. Centralized. Swap without deploy.

models:
  # High-volume, low-stakes
  resume_mapping:
    id: "inclusionai/ling-3.0-flash:free"
    purpose: "Resume text → competency scores"
    max_tokens: 2000

  # Pinned free model for Coach (deterministic behavior needed)
  coach_chat:
    id: "nvidia/nemotron-3-ultra:free"
    fallback: ["google/gemma-4-31b-it:free", "openrouter/free"]
    purpose: "RAG-grounded Coach responses"
    streaming: true

  # Reasoning tasks (grading open responses)
  grading:
    id: "openai/gpt-oss-20b:free"
    fallback: ["google/gemma-4-31b-it:free", "openrouter/free"]
    purpose: "Open-text → rubric dimension scores"
    max_tokens: 1500

  # Content generation (offline pipeline only)
  content_generation:
    id: "nvidia/nemotron-3-ultra:free"
    fallback: ["openrouter/free"]
    purpose: "Batch generate questions/cases/projects"
    max_tokens: 4000

  # Embeddings
  embeddings:
    id: "nvidia/nemotron-3-embed-1b:free"
    dimension: 768
    purpose: "Asset + blog chunk embedding → pgvector"

  # Any call that must not be logged (future: sensitive data)
  secure_override:
    id: null   # Set to a paid model when budget allows
    purpose: "PII-heavy calls if consent model changes"

rate_limits:
  # Account-wide free-model limits (approx)
  free_requests_per_day: 1000
  buffer_percent: 20   # Never plan above 80% of the cap
```

---

## Agent Architecture

Rather than one giant agent, each agent does exactly one job. LangGraph state machine wires them together.

```
┌────────────────────────────────────────────────────────────┐
│                    PIPELINE (Phase A/B)                     │
│                                                            │
│  Resume Agent ──► Assessment Agent ──► Competency Agent    │
│       │                                   │               │
│       ▼                                   ▼               │
│  Readiness Score                    Roadmap Agent         │
│  (deterministic)                    (deterministic graph  │
│                                     traversal + LLM week   │
│                                     synthesis)            │
│                                                            │
│                     ┌───────────────┐                     │
│                     │  Coach Agent  │  (Pro, RAG chat)    │
│                     └───────────────┘                     │
│                                                            │
│  Interview Agent    Project Review    Certification Agent │
│  (typed, rubric)    Agent (rubric)    (aggregation)       │
└────────────────────────────────────────────────────────────┘
```

### Agent Definitions

| Agent | Trigger | Input | Output | LLM Cost |
|-------|---------|-------|--------|----------|
| **Resume Agent** | Resume upload | Extracted resume text + target role | Structured: roles, skills, projects, years, competencies evidenced | 1 call |
| **Assessment Agent** | Resume analysis | Structured resume + competency list | Per-competency scores (0–100), confidence | 1 call |
| **Competency Agent** | Score assignment | Raw LLM scores | Cleaned scores, level assignments (beginner→expert) | 1 call |
| **Roadmap Agent** | Onboarding/Re-assessment | Scores + target role + timeline + hours | Week-by-week roadmap (deterministic traversal + LLM theme text) | 1 call |
| **Coach Agent** | User chat (Pro) | Query + session history + RAG chunks | Grounded response, cites asset IDs | 1 call / message |
| **Interview Agent** | Interview start | Interview type + competency targets | Question sequence (graph-sourced), follow-ups, final report | streaming |
| **Project Review Agent** | Project submission | Submission + rubric | Dimension scores + feedback | 1–3 calls |
| **Recommendation Agent** | Dashboard load | Latest scores | Next competency recommendations | 0 (deterministic) |
| **Certification Agent** | Certification submit | All evidence (scores, projects, interviews) | Pass/fail + level + report | 1 call |
| **Enterprise Analytics Agent** | Enterprise report | Org scores | Team heatmaps, skill gaps, trends | 0–1 call |

---

## AI Client Layer (packages/core/ai)

```typescript
// packages/core/ai/client.ts
interface LLMClientConfig {
  modelId: string;
  fallbackChain: string[];
  maxTokens: number;
  streaming: boolean;
  jsonMode?: boolean;        // structured output
  temperature?: number;
  cacheTtlSeconds?: number;
}

class LLMClient {
  private cache: ResponseCache;        // DB-backed (llm_cache table)
  private queue: RequestQueue;         // in-process + DB fallback
  private circuitBreaker: CircuitBreaker;

  async complete(params: CompletionParams): Promise<LLMResponse> {
    // 1. Cache check (semantic hash of prompt + model)
    const cached = await this.cache.get(params);
    if (cached) return cached;

    // 2. Queue with exponential backoff (respect free-model rate limits)
    const response = await this.queue.withRetry(async () => {
      for (const model of [params.modelId, ...params.fallbackChain]) {
        try {
          return await this.callOpenRouter(model, params);
        } catch (e) {
          if (this.isRateLimit(e)) { this.circuitBreaker.fail(model); continue; }
          throw e;
        }
      }
      throw new Error('All models failed');
    });

    // 3. Cache response (respect TTL)
    await this.cache.set(params, response);
    return response;
  }
}
```

### Circuit Breaker Logic

```
- Per-model failure counter (429, 5xx, timeout)
- After 5 failures in 60s window → open breaker for that model (5 min)
- While open, skip to fallback model
- Half-open after cooldown → test 1 request
```

### Response Cache Table

```sql
CREATE TABLE llm_cache (
  prompt_hash TEXT PRIMARY KEY,       -- sha256(prompt + model + params)
  model TEXT NOT NULL,
  response JSONB NOT NULL,
  tokens_used INT,
  cached_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ,
  hit_count INT DEFAULT 0
);
```

### Cost Guards

```typescript
// Hard limits per feature per user per day
const FEATURE_LIMITS: Record<string, number> = {
  resume_mapping: 3,       // Free: 3 analyses/month, 1/day
  coach_chat: 50,          // Pro: 50 messages/day
  grading: 30,             // Pro: 30 graded responses/day
  content_generation: Infinity, // Offline pipeline only
};
```

---

## LangGraph State Machines

### Resume → Score Pipeline

```typescript
// packages/core/graphs/resumePipeline.ts
const resumeGraph = new StateGraph(ResumeState)
  .addNode('extract', extractResumeText)        // pdf-parse / mammoth
  .addNode('structure', structureResume)        // LLM: raw → structured JSON
  .addNode('map_competencies', mapCompetencies) // LLM: structured → per-competency evidence
  .addNode('score', scoreCompetencies)          // LLM: evidence → dimension scores
  .addNode('aggregate', aggregateReadiness)     // Deterministic: weighted readiness
  .addNode('detect_gaps', detectGaps)           // Deterministic: vs target role
  .addNode('generate_roadmap', generateRoadmap) // Deterministic traversal + LLM themes
  .addEdge(START, 'extract')
  .addEdge('extract', 'structure')
  .addEdge('structure', 'map_competencies')
  .addEdge('map_competencies', 'score')
  .addEdge('score', 'aggregate')
  .addEdge('aggregate', 'detect_gaps')
  .addEdge('detect_gaps', 'generate_roadmap')
  .addEdge('generate_roadmap', END);
```

### Coach Chat (RAG)

```typescript
// packages/core/graphs/coach.ts
const coachGraph = new StateGraph(CoachState)
  .addNode('classify_intent', classifyIntent)   // explain | quiz | scenario | review | next_step
  .addNode('retrieve', retrieveChunks)          // pgvector: top-k graph asset chunks
  .addNode('ground', groundResponse)            // LLM: generate with citations
  .addNode('persist', persistConversation)
  .addEdge(START, 'classify_intent')
  .addConditionalEdges('classify_intent', routeByIntent)
  .addEdge('retrieve', 'ground')
  .addEdge('ground', 'persist')
  .addEdge('persist', END);
```

---

## RAG Over Graph Assets

```
Query: "Explain REST idempotency with an example"
  │
  ▼
embed(query) ──────────────────────────────┐
                                           ▼
pgvector similarity search (cosine, top_k=8)
                                           │
  "REST API Design" competency theory ─────┘
  "Idempotency" MCQ explanation
  "Idempotency" scenario context
  Example asset (Stripe API idempotency keys)
  │
  ▼
Ground prompt: [system: "Answer ONLY from provided assets. Cite asset_id for every claim. If not in assets, say 'I don't have that material'."]
  │
  ▼
Coach response with citations
```

**Guardrail:** Coach has no parametric knowledge access. If the answer isn't in the graph, it says so — no hallucination.

---

## Content Generation Pipeline (GitHub Actions)

```
GitHub Actions (manual/scheduled trigger)
  │
  ├─ Reads pending jobs from content_generation_jobs table
  ├─ For each: builds prompt from competency data + asset type template
  ├─ Calls OpenRouter free model (queued, batched, rate-limited)
  ├─ Validates output against Zod schema (strict)
  ├─ Writes to competency_assets with status='review'
  └─ Creates PR / notifies for human review
        │
        ▼
     Human approves → status='published'
```

### Validation Rules (Zod Schemas)

```typescript
const MCQSchema = z.object({
  stem: z.string().min(10),
  options: z.array(z.object({
    text: z.string().min(1),
    isCorrect: z.boolean()
  })).length(4).refine(opts => opts.filter(o => o.isCorrect).length === 1, {
    message: "Exactly one correct option required"
  }),
  explanation: z.string().min(20),
  bloomLevel: z.enum(['remember', 'understand', 'apply']),
  difficulty: z.enum(['easy', 'medium', 'hard'])
});
```

Failed validation → job marked `error`, retried with different model or prompt.

---

## LLM Call Budget (MVP)

| Feature | Calls/day/user | Tokens/call | Est. free-model impact |
|---------|----------------|-------------|------------------------|
| Resume analysis | 0.03 (1/mo avg) | ~3k in / 1k out | Negligible |
| Coach chat | 10 avg (limit 50) | ~1k in / 300 out | Highest volume |
| Grading open answers | 5 avg | ~2k in / 500 out | Moderate |
| Roadmap generation | 0.03 | ~2k in / 1k out | Negligible |
| Content pipeline | Offline batch | 50–100 competencies × 120 assets | One-time (batching, off-peak) |

**Mitigation:** With 20% buffer and caching, 100 Pro users at 10 msgs/day = ~1k coach calls/day. Free limit ≈ 1k/day. **Caching + off-peak queue is mandatory at 100+ users.** Revisit paid models (cents) or self-host at that point.

---

## PII & Privacy Decision

**Decision (locked):** User's own resume data, consent accepted. Free-model logging acknowledged.

- Consent recorded at upload: `resume_analyses.consent_acknowledged`
- Optional client-side PII stripping (names, emails, phone) offered in settings
- Roadmap: when budget allows, route resume_mapping to a paid model for zero-logging

---

## Observability

- `llm_usage_logs` table: every call logged (feature, model, tokens, latency, cost, status)
- Daily summary query → cost dashboard
- Circuit breaker events logged (model, error, cooldown)
- Alert (email via Vercel Cron) when: cache hit rate < 40%, error rate > 5%, rate-limit events > 10/hr

---

## Failure Handling Matrix

| Failure | Detection | Response |
|---------|-----------|----------|
| Model rate-limited (429) | Response code | Backoff + retry next fallback |
| Model delisted (404/410) | Response code | Remove from config, alert |
| Model returns garbage | Zod validation | Retry with different model/temp |
| All models down | Circuit breaker open | Return graceful degradation message, queue for retry |
| pgvector query slow | Latency monitor | Reduce top_k, quantize embeddings |
| Vercel function timeout (10s) | API 504 | Stream responses; queue heavy jobs |

---

*Every agent, roadmap, assessment, and recommendation traces to the Competency Graph. No agent invents taxonomy.*