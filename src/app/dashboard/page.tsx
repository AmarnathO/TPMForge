import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ClipboardList, FileText } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { AppShell } from "@/components/app-shell";
import { ResumeUpload } from "@/components/resume-upload";
import { ReadinessReportView } from "@/components/readiness-report";
import { StandView } from "@/components/stand-view";
import { getPublishedCompetencies, seedGraph } from "@tpmforge/core";
import type { ResumeReportPayload } from "@/app/actions/resume";
import { getLatestAnalysis } from "@/lib/analysis";
import {
  getLatestReadinessTest,
  standFromRow,
} from "@/lib/readiness";

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

  const [profileResult, latest, testRow] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", user.id).single(),
    getLatestAnalysis(supabase, user.id),
    getLatestReadinessTest(supabase, user.id),
  ]);

  const profile = profileResult.data;
  const stand = testRow ? standFromRow(testRow) : null;

  const strongest =
    stand &&
    (Object.entries(stand.aspects).sort((a, b) => b[1] - a[1])[0]?.[0] ?? "");

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

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          <DashboardCard
            label="TPM stand"
            value={stand ? String(stand.overall) : "Pending"}
            hint={
              stand
                ? "From the 30-question readiness test"
                : "Take the readiness test to see it"
            }
          />
          <DashboardCard
            label="Strongest pillar"
            value={
              strongest
                ? strongest.charAt(0).toUpperCase() + strongest.slice(1)
                : "—"
            }
            hint={stand ? "Business · technology · product" : "Awaiting test"}
          />
          <DashboardCard
            label="Next step"
            value={!stand ? "TPM test" : "Resume analysis"}
            hint={
              !stand
                ? "Measure your current stand first"
                : "Score your resume for suggestions"
            }
          />
        </div>

        {!stand ? (
          <div className="mt-8">
            <div className="flex flex-col items-start gap-4 rounded-2xl border border-indigo-500/30 bg-indigo-500/10 p-6 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-start gap-3">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-600/20">
                  <ClipboardList className="h-6 w-6 text-indigo-300" />
                </span>
                <div>
                  <h3 className="text-base font-semibold text-zinc-100">
                    Know your current TPM stand
                  </h3>
                  <p className="mt-1 text-sm text-zinc-400">
                    Answer 10 questions on each of business, technology, and
                    product — get your stand, strongest pillar, and focus
                    areas in under 10 minutes.
                  </p>
                </div>
              </div>
              <Link
                href="/dashboard/readiness#test"
                className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-600/25 transition hover:bg-indigo-500"
              >
                Take the readiness test
              </Link>
            </div>
          </div>
        ) : (
          <div className="mt-8">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-semibold text-zinc-100">
                  Your current stand
                </h3>
                <p className="text-xs text-zinc-500">
                  Based on your 30-question readiness test.
                </p>
              </div>
              <Link
                href="/dashboard/readiness#test"
                className="inline-flex items-center gap-2 rounded-lg border border-zinc-700 px-3 py-2 text-xs font-medium text-zinc-300 transition hover:border-zinc-500 hover:text-zinc-100"
              >
                Retake test
              </Link>
            </div>
            <StandView stand={stand} />
          </div>
        )}

        <div className="mt-12">
          <div className="mb-4 flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-600/20">
              <FileText className="h-4 w-4 text-indigo-300" />
            </span>
            <div>
              <h3 className="text-sm font-semibold text-zinc-100">
                Resume analysis, scoring &amp; suggestions
              </h3>
              <p className="text-xs text-zinc-500">
                Upload your resume for a separate match score, competency gap
                analysis, and learning suggestions.
              </p>
            </div>
          </div>
          {latest ? (
            <>
              <ReadinessReportView report={analysisToPayload(latest)} />
              <div className="mt-8">
                <ResumeUpload />
                <p className="mt-6 text-center text-xs text-zinc-600">
                  Re-upload a newer resume to refresh your analysis.
                </p>
              </div>
            </>
          ) : (
            <ResumeUpload />
          )}
        </div>
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
