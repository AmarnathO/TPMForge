import type { SupabaseClient } from "@supabase/supabase-js";
import type { ProductAgentResult } from "@/lib/product-agent";
import { buildMcqResults } from "@/lib/product-agent";

export interface ProductAssessmentRow {
  id: string;
  overall_score: number | null;
  mcq_score: number | null;
  descriptive_score: number | null;
  dimension_scores: Record<string, number> | null;
  category_scores: Record<string, number> | null;
  summary: string | null;
  answer_feedback: Record<string, unknown> | null;
  roadmap: unknown[] | null;
  answers: Record<string, string> | null;
  model: string | null;
  graded: boolean | null;
  created_at: string;
}

export const PRODUCT_ASSESSMENT_SELECT =
  "id, overall_score, mcq_score, descriptive_score, dimension_scores, category_scores, summary, answer_feedback, roadmap, answers, model, graded, created_at";

export async function getLatestProductAssessment(
  supabase: SupabaseClient,
  userId: string
): Promise<ProductAssessmentRow | null> {
  const { data } = await supabase
    .from("product_assessments")
    .select(PRODUCT_ASSESSMENT_SELECT)
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(1);
  return (data?.[0] as ProductAssessmentRow | undefined) ?? null;
}

export function productAssessmentFromRow(
  row: ProductAssessmentRow
): ProductAgentResult | null {
  if (row.overall_score === null) return null;
  const dimensionScores = (
    Object.keys(row.dimension_scores ?? {}) as string[]
  ).reduce<Record<string, number>>((acc, key) => {
    const value = row.dimension_scores?.[key];
    if (typeof value === "number") acc[key] = value;
    return acc;
  }, {});

  const avgOf = (...keys: string[]): number => {
    const values = keys
      .map((k) => dimensionScores[k])
      .filter((v): v is number => typeof v === "number");
    return values.length > 0
      ? Math.round(values.reduce((a, b) => a + b, 0) / values.length)
      : 0;
  };

  const legacyCategory = (
    mcq: number,
    descriptive: number | null
  ): Record<string, number> => {
    const metrics =
      typeof dimensionScores.metrics === "number"
        ? dimensionScores.metrics
        : Math.round((mcq + (descriptive ?? mcq)) / 2);
    const product = avgOf("discovery", "strategy", "prioritization");
    const scenario = avgOf("execution", "communication");
    return {
      metrics: product > 0 ? metrics : mcq,
      product: product > 0 ? product : (descriptive ?? mcq),
      scenario: scenario > 0 ? scenario : mcq,
    };
  };

  const mcqScore = row.mcq_score ?? 0;
  const mcqResults = buildMcqResults(row.answers ?? {});
  const mcqCorrect = mcqResults.filter((r) => r.correct).length;
  const mcqTotal = mcqResults.length;
  const rawCategory = row.category_scores ?? {};
  const hasCategory =
    typeof rawCategory.metrics === "number" ||
    typeof rawCategory.product === "number" ||
    typeof rawCategory.scenario === "number";
  const categoryScores = hasCategory
    ? {
        metrics: Math.max(0, Math.min(100, Math.round(rawCategory.metrics ?? 0))),
        product: Math.max(0, Math.min(100, Math.round(rawCategory.product ?? 0))),
        scenario: Math.max(0, Math.min(100, Math.round(rawCategory.scenario ?? 0))),
      }
    : legacyCategory(mcqScore, row.descriptive_score);
  const roadmap = Array.isArray(row.roadmap)
    ? row.roadmap
        .map((item) => item as Record<string, unknown>)
        .filter(
          (item) =>
            typeof item?.topic === "string" &&
            typeof item?.why === "string" &&
            typeof item?.exercise === "string"
        )
        .map((item) => ({
          topic: String(item.topic),
          why: String(item.why),
          exercise: String(item.exercise),
          duration: typeof item.duration === "string" ? String(item.duration) : "",
        }))
    : [];
  const answerFeedback: Record<string, { score: number; feedback: string; strengths: string[]; gaps: string[] }> = {};
  for (const [id, raw] of Object.entries(row.answer_feedback ?? {})) {
    const item = (raw ?? {}) as Record<string, unknown>;
    if (typeof item?.score !== "number") continue;
    answerFeedback[id] = {
      score: Math.max(0, Math.min(100, Math.round(item.score))),
      feedback: typeof item.feedback === "string" ? item.feedback : "",
      strengths: Array.isArray(item.strengths)
        ? item.strengths.filter((s): s is string => typeof s === "string")
        : [],
      gaps: Array.isArray(item.gaps)
        ? item.gaps.filter((g): g is string => typeof g === "string")
        : [],
    };
  }
  return {
    overallScore: row.overall_score,
    mcqScore: mcqScore,
    mcqCorrect,
    mcqTotal,
    mcqResults,
    descriptiveScore: row.descriptive_score,
    categoryScores,
    dimensionScores,
    summary: row.summary ?? "",
    answerFeedback,
    roadmap,
    model: row.model ?? "",
    tokensUsed: 0,
    graded: row.graded === true,
  };
}
