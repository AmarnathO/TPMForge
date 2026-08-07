# TPMForge — Phase 3: Assessment Engine

## Goal
Measure competency, not course completion. Formal, rubric-scored assessments per competency.

## Types (beyond MVP practice)
| Type | Count/Comp | Formal? | Scoring |
|------|-----------|---------|---------|
| MCQ | 50 | Yes (timed) | Deterministic |
| Scenario | 20 | Yes | LLM rubric |
| Case studies | 10 | Yes (multi-step) | LLM rubric |
| Short answers | 10 | Yes | LLM rubric |
| Assignments | 5 | Yes | LLM + human |
| Executive presentations | 3 | Yes | LLM rubric |
| Projects | 5 | Yes | Human + LLM |

## Formal vs Practice
| | Practice | Formal |
|--|----------|--------|
| Attempts | Unlimited | 2/quarter |
| Timed | No | Yes |
| Counts toward score | No | Yes |
| Retake cooldown | — | 6 weeks |
| Certification credit | No | Yes |

## Scoring
- 6 dimensions, each 0–100 (weights: application/decision ×1.5)
- Overall = weighted average
- Stored to `user_competency_scores` (snapshot history → trends)

## Adaptive Engine (Phase 3 enhancement)
- Bank-based: wrong answer → easier question (same competency), correct → harder
- Bounded difficulty drift (±2 levels)
- Terminal score = converged estimate across dimensions

## Certification Proctoring (Phase 7 hook)
- Video + screen recording (request camera permission)
- Answer-time heuristics (too fast = flagged)
- Identity check (selfie + ID)

## Outputs
- Radar (6 dimensions)
- Heatmap (competency × dimension, per category)
- Gap report (vs target role/certification)
- Readiness trend over time
- Certification readiness badge

## Anti-Cheat
- Server-side grading only (no client score trust)
- Rate-limit submission
- Plagiarism check (LLM similarity) for open-text

## Success Metrics
- Formal assessment retake rate < 20% (suggests real mastery signal)
- Score variance across attempts < 10 (reliability)
- Survey: "Assessment felt fair/accurate" > 70%

---

*Depends on: 15 (MVP), 06 (assessment engine)*