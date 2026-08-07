# TPMForge — API Specification

**Framework:** Next.js API Routes (App Router, Route Handlers) + Server Actions.
**Base URL:** `https://<project>.vercel.app/api/v1`
**Auth:** Supabase JWT (Bearer token) via middleware.
**Format:** JSON. Errors: `{ "error": { "code": string, "message": string } }`.

---

## Auth Endpoints (Supabase handles directly)
- Supabase Auth provides: signup, login, OAuth, password reset, session refresh
- Client uses `@supabase/ssr` + `@supabase/supabase-js`
- Middleware guards `/app/*` routes

## Endpoints

### Resume & Diagnostic
| Method | Path | Auth | Body/Params | Returns |
|--------|------|------|-------------|---------|
| POST | `/resumes/analyze` | ✅ | multipart: `file`, `targetRole`, `consentAcknowledged` | `analysisId` (async, 202) |
| GET | `/resumes/:id` | ✅ | — | Analysis: scores, readiness, radar, gaps |
| GET | `/resumes/:id/report` | Public token | — | Shareable report |
| GET | `/me/readiness` | ✅ | — | Latest readiness + trend |

### Competencies
| Method | Path | Auth | Returns |
|--------|------|------|---------|
| GET | `/competencies` | Public | List (category, domain, difficulty, importance) |
| GET | `/competencies/:slug` | Public | Full competency + published assets |
| GET | `/competencies/:slug/assets?type=mcq&limit=10` | Public | Asset banks (MCQ/scenario/etc.) |
| GET | `/categories` | Public | Categories + domains tree |

### Roadmap
| Method | Path | Auth | Body | Returns |
|--------|------|------|------|---------|
| POST | `/roadmaps` | ✅ Pro | `{ targetRole, timelineWeeks, weeklyHours }` | `roadmapId` |
| GET | `/roadmaps/:id` | ✅ | — | Weeks + items |
| GET | `/roadmaps/:id/weeks/:week/items` | ✅ | — | Items with assets |
| POST | `/roadmaps/:id/regenerate` | ✅ Pro | — | New version |

### Assessments
| Method | Path | Auth | Body | Returns |
|--------|------|------|------|---------|
| POST | `/assessments` | ✅ | `{ competencyId, type, mode }` | Questions (from graph bank) |
| POST | `/assessments/:id/responses` | ✅ | `{ questionId, response }` | Score (MCQ immediate; open-text async) |
| GET | `/assessments/:id` | ✅ | — | Status, per-question scores |
| GET | `/me/scores` | ✅ | — | All competency scores + radar data |

### Coach
| Method | Path | Auth | Body | Returns |
|--------|------|------|------|---------|
| POST | `/coach/sessions` | ✅ Pro | `{ mode, competencyId? }` | `sessionId` |
| POST | `/coach/sessions/:id/messages` | ✅ Pro | `{ content }` | Streamed completion (SSE) |
| GET | `/coach/sessions/:id` | ✅ Pro | — | Transcript |

### Subscription (Razorpay)
| Method | Path | Auth | Body | Returns |
|--------|------|------|------|---------|
| POST | `/subscriptions/create` | ✅ | `{ plan: 'pro' }` | Razorpay subscription details |
| POST | `/subscriptions/cancel` | ✅ | — | Cancel at period end |
| GET | `/subscriptions/me` | ✅ | — | Tier, status, period |
| POST | `/webhooks/razorpay` | Webhook secret | Razorpay event | 200 (idempotent) |

### Content (Admin/Pipeline)
| Method | Path | Auth | Body | Returns |
|--------|------|------|------|---------|
| GET | `/admin/content/jobs` | ✅ admin | — | Pending generation jobs |
| POST | `/admin/content/jobs` | ✅ admin | `{ competencyId, assetType, model }` | Queue job |
| POST | `/admin/content/assets/:id/publish` | ✅ admin | — | Publish (status → published) |
| GET | `/admin/content/assets/:id` | ✅ admin | — | Asset JSON (review) |

### Blog
| Method | Path | Auth | Returns |
|--------|------|------|---------|
| GET | `/blog/posts` | Public | Published posts (paginated) |
| GET | `/blog/posts/:slug` | Public | Post MDX |
| GET | `/blog/posts?competency=:id` | Public | Posts tagged to competency |

## Response Caching
- GET competency/assets: `Cache-Control: public, s-maxage=3600` (Vercel ISR/edge)
- Coach messages: streamed, no cache
- Report share URLs: token-gated, immutable cache

## Rate Limits (app-level)
- Public GETs: 120/min/IP
- Resume analyze: 1/day/user (free), 3/day (Pro)
- Coach messages: 50/day/user (Pro)
- Assessment responses: 30/day/user (Pro)
- Webhook: Razorpay signature verified; idempotency key dedupe

## Error Codes
| Code | Meaning |
|------|---------|
| `AUTH_REQUIRED` | No/invalid JWT |
| `PRO_REQUIRED` | Feature requires Pro |
| `RATE_LIMITED` | Quota exceeded |
| `NOT_FOUND` | Resource missing |
| `VALIDATION_ERROR` | Zod schema failed |
| `ANALYSIS_IN_PROGRESS` | Resume processing (poll) |
| `MODEL_UNAVAILABLE` | LLM degraded (fallback exhausted) |

## Streaming (Coach)
```
POST /coach/sessions/:id/messages  →  SSE:
event: chunk      data: { text }
event: citations  data: { assetIds: [...] }
event: done       data: { messageId, tokens }
```

---

*Implementation target: `apps/web/app/api/**/route.ts`. All handlers typed with Zod, wrapped in try/catch → error envelope.*