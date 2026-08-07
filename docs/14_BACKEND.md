# TPMForge — Backend Architecture

## Stack
Next.js API Routes + Server Actions (App Router) on Vercel. Supabase (Postgres + pgvector + Auth). No separate API service — one deploy.

## Why Next.js-Only (locked decision)
- $0/month fixed cost (Vercel Hobby)
- No cold starts (vs Render free tier)
- One repo, one deploy, type-safe end-to-end
- Server Actions for mutations, Route Handlers for REST

## Module Map
```
lib/
  supabase/
    server.ts          # Supabase server client (RLS-scoped)
    middleware.ts      # Auth session refresh
  ai/
    client.ts          # LLMClient (queue/cache/circuit breaker)
    routing.ts         # Model config loader (models.yaml)
    prompts/
      resume-structure.ts
      competency-map.ts
      grading.ts
      coach-system.ts
  scoring/
    rubric.ts          # Dimension → overall (weighted)
    readiness.ts       # Competency scores → readiness (weighted)
  graph/
    traversal.ts       # Topological sort, prereq collection
    capacity.ts        # Week allocation
  resume/
    extract.ts         # pdf-parse / mammoth
    pii.ts             # Optional PII strip
    analyze.ts         # Orchestrates resume pipeline
  assessment/
    bank.ts            # Question retrieval from competency_assets
    grade.ts           # MCQ deterministic / open-text LLM grading
  roadmap/
    generate.ts        # Gap → sort → allocate → synthesize
  coach/
    retrieve.ts        # pgvector RAG
    generate.ts        # Streaming completion
  subscriptions/
    razorpay.ts        # Razorpay client + webhook verify
  queue/
    inprocess.ts       # In-process promise queue with backoff
    dbCache.ts         # llm_cache table wrapper
  utils/
    errors.ts          # AppError → error envelope
    zod.ts             # Shared schemas
```

## Request Flow (Resume Analysis)
```
POST /api/resumes/analyze
  → validate (Zod) + auth + consent check
  → store resume row (status=processing)
  → extract text (pdf-parse/mammoth)
  → LLM structure (1 call, queued)
  → LLM competency map (1 call, queued)
  → deterministic readiness + gaps
  → roadmap (sample or full by tier)
  → store all rows, update status=completed
  → 202 (client polls GET /resumes/:id)
```
Note: Vercel function timeout (10s) → analysis runs in a **queued background execution**; simplest: client polls. For longer tasks, queue via Supabase RPC or trigger external worker (GitHub Actions webhook) later.

## Server Actions vs Route Handlers
| Concern | Use |
|---------|-----|
| Mutations behind auth (profile, settings, roadmap regen) | Server Actions |
| Public GETs (competencies, blog) | Route Handlers + ISR |
| File upload (resume) | Route Handler (multipart) |
| Webhooks (Razorpay) | Route Handler (signature verify) |
| SSE streaming (coach) | Route Handler (streams) |

## Rate Limiting (app-level)
- Per-user counters in `rate_limit_counters` table (window = feature)
- Middleware + per-handler checks
- Vercel Hobby has no built-in rate limiting → self-implemented

## Background Work
| Job | Mechanism |
|-----|-----------|
| Content generation (batch) | GitHub Actions workflow → writes to Supabase |
| Weekly newsletter | Vercel Cron (2/day Hobby free) → pg_cron → Resend API |
| Materialized view refresh | Supabase pg_cron (daily) |
| Usage digest email | Vercel Cron |

## Error Handling
- Global error handler → `{ error: { code, message } }`
- Zod validation → 400 + field errors
- LLM failures → graceful degradation message (never 500 to user)
- Log to `llm_usage_logs` + server logs

## Security
- Supabase RLS is the security boundary (never trust client)
- Server-only env vars: `SUPABASE_SERVICE_ROLE_KEY`, `OPENROUTER_API_KEY`, `RAZORPAY_KEY_SECRET`, `RAZORPAY_WEBHOOK_SECRET`
- Razorpay webhook: verify signature + idempotency key
- No client-side secrets. Never log resume raw text.
- Free-model prompt logging accepted per consent (see 05)

## Testing
- Unit: scoring math, graph traversal, capacity allocation, Zod schemas
- Integration: API handlers with mocked Supabase
- Golden-set resume tests (20 resumes, assert mapping consistency)
- CI: GitHub Actions (lint, typecheck, test) on every PR

## Env Vars
```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
OPENROUTER_API_KEY
RAZORPAY_KEY_ID
RAZORPAY_KEY_SECRET
RAZORPAY_WEBHOOK_SECRET
RESEND_API_KEY
NEXT_PUBLIC_SITE_URL
```

## Deploy
- Vercel: `vercel` (web), env vars set in project settings
- CI: GitHub Actions → build + test → deploy preview
- Production: push to main → Vercel auto-deploy

---

*Depends on: 04 (schema), 05 (AI client), 12 (API)*