# TPMForge — Frontend Architecture

## Stack
Next.js 14 (App Router) + TypeScript + Tailwind CSS + shadcn/ui, deployed on Vercel Hobby (free).

## Repo Layout
```
apps/web/
  app/
    (marketing)/
      page.tsx                  # Landing
      blog/
        [slug]/page.tsx         # Blog post (MDX)
      pricing/page.tsx
      auth/                     # Login/signup/oauth callback
    (app)/                      # Authenticated
      dashboard/page.tsx        # Readiness + radar + gaps
      roadmap/
        [id]/page.tsx           # Week-by-week roadmap
      coach/page.tsx            # AI Coach chat
      assessment/
        [id]/page.tsx           # Assessment runner
      resume/page.tsx           # Upload + analysis result
      settings/page.tsx
    api/**/route.ts             # API handlers (see 12_API_SPEC)
  components/
    ui/                         # shadcn/ui
    charts/                     # Radar, heatmap (recharts)
    coach/                      # Chat components
    assessment/                 # MCQ, scenario, case runner
  lib/
    supabase/                   # client + server clients
    ai/                         # OpenRouter client wrappers
    scoring/                    # Rubric math
    graph/                      # Graph traversal
  packages/
    core/                       # Shared types, scoring, graph kernel
```

## Key Pages & Data Fetching

| Page | Data | Fetching |
|------|------|----------|
| Landing | static + signup CTA | Server component, `revalidate=3600` |
| Dashboard | readiness, radar, gaps | Server component + Supabase query |
| Roadmap | weeks + items | Server component + Supabase |
| Coach | session transcript | Client + SSE streaming |
| Assessment | question bank | Server component + Supabase |
| Resume | upload + result | Client (upload) → server (analysis) → poll |

## Authentication Flow
- `@supabase/ssr` middleware → refresh session
- Guard `(app)/*` → redirect to `/auth` if no session
- Member gate: middleware checks `subscriptions.tier` (server-side)

## State Management
- Server Components default (RSC) — minimal client state
- Coach chat: local state + SSE via `useSWR`/`EventSource`
- Assessment runner: Zustand for local progress state
- Global: `useAuth` hook from Supabase context

## Design System (shadcn/ui)
- Theme: light/dark toggle
- Charts: recharts (radar, heatmap, line trends)
- Icons: lucide-react
- Typography: Tailwind typography plugin for MDX

## Performance Budget
- Lighthouse ≥ 90 (marketing + app shell)
- Core Web Vitals: LCP < 2.5s, CLS < 0.1
- Route code-splitting via App Router
- ISR for blog + landing (stale-while-revalidate)

## Accessibility
- ARIA labels on interactive elements
- Keyboard navigation for assessment runner + coach
- Focus states (Tailwind)

## Error Boundaries
- Global error.tsx + not-found.tsx
- Route-level error boundaries for coach/assessment

## Testing
- Vitest + Testing Library for components (radar chart, MCQ runner, coach input)
- Playwright for critical flows (signup → resume → dashboard)

## MVP Page Checklist (Phases A/B)
- [ ] Landing (signup CTA + pricing)
- [ ] Auth pages
- [ ] Onboarding (role, target, timeline)
- [ ] Resume upload + analysis result (radar, score, gaps)
- [ ] Dashboard (readiness, quick stats)
- [ ] Roadmap view (sample → full Pro)
- [ ] Coach chat (Pro)
- [ ] Assessment runner (MCQ + scenario)
- [ ] Pricing page (₹2,000/mo · ₹1,600/mo annual)
- [ ] Settings (profile, subscription, consent toggle)

---

*Depends on: 02 (phases), 05 (AI client), 12 (API)*