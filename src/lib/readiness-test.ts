export type ReadinessAspect = "business" | "technology" | "product";

export type QuestionDifficulty = "basic" | "intermediate" | "pro";

export const ASPECTS: {
  key: ReadinessAspect;
  label: string;
  blurb: string;
}[] = [
  {
    key: "business",
    label: "Business",
    blurb: "Economics, strategy, and stakeholder value",
  },
  {
    key: "technology",
    label: "Technology",
    blurb: "Architecture, systems, and engineering fluency",
  },
  {
    key: "product",
    label: "Product",
    blurb: "Discovery, prioritization, and shipping",
  },
];

export const DIFFICULTY_MIX: Record<QuestionDifficulty, number> = {
  basic: 2,
  intermediate: 4,
  pro: 6,
};

export const DIFFICULTY_LABEL: Record<QuestionDifficulty, string> = {
  basic: "Basic",
  intermediate: "Intermediate",
  pro: "Pro",
};

export interface ReadinessQuestionOption {
  label: string;
  points: number;
}

export interface ReadinessQuestion {
  id: string;
  aspect: ReadinessAspect;
  difficulty: QuestionDifficulty;
  prompt: string;
  options: ReadinessQuestionOption[];
}

export const READINESS_QUESTIONS: ReadinessQuestion[] = [
  // =====================================================================
  // BUSINESS — 2 basic, 4 intermediate, 6 pro
  // =====================================================================
  {
    id: "biz-b1",
    aspect: "business",
    difficulty: "basic",
    prompt:
      "A product is sold for ₹10 and costs ₹8 to produce and deliver. What is the gross margin?",
    options: [
      { label: "20% — profit is ₹2 on a ₹10 sale.", points: 3 },
      { label: "80% — costs are 80% of the price.", points: 1 },
      { label: "₹2 — the absolute rupee profit.", points: 1 },
      { label: "Not enough information to say.", points: 0 },
    ],
  },
  {
    id: "biz-b2",
    aspect: "business",
    difficulty: "basic",
    prompt:
      "If 10% of a product's customers cancel every month, roughly how long does an average customer stay?",
    options: [
      { label: "About 10 months (lifetime ≈ 1 ÷ churn).", points: 3 },
      { label: "About 1 month.", points: 0 },
      { label: "About 90 days.", points: 1 },
      { label: "Churn alone can't tell us anything about lifetime.", points: 1 },
    ],
  },
  {
    id: "biz-3",
    aspect: "business",
    difficulty: "intermediate",
    prompt:
      "You raise prices 10% and see signups drop 4%. What does this tell you?",
    options: [
      { label: "Price elasticity is low; the increase likely raises revenue — validate with cohort economics.", points: 3 },
      { label: "Demand is elastic, so revert the price immediately.", points: 0 },
      { label: "The feature set is wrong — rework the roadmap.", points: 1 },
      { label: "Marketing spend is too low; increase acquisition.", points: 1 },
    ],
  },
  {
    id: "biz-4",
    aspect: "business",
    difficulty: "intermediate",
    prompt:
      "Leadership asks for a bottom-up TAM estimate for a new segment. What's the correct approach?",
    options: [
      { label: "Segment by real buyer count and price, then sanity-check against top-down sources.", points: 3 },
      { label: "Use a published analyst TAM figure verbatim.", points: 1 },
      { label: "Multiply total internet users by an assumed price.", points: 0 },
      { label: "Forecast from your best quarter's growth rate.", points: 1 },
    ],
  },
  {
    id: "biz-5",
    aspect: "business",
    difficulty: "intermediate",
    prompt:
      "One product line has a 62% gross margin, another has 28%. Both grow similarly. What's the financially sound move?",
    options: [
      { label: "Shift investment toward the high-margin line and investigate the low-margin one.", points: 3 },
      { label: "Kill the low-margin line immediately.", points: 1 },
      { label: "Keep growth equal since revenue is revenue.", points: 0 },
      { label: "Price-cut the high-margin line to accelerate growth.", points: 1 },
    ],
  },
  {
    id: "biz-7",
    aspect: "business",
    difficulty: "intermediate",
    prompt:
      "To expand your user base, engineering proposes a free tier. Which decision framework is sound?",
    options: [
      { label: "Model conversion funnel, unit economics, and cannibalization before committing.", points: 3 },
      { label: "Launch free first and figure out monetization later.", points: 0 },
      { label: "Charge a tiny fee to keep revenue from dropping.", points: 1 },
      { label: "Only offer free to enterprise accounts.", points: 2 },
    ],
  },
  {
    id: "biz-1",
    aspect: "business",
    difficulty: "pro",
    prompt:
      "A feature is expected to add ₹40/user/month in revenue and ₹5/user/month in support savings, at ₹12/user/month in extra infra cost. CAC is ₹4,800. What do you evaluate first?",
    options: [
      { label: "Compute the payback period (CAC ÷ monthly contribution) before building.", points: 3 },
      { label: "Ship fast to win market share before competitors move.", points: 0 },
      { label: "Compare gross revenue against engineering effort only.", points: 1 },
      { label: "Estimate gross margin as revenue minus infra cost.", points: 2 },
    ],
  },
  {
    id: "biz-2",
    aspect: "business",
    difficulty: "pro",
    prompt:
      "Two projects both clear their cost of capital. Project A returns ₹9L in year 1, Project B returns ₹14L in year 3. Budget only allows one. What drives your decision?",
    options: [
      { label: "Time-value of money and strategic alignment, not just nominal returns.", points: 3 },
      { label: "Always pick the larger absolute return.", points: 0 },
      { label: "Pick whichever engineering estimates look cheapest.", points: 1 },
      { label: "Split the budget 50/50 to reduce risk.", points: 2 },
    ],
  },
  {
    id: "biz-6",
    aspect: "business",
    difficulty: "pro",
    prompt:
      "Monthly churn is 5% and CAC is ₹2,400. A customer contributes ₹300/month after variable costs. Is the unit economics sustainable?",
    options: [
      { label: "Lifetime ≈ 20 months, so LTV ≈ ₹6,000 vs CAC ₹2,400 — a healthy 2.5x ratio.", points: 3 },
      { label: "Lifetime is exactly 5% of the customer base — unsustainable.", points: 0 },
      { label: "Lifetime is roughly 12 months by convention, so LTV ≈ ₹3,600 — acceptable.", points: 1 },
      { label: "Churn alone says nothing about lifetime value.", points: 1 },
    ],
  },
  {
    id: "biz-8",
    aspect: "business",
    difficulty: "pro",
    prompt:
      "A vendor contract saves 12% of infra cost but locks you in for 2 years with a 40% overage penalty. What do you weigh?",
    options: [
      { label: "Total cost of ownership including penalties and exit flexibility.", points: 3 },
      { label: "The 12% headline saving alone.", points: 0 },
      { label: "Whether the vendor has a good brand.", points: 1 },
      { label: "Only the first year's projected spend.", points: 1 },
    ],
  },
  {
    id: "biz-10",
    aspect: "business",
    difficulty: "pro",
    prompt:
      "You must defend next quarter's plan to finance. Which framing lands best?",
    options: [
      { label: "Link every initiative to revenue, margin, or strategic risk outcomes with numbers.", points: 3 },
      { label: "List engineering milestones and team capacity.", points: 1 },
      { label: "Lead with the number of features being shipped.", points: 0 },
      { label: "Present the plan as a reaction to competitor moves.", points: 1 },
    ],
  },
  {
    id: "biz-9",
    aspect: "business",
    difficulty: "pro",
    prompt:
      "A competitor ships a lookalike of your flagship feature in two weeks. Your best response?",
    options: [
      { label: "Assess what your customers actually value, then double down on your differentiation.", points: 3 },
      { label: "Rush an identical feature out to match.", points: 0 },
      { label: "Lower all prices to undercut them.", points: 1 },
      { label: "Ignore them; competitors don't matter.", points: 0 },
    ],
  },

  // =====================================================================
  // TECHNOLOGY — 2 basic, 4 intermediate, 6 pro
  // =====================================================================
  {
    id: "tech-b1",
    aspect: "technology",
    difficulty: "basic",
    prompt:
      "What is the main difference between horizontal and vertical scaling?",
    options: [
      { label: "Horizontal adds more machines to share load; vertical makes one machine bigger.", points: 3 },
      { label: "Vertical adds more machines; horizontal makes one machine bigger.", points: 0 },
      { label: "They are the same thing under different names.", points: 0 },
      { label: "Horizontal only applies to databases.", points: 1 },
    ],
  },
  {
    id: "tech-b2",
    aspect: "technology",
    difficulty: "basic",
    prompt:
      "What is a database index primarily used for?",
    options: [
      { label: "Speeding up lookups and queries on large tables.", points: 3 },
      { label: "Storing backups of the database.", points: 0 },
      { label: "Encrypting data at rest.", points: 0 },
      { label: "Enforcing user permissions.", points: 1 },
    ],
  },
  {
    id: "tech-2",
    aspect: "technology",
    difficulty: "intermediate",
    prompt:
      "A slow analytics query joins several large tables and times out for users. The quickest high-leverage fix?",
    options: [
      { label: "Inspect the query plan, add targeted indexes, and consider a materialized summary.", points: 3 },
      { label: "Cache the results for 24 hours in memory.", points: 1 },
      { label: "Denormalize every table into one wide table.", points: 0 },
      { label: "Increase the database instance size until it's fast.", points: 1 },
    ],
  },
  {
    id: "tech-4",
    aspect: "technology",
    difficulty: "intermediate",
    prompt:
      "Traffic is 10x the forecast and the monolith is running hot. Which scaling approach is sound for the short term?",
    options: [
      { label: "Horizontally scale stateless app tiers and move state to a backing store.", points: 3 },
      { label: "Buy one massive machine and hope it absorbs the spike.", points: 0 },
      { label: "Rate-limit all users to keep the box stable.", points: 1 },
      { label: "Deploy a second copy of the database with no sync.", points: 0 },
    ],
  },
  {
    id: "tech-6",
    aspect: "technology",
    difficulty: "intermediate",
    prompt:
      "You add a cache in front of a read-heavy API. What must you design for first?",
    options: [
      { label: "Cache invalidation and stale-data tolerance for each consumer.", points: 3 },
      { label: "The fastest possible TTL so data is never stale.", points: 1 },
      { label: "Caching everything including writes.", points: 0 },
      { label: "No invalidation — only expiration.", points: 0 },
    ],
  },
  {
    id: "tech-7",
    aspect: "technology",
    difficulty: "intermediate",
    prompt:
      "A schema change will add a required column to a table with 50M rows. What's the safe rollout?",
    options: [
      { label: "Add the column as nullable, backfill in batches, then enforce.", points: 3 },
      { label: "Lock the table and ALTER in one maintenance window.", points: 1 },
      { label: "Drop and recreate the table from a snapshot.", points: 0 },
      { label: "Add the constraint immediately and roll back if it errors.", points: 1 },
    ],
  },
  {
    id: "tech-1",
    aspect: "technology",
    difficulty: "pro",
    prompt:
      "A public REST API you own has a breaking change to a widely used endpoint. What's the safest path?",
    options: [
      { label: "Add a versioned endpoint (e.g., /v2) and migrate consumers before deprecating v1.", points: 3 },
      { label: "Change the contract in place and update the docs.", points: 0 },
      { label: "Add optional fields and call it backward compatible even if defaults change behavior.", points: 1 },
      { label: "Keep the old field but silently drop its data.", points: 0 },
    ],
  },
  {
    id: "tech-3",
    aspect: "technology",
    difficulty: "pro",
    prompt:
      "A critical endpoint went from 90ms to 1.2s after a deploy. Your first diagnostic step?",
    options: [
      { label: "Check dashboards for latency breakdown, DB load, and recent deploy rollbacks in parallel.", points: 3 },
      { label: "Restart all services to clear any cache.", points: 0 },
      { label: "Add more instances immediately.", points: 1 },
      { label: "Rewrite the endpoint to be async.", points: 0 },
    ],
  },
  {
    id: "tech-5",
    aspect: "technology",
    difficulty: "pro",
    prompt:
      "A team proposes skipping a refactor to ship a feature that likely drives 20% more signups. The system is fragile. What's the balanced call?",
    options: [
      { label: "Refactor the hot path the feature depends on, and ship the rest iteratively.", points: 3 },
      { label: "Ship the feature and fix broken things when they break.", points: 0 },
      { label: "Refactor everything before any feature work.", points: 1 },
      { label: "Cancel the feature to protect code quality.", points: 0 },
    ],
  },
  {
    id: "tech-8",
    aspect: "technology",
    difficulty: "pro",
    prompt:
      "You're building an alert that should catch real user-facing outages without paging everyone on noise. Best foundation?",
    options: [
      { label: "SLOs with error-budget burn-rate alerts on request success and latency.", points: 3 },
      { label: "Alert on every 5xx status code.", points: 1 },
      { label: "Alert when CPU crosses 80%.", points: 0 },
      { label: "Alert only on downtime longer than 10 minutes.", points: 1 },
    ],
  },
  {
    id: "tech-9",
    aspect: "technology",
    difficulty: "pro",
    prompt:
      "A new API lets any authenticated user read another user's private data due to a broken authorization check. Immediate action?",
    options: [
      { label: "Verify the blast radius, fix and deploy the authorization check, and rotate/suspend exposed tokens.", points: 3 },
      { label: "File a bug and schedule it for next sprint.", points: 0 },
      { label: "Hide the endpoint from the docs until someone complains.", points: 0 },
      { label: "Rate-limit the endpoint to reduce exposure.", points: 1 },
    ],
  },
  {
    id: "tech-10",
    aspect: "technology",
    difficulty: "pro",
    prompt:
      "You must explain a risky architecture migration to skeptical engineers. What earns their confidence?",
    options: [
      { label: "An incremental, reversible plan with canary steps and rollback criteria.", points: 3 },
      { label: "An executive mandate that the migration is happening.", points: 0 },
      { label: "A promise that it will be faster with no details.", points: 0 },
      { label: "A big-bang switchover planned for a quiet weekend.", points: 1 },
    ],
  },

  // =====================================================================
  // PRODUCT — 2 basic, 4 intermediate, 6 pro
  // =====================================================================
  {
    id: "prod-b1",
    aspect: "product",
    difficulty: "basic",
    prompt:
      "Which metric directly measures whether visitors complete a desired action (such as signing up or purchasing) on your site?",
    options: [
      { label: "Conversion rate.", points: 3 },
      { label: "Monthly churn.", points: 1 },
      { label: "Server uptime.", points: 0 },
      { label: "Number of features shipped.", points: 0 },
    ],
  },
  {
    id: "prod-b2",
    aspect: "product",
    difficulty: "basic",
    prompt:
      "What is the primary purpose of an MVP?",
    options: [
      { label: "Test the riskiest assumption with the smallest useful slice.", points: 3 },
      { label: "Ship every feature so customers are never disappointed.", points: 0 },
      { label: "Build a polished marketing demo with no real flows.", points: 1 },
      { label: "Deliver the complete long-term vision in one release.", points: 0 },
    ],
  },
  {
    id: "prod-3",
    aspect: "product",
    difficulty: "intermediate",
    prompt:
      "An A/B test shows a 2% lift in conversion with p = 0.04 but only 400 users per variant. What do you do?",
    options: [
      { label: "Treat it as promising but underpowered — run longer or segment before declaring victory.", points: 3 },
      { label: "Ship it because p < 0.05 means statistically significant.", points: 1 },
      { label: "Ignore the data and trust the designer's instinct.", points: 0 },
      { label: "Launch it to everyone immediately to bank the gain.", points: 0 },
    ],
  },
  {
    id: "prod-4",
    aspect: "product",
    difficulty: "intermediate",
    prompt:
      "You have two weeks of research budget to validate an unproven feature. What's the most reliable input?",
    options: [
      { label: "Customer interviews on actual pain points plus a cheap prototype test.", points: 3 },
      { label: "A survey emailed to your entire list.", points: 1 },
      { label: "Your own opinion, since you know the space.", points: 0 },
      { label: "Reading competitor reviews online.", points: 1 },
    ],
  },
  {
    id: "prod-5",
    aspect: "product",
    difficulty: "intermediate",
    prompt:
      "Activation converts strongly but weekly retention is flat. Where is the problem likely?",
    options: [
      { label: "The core loop lacks repeated value — investigate habit and re-engagement moments.", points: 3 },
      { label: "Marketing isn't sending enough users.", points: 1 },
      { label: "The onboarding flow is too long.", points: 1 },
      { label: "Pricing is too high.", points: 0 },
    ],
  },
  {
    id: "prod-9",
    aspect: "product",
    difficulty: "intermediate",
    prompt:
      "Signups are growing but 70% of new users never finish onboarding. Highest-leverage fix?",
    options: [
      { label: "Instrument the funnel to find the exact drop-off step, then simplify it.", points: 3 },
      { label: "Add more signup fields to filter out low-intent users.", points: 0 },
      { label: "Send more emails after signup.", points: 1 },
      { label: "Reduce the price to encourage completion.", points: 1 },
    ],
  },
  {
    id: "prod-1",
    aspect: "product",
    difficulty: "pro",
    prompt:
      "Three features are candidates: A (high reach, low effort, low confidence), B (low reach, high effort, high confidence), C (medium, medium, medium). Which prioritization approach is correct?",
    options: [
      { label: "Score them on reach × impact ÷ effort, weighted by confidence, to compare apples to apples.", points: 3 },
      { label: "Ship whatever the biggest customer asked for.", points: 0 },
      { label: "Pick the cheapest one to bank a quick win.", points: 1 },
      { label: "Ship all three in parallel to reduce risk.", points: 0 },
    ],
  },
  {
    id: "prod-2",
    aspect: "product",
    difficulty: "pro",
    prompt:
      "Your product's goal is long-term sustainable growth. Which metric best captures it?",
    options: [
      { label: "A north-star metric tied to delivered value, like weekly active users completing the core action.", points: 3 },
      { label: "Total registered accounts.", points: 1 },
      { label: "Monthly revenue from existing customers.", points: 1 },
      { label: "Number of features shipped.", points: 0 },
    ],
  },
  {
    id: "prod-6",
    aspect: "product",
    difficulty: "pro",
    prompt:
      "You must choose between a big strategic bet (12 weeks) and several quick wins (3 weeks each). What's the right posture?",
    options: [
      { label: "De-risk the big bet with validation, while banking a few quick wins for momentum.", points: 3 },
      { label: "Always take the big bet — strategy beats tactics.", points: 1 },
      { label: "Only do quick wins until the numbers look good.", points: 1 },
      { label: "Cancel the big bet to stay nimble.", points: 0 },
    ],
  },
  {
    id: "prod-7",
    aspect: "product",
    difficulty: "pro",
    prompt:
      "A stakeholder asks for a dashboard of 'total visits'. Which metric would you counter-propose?",
    options: [
      { label: "An actionable metric tied to a decision, like activation rate by cohort.", points: 3 },
      { label: "Total visits is fine — just add more charts.", points: 0 },
      { label: "Unique visitors per month.", points: 1 },
      { label: "Page load time as a proxy for engagement.", points: 1 },
    ],
  },
  {
    id: "prod-8",
    aspect: "product",
    difficulty: "pro",
    prompt:
      "For an MVP, which scope is the right one?",
    options: [
      { label: "The smallest end-to-end slice that tests the riskiest assumption.", points: 3 },
      { label: "Every feature the sales team listed in the contract.", points: 0 },
      { label: "A polished read-only prototype with no real flows.", points: 1 },
      { label: "The full vision so users see what's coming.", points: 0 },
    ],
  },
  {
    id: "prod-10",
    aspect: "product",
    difficulty: "pro",
    prompt:
      "Which set of signals most strongly indicates product-market fit?",
    options: [
      { label: "Organic growth plus a rising share of users who would be 'very disappointed' without the product.", points: 3 },
      { label: "A large marketing budget and press coverage.", points: 1 },
      { label: "Feature requests accumulating in a backlog.", points: 0 },
      { label: "Positive reviews on app stores.", points: 1 },
    ],
  },
];

export type ReadinessAnswers = Record<string, number>;

export interface AspectScores {
  business: number;
  technology: number;
  product: number;
}

const ZERO_ASPECTS: AspectScores = {
  business: 0,
  technology: 0,
  product: 0,
};

export const QUESTIONS_PER_ASPECT = 12;

export function questionsForAspect(aspect: ReadinessAspect) {
  return READINESS_QUESTIONS.filter((q) => q.aspect === aspect);
}

export function scoreReadinessAnswers(
  answers: ReadinessAnswers
): AspectScores {
  const totals: AspectScores = { ...ZERO_ASPECTS };
  const max: AspectScores = { ...ZERO_ASPECTS };
  for (const q of READINESS_QUESTIONS) {
    max[q.aspect] += 3;
    const picked = answers[q.id];
    const option = q.options[picked];
    if (typeof picked === "number" && option) {
      totals[q.aspect] += option.points;
    }
  }
  return {
    business: Math.round((totals.business / max.business) * 100),
    technology: Math.round((totals.technology / max.technology) * 100),
    product: Math.round((totals.product / max.product) * 100),
  };
}

export function overallFromAspects(aspects: AspectScores): number {
  return Math.round(
    (aspects.business + aspects.technology + aspects.product) / 3
  );
}

export function scoreAspect(
  aspect: ReadinessAspect,
  answers: ReadinessAnswers
): number | null {
  const questions = questionsForAspect(aspect);
  if (questions.some((q) => typeof answers[q.id] !== "number")) {
    return null;
  }
  let total = 0;
  let max = 0;
  for (const q of questions) {
    max += 3;
    const picked = answers[q.id];
    const option = q.options[picked];
    if (typeof picked === "number" && option) {
      total += option.points;
    }
  }
  return max > 0 ? Math.round((total / max) * 100) : null;
}

export interface TpmStand {
  overall: number;
  aspects: AspectScores;
  label: string;
  narrative: string;
  focus: string[];
}

const FOCUS_BY_ASPECT: Record<ReadinessAspect, string[]> = {
  business: [
    "Unit Economics",
    "Business Case & ROI",
    "Market Sizing & TAM",
    "Financial Acumen",
  ],
  technology: [
    "System Architecture",
    "APIs & Data Modeling",
    "Observability & SLOs",
    "Scaling & Reliability",
  ],
  product: [
    "Prioritization Frameworks",
    "Discovery & Research",
    "Metrics & Funnels",
    "Roadmapping",
  ],
};

export function deriveStand(aspects: AspectScores): TpmStand {
  const overall = overallFromAspects(aspects);

  let label: string;
  let prefix: string;
  if (overall >= 80) {
    label = "Advanced Operator";
    prefix =
      "You think like a senior TPM across business, technology, and product.";
  } else if (overall >= 65) {
    label = "Strong Core";
    prefix =
      "You have a solid TPM foundation with clear room to sharpen one or two areas.";
  } else if (overall >= 50) {
    label = "Developing Foundation";
    prefix =
      "You understand the fundamentals but need consistent practice to make them instinctive.";
  } else if (overall >= 35) {
    label = "Early Stage";
    prefix =
      "You're getting oriented — the core habits of TPM work are still forming.";
  } else {
    label = "Getting Started";
    prefix =
      "The TPM craft is new territory — a structured plan will move you fast.";
  }

  const sorted = (
    Object.entries(aspects) as [ReadinessAspect, number][]
  ).sort((a, b) => b[1] - a[1]);
  const strongest = sorted[0];
  const weakest = sorted[2];
  const aspectLabel = ASPECTS.find((a) => a.key === weakest[0])?.label ?? "";
  const strongLabel = ASPECTS.find((a) => a.key === strongest[0])?.label ?? "";

  const narrative = `${prefix} Your ${strongLabel} thinking is a relative strength (${strongest[1]}/100). Your biggest lever is ${aspectLabel} — invest there to round out the shape of a well-balanced TPM.`;

  return {
    overall,
    aspects,
    label,
    narrative,
    focus: FOCUS_BY_ASPECT[weakest[0]],
  };
}
