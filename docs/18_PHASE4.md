# TPMForge — Phase 4: AI Mentor

## Goal
Interactive tutoring across the graph, contextual to each learner's scores and current content.

## Capabilities
| Capability | Mechanism |
|------------|-----------|
| Explain concepts | RAG over graph theory, simplify to level |
| Ask follow-up questions | Socratic: LLM generates Socratic probes grounded on objective |
| Teach interactively | Progressive disclosure (concept → example → you try) |
| Generate examples | Context-specific, cites assets |
| Recommend resources | Graph-linked readings/templates |
| Review homework | Rubric-graded submission feedback |
| Recommend next competency | Gap-aware (deterministic + rationale) |

## Mentor Modes (intent classifier)
- **explain** — "Explain REST idempotency like I'm 5"
- **quiz** — "Quiz me on SQL joins"
- **scenario** — "Give me a scenario to practice on"
- **review** — "Grade my answer"
- **next_step** — "What should I learn next?"

## State Machine (LangGraph)
```
Classify intent → [retrieve chunks for competency] → ground generation → 
persist → (loop) follow-up probe → regenerate
```
Session checkpointer (Supabase `coach_sessions`) for multi-turn context.

## Evaluation Guardrails
- Mentor never invents questions (graph bank only)
- Mentor cites asset IDs for every factual claim
- Socratic probes bounded (no infinite loop; max 3 follow-ups per turn)
- Level adaptation from learner's current score for that competency

## Differentiation vs MVP Coach
MVP Coach = conversational RAG over content.
Phase 4 Mentor = **pedagogical agent** — tracks learning objectives, quizzes with purpose, grades homework, and sequences next steps. It knows *where the learner is* in the graph and *where they need to go*.

## Build Order
1. Intent classifier (LLM, low cost)
2. Mode-specific prompt templates
3. Socratic probe loop with persistence
4. Homework review (reuse grading client)
5. Next-step recommendation (deterministic gap + LLM rationale)

## Success Metrics
- Mentor sessions/user/week > 3
- "Learned something new" rating > 75%
- Homework review turnaround < 5 min

---

*Depends on: 15 (MVP Coach foundations), 05 (AI client)*