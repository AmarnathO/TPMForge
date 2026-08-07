# TPMForge — Monetization

## Pricing (Simple, Paid-Only)

One membership, two billing options. No free tier, no founding-member gimmicks.

### Membership — ₹2,000/month
Full roadmap + regeneration, AI Coach (50 msgs/day), full assessment practice (30/day), dashboard + progress, priority access, future features (academy, interviews, projects, certs).

### Annual — ₹1,600/month effective (billed ₹19,200/yr)
Same as monthly, save 20%. Cancel anytime (subscription ends at period end).

### Enterprise (Phase 9)
Custom. Reference ₹5,000/user/yr, 50-seat minimum. Team dashboards, internal certs, custom paths, org coach.

## Revenue Model
| Phase | Revenue Source | Target |
|-------|----------------|--------|
| MVP | Memberships (₹2,000/mo or ₹1,600/mo annual) | 50 users → ₹80–100k MRR |
| Phase 7 | Certification fees (₹2,000–₹8,000) | Upsell |
| Phase 9 | Enterprise contracts | ARR anchors |

## Cost Model (Free-First)
| Cost | Amount |
|------|--------|
| Vercel Hobby | $0 |
| Supabase Free | $0 |
| OpenRouter free models | $0 (rate-limited) |
| Razorpay | 2% per txn |
| **Fixed monthly** | **$0** |

**LLM scaling trigger:** at ~100 members (≈1k coach msgs/day), rate limits bite → introduce cheap paid models (cents/day) or self-host small model. Monitor `llm_usage_logs`.

## Payment Flow (Razorpay)
```
User clicks "Become a member" → POST /subscriptions/create
  → Razorpay Subscription API (₹2,000/mo or ₹1,600/mo annual)
  → Redirect to Razorpay checkout → success → webhook verify
  → Update subscriptions table → member unlocked
Cancel → cancel_at_period_end → downgrade at period end
```

## Conversion Levers
1. Free diagnostic preview on landing (score + sample roadmap) → membership paywall
2. Coach 3 free messages → gate (show quality, then charge)
3. Annual "2 free months" framing pushes annual
4. Re-engagement email after readiness score with roadmap preview

## KPI Targets
| Metric | MVP | Phase 2+ |
|--------|-----|----------|
| MRR | ₹100k | ₹500k |
| Conversion (visitor→member, 30d) | 2% | 4% |
| Churn (monthly) | < 5% | < 3% |
| CAC | ~₹0 (content/word-of-mouth) | ₹200 |
| LTV | ₹16k (8 mo avg) | ₹20k |
| LTV:CAC | — | 100:1 (organic) |

## Price Testing Plan
- After 100 paying users: A/B ₹2,000 vs ₹2,500 (grandfather existing at ₹2,000)
- Annual: 20% discount → push annual with 2 free months framing
- Enterprise: value-based quotes, not per-seat discounts

## Non-Goals
- Ads, data selling, employer-sponsored resume listings
- Freemium unlimited AI (unsustainable)
- Per-assessment micro-payments (friction)
- Waitlist or founding-member scarcity mechanics

---

*Depends on: 02 (plan), 15 (MVP)*
