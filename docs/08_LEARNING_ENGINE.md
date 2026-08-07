# TPMForge — Learning Engine

## Purpose
Structured, competency-based learning. Every competency has a complete content pack.

## Content Pack (Per Competency)
| Asset | Purpose | Delivery |
|-------|---------|----------|
| Theory (markdown) | Concept → principles → patterns → tradeoffs → anti-patterns | Reader |
| Interactive lessons | Code playgrounds, diagrams (Mermaid) | Interactive |
| Articles | Curated + original | Reader |
| Videos | Embedded, timestamped to objectives | Video |
| Case studies | Real company decision points | Interactive |
| Quizzes (MCQ 50) | Knowledge check | Quiz UI |
| Templates | PRD, RAID, roadmap, etc. | Download |
| Assignments | Graded artifacts | Submit |
| Projects | Portfolio deliverables | Project Studio |

## Learning Flow
```
Select competency → Theory → Quiz (MCQ 10 random) → Scenario practice
   → Assignment → Project → Formal assessment → Competency score
```

## AI Mentor Integration (Phase 4)
- Context-aware help at every step (Coach with RAG on current asset)
- "Explain this section" → grounds response in current theory chunk
- "Generate an example" → context-specific example, cites assets

## Gamification (Phase 2)
| Mechanic | Rule |
|----------|------|
| XP | Theory 10, MCQ 2/answer, Assignment 50, Assessment 100 |
| Streaks | Daily activity, resets on miss |
| Badges | Per competency mastered, per category, meta-badges |
| Achievements | First assessment, 1000 XP, 30-day streak, etc. |
| Leaderboards | XP, streak, certifications (Phase 8) |

## Progress Tracking
- Per-asset completion (percent per competency)
- Competency mastery thresholds (score ≥ 75 = mastered)
- Category completion (all competencies ≥ 60)
- Readiness score trend (weekly snapshots)

## MVP Scope
- Theory, MCQ quiz, scenario practice, progress tracking (basic)
- Assignments/projects → Phase 6 (Project Studio)
- Videos/articles curated links (no hosting)
- Gamification → Phase 2

## Implementation Notes
- Content stored in `competency_assets` (theory as markdown, lessons as structured JSON)
- MDX renderer for theory + templates
- Progress upserts to `user_competency_scores` after each graded step

---

*Depends on: 03 (graph assets), 05 (AI client)*