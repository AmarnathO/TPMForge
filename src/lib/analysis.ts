import type { SupabaseClient } from "@supabase/supabase-js";
import { getPublishedCompetencies, seedGraph } from "@tpmforge/core";
import type { ResumeReportPayload } from "@/app/actions/resume";

export const ANALYSIS_SELECT =
  "readiness_score, radar_data, gap_report, model_used, tokens_used, file_name, competency_scores, created_at";

export type AnalysisRow = {
  readiness_score: number | null;
  radar_data: unknown;
  gap_report: unknown;
  model_used: string | null;
  tokens_used: number | null;
  file_name: string;
  competency_scores: Record<string, unknown>;
  created_at: string;
};

export function analysisToPayload(row: AnalysisRow): ResumeReportPayload {
  const radar = (row.radar_data ?? {}) as ResumeReportPayload["radar"];
  const gapReport = (row.gap_report ?? {}) as {
    gaps?: ResumeReportPayload["gaps"];
    nextSteps?: ResumeReportPayload["nextSteps"];
  };
  return {
    readinessScore: row.readiness_score ?? 0,
    radar,
    gaps: gapReport.gaps ?? [],
    nextSteps: gapReport.nextSteps ?? [],
    competencyCount: getPublishedCompetencies(seedGraph).length,
    scoredCount: Object.keys(row.competency_scores ?? {}).filter(
      (key) =>
        Object.keys((row.competency_scores ?? {})[key] ?? {}).length > 0
    ).length,
    model: row.model_used ?? "unknown",
    tokensUsed: row.tokens_used ?? 0,
    fileName: row.file_name,
    coach: (gapReport as { coach?: ResumeReportPayload["coach"] }).coach ?? null,
  };
}

export async function getLatestAnalysis(
  supabase: SupabaseClient,
  userId: string
): Promise<AnalysisRow | null> {
  const { data } = await supabase
    .from("resume_analyses")
    .select(ANALYSIS_SELECT)
    .eq("user_id", userId)
    .eq("status", "completed")
    .order("created_at", { ascending: false })
    .limit(1);
  return data?.[0] ?? null;
}
