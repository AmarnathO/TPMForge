import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AppShell } from "@/components/app-shell";
import { ResumeUpload } from "@/components/resume-upload";
import { ReadinessReportView } from "@/components/readiness-report";
import { getPublishedCompetencies, seedGraph } from "@tpmforge/core";
import type { ResumeReportPayload } from "@/app/actions/resume";

export const metadata: Metadata = {
  title: "Dashboard",
};

export const maxDuration = 60;

function analysisToPayload(row: {
  readiness_score: number | null;
  radar_data: unknown;
  gap_report: unknown;
  model_used: string | null;
  tokens_used: number | null;
  file_name: string;
  competency_scores: Record<string, unknown>;
}): ResumeReportPayload {
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
  };
}

export default async function DashboardPage() {
  if (
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  ) {
    redirect("/login");
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const [profileResult, analysesResult] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", user.id).single(),
    supabase
      .from("resume_analyses")
      .select(
        "readiness_score, radar_data, gap_report, model_used, tokens_used, file_name, competency_scores, created_at"
      )
      .eq("user_id", user.id)
      .eq("status", "completed")
      .order("created_at", { ascending: false })
      .limit(1),
  ]);

  const profile = profileResult.data;
  const latest = analysesResult.data?.[0];
  const hasAnalysis = Boolean(latest);

  return (
    <AppShell user={{ email: user.email ?? "" }}>
      <div className="mx-auto max-w-7xl px-6 py-10">
        <div className="mb-10">
          <p className="text-sm text-indigo-400">Dashboard</p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-zinc-50">
            Welcome back, {profile?.full_name || "forger"}
          </h1>
          <p className="mt-2 text-sm text-zinc-400">
            {profile?.target_role
              ? `Your goal: ${profile.target_role} · ${profile.timeline_weeks ?? "—"} week plan · ${profile.weekly_hours ?? "—"} hrs/week`
              : "Complete your setup to unlock your personalized roadmap."}
          </p>
        </div>

        {hasAnalysis && latest ? (
          <ReadinessReportView report={analysisToPayload(latest)} />
        ) : (
          <>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              <DashboardCard
                label="Readiness score"
                value="Pending"
                hint="From your first resume scan"
              />
              <DashboardCard
                label="Gap focus"
                value="—"
                hint="Prioritized after radar mapping"
              />
              <DashboardCard
                label="Next milestone"
                value="Resume scan"
                hint="Step 1 of your journey"
              />
            </div>
            <div className="mt-10">
              <ResumeUpload />
            </div>
          </>
        )}

        {hasAnalysis && (
          <div className="mt-10">
            <ResumeUpload />
            <p className="mt-6 text-center text-xs text-zinc-600">
              Re-upload a newer resume to refresh your readiness score.
            </p>
          </div>
        )}

        <p className="mt-10 text-xs text-zinc-600">
          Membership from ₹1,600/mo with annual billing.
        </p>
      </div>
    </AppShell>
  );
}

function DashboardCard({
  label,
  value,
  hint,
}: {
  label: string;
  value: string;
  hint: string;
}) {
  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6">
      <p className="text-xs font-medium uppercase tracking-wider text-zinc-500">
        {label}
      </p>
      <p className="mt-2 text-3xl font-bold text-zinc-50">{value}</p>
      <p className="mt-2 text-xs text-zinc-500">{hint}</p>
    </div>
  );
}
