# TPMForge — MVP Specification

## Definition
A lean, valuable, shippable SaaS. Free diagnostic for acquisition + Pro subscription (₹999/mo intro) with Coach + Assessments as the paid anchor. $0/month fixed infra cost.

## Shippable Pieces (P1–P10)

### Phase A — Foundation + Free Diagnostic
| # | Piece | Ship Criteria | Value |
|---|-------|---------------|-------|
| P1 | Foundation + Waitlist | Landing live, email capture, Supabase project, Vercel deploy, preview env | Pre-launch acquisition |
| P2 | Auth + Onboarding | Signup/login/OAuth, profile, role/target/timeline capture | Accounts + conversion tracking |
| P3 | Competency Graph Kernel | `packages/core` types, schema load, scoring math, traversal, unit tests, golden-set resume mapping tests | The moat, headless + tested |
| P4 | Resume Intake + Free Diagnostic | Upload → parse → map → readiness score + radar + gaps + 2-week sample roadmap; shareable report | The free "aha" moment |

**Exit Criteria (Phase A):** 100 users complete resume flow · readiness NPS > 40 · < 5% parse failures · score consistency > 80% vs manual review · waitlist → signup > 40%

### Phase B — Pro Monetization
| # | Piece | Ship Criteria | Value |
|---|-------|---------------|-------|
| P5 | Roadmap Engine | Gap → topological sort → capacity allocation → full roadmap (Pro); regen on re-assessment | Actionable plan |
| P6 | AI Coach | RAG chat over graph, streaming, citations, mode routing (explain/quiz/scenario/review/next), Pro gate | Recurring paid anchor |
| P7 | Assessment Practice | MCQ (10/quiz) + scenario grading, rubric scoring, progress tracking | Recurring value #2 |
| P8 | Payments + Plans | Razorpay subscription, webhook, plan limits, upgrade prompts, founding-member badge | Revenue |

**Exit Criteria (Phase B):** 10+ paying users · conversion > 5% · payment failure < 2% · coach sessions/user/day > 2

### Phase C — Retention + Growth
| # | Piece | Ship Criteria | Value |
|---|-------|---------------|-------|
| P9 | Dashboard + Progress | Score trend, heatmap, XP, streaks, weekly email | Retention |
| P10 | Blog + Newsletter | Competency-linked posts, weekly digest | Growth |

**Exit Criteria (Phase C):** Pro weekly active > 40% · newsletter open > 35% · MRR ₹50k

## MVP Feature Matrix
| Feature | Free | Pro ₹999 |
|---------|------|----------|
| Landing + waitlist | ✅ | — |
| Auth + onboarding | ✅ | — |
| Resume upload + analysis | ✅ | — |
| Readiness score + radar + gaps | ✅ | — |
| 2-week sample roadmap | ✅ | — |
| Limited assessment (3/mo) | ✅ | — |
| Full roadmap + regeneration | — | ✅ |
| AI Coach (50 msgs/day) | — | ✅ |
| Full assessment practice (30/day) | — | ✅ |
| Dashboard + progress | — | ✅ |
| Priority access + future features | — | ✅ |

## Explicitly NOT in MVP
Blog, newsletter, voice interviews, project studio, certifications, community, enterprise, mobile app, gamification beyond basic XP, multi-career graphs.

## Infrastructure (Free-First)
- Vercel Hobby: Next.js app (web + API)
- Supabase Free: Postgres 500MB + pgvector + Auth 50k MAU
- OpenRouter: free models only, queue/cache/circuit-breaker client
- Razorpay: pay-per-transaction (2%)
- GitHub Actions: CI + content generation pipeline
- Vercel Cron: 2/day (usage digest, newsletter prep)

## MVP Launch Checklist
- [ ] P1: Landing + waitlist live; 200+ subscribers on list
- [ ] P2: Auth + onboarding funnel analytics wired
- [ ] P3: Kernel tested (unit + golden set) → CI green
- [ ] P4: Resume flow soft-launch to waitlist (100 users)
- [ ] P4: NPS survey after readiness report
- [ ] P5–P7: Pro features behind feature flag
- [ ] P8: Founding-member offer (₹999 until 50 users / 60 days)
- [ ] P8: Razorpay test-mode → live-mode verification
- [ ] P9–P10: Retention loops + first growth content
- [ ] Launch announcement (newsletter + LinkedIn + TPM communities)

## Success Metrics
| Metric | Phase A | Phase B | Phase C |
|--------|---------|---------|---------|
| Signups | 100 | 500 | 2,000 |
| Diagnostic completion | 60% | 65% | 70% |
| Free → Pro conversion | — | 5% | 8% |
| Paying users | — | 10 | 50 |
| MRR | ₹0 | ₹10k | ₹50k |

## Risks & Mitigations (MVP)
| Risk | Mitigation |
|------|------------|
| Free model rate limits | Queue + cache + off-peak batch; revisit paid at 100 users |
| Model delisted | Config-based fallback chain; daily monitor |
| Resume parse quality | Golden set regression tests |
| Vercel 10s timeout | Streaming coach; async resume analysis with polling |
| PII logging | Consent acknowledged; optional client-side strip |
| Coach quality | RAG-only grounding, citation requirement |

---

*Depends on: 02 (plan), 03 (graph), 04 (schema), 05 (AI)*