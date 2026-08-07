# TPMForge — Documentation Index

**Project Root:** `/Users/amarnath.ojha/Desktop/Amar Projects/ForgeTPM`  
**Stack:** Next.js 14 (Vercel) + Supabase (Postgres + pgvector + Auth) + OpenRouter (free models) + Razorpay  
**Cost Target:** $0/month fixed (Vercel Hobby + Supabase Free + OpenRouter free + Razorpay per-txn)

---

## Document Map (Dependency-Ordered)

| # | Document | Tier | Status | Depends On |
|---|----------|------|--------|------------|
| 00 | `00_README.md` | Core | ✅ Complete | — |
| 01 | `01_VISION.md` | Core | ✅ Complete | 00 |
| 02 | `02_PLAN.md` | Core | ✅ Complete | 01 |
| 03 | `03_COMPETENCY_GRAPH.md` | Core | ✅ Complete | 02, 04 |
| 04 | `04_DATABASE_SCHEMA.md` | Core | ✅ Complete | 03 |
| 05 | `05_AI_ARCHITECTURE.md` | Core | ✅ Complete | 03, 04 |
| 06 | `06_ASSESSMENT_ENGINE.md` | Engine | ✅ Complete | 03, 04, 05 |
| 07 | `07_INTERVIEW_ENGINE.md` | Engine | ✅ Complete | 03, 05 |
| 08 | `08_LEARNING_ENGINE.md` | Engine | ✅ Complete | 03, 05 |
| 09 | `09_ROADMAP_ENGINE.md` | Engine | ✅ Complete | 03, 04, 05 |
| 10 | `10_BLOG_STRATEGY.md` | Product | ✅ Complete | 03 |
| 11 | `11_ENTERPRISE.md` | Product | ✅ Complete | 02, 04 |
| 12 | `12_API_SPEC.md` | Impl | ✅ Complete | 04, 05 |
| 13 | `13_FRONTEND.md` | Impl | ✅ Complete | 02, 05 |
| 14 | `14_BACKEND.md` | Impl | ✅ Complete | 04, 05, 12 |
| 15 | `15_MVP.md` | Product | ✅ Complete | 02, 03, 04, 05 |
| 16 | `16_PHASE2.md` | Phase | ✅ Complete | 15 |
| 17 | `17_PHASE3.md` | Phase | ✅ Complete | 15, 06 |
| 18 | `18_PHASE4.md` | Phase | ✅ Complete | 15, 05 |
| 19 | `19_PHASE5.md` | Phase | ✅ Complete | 15, 07 |
| 20 | `20_MONETIZATION.md` | Product | ✅ Complete | 02, 15 |

---

## Dependency Graph

```
00_README.md
  └─ 01_VISION.md
       └─ 02_PLAN.md
            ├─ 03_COMPETENCY_GRAPH.md ◄── 04_DATABASE_SCHEMA.md
            │      │
            │      └─ 05_AI_ARCHITECTURE.md
            │           │
            ├──────────┼──────────┬──────────┬──────────┐
            ▼          ▼          ▼          ▼          ▼
        06_ASSESS  07_INTERV   08_LEARN   09_ROADMAP  10_BLOG
            │          │          │          │          │
            └──────────┴──────────┴──────────┴──────────┘
                          │
                          ▼
                   11_ENTERPRISE
                          │
                          ▼
              12_API_SPEC ── 13_FRONTEND ── 14_BACKEND
                          │
                          ▼
                   15_MVP (shippable pieces)
                          │
          ┌───────────────┼───────────────┐
          ▼               ▼               ▼
       16_PHASE2      17_PHASE3      18_PHASE4
          │               │               │
          └───────────────┼───────────────┘
                          ▼
                       19_PHASE5
                          │
                          ▼
                    20_MONETIZATION
```

---

## Status Board

| Phase | Description | Target | Status |
|-------|-------------|--------|--------|
| **Phase 0** | Documentation & Spec Complete | 20 docs | ✅ Done |
| **Phase A (P1–P4)** | Waitlist → Auth → Graph Kernel → Resume Intake → Soft Launch | 100 users | ⏳ Pending |
| **Phase B (P5–P8)** | Roadmap → Coach → Assessments → Payments → Pro Launch | First paying users | ⏳ Pending |
| **Phase C (P9–P10)** | Dashboard → Blog/Newsletter | Retention + Growth | ⏳ Pending |
| **Phase 2** | Learning Academy | Structured learning | ⏳ Pending |
| **Phase 3** | Assessment Engine | Competency measurement | ⏳ Pending |
| **Phase 4** | AI Mentor | Interactive tutoring | ⏳ Pending |
| **Phase 5** | Interview Platform | Mock interviews | ⏳ Pending |
| **Phase 6** | Project Studio | Real TPM artifacts | ⏳ Pending |
| **Phase 7** | Certification Platform | Credentialing | ⏳ Pending |
| **Phase 8** | Community | Network effects | ⏳ Pending |
| **Phase 9** | Enterprise | B2B expansion | ⏳ Pending |

---

## Quick Reference: Key Decisions Locked

| Decision | Value |
|----------|-------|
| **MVP Free Tier** | Resume → Readiness Score + Radar + Gap, 2-week sample roadmap, limited assessment |
| **MVP Pro Tier** | ₹999/mo intro (→ ₹2,000), AI Coach + Full Roadmap + Full Assessments + Dashboard |
| **Content at Launch** | 30–40 competencies (5 hand-worked quality bar + AI-drafted, review-gated) |
| **LLM Strategy** | OpenRouter free models only; queue/cache/fallback in AI client; pre-generated content |
| **PII Handling** | User's own resume data, consent accepted; free-model logging acknowledged |
| **Payments** | Razorpay (2% per txn, no monthly) |
| **Deployment** | Vercel Hobby (Next.js), Supabase Free, GitHub Actions (batch), Vercel Cron (2/day) |
| **Backend** | Next.js API routes + Server Actions (no separate Rails service) |

---

## Next Actions

1. **Initialize Next.js repo** at project root with TypeScript, Tailwind, shadcn/ui
2. **Set up Supabase project** — enable pgvector, configure Auth
3. **Implement Competency Graph kernel** (packages/core) — schema, scoring, rubric engine
4. **Build AI client** with queue, cache, fallback, model routing config
5. **GitHub Actions workflow** for batch content generation
6. **Execute Phase A pieces** in order

---

*Generated as single source of truth for all AI agents and human contributors.*