import type { SupabaseClient } from "@supabase/supabase-js";
import { seedGraph } from "@tpmforge/core";

export type ReadinessTrendPoint = {
  date: string;
  score: number;
};

export type PracticeStats = {
  totalAttempts: number;
  scenarioCount: number;
  quizCount: number;
  avgScore: number | null;
  bestScore: number | null;
};

export type PerCompetencyStats = {
  competencyId: string;
  title: string;
  attempts: number;
  avgScore: number;
};

export async function getReadinessTrend(
  supabase: SupabaseClient,
  userId: string
): Promise<ReadinessTrendPoint[]> {
  const { data } = await supabase
    .from("resume_analyses")
    .select("readiness_score, created_at")
    .eq("user_id", userId)
    .eq("status", "completed")
    .order("created_at", { ascending: true });
  return (data ?? [])
    .filter((r): r is { readiness_score: number; created_at: string } =>
      typeof r.readiness_score === "number"
    )
    .map((r) => ({
      date: r.created_at,
      score: r.readiness_score,
    }));
}

export async function getPracticeStats(
  supabase: SupabaseClient,
  userId: string
): Promise<PracticeStats> {
  const { data } = await supabase
    .from("practice_attempts")
    .select("kind, score")
    .eq("user_id", userId);

  const rows = data ?? [];
  const scores = rows.filter((r) => typeof r.score === "number") as {
    score: number;
  }[];
  const totalAttempts = rows.length;
  const scenarioCount = rows.filter((r) => r.kind === "scenario").length;
  const quizCount = rows.filter((r) => r.kind === "quiz").length;
  const avgScore =
    scores.length > 0
      ? Math.round(scores.reduce((acc, r) => acc + r.score, 0) / scores.length)
      : null;
  const bestScore =
    scores.length > 0
      ? Math.max(...scores.map((r) => r.score))
      : null;

  return { totalAttempts, scenarioCount, quizCount, avgScore, bestScore };
}

export async function getPerCompetencyStats(
  supabase: SupabaseClient,
  userId: string
): Promise<PerCompetencyStats[]> {
  const { data } = await supabase
    .from("practice_attempts")
    .select("competency_id, score")
    .eq("user_id", userId);

  const byCompetency = new Map<string, { count: number; sum: number }>();
  for (const row of data ?? []) {
    if (typeof row.score !== "number") continue;
    const entry = byCompetency.get(row.competency_id) ?? { count: 0, sum: 0 };
    entry.count += 1;
    entry.sum += row.score;
    byCompetency.set(row.competency_id, entry);
  }

  return Array.from(byCompetency.entries())
    .map(([competencyId, stats]) => ({
      competencyId,
      title: seedGraph.competencies[competencyId]?.title ?? competencyId,
      attempts: stats.count,
      avgScore: Math.round(stats.sum / stats.count),
    }))
    .sort((a, b) => b.attempts - a.attempts);
}

export async function getCoachStats(
  supabase: SupabaseClient,
  userId: string
): Promise<{ conversations: number; messages: number }> {
  const { data: conversations } = await supabase
    .from("coach_conversations")
    .select("id")
    .eq("user_id", userId);

  const ids = (conversations ?? []).map((c) => c.id);
  let messages = 0;
  if (ids.length > 0) {
    const { count } = await supabase
      .from("coach_messages")
      .select("id", { count: "exact", head: true })
      .in("conversation_id", ids);
    messages = count ?? 0;
  }
  return { conversations: (conversations ?? []).length, messages };
}

export async function getRecentPractice(
  supabase: SupabaseClient,
  userId: string,
  limit = 8
): Promise<
  {
    id: string;
    competencyTitle: string;
    kind: "scenario" | "quiz";
    score: number | null;
    created_at: string;
  }[]
> {
  const { data } = await supabase
    .from("practice_attempts")
    .select("id, competency_id, kind, score, created_at")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(limit);
  return (data ?? []).map((r) => ({
    id: r.id,
    competencyTitle:
      seedGraph.competencies[r.competency_id]?.title ?? r.competency_id,
    kind: r.kind as "scenario" | "quiz",
    score: typeof r.score === "number" ? r.score : null,
    created_at: r.created_at,
  }));
}

export function competencyTitleFor(id: string): string {
  return seedGraph.competencies[id]?.title ?? id;
}
