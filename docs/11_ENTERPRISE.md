# TPMForge — Enterprise

## Purpose
B2B expansion: internal TPM academies, team capability measurement, skill-gap analytics.

## Value Proposition
"Stop guessing who's ready for program leadership. Measure it. Grow it. Certify it."

## Offerings
| Product | Buyer | Deliverable |
|---------|-------|-------------|
| Team Skill Assessment | Eng/Product Directors | Team heatmap, individual gap reports |
| Internal Learning Paths | L&D | Role-based curricula (custom graphs) |
| Enterprise Certifications | HR | Internal TPM credential with custom rubric |
| Manager Dashboards | VPs | Team-level readiness, trends, attrition risk |
| AI Coach (Enterprise) | Org | Private, org-data-aware coaching (data isolation) |

## Data Model
```
Organization
  ├─ Members (roles: owner/admin/manager/member)
  ├─ Enterprise Assessments (assign competency sets to cohorts)
  ├─ Team Dashboards (aggregate latest_user_competency_scores)
  └─ Custom Learning Paths (subset of graph + custom competencies)
```

## Use Cases
1. **Hiring validation** — assess candidates against internal TPM bar
2. **Succession planning** — identify ICs ready for TPM (score + trajectory)
3. **Onboarding** — new TPMs get personalized ramp plan from assessment
4. **Quarterly capability review** — org-wide readiness trend
5. **Consulting firms** — certify consultants, show clients credible TPM capability

## Permission Model (RLS)
- Owner/Admin: everything
- Manager: their team's dashboards + assessments
- Member: own data only

## Enterprise Analytics Agent
- Input: org competency scores
- Output: team heatmaps, category-level gaps, trends over quarters, readiness distribution
- Deterministic aggregation (no LLM) for scores; LLM only for narrative summaries

## Pricing (Phase 9)
Custom. Reference: per-seat/annual + setup fee. Anchor: ₹5,000/user/year for team (50 seats min).

## MVP Scope
**None.** Enterprise is Phase 9. The schema (organizations, members, enterprise_assessments) is created now for forward-compat, not activated.

## Technical Notes
- Org membership via verified work email domain or SSO
- Data isolation: RLS scoped by org_id
- Custom competencies: allow org to add their own competency rows (org-scoped)

---

*Depends on: 02 (phases), 04 (schema)*