# TPMForge — Blog Strategy

## Purpose
Acquisition + SEO. Every blog post links to one or more competencies in the graph → reader conversion to free diagnostic.

## Categories
Technology, System Design, Cloud, AI, Product, Business, Program Management, Leadership, Career Growth, Interview Preparation, Templates, Case Studies, Industry News, Books, Product Reviews.

## Competency-Cluster Model
```
Each competency = 1 pillar article + 3 supporting articles
Pillar: "REST API Design for TPMs" (competency TECH-API-REST-001)
  ├─ Supporting 1: "Idempotency Explained: Why Your API Calls Duplicate"
  ├─ Supporting 2: "API Versioning: The TPM's Guide to Breaking Changes"
  └─ Supporting 3: "OpenAPI Specs for Non-Engineers"
Every article ends with CTA → free readiness assessment for that competency
```

## Article Types & Funnel
| Type | Purpose | Conversion |
|------|---------|------------|
| Pillar (comprehensive) | SEO rank for competency | CTA → assessment |
| Supporting (narrow) | Long-tail keyword | CTA → pillar |
| Template (downloadable) | Email capture | CTA → newsletter |
| Case study | Authority + shareable | CTA → free account |
| Industry news | Trending traffic | CTA → related pillar |

## SEO Rules
- One pillar per competency (no cannibalization)
- Keyword mapping table in Notion/DB (post ↔ competency ↔ keyword)
- Internal linking: supporting → pillar → graph competency page
- Open Graph images per post
- Reading time auto-calculated

## Newsletter Strategy
- Weekly digest: 1 featured article + 2 curated + 1 challenge
- Segmentation: by category interest, by readiness score
- Send: Resend/EmailJS free tier (≤3k/mo) or Supabase pg_cron + SMTP
- Subscriber → free diagnostic CTA in every issue

## Content Pipeline (Free-First)
- AI-drafted (GitHub Actions + free model) → human edit → publish
- Editorial calendar in `blog_posts` table (status: draft → published)

## MVP Scope
Deferred to Phase C (P10). Landing page waitlist is the pre-launch acquisition channel.

## KPIs
| Metric | Target |
|--------|--------|
| Blog → diagnostic conversion | > 3% |
| Pillar article rank (page 1, 6mo) | > 20% of pillars |
| Newsletter open rate | > 35% |
| Newsletter → account conversion | > 5% |

---

*Depends on: 03 (competency linkage)*