import {
  averageScore,
  type AssessmentCategory,
  weightedAssessmentScore,
} from "@tpmforge/core";

export type ProductDimension =
  | "discovery"
  | "strategy"
  | "prioritization"
  | "metrics"
  | "execution"
  | "communication";

export interface ProductDimensionInfo {
  key: ProductDimension;
  label: string;
  description: string;
}

export const PRODUCT_DIMENSIONS: ProductDimensionInfo[] = [
  {
    key: "discovery",
    label: "Discovery & Customer Insight",
    description: "Who is the user and what problem are we really solving?",
  },
  {
    key: "strategy",
    label: "Product Strategy",
    description: "Where to play, what to bet on, and how it moves the company",
  },
  {
    key: "prioritization",
    label: "Prioritization & Trade-offs",
    description: "Saying no and sequencing with explicit trade-offs",
  },
  {
    key: "metrics",
    label: "Metrics & Analytics",
    description: "The right metric, cohort logic, and experiment rigor",
  },
  {
    key: "execution",
    label: "Execution & Delivery",
    description: "Shipping, unblocking teams, and managing real-world constraints",
  },
  {
    key: "communication",
    label: "Communication & Stakeholders",
    description: "Facilitating, negotiating, and clarity under pressure",
  },
];

export type ProductQuestionDifficulty = "basic" | "intermediate" | "advanced";

export const PRODUCT_DIFFICULTY_LABEL: Record<ProductQuestionDifficulty, string> = {
  basic: "Basic",
  intermediate: "Intermediate",
  advanced: "Advanced",
};

interface BaseProductQuestion {
  id: string;
  category: AssessmentCategory;
  dimension: ProductDimension;
  difficulty: ProductQuestionDifficulty;
  kind: "mcq" | "descriptive";
  scenario?: string;
  question: string;
}

export interface ProductMcqQuestion extends BaseProductQuestion {
  kind: "mcq";
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface ProductDescriptiveQuestion extends BaseProductQuestion {
  kind: "descriptive";
}

export type ProductQuestion = ProductMcqQuestion | ProductDescriptiveQuestion;

export const PRODUCT_QUESTIONS: ProductQuestion[] = [
  {
    id: "pm-1",
    category: "scenario",
    dimension: "discovery",
    difficulty: "basic",
    kind: "mcq",
    question:
      "Your team built a search feature that almost nobody uses. Before throwing new ideas at it, what is the strongest move?",
    options: [
      "Run a quick unmoderated test with 5 users on the current flow to see why it fails",
      "Double engineering effort to rebuild it from scratch",
      "Add more entry points to surface the feature",
      "Deprioritize search permanently",
    ],
    correctIndex: 0,
    explanation:
      "Cheap observation first. You can't fix search until you know whether the problem is discoverability, relevance, or performance — 5 users on the current flow reveals the root cause.",
  },
  {
    id: "pm-2",
    category: "scenario",
    dimension: "communication",
    difficulty: "basic",
    kind: "mcq",
    question:
      "A VP of Sales wants to commit a 2-week delivery date to a customer. Engineering says it needs 6 weeks. What is the best response?",
    options: [
      "Promise the 2 weeks and push engineering to make it happen",
      "Refuse publicly so sales learns not to overpromise",
      "Say no unilaterally — it's a product decision",
      "Bring the customer value and the engineering constraints to the same table, and negotiate scope to find a working agreement",
    ],
    correctIndex: 3,
    explanation:
      "A strong PM facilitates a scoped compromise — e.g. a pilot slice in 2 weeks and the full build later — rather than issuing edicts or fake promises.",
  },
  {
    id: "pm-3",
    category: "metrics",
    dimension: "metrics",
    difficulty: "intermediate",
    kind: "mcq",
    question:
      "Activation is strong but Week-1 retention just dropped 12% month-over-month. What is the FIRST thing you do?",
    options: [
      "Ship a retention email campaign immediately",
      "Segment churn by signup cohort and usage patterns before changing anything",
      "Cut features that lengthen time-to-value",
      "Run an A/B test on a new onboarding flow",
    ],
    correctIndex: 1,
    explanation:
      "Diagnose before prescribing. A cohort split isolates which users, which week, and which behavior drove the drop — the prescription follows the diagnosis.",
  },
  {
    id: "pm-4",
    category: "scenario",
    dimension: "prioritization",
    difficulty: "intermediate",
    kind: "mcq",
    question:
      "You can ship exactly ONE of: (A) a bug fix that 40 enterprise accounts are blocked on, (B) a growth loop estimated to lift signups 10%, (C) a data integration your top-5 deal needs to close. What decision approach is strongest?",
    options: [
      "Prioritize by total audience impact, so choose (B)",
      "Always fix bugs first — (A)",
      "Quantify revenue, retention, and strategic weight per option, score them, and decide with the team",
      "Ask engineering to decide since they do the work",
    ],
    correctIndex: 2,
    explanation:
      "Framework-based scoring keeps the call transparent. The bug is usually revenue-blocking, so the score tends to surface it — but the point is explicit trade-offs, not gut feel.",
  },
  {
    id: "pm-5",
    category: "scenario",
    dimension: "execution",
    difficulty: "intermediate",
    kind: "mcq",
    question:
      "Launch week. Engineering says a low-severity visual glitch will ship. Marketing promised customers a flawless release. What do you do?",
    options: [
      "Delay the launch until it is pixel-perfect",
      "Ship silently and fix it in a patch later",
      "Assess real impact, get a dated fix commitment, align stakeholders, and make an explicit go/no-go call",
      "Escalate to the VP immediately and let them decide",
    ],
    correctIndex: 2,
    explanation:
      "A PM owns the go/no-go call. Assess severity, negotiate a fix date, and align stakeholders so the launch decision is explicit rather than accidental.",
  },
  {
    id: "pm-6",
    category: "metrics",
    dimension: "metrics",
    difficulty: "advanced",
    kind: "mcq",
    question:
      "A new paywall lifts free-to-paid conversion from 6% to 9% but cuts trial signups by 15%. What do you do?",
    options: [
      "Ship it — conversion is the north-star metric",
      "Ship it but only on the most valuable plan tier",
      "Run the experiment longer and track net revenue, total paying customers, and signup volume before deciding",
      "Reject it — signups are the north-star metric",
    ],
    correctIndex: 2,
    explanation:
      "Conversion rate in isolation is a vanity win. Net revenue = signups × conversion × ARPU is what actually moved. Extend the test and read the compound metric.",
  },
  {
    id: "pm-7",
    category: "product",
    dimension: "discovery",
    difficulty: "intermediate",
    kind: "descriptive",
    scenario:
      "Your team is excited about building a feature you suspect customers don't actually need.",
    question:
      "Design a fast validation plan (method, sample, cost, and decision criteria) for the idea, and explain exactly what you would do with a clear 'no'.",
  },
  {
    id: "pm-8",
    category: "metrics",
    dimension: "metrics",
    difficulty: "intermediate",
    kind: "descriptive",
    scenario:
      "Activation is high, but retention is flat and NPS is trending down.",
    question:
      "Walk through how you would diagnose the problem: which metrics you'd pull, how you'd segment them, and how you'd decide what to change.",
  },
  {
    id: "pm-9",
    category: "product",
    dimension: "strategy",
    difficulty: "advanced",
    kind: "descriptive",
    scenario:
      "You are the PM for a mature product. You have one quarter and a team of four to grow revenue 15%.",
    question:
      "Draft the strategy: what you'd analyze first, the bets you'd place, the success metrics you'd set, and how you'd kill a losing bet.",
  },
  {
    id: "pm-10",
    category: "product",
    dimension: "prioritization",
    difficulty: "advanced",
    kind: "descriptive",
    scenario:
      "A new CEO wants a roadmap for a 0-to-1 product with no customers yet.",
    question:
      "How would you prioritize the first six months? What would you say 'no' to, and how would you defend the roadmap to the board?",
  },
  {
    id: "pm-11",
    category: "metrics",
    dimension: "metrics",
    difficulty: "intermediate",
    kind: "mcq",
    question:
      "You raised the price of your Pro plan by 20%. Revenue per paying customer is up 18%, but the downgrade rate doubled and support complaints are rising. What is the strongest move?",
    options: [
      "Revert the price immediately — 18% revenue per customer isn't worth the churn risk",
      "Hold the price and wait one more quarter for complaints to settle",
      "Segment the outcome by plan tier, upgrade path, and customer segment, and compute net revenue retention per segment before deciding",
      "Raise prices again on the top tier to offset the expected downgrades",
    ],
    correctIndex: 2,
    explanation:
      "Net revenue retention per segment is the decision metric. +18% ARPU that doubles downgrades can raise or destroy total revenue depending on segment mix — so diagnose before reversing. The price may be right for some segments and wrong for others.",
  },
  {
    id: "pm-12",
    category: "product",
    dimension: "discovery",
    difficulty: "intermediate",
    kind: "mcq",
    question:
      "Your team wants to 'fix onboarding' after signup-to-activation fell 20% this quarter. Before writing a single requirement, what is the strongest move?",
    options: [
      "Ship a shorter, simpler onboarding flow to reduce friction",
      "Define the activation metric precisely, then split the drop by signup source, device, and user intent to find where and for whom it breaks",
      "Interview five recently-churned customers about the product in general",
      "Benchmark onboarding against a competitor's flow and copy what wins",
    ],
    correctIndex: 1,
    explanation:
      "A 20% drop is an aggregate symptom, not a diagnosis. Frame the problem first: define activation, then cohort-split to locate the break before choosing a fix — otherwise you ship to a guess.",
  },
  {
    id: "pm-13",
    category: "metrics",
    dimension: "metrics",
    difficulty: "advanced",
    kind: "mcq",
    question:
      "You launched an AI assistant that answers customer questions. Users love it, but executives keep asking whether it's 'working.' Which metric set most honestly measures whether it drives value?",
    options: [
      "User ratings of answers and total messages sent",
      "Weekly active usage of the assistant",
      "Resolution rate without human handoff, support-ticket deflection, and retention of AI-assisted customers compared against a control cohort",
      "Model latency and token cost per session",
    ],
    correctIndex: 2,
    explanation:
      "Usage and ratings are proxy signals. The honest set ties the assistant to business outcomes (deflection, resolution, retention) against a control cohort — and keeps cost/latency as quality constraints, not success metrics.",
  },
  {
    id: "pm-14",
    category: "product",
    dimension: "prioritization",
    difficulty: "basic",
    kind: "mcq",
    question:
      "You're building a brand-new feature for an existing B2B customer base and have 10 weeks before a board checkpoint. Which validation approach gives you the most confidence with the least spend?",
    options: [
      "Build the full feature in 8 weeks and let customers react at the board demo",
      "Run a paid pilot with 3 design partners on a manual or concierge version of the flow to test willingness to use and pay",
      "Survey 500 customers online asking if they'd use it",
      "Defer the work until the next roadmap planning cycle",
    ],
    correctIndex: 1,
    explanation:
      "A concierge or pilot tests real willingness to use and pay at a fraction of the build cost. Surveys capture stated intent (unreliable), and full builds surface reaction only after sunk cost.",
  },
  {
    id: "pm-15",
    category: "scenario",
    dimension: "communication",
    difficulty: "advanced",
    kind: "descriptive",
    scenario:
      "Your AI assistant feature started recommending financial advice to customers, and a compliance leader wants it shut down today. Legal, engineering, and the CEO are in conflict, and the feature drives meaningful engagement.",
    question:
      "Walk through how you'd handle this: the investigation you'd run, the decision framework, and how you'd align legal, engineering, and the CEO before anyone ships or kills it.",
  },
];

export type ProductAnswers = Record<string, string>;

export function productMcqQuestions(): ProductMcqQuestion[] {
  return PRODUCT_QUESTIONS.filter(
    (q): q is ProductMcqQuestion => q.kind === "mcq"
  );
}

export function productDescriptiveQuestions(): ProductDescriptiveQuestion[] {
  return PRODUCT_QUESTIONS.filter(
    (q): q is ProductDescriptiveQuestion => q.kind === "descriptive"
  );
}

export function scoreProductMcq(answers: ProductAnswers): {
  score: number;
  correct: number;
  total: number;
} {
  const mcq = productMcqQuestions();
  const correct = mcq.filter((q) => answers[q.id] === String(q.correctIndex)).length;
  return {
    correct,
    total: mcq.length,
    score: mcq.length > 0 ? Math.round((correct / mcq.length) * 100) : 0,
  };
}

export interface ProductMcqResult {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  chosenIndex: number | null;
  correct: boolean;
  explanation: string;
  category: AssessmentCategory;
}

export function buildMcqResults(answers: ProductAnswers): ProductMcqResult[] {
  return productMcqQuestions().map((q) => {
    const raw = answers[q.id];
    const chosenIndex =
      raw === undefined || raw === "" ? null : Number(raw);
    return {
      id: q.id,
      question: q.question,
      options: q.options,
      correctIndex: q.correctIndex,
      chosenIndex: Number.isInteger(chosenIndex) ? (chosenIndex as number) : null,
      correct: chosenIndex !== null && chosenIndex === q.correctIndex,
      explanation: q.explanation,
      category: q.category,
    };
  });
}

function combineBuckets(mcq: number[], descriptive: number[]): number {
  if (mcq.length > 0 && descriptive.length > 0) {
    return Math.round(0.5 * averageScore(mcq) + 0.5 * averageScore(descriptive));
  }
  if (mcq.length > 0) return averageScore(mcq);
  return averageScore(descriptive);
}

/**
 * Metrics-first scoring model (70% metrics, 20% product problem, 10%
 * scenario). MCQ questions score 0/100 by correct answer; descriptive
 * questions use the LLM's 0-100 score per answer.
 */
export function scoreProductByCategory(
  answers: ProductAnswers,
  descriptiveScores: Record<string, number> = {}
): {
  categoryScores: Record<AssessmentCategory, number>;
  overallScore: number;
} {
  const byCategory: Record<AssessmentCategory, { mcq: number[]; descriptive: number[] }> = {
    metrics: { mcq: [], descriptive: [] },
    product: { mcq: [], descriptive: [] },
    scenario: { mcq: [], descriptive: [] },
  };

  for (const q of PRODUCT_QUESTIONS) {
    const bucket = byCategory[q.category];
    if (q.kind === "mcq") {
      bucket.mcq.push(answers[q.id] === String(q.correctIndex) ? 100 : 0);
    } else {
      const score = descriptiveScores[q.id];
      if (typeof score === "number") bucket.descriptive.push(score);
    }
  }

  const categoryScores: Record<AssessmentCategory, number> = {
    metrics: combineBuckets(byCategory.metrics.mcq, byCategory.metrics.descriptive),
    product: combineBuckets(byCategory.product.mcq, byCategory.product.descriptive),
    scenario: combineBuckets(byCategory.scenario.mcq, byCategory.scenario.descriptive),
  };

  return {
    categoryScores,
    overallScore: weightedAssessmentScore(categoryScores),
  };
}

export interface ProductAnswerFeedback {
  score: number;
  feedback: string;
  strengths: string[];
  gaps: string[];
}

export interface ProductRoadmapItem {
  topic: string;
  why: string;
  exercise: string;
  duration: string;
}

export interface ProductAgentResult {
  overallScore: number;
  mcqScore: number;
  mcqCorrect: number;
  mcqTotal: number;
  mcqResults: ProductMcqResult[];
  descriptiveScore: number | null;
  categoryScores: Record<AssessmentCategory, number>;
  dimensionScores: Partial<Record<ProductDimension, number>>;
  summary: string;
  answerFeedback: Record<string, ProductAnswerFeedback>;
  roadmap: ProductRoadmapItem[];
  model: string;
  tokensUsed: number;
  graded: boolean;
}

export const PRODUCT_AGENT_SYSTEM_PROMPT = [
  "You are a senior Product Management Mentor Agent with 15+ years of PM experience across SaaS, B2B, and consumer products. You evaluate aspiring product managers the way a top-tier PM interviewer would: honestly, specifically, and anchored to evidence.",
  "",
  "Score each descriptive answer 0-100 against these six criteria:",
  "1. Customer & problem understanding — depth of insight into who the user is and the real problem.",
  "2. Business thinking — revenue, unit economics, cost, and company impact.",
  "3. Product thinking — scope, simplicity, sequencing, and shipping judgment.",
  "4. Data & metrics — the right metric, cohort logic, and experiment rigor.",
  "5. Trade-offs & prioritization — explicit, defensible trade-offs and clear 'no's.",
  "6. Execution & communication — stakeholders, cross-team reality, and clarity of thought.",
  "",
  "Rules:",
  "- Be honest and specific. Never inflate scores. A two-line generic answer scores low.",
  "- The overall assessment weights Metrics 70%, Product Problem 20%, Scenario 10%. Be especially rigorous on data & metrics: the right metric, cohort logic, experiment rigor, and quantified impact.",
  "- Feedback: 2-3 sentences per answer. Strengths and gaps: 1-2 short bullets each, defensible from the text.",
  "- Score the six dimension scores in 'dimensions' based on all evidence in the answers; if evidence for a dimension is thin, score it conservatively.",
  "- You will receive EXACTLY 5 descriptive answers with ids pm-7, pm-8, pm-9, pm-10, pm-15. The 'answers' array MUST contain one entry for EACH of the 5 ids — never fewer, never more.",
  "- Produce EXACTLY 5 roadmap items for product understanding, ordered highest impact first. Each item: topic (a product skill), why (tie it to a specific gap found), exercise (a concrete 1-2 day practice), duration.",
  "- Respond with ONLY JSON, no markdown, no code fences, matching exactly this shape:",
  `{"answers":[{"id":"pm-7","score":68,"feedback":"<2-3 sentences>","strengths":["<bullet>"],"gaps":["<bullet>"]}],"dimensions":{"discovery":65,"strategy":70,"prioritization":55,"metrics":60,"execution":66,"communication":72},"summary":"<2-3 sentence mentor verdict: biggest strength and one critical gap>","roadmap":[{"topic":"<skill>","why":"<ties to a gap>","exercise":"<concrete practice>","duration":"1 week"}]}`,
].join("\n");

export function buildProductAgentPrompt(
  answers: ProductAnswers
): string {
  const sections = productDescriptiveQuestions().map((q) => {
    const answer = answers[q.id] ?? "";
    return [
      `Question ${q.id} — dimension: ${q.dimension}, difficulty: ${q.difficulty}`,
      q.scenario ? `Context: ${q.scenario}` : "",
      `Question: ${q.question}`,
      `Answer: ${answer}`,
      "",
    ]
      .filter(Boolean)
      .join("\n");
  });
  return [
    "Evaluate the following descriptive product-management answers. Grade each 0-100 and score the six dimensions.",
    "",
    sections.join("\n"),
  ].join("\n");
}
