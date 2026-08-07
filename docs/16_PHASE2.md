# TPMForge — Phase 2: Learning Academy

## Goal
Structured, competency-based learning for every node in the graph. Every competency has a complete, pre-generated content pack.

## Scope (after MVP proven)
- Theory content (structured markdown) for all 30–40 launch competencies
- Interactive lessons (code playgrounds, Mermaid diagrams, step-through simulations)
- Quizzes from graph MCQ bank (retrieve, not generate)
- Scenario practice with rubric feedback
- Templates (PRD, RAID, dependency matrix, roadmap, etc.)
- Assignments (graded artifacts)
- Curated articles + videos (no hosting cost — external links, timestamped)

## Per-Competency Content Pack
| Asset | Source | Effort |
|-------|--------|--------|
| Theory | AI-drafted + human review (pipeline) | 1 competence/day |
| Interactive lessons | Hand-built for top-10 competencies | High |
| MCQ quiz | Graph bank (50) | Zero (exists) |
| Scenario practice | Graph bank (20) | Zero (exists) |
| Templates | Hand-crafted 20 core templates | Medium |
| Assignments | Graph bank (5) | Zero (exists) |

## Gamification
| Mechanic | Rule | Status |
|----------|------|--------|
| XP | Theory 10, MCQ 2/answer, scenario 15, assignment 50 | Phase 2 |
| Streaks | Daily activity | Phase 2 |
| Badges | Per-competency mastered (≥75), category badges, meta badges | Phase 2 |
| Achievements | First assessment, 1000 XP, 30-day streak | Phase 2 |
| Leaderboards | XP/streak | Phase 8 |

## AI Mentor Integration
- Context-aware help at every content step
- Coach grounded on current asset chunk (RAG)
- "Explain / example / quiz me / next step" modes per section

## Learning UI
- Competency detail page: progress ring, content tabs, quiz entry
- Lesson player: markdown + diagram render + interactive step
- Quiz runner: MCQ UI with instant feedback + explanations
- Template library: downloadable + fillable web versions

## Success Metrics
- Content completion rate > 30% of started
- Quiz pass rate (first try) 60–80% (too high = too easy)
- Time-on-competency within 2× estimated hours

## Build Order
1. Theory rendering + quiz runner (reuses MVP components)
2. Templates library (highest perceived value per TPM)
3. Interactive lessons for top-10 competencies
4. Gamification layer
5. Mentor integration

---

*Depends on: 15 (MVP foundations)*