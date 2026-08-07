# TPMForge — Phase 5: Interview Platform

## Goal
Realistic, rubric-scored mock interviews for TPM roles. Typed + voice.

## Interview Types
Behavioral (STAR), Technical, Product, Business, Leadership, Program, Executive Communication, System Design.

## Typed Mode
```
Select interview type + target level → question sequence (graph bank)
→ user answers in text → immediate rubric feedback per question
→ final report (scores, strengths, gaps, transcript)
```

## Voice Mode Workflow
```
Speech (Web Speech API / Whisper)
  → Transcript
  → Rubric evaluation (LLM)
  → Dynamic follow-up (weak dimension, graph-sourced)
  → repeat (5–8 rounds)
  → Final report
```

## Scoring Dimensions
Communication, Confidence, Business Thinking, Product Thinking, Technical Depth, Executive Presence, STAR Structure.

## Question Sources (anti-hallucination)
- `interview_questions` (10/competency)
- `star_questions` (10/competency)
- `scenarios` (20/competency)
- `case_studies` (10/competency)
- Follow-ups from each question's `followUpPrompts`

## Difficulty Adaptation
- Target level → question difficulty (Associate = beginner; Principal = expert)
- Live adaptation: 2 correct → next question harder (bounded ±2)

## Final Report
- Per-question score + transcript
- Dimension radar
- 3 strengths / 3 gaps (LLM from transcript, rubric-grounded)
- Recommended competencies (gap-linked)

## Free/Pro Split
| Feature | Free | Pro |
|---------|------|-----|
| Typed practice (2/mo) | ✅ | — |
| Unlimited typed | — | ✅ |
| Voice interviews | — | ✅ |
| Final detailed report | sample | full |

## Tech Notes (free-first)
- Speech capture: Web Speech API (Chrome free) → transcript via browser; Whisper via OpenRouter free when available
- Voice eval: transcript → grading client (free model, rubric prompt)
- Streaming: SSE for question-by-question delivery

## Success Metrics
- Interviews/user/month > 1
- Users who practice + land interviews (survey) — target 60% report progress
- Report satisfaction > 80%

## Build Order
1. Typed interview runner (reuse assessment runner)
2. Question sequencing engine (graph retrieval)
3. LLM evaluation + report
4. Voice capture + transcript
5. Difficulty adaptation

---

*Depends on: 15 (MVP), 07 (interview engine)*