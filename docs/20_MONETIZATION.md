# TPMForge — Monetization

## Pricing Tiers

### Free
Resume analysis (3/mo), readiness score + radar + gaps, 2-week sample roadmap, limited assessment (3/mo), selected blogs, newsletter.

### Pro — ₹999/mo intro (founding member)
Full roadmap + regeneration, AI Coach (50 msgs/day), full assessment practice (30/day), dashboard + progress, priority access, future features (academy, interviews, projects, certs).
- **Intro expiry:** 50 users OR 60 days → ₹2,000/mo
- **Annual (post-intro):** ₹19,200/yr (₹1,600/mo effective)

### Enterprise (Phase 9)
Custom. Reference ₹5,000/user/yr, 50-seat minimum. Team dashboards, internal certs, custom paths, org coach.

## Founding Member Strategy (MVP)
- Badge + "locked forever" messaging (early adopters get intro price for life)
- Scarcity: 50 users or 60 days, whichever first
- Social proof: founder countdown on pricing page

## Revenue Model
| Phase | Revenue Source | Target |
|-------|----------------|--------|
| MVP | Pro subscriptions (₹999) | 50 users → ₹50k MRR |
| Phase 2+ | Pro at ₹2,000 | 250 users → ₹500k MRR |
| Phase 7 | Certification fees (₹2,000–₹8,000) | Upsell |
| Phase 9 | Enterprise contracts | ARR anchors |

## Cost Model (Free-First)
| Cost | Amount |
|------|--------|
| Vercel Hobby | $0 |
| Supabase Free | $0 |
| OpenRouter free models | $0 (rate-limited) |
| Razorpay | 2% per txn |
| Resend (newsletter) | $0 (≤3k/mo) |
| **Fixed monthly** | **$0** |

**LLM scaling trigger:** at ~100 Pro users (≈1k coach msgs/day), rate limits bite → introduce cheap paid models (cents/day) or self-host small model. Monitor `llm_usage_logs`.

## Payment Flow (Razorpay)
```
User clicks "Go Pro" → POST /subscriptions/create
  → Razorpay Subscription API (₹999/mo, addons for annual)
  → Redirect to Razorpay checkout → success → webhook verify
  → Update subscriptions table → Pro unlocked
Cancel → cancel_at_period_end → downgrade at period end
```

## Conversion Levers
1. Free diagnostic → full roadmap paywall (clear value preview)
2. Coach 3 free messages → Pro gate (show quality, then charge)
3. Founding-member scarcity
4. Re-engagement email after readiness score with roadmap preview

## KPI Targets
| Metric | MVP | Phase 2+ |
|--------|-----|----------|
| MRR | ₹50k | ₹500k |
| Conversion (free→pro, 30d) | 5% | 8% |
| Churn (monthly) | < 5% | < 3% |
| CAC | ~₹0 (content/word-of-mouth) | ₹200 |
| LTV | ₹8k (8 mo avg) | ₹20k |
| LTV:CAC | — | 100:1 (organic) |

## Price Testing Plan
- After 100 paying users: A/B ₹999 vs ₹1,499 (grandfather existing at ₹999)
- Annual: 20% discount → push annual with 2 free months framing
- Enterprise: value-based quotes, not per-seat discounts

## Non-Goals
- Ads, data selling, employer-sponsored resume listings
- Freemium unlimited AI (unsustainable)
- Per-assessment micro-payments (friction)

---

*Depends on: 02 (plan), 15 (MVP)*