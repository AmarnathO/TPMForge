# TPMForge — Interview Engine

## Purpose
Realistic, rubric-scored mock interviews for TPM roles. Typed + voice modes.

## Interview Types
| Type | Focus | Question Source |
|------|-------|-----------------|
| Behavioral | Past behavior, STAR | `star_questions` (10/competency) |
| STAR | Structured situation-task-action-result | `star_questions` |
| Technical | System design, architecture depth | `interview_questions` + `case_studies` |
| Product | Strategy, prioritization, metrics | `interview_questions` + `scenarios` |
| Business | Finance, unit economics, strategy | `interview_questions` |
| Leadership | Conflict, influence, hiring | `interview_questions` + `star_questions` |
| Program | Planning, governance, risk | `interview_questions` + `scenarios` |
| Executive Communication | Updates, board deck | `interview_questions` |
| System Design | Scalability, tradeoffs | `case_studies` + `projects` |

## Voice Mode Workflow
```
Speech (Web Speech API / Whisper)
   │
   ▼
Transcript
   │
   ▼
Rubric evaluation (LLM)  ──►  dimension scores + strengths/gaps
   │
   ▼
Dynamic follow-up question (graph-sourced, based on weak dimension)
   │
   ▼
...repeat (5–8 rounds)...
   │
   ▼
Final report: scores + STAR analysis + improvement plan
```

## Scoring Dimensions
Communication, Confidence, Business Thinking, Product Thinking, Technical Depth, Executive Presence, STAR Structure.

## Question Selection
- Pull from graph asset banks (typed questions + STAR + scenarios)
- No on-the-fly generation (anti-hallucination)
- Follow-ups selected from `followUpPrompts` on each question

## Difficulty Adaptation
- Based on target certification level: Associate → beginner questions, Principal → expert
- Based on live performance: 2 correct → harder; 2 weak → easier (bounded)

## Final Report
- Per-question score + transcript
- Dimension radar
- 3 strengths / 3 gaps (LLM from transcript, rubric-grounded)
- Recommended competencies to improve (from gap report)

## Implementation Notes (MVP scope: NONE — Phase 5)
- Deferred out of MVP. MVP Coach handles practice Q&A only.
- Voice requires Whisper or Web Speech API (free tier considerations)

## Future
- Interview with pacing/tone analysis
- Paired peer interviews (Phase 8 community)
- Real interviewer calibration (human grading cross-check)

---

*Depends on: 03 (graph assets), 05 (AI client)*