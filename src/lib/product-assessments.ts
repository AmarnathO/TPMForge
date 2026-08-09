import type { SupabaseClient } from "@supabase/supabase-js";
import type { ProductAgentResult } from "@/lib/product-agent";

export interface ProductAssessmentRow {
  id: string;
  overall_score: number | null;
  mcq_score: number | null;
  descriptive_score: number | null;
  dimension_scores: Record<string, number> | null;
  summary: string | null;
  answer_feedback: Record<string, unknown> | null;
  roadmap: unknown[] | null;
  model: string | null;
  graded: boolean | null;
  created_at: string;
}

export const PRODUCT_ASSESSMENT_SELECT =
  "id, overall_score, mcq_score, descriptive_score, dimension_scores, summary, answer_feedback, roadmap, model, graded, created_at";

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
  const dimensions = (
    Object.keys(row.dimension_scores ?? {}) as string[]
  ).reduce<Record<string, number>>((acc, key) => {
    const value = row.dimension_scores?.[key];
    if (typeof value === "number") acc[key] = value;
    return acc;
  }, {});
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
    mcqScore: row.mcq_score ?? 0,
    descriptiveScore: row.descriptive_score,
    dimensionScores: dimensions,
    summary: row.summary ?? "",
    answerFeedback,
    roadmap,
    model: row.model ?? "",
    tokensUsed: 0,
    graded: row.graded === true,
  };
}
