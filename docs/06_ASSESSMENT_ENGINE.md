# TPMForge — Assessment Engine

## Purpose
Measure what a user can *do*, not what they *completed*. Every question maps to a competency graph node. No random questions, ever.

## Core Principle
**Assessment ≠ Course Completion.** A user scores 85 on REST API → they have proof, regardless of how they learned it.

---

## Assessment Types

| Type | Count/Competency | Scoring | LLM? | Notes |
|------|------------------|---------|------|-------|
| MCQ | 50 | Deterministic (code) | No | Instant, practice mode |
| Scenario Questions | 20 | Rubric | Yes (grading) | Open-text, 2–3 para context |
| Case Studies | 10 | Rubric | Yes (grading) | Multi-step, timed |
| Short Answers | 10 | Rubric | Yes (grading) | Definition + connect |
| Practical Assignments | 5 | Rubric | Yes + human | Artifact submission |
| Voice Questions | 10 | Rubric | Yes (transcript eval) | Speech → text → grade |
| Projects | 5 | Rubric | Yes + human | Full deliverables |
| Executive Presentations | 3 | Rubric | Yes | Structure + delivery |

## Scoring Dimensions (6D)
Each 0–100: Knowledge, Understanding, Application, Communication, Decision Making, Execution.
Overall = weighted average (application & decision-making weight 1.5×).

## Scoring Flow

```
User answers
    │
    ├─ MCQ ──► deterministic grade (code)
    │
    └─ Open-text ──► LLM grading prompt
          │   [rubric levels + user answer + expected outcomes]
          ▼
    Dimension scores (Zod-validated JSON)
          ▼
    Score stored → competency score updated → readiness recomputed
```

## Rubric Structure
```
Rubric = 1 per (competency × dimension)
Levels: 0 / 25 / 50 / 75 / 100
Each level: descriptor + example answer snippets
```

## Assessment Modes
- **Practice:** unlimited attempts, low stakes, instant feedback
- **Formal:** timed, counts toward competency score, limited retries (2/quarter)
- **Certification:** formal + proctored-in-video + project evidence

## Outputs
- Radar chart (6 dimensions)
- Heatmap (competency × dimension)
- Gap report (ranked vs target role)
- Certification readiness indicator

## Anti-Hallucination Rules
1. Questions are retrieved from `competency_assets`, never generated at request time
2. Grading uses the stored rubric for that competency+dimension
3. LLM grading prompt includes: rubric, expected outcomes, user's answer, question ID (no new question invented)

## Implementation Notes (MVP scope: P7)
- MCQ practice: retrieve 10 random from 50 → grade in code → explanations shown
- Scenario grading: 1 LLM call per response, cached by (question_id, answer_hash)
- Rate limit: 30 graded responses/day/user (Pro)

## Future (Phase 3)
- Adaptive difficulty (wrong answer → easier, correct → harder)
- Certification proctoring (screen record + face detection)
- Cheat detection (answer-time heuristics)
- Peer review for open-ended artifacts

---

*Depends on: 03 (graph assets), 04 (schema), 05 (AI grading client)*