# TPMForge — Master Plan & Phase Roadmap

## Executive Summary
This is the single source of truth for product phases, MVP definition, launch sequencing, and success metrics. All engineering, product, and GTM decisions trace to this document.

---

## Phase Overview

| Phase | Name | Duration | Goal | Key Deliverable |
|-------|------|----------|------|-----------------|
| **0** | Product Foundation | Weeks 1–4 | Design before build | Complete spec (these 20 docs) |
| **A** | MVP Core Loop (P1–P4) | Weeks 5–10 | Free diagnostic + 100 users | Resume → Readiness → Roadmap live |
| **B** | Pro Monetization (P5–P8) | Weeks 11–18 | Paid subscriptions | Coach + Assessments + Payments live |
| **C** | Retention & Growth (P9–P10) | Weeks 19–24 | Stickiness + acquisition | Dashboard + Blog/Newsletter |
| **2** | Learning Academy | Months 7–10 | Structured learning | Competency content + Gamification |
| **3** | Assessment Engine | Months 10–13 | Competency measurement | Radar/Heatmap/Gap reports |
| **4** | AI Mentor | Months 13–16 | Interactive tutoring | Socratic agent + homework review |
| **5** | Interview Platform | Months 16–20 | Interview prep | Voice + typed mock interviews |
| **6** | Project Studio | Months 20–24 | Real TPM artifacts | AI-reviewed project portfolio |
| **7** | Certification Platform | Months 24–30 | Credentialing | Associate → Principal TPM paths |
| **8** | Community | Months 30–36 | Network effects | Forums, challenges, mentorship |
| **9** | Enterprise | Months 36+ | B2B revenue | Team dashboards, internal academy |

---

## Phase 0 — Product Foundation (Weeks 1–4) ✅ COMPLETE

**Goal:** Design before building. Zero code until spec is done.

**Deliverables (these 20 docs):**
- Vision, Mission, Brand, User Personas, User Journey
- Information Architecture, Database Design, AI Architecture
- Competency Graph v1 (schema + 5 worked competencies)
- PRD, Wireframes, UX Flows, Tech Stack, API Contracts

**Output:** Complete product blueprint — this documentation set.

**Exit Criteria:** All 20 docs reviewed, no open architectural questions.

---

## Phase A — MVP Core Loop (Weeks 5–10)

**Goal:** Soft-launch free diagnostic to 100 users. Validate graph quality + score accuracy.

### P1 — Foundation & Waitlist (Week 5)
- Landing page with value prop, email capture, waitlist position
- Supabase project: Postgres + pgvector + Auth configured
- Vercel project connected, preview deployments working
- Admin: waitlist CSV export, basic analytics

### P2 — Auth & Onboarding (Week 6)
- Supabase Auth: email/password, OAuth (GitHub, Google, LinkedIn)
- Profile setup: current role, target role, target companies, timeline, weekly hours
- Career goal selection: TPM, Senior TPM, Principal TPM, Enterprise TPM
- Onboarding funnel analytics

### P3 — Competency Graph Kernel + Scoring Engine (Week 7–8) **CRITICAL PATH**
- `packages/core` library: TypeScript types for Competency, Asset, Rubric, Assessment
- Graph schema loaded from Supabase (competencies, prerequisites, objectives, assets)
- **Scoring kernel:** deterministic rubric engine (0–100 per dimension)
- **Resume → Competency Mapping:** LLM prompt + structured output parser (Zod)
- Unit tests: scoring math, graph traversal, mapping accuracy vs golden set
- **No UI yet** — headless, fully tested library

### P4 — Resume Intake & Free Diagnostic (Week 9–10)
- Resume upload (PDF/DOCX) → text extraction (pdf-parse / mammoth)
- PII stripping optional (user consent stored)
- LLM call: resume text → competency scores (using graph rubrics)
- **Readiness Score:** weighted aggregate (0–100)
- **Radar Chart:** 6 dimensions (Knowledge, Understanding, Application, Communication, Decision Making, Execution)
- **Gap Report:** ranked missing competencies vs target role
- **2-Week Sample Roadmap:** graph-sourced, week-by-week
- Shareable report URL (public token)
- Soft launch: 100 waitlist users invited
- **Exit Criteria:** 100 users complete flow, NPS > 40, < 5% parse failures, score consistency > 80% vs manual review

---

## Phase B — Pro Monetization (Weeks 11–18)

**Goal:** Flip Pro tier at ₹999/mo intro. Acquire first paying users.

### P5 — Roadmap Engine (Week 11–12)
- **Input:** User profile + assessment scores + target role + timeline + weekly hours
- **Algorithm:** Gap analysis → topological sort of competency graph → week allocation
- **Output:** Full roadmap (not sample) with: competencies, assets, assessments, milestones
- **Free tier:** 2-week sample only. **Pro:** full roadmap + updates on re-assessment
- Roadmap versioning (re-generated on significant score change)

### P6 — AI Coach (Pro) (Week 13–14)
- **RAG over graph assets:** Coach retrieves relevant theory, examples, case studies
- **Chat modes:** Explain, Quiz Me, Practice Scenario, Review My Answer, Next Step
- **Conversation memory:** Supabase `coach_sessions` + `coach_messages`
- **Streaming responses** (Vercel AI SDK) with 10s timeout guard
- **Rate-limit handling:** Queue + exponential backoff + DB response cache
- **Fallback chain:** `nvidia/nemotron-3-ultra:free` → `google/gemma-4-31b-it:free` → `openrouter/free`
- **Pro gate:** Middleware checks subscription status

### P7 — Assessment Practice (Pro) (Week 15–16)
- **Question retrieval** (not generation) from graph asset tables
- **MCQ:** Instant scoring, explanation, retry with variant
- **Scenario:** User writes response → LLM grades against rubric → dimension scores
- **Case Study:** Multi-step, timed, final rubric score
- **Progress tracking:** Per-competency attempt history, mastery threshold
- **Daily/Weekly challenge:** Graph-sourced, rotating

### P8 — Payments & Plans (Week 17–18)
- Razorpay integration: Subscription (₹999/mo), Webhook handling
- Plan limits: Free (3 assessments/mo, sample roadmap, no coach) vs Pro (unlimited)
- Subscription portal: Upgrade, cancel, billing history, invoice download
- **Intro pricing badge:** "Founding Member — ₹999/mo (regular ₹2,000) — expires at 50 users or 60 days"
- **Exit Criteria:** 10+ paying users, < 2% payment failure rate, coach session/day > 2/user

---

## Phase C — Retention & Growth (Weeks 19–24)

### P9 — Dashboard & Progress (Week 19–20)
- Readiness score trend (weekly snapshots)
- Competency heatmap (radar per category)
- XP / Streaks / Badges (gamification core)
- Weekly activity summary email
- Re-assessment prompt (every 2 weeks)

### P10 — Blog & Newsletter (Week 21–22)
- **Blog:** Next.js MDX + content layer, competency-linked (each post tags graph nodes)
- **Categories:** Technology, System Design, Cloud, AI, Product, Business, Program, Leadership, Career, Interview, Templates, Case Studies, Industry News, Books, Reviews
- **Newsletter:** Weekly digest (Supabase pg_cron + Resend/EmailJS free tier)
- **SEO:** Competency-cluster content strategy (each competency → 1 pillar article + 3 supporting)

---

## Phase 2 — Learning Academy (Months 7–10)

**Goal:** Structured learning per competency.

**Per Competency Content Pack:**
- Theory (structured markdown)
- Interactive lessons (code playground, diagrams)
- Articles (curated + original)
- Videos (embedded, timestamped to objectives)
- Case studies (real company, decision points)
- Quizzes (MCQ + scenario, from graph assets)
- Templates (PRD, RAID, Roadmap, etc.)
- Assignments (graded by rubric)
- AI Mentor integration (context-aware help)

**Gamification:**
- XP per asset completion
- Streaks (daily login + activity)
- Badges (per competency mastered, per category, meta-badges)
- Achievements (first assessment, 1000 XP, streak 30, etc.)

---

## Phase 3 — Assessment Engine (Months 10–13)

**Goal:** Measure competency, not course completion.

**Assessment Types (all graph-sourced):**
| Type | Count/Competency | Scoring |
|------|------------------|---------|
| MCQ | 50 | Auto (code) |
| Scenario Questions | 20 | Rubric (LLM-graded) |
| Case Studies | 10 | Rubric (LLM-graded) |
| Short Answers | 10 | Rubric (LLM-graded) |
| Practical Assignments | 5 | Rubric (human + LLM) |
| Executive Presentations | 3 | Rubric (LLM-graded) |
| Project Reviews | 2 | Rubric (human) |

**Scoring Dimensions (0–100 each):**
1. Knowledge — recall + recognition
2. Understanding — explain + connect
3. Application — solve in context
4. Communication — structure + clarity
5. Decision Making — tradeoffs + rationale
6. Execution — completeness + pragmatism

**Outputs:**
- Radar Chart (6 dimensions)
- Heat Map (competency × dimension)
- Gap Report (ranked vs target role)
- Certification readiness indicator

---

## Phase 4 — AI Mentor (Months 13–16)

**Agent Capabilities (single Mentor Agent, graph-contextualized):**
- Explain concepts (retrieve + simplify)
- Ask follow-up questions (Socratic)
- Teach interactively (progressive disclosure)
- Generate examples (context-specific)
- Recommend resources (graph-linked)
- Review homework (rubric-graded)
- Recommend next competency (gap-aware)

**Architecture:** LangGraph state machine, Supabase checkpointer, RAG over graph assets.

---

## Phase 5 — AI Interview Platform (Months 16–20)

**Interview Types:**
- Behavioral (STAR)
- Technical (system design, coding-adjacent)
- Product (strategy, prioritization, metrics)
- Business (finance, strategy, market)
- Leadership (conflict, influence, hiring)
- Program (planning, governance, risk)
- Executive Communication (updates, board decks)
- System Design (scalability, tradeoffs)

**Voice Mode Workflow:**
```
Speech → Transcript (Whisper/Web Speech API) → Evaluation (rubric) → Follow-up Questions → Final Report
```

**Scoring Dimensions:**
- Communication, Confidence, Business Thinking, Product Thinking, Technical Depth, Executive Presence, STAR Structure

---

## Phase 6 — Project Studio (Months 20–24)

**Project Templates (AI reviews every submission):**
- PRD, Executive Update, Quarterly Planning, Dependency Matrix
- KPI Dashboard, Incident RCA, Roadmap, Risk Register
- Stakeholder Map, Business Case, System Design Review

**Output:** Portfolio of reviewed artifacts → certification evidence.

---

## Phase 7 — Certification Platform (Months 24–30)

**Paths:**
| Level | Target | Requirements |
|-------|--------|--------------|
| Associate TPM | 0–2 yrs exp | Knowledge + 2 projects + 1 interview |
| TPM | 2–5 yrs | Knowledge + Application + 3 projects + 2 interviews |
| Senior TPM | 5–8 yrs | + Decision Making + 5 projects + 3 interviews |
| Principal TPM | 8+ yrs | + Execution + Capstone + Panel |
| Enterprise TPM | Org scope | Portfolio + Governance + Transformation case |

**AI Evaluates:** Knowledge (assessments), Projects (rubric), Interviews (rubric), Assignments, Final Capstone.

---

## Phase 8 — Community (Months 30–36)

**Features:**
- Discussion Forums (per competency + general)
- Weekly Challenges (graph-sourced)
- Study Groups (cohort-based)
- Office Hours (scheduled, recorded)
- Resume Reviews (peer + AI)
- Interview Practice (paired)
- Mentorship (matching algorithm)
- Referral Network (hiring partners)
- Local Chapters (geo-based)
- Leaderboards (XP, certifications, challenges)

**Future:** LinkedIn-like professional TPM network.

---

## Phase 9 — Enterprise (Months 36+)

**Features:**
- Employee Assessments (bulk + scheduled)
- Team Dashboards (aggregated heatmaps)
- Manager Reports (individual + team gaps)
- Learning Analytics (completion, mastery, ROI)
- Skill Gap Analysis (org-level radar)
- Internal Certifications (custom rubrics)
- Company Learning Paths (role-specific)
- AI Coach for Employees (private, data-isolated)

---

## MVP Definition (Lean, Valuable, Shippable)

### What IS in MVP (Phases A+B)
| Piece | Free | Pro (₹999 intro) |
|-------|------|------------------|
| Landing + Waitlist | ✅ | — |
| Auth + Onboarding | ✅ | — |
| Resume Upload + Parse | ✅ | — |
| Readiness Score + Radar + Gap | ✅ | — |
| 2-Week Sample Roadmap | ✅ | — |
| Limited Assessment (3/mo) | ✅ | — |
| Full Roadmap | — | ✅ |
| AI Coach (chat) | — | ✅ |
| Full Assessment Practice | — | ✅ |
| Dashboard + Progress | — | ✅ |
| Payments (Razorpay) | — | ✅ |

### What is NOT in MVP (Deferred)
- Blog/Newsletter (Phase C)
- Voice Interviews (Phase 5)
- Projects (Phase 6)
- Certifications (Phase 7)
- Community (Phase 8)
- Enterprise (Phase 9)
- Gamification beyond basic XP (Phase 2)
- Mobile app (never — PWA only)

---

## Key Risks & Mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| OpenRouter free model delisted | High | High | Fallback chain in config; cache aggressively; monitor daily |
| Free model rate limits hit | High | Medium | Queue + backoff; DB response cache; batch offline generation |
| Supabase 500MB pgvector exceeded | Medium | High | Quantize embeddings (int8); prune old versions; upgrade at $25/mo when needed |
| Resume parsing quality variance | Medium | High | Golden test set (20 resumes); regression test on every prompt change |
| Coach hallucination on graph facts | Medium | High | RAG-only mode (no parametric knowledge); cite asset IDs |
| PII logging on free models | Low | High | Documented consent; optional client-side strip; paid model for sensitive |
| Vercel 10s timeout on LLM calls | Medium | Medium | Streaming responses; background jobs for heavy grading |
| Content quality at scale | High | High | 5 hand-worked competencies as gold standard; review gate for AI drafts |

---

## Success Metrics (KPIs)

| Phase | Primary Metric | Target |
|-------|----------------|--------|
| Phase A | Free diagnostic completion rate | > 60% of signups |
| Phase A | Readiness score NPS | > 40 |
| Phase B | Free → Pro conversion | > 5% within 30 days |
| Phase B | Pro MRR | ₹50,000/mo (50 users @ ₹999) |
| Phase C | Weekly active learners (Pro) | > 40% |
| Phase C | Newsletter open rate | > 35% |
| Phase 2 | Competency mastery rate | > 30% of started |
| Phase 3 | Assessment retake rate | < 20% (shows mastery) |
| Phase 5 | Interview practice → real interview success | Track via survey |
| Phase 7 | Certification completion | > 10% of Pro users |
| Phase 9 | Enterprise pilot → paid | > 50% |

---

## Non-Goals (Explicitly Out of Scope)
- Building a generic LLM wrapper — we use LLMs as tools, not product
- Competing on content volume — we compete on competency structure + assessment rigor
- Mobile-native apps — PWA is sufficient
- Free unlimited AI — sustainability requires paid tier
- Ad-supported model — user is the customer, not the product
- Marketplace for coaches — AI coach replaces human for scale; human mentors come in Phase 8+

---

*This plan is the contract. Changes require updating this doc + all downstream docs.*