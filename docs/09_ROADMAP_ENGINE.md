# TPMForge — Roadmap Engine

## Purpose
Generate personalized learning roadmaps from the Competency Graph. **The AI does not invent the roadmap — it traverses the graph.**

## Inputs
- Resume assessment scores (per competency)
- Target role (TPM, Senior TPM, Principal, Enterprise)
- Timeline (weeks)
- Weekly hours commitment
- Target companies (optional — affects prioritization weights)

## Algorithm

```
Competency Graph
      │
      ▼
Gap Analysis ──► [target role required competencies] − [user's proven competencies]
      │
      ▼
Topological Sort (prerequisites first)
      │
      ▼
Capacity Allocation (weekly hours budget)
      │
      ▼
Roadmap (week → theme → competencies → assets)
```

### Step 1: Gap Analysis
```
Required for target = certification mapping (per level)
Proven = user's competency scores ≥ 60 (or resume-evidenced)
Gap = Required − Proven
```

### Step 2: Topological Sort (Kahn's Algorithm)
```
Every gap competency → collect transitive prerequisites → order so no
competency appears before its prerequisites
```

### Step 3: Capacity Allocation
```
Weekly budget = user's weekly_hours
Per-competency load = estimated_study_hours × user_velocity_factor
  (velocity = time to complete past competencies / estimate)
Week assignment = pack competencies greedily up to weekly budget
Milestones = formal assessments at end of each theme block
```

### Step 4: Roadmap Synthesis (LLM only for themes)
```
For each week: LLM writes theme title + narrative (1 call)
Content items = deterministic retrieval from graph assets
  (theory → quiz → scenario → assignment per competency)
```

## Roadmap Structure
```
Week 1:  Networking & REST APIs
  ├─ REST API Design — Theory (2h)
  ├─ REST API Design — MCQ Quiz (0.5h)
  ├─ HTTP Basics — Theory (1h)
  └─ Milestone: REST formal assessment
Week 2:  Databases & SQL
  ├─ SQL Joins — Theory (2h)
  └─ ...
```

## Regeneration Triggers
- Significant score change (any competency ±20 points)
- New assessment completed
- Timeline/hours updated by user
- User requests (full regen, Pro only)

## Versioning
- Each generation = new roadmap version row
- Old version preserved (`previous_version_id`)
- Progress preserved via competency scores (not roadmap items)

## Free vs Pro
| Feature | Free | Pro |
|---------|------|-----|
| 2-week sample roadmap | ✅ | ✅ |
| Full roadmap | — | ✅ |
| Re-generation on re-assessment | — | ✅ |
| Target company weighting | — | ✅ |
| Roadmap history | — | ✅ |

## Implementation Notes (MVP scope: P5)
- Traversal + capacity: pure TypeScript, unit-tested
- LLM theme synthesis: 1 call per generation, cached
- Milestones reference `assessments` (created on completion)

---

*Depends on: 03 (graph traversal), 04 (schema), 05 (AI client)*