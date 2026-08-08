import type { SupabaseClient } from "@supabase/supabase-js";
import type { DimensionScores } from "@tpmforge/core";
import {
  deriveStand,
  type AspectScores,
  type TpmStand,
} from "@/lib/readiness-test";

export interface ReadinessTestRow {
  id: string;
  aspect_scores: AspectScores;
  overall_score: number;
  stand_label: string | null;
  created_at: string;
}

export const READINESS_TEST_SELECT =
  "id, aspect_scores, overall_score, stand_label, created_at";

export async function getLatestReadinessTest(
  supabase: SupabaseClient,
  userId: string
): Promise<ReadinessTestRow | null> {
  const { data } = await supabase
    .from("readiness_tests")
    .select(READINESS_TEST_SELECT)
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(1);
  return (data?.[0] as ReadinessTestRow | undefined) ?? null;
}

export function standFromRow(
  row: ReadinessTestRow
): TpmStand & { completedAt: string } {
  return {
    ...deriveStand(row.aspect_scores),
    completedAt: row.created_at,
  };
}

export function aspectsToRadar(aspects: AspectScores): DimensionScores {
  const average = Math.round(
    (aspects.business + aspects.technology + aspects.product) / 3
  );
  return {
    knowledge: average,
    understanding: average,
    application: Math.round(
      (aspects.technology + aspects.product) / 2
    ),
    communication: Math.round(
      (aspects.business + aspects.product) / 2
    ),
    decision_making: Math.round(
      (aspects.business + aspects.product) / 2
    ),
    execution: Math.round((aspects.technology + aspects.business) / 2),
  };
}
