import { OpenRouterClient } from "./openrouter";
import { parseJsonContent } from "./evaluate";
import { clampScore } from "../scoring";

export interface ResumeCoachImprovement {
  current: string;
  recommended: string;
}

export interface ResumeCoachPlanPhase {
  phase: string;
  actions: string[];
}

export interface ResumeCoachReport {
  profile: string;
  executiveAssessment: string;
  readinessScore: number;
  strengths: string[];
  criticalGaps: string[];
  resumeIssues: string[];
  bulletImprovements: ResumeCoachImprovement[];
  missingEvidence: string[];
  technicalGaps: string[];
  impactGaps: string[];
  portfolioRecommendations: string[];
  certificationRecommendations: string[];
  linkedinRecommendations: string[];
  contentStrategy: string[];
  roadmap: string[];
  plan306090: ResumeCoachPlanPhase[];
  interviewReadiness: { score: number; notes: string };
}

export interface ResumeCoachResult extends ResumeCoachReport {
  model: string;
  tokensUsed: number;
  raw: string;
}

const COACH_SYSTEM_PROMPT = [
  "You are a Technical Program Management Career Coach, Resume Strategist, Hiring Manager, Recruiter, and Interview Coach. You help professionals transition into or advance within a Technical Program Manager (TPM) career.",
  "You evaluate the candidate's resume honestly, specifically, and anchored to evidence. Never invent experience or metrics.",
  "",
  "Score the candidate 0-10 on: Program Management, Technical Depth, System Design, Engineering Collaboration, Execution, Strategic Thinking, Business Acumen, Stakeholder Management, Executive Communication, Risk Management, Data & Metrics, Leadership, Product Thinking, Cloud, Agile/Delivery, Career Positioning.",
  "",
  "A strong TPM resume answers five questions immediately: 1) What scale has this person operated at? 2) What technical problems have they solved? 3) What programs have they led? 4) How did they influence teams and stakeholders? 5) What measurable business/customer/engineering impact did they create?",
  "Audit resume structure, content, business/product/engineering/program impact, technical depth, and ATS relevance. Rewrite weak bullets using Action + Scope + Complexity + Leadership + Technical Context + Business Outcome + Metric. If a metric is unknown use [metric] — never invent one. Keep resumes natural and truthful; do not keyword-stuff.",
  "",
  "Respond with ONLY JSON, no markdown, no code fences, matching exactly this shape:",
  `{"profile":"<1-2 sentence candidate classification>","executive_assessment":"<2-3 sentences>","readiness_score":62,"strengths":["<max 5>"],"critical_gaps":["<max 5>"],"resume_issues":["<max 5>"],"bullet_improvements":[{"current":"<weak bullet>","recommended":"<Action + Scope + Complexity + Leadership + Technical Context + Business Outcome + Metric>"}],"missing_evidence":["<max 4>"],"technical_gaps":["<max 4>"],"impact_gaps":["<max 4>"],"portfolio_recommendations":["<max 4>"],"certification_recommendations":["<max 3>"],"linkedin_recommendations":["<max 3>"],"content_strategy":["<max 3>"],"roadmap":["<max 6>"],"plan_30_60_90":[{"phase":"30 days","actions":["<max 3>"]},{"phase":"60 days","actions":["<max 3>"]},{"phase":"90 days","actions":["<max 3>"]}],"interview_readiness":{"score":55,"notes":"<1-2 sentences>"}}`,
  "Keep every bullet concise. Bullet_improvements: 3-5 pairs. Do not invent metrics; use [metric] placeholders.",
].join("\n");

function strings(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((v): v is string => typeof v === "string" && v.trim().length > 0);
}

export async function runResumeCoach(
  client: OpenRouterClient,
  params: {
    resumeText: string;
    currentRole?: string;
    targetRole?: string;
    competencyScores?: Record<string, unknown>;
    maxTokens?: number;
  }
): Promise<ResumeCoachResult> {
  const context: string[] = [];
  if (params.currentRole) context.push(`Current role: ${params.currentRole}`);
  if (params.targetRole) context.push(`Target TPM role: ${params.targetRole}`);
  if (params.competencyScores) {
    context.push(
      `Existing competency scores: ${JSON.stringify(params.competencyScores)}`
    );
  }

  const messages = [
    { role: "system" as const, content: COACH_SYSTEM_PROMPT },
    {
      role: "user" as const,
      content: [
        context.join("\n"),
        "",
        "RESUME:",
        params.resumeText.slice(0, 8000),
      ].join("\n"),
    },
  ];

  const result = await client.complete({
    modelId: client.modelIdFor("resume_mapping"),
    fallback: client.fallbacksFor("resume_mapping"),
    messages,
    maxTokens: params.maxTokens ?? 3000,
    temperature: 0.3,
    jsonMode: true,
  });

  const parsed = parseJsonContent(result.content) ?? {};

  const improvements: ResumeCoachImprovement[] = [];
  if (Array.isArray(parsed.bullet_improvements)) {
    for (const item of parsed.bullet_improvements.slice(0, 5)) {
      const it = (item ?? {}) as Record<string, unknown>;
      if (typeof it?.current !== "string" || typeof it?.recommended !== "string") continue;
      improvements.push({ current: it.current, recommended: it.recommended });
    }
  }

  const plan: ResumeCoachPlanPhase[] = [];
  if (Array.isArray(parsed.plan_30_60_90)) {
    for (const item of parsed.plan_30_60_90.slice(0, 3)) {
      const it = (item ?? {}) as Record<string, unknown>;
      plan.push({
        phase: typeof it.phase === "string" ? it.phase : "phase",
        actions: strings(it.actions).slice(0, 3),
      });
    }
  }

  const ir = (parsed.interview_readiness ?? {}) as Record<string, unknown>;

  return {
    profile: typeof parsed.profile === "string" ? parsed.profile : "",
    executiveAssessment:
      typeof parsed.executive_assessment === "string" ? parsed.executive_assessment : "",
    readinessScore: clampScore(
      typeof parsed.readiness_score === "number" ? (parsed.readiness_score as number) : 0
    ),
    strengths: strings(parsed.strengths).slice(0, 5),
    criticalGaps: strings(parsed.critical_gaps).slice(0, 5),
    resumeIssues: strings(parsed.resume_issues).slice(0, 5),
    bulletImprovements: improvements,
    missingEvidence: strings(parsed.missing_evidence).slice(0, 4),
    technicalGaps: strings(parsed.technical_gaps).slice(0, 4),
    impactGaps: strings(parsed.impact_gaps).slice(0, 4),
    portfolioRecommendations: strings(parsed.portfolio_recommendations).slice(0, 4),
    certificationRecommendations: strings(parsed.certification_recommendations).slice(0, 3),
    linkedinRecommendations: strings(parsed.linkedin_recommendations).slice(0, 3),
    contentStrategy: strings(parsed.content_strategy).slice(0, 3),
    roadmap: strings(parsed.roadmap).slice(0, 6),
    plan306090: plan,
    interviewReadiness: {
      score: clampScore(
        typeof ir.score === "number" ? (ir.score as number) : 0
      ),
      notes: typeof ir.notes === "string" ? ir.notes : "",
    },
    model: result.model,
    tokensUsed: result.tokensUsed,
    raw: result.content,
  };
}
