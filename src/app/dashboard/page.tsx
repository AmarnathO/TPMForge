import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowRight, ClipboardList, FileText } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { AppShell } from "@/components/app-shell";
import { RadarChart } from "@/components/radar-chart";
import { getLatestAnalysis } from "@/lib/analysis";
import {
  getLatestReadinessTest,
  standFromRow,
  aspectsToRadar,
} from "@/lib/readiness";
import { ASPECTS } from "@/lib/readiness-test";

export const metadata: Metadata = {
  title: "Dashboard",
};

export const maxDuration = 60;

function aspectColor(score: number) {
  if (score >= 75) return "bg-emerald-500";
  if (score >= 60) return "bg-indigo-500";
  if (score >= 40) return "bg-amber-500";
  return "bg-rose-500";
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
  const radar = stand ? aspectsToRadar(stand.aspects) : null;

  return (
    <AppShell user={{ email: user.email ?? "" }}>
      <div className="mx-auto max-w-7xl px-6 py-10">
        <div className="mb-12">
          <p className="text-sm text-indigo-400">Overview</p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-zinc-50">
            Welcome back, {profile?.full_name || "forger"}
          </h1>
          <p className="mt-2 text-sm text-zinc-400">
            {profile?.target_role
              ? `Your goal: ${profile.target_role} · ${profile.weekly_hours ?? "—"} hrs/week`
              : "Complete your setup to unlock your personalized roadmap."}
          </p>
        </div>

        {/* ---------- Section 1: Know your current TPM stand (main) ---------- */}
        <section className="rounded-2xl border border-indigo-500/30 bg-gradient-to-br from-indigo-500/10 via-zinc-900/40 to-zinc-900/40 p-8">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-600/20">
                <ClipboardList className="h-6 w-6 text-indigo-300" />
              </span>
              <div>
                <h2 className="text-xl font-bold tracking-tight text-zinc-50">
                  Know Your Current TPM Stand
                </h2>
                <p className="mt-1 text-sm text-zinc-400">
                  {stand
                    ? `Your stand from the 36-question test, last taken ${new Date(stand.completedAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}.`
                    : "Answer 12 questions each on business, technology, and product — get your stand, strongest pillar, and focus areas."}
                </p>
              </div>
            </div>
            <Link
              href="/dashboard/readiness"
              className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-600/25 transition hover:bg-indigo-500"
            >
              {stand ? "See stand details" : "Take the readiness test"}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          {!stand ? (
            <div className="mt-6 rounded-xl border border-dashed border-indigo-500/30 bg-zinc-950/40 p-6">
              <p className="text-sm text-zinc-400">
                Measure your current stand first. Once you complete the test,
                you&apos;ll see your score, competency graph, and suggested
                focus areas here and on the{" "}
                <Link
                  href="/dashboard/readiness"
                  className="font-medium text-indigo-300 underline decoration-indigo-500/40 underline-offset-2 hover:text-indigo-200"
                >
                  readiness page
                </Link>
                .
              </p>
            </div>
          ) : (
            <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,280px)_minmax(0,1fr)]">
              <div className="rounded-2xl border border-zinc-800 bg-zinc-950/50 p-6 text-center">
                <p className="text-xs font-medium uppercase tracking-wider text-zinc-500">
                  Your TPM stand
                </p>
                <p className="mt-2 text-5xl font-bold text-zinc-50">
                  {stand.overall}
                  <span className="text-2xl text-zinc-500">/100</span>
                </p>
                <span className="mt-3 inline-flex items-center rounded-full border border-indigo-500/30 bg-indigo-500/10 px-3 py-1 text-xs font-medium text-indigo-300">
                  {stand.label}
                </span>
                <Link
                  href="/dashboard/readiness"
                  className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-zinc-700 px-4 py-2.5 text-sm font-medium text-zinc-300 transition hover:border-zinc-500 hover:text-zinc-100"
                >
                  Full details &amp; focus areas
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>

              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div className="rounded-2xl border border-zinc-800 bg-zinc-950/50 p-6">
                  <p className="text-xs font-medium uppercase tracking-wider text-zinc-500">
                    Competency graph
                  </p>
                  <div className="mx-auto mt-2 h-56 max-w-[220px]">
                    <RadarChart data={radar!} />
                  </div>
                </div>
                <div className="flex flex-col justify-center rounded-2xl border border-zinc-800 bg-zinc-950/50 p-6">
                  <p className="text-xs font-medium uppercase tracking-wider text-zinc-500">
                    Strength by pillar
                  </p>
                  <div className="mt-4 space-y-4">
                    {ASPECTS.map((aspect) => {
                      const score = stand.aspects[aspect.key];
                      return (
                        <div key={aspect.key}>
                          <div className="flex items-center justify-between gap-3">
                            <p className="text-sm text-zinc-300">
                              {aspect.label}
                            </p>
                            <span className="text-xs font-medium text-zinc-500">
                              {score}/100
                            </span>
                          </div>
                          <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-zinc-800">
                            <div
                              className={`h-full rounded-full ${aspectColor(score)}`}
                              style={{ width: `${score}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  <Link
                    href="/dashboard/readiness#test"
                    className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-zinc-700 px-4 py-2.5 text-sm font-medium text-zinc-300 transition hover:border-zinc-500 hover:text-zinc-100"
                  >
                    Retake test
                  </Link>
                </div>
              </div>
            </div>
          )}
        </section>

        {/* -------- Section 2: Resume analysis (biggest heading + journey link) -------- */}
        <section className="mt-16">
          <div className="mb-6 flex items-center gap-3">
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-600/20">
              <FileText className="h-6 w-6 text-indigo-300" />
            </span>
            <div>
              <h2 className="text-3xl font-bold tracking-tight text-zinc-50">
                Resume Analysis, Scoring &amp; Suggestions
              </h2>
              <p className="mt-1 text-sm text-zinc-400">
                Upload your resume to score it against the TPM competency graph
                — then open the full analysis with gaps and suggestions.
              </p>
            </div>
          </div>

          {latest && (
            <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-zinc-800 bg-zinc-900/40 p-5">
              <div className="flex items-center gap-4">
                <p className="text-4xl font-bold text-zinc-50">
                  {latest.readiness_score ?? 0}
                  <span className="text-lg text-zinc-500">/100</span>
                </p>
                <div>
                  <p className="text-sm font-medium text-zinc-200">
                    {latest.file_name}
                  </p>
                  <p className="text-xs text-zinc-500">
                    Resume match score · analyzed with the competency graph
                  </p>
                </div>
              </div>
              <Link
                href="/dashboard/resume"
                className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-600/25 transition hover:bg-indigo-500"
              >
                View full analysis <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          )}

          <Link
            href="/dashboard/resume"
            className="group flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-indigo-500/30 bg-gradient-to-br from-indigo-500/10 via-zinc-900/40 to-zinc-900/40 p-8 transition hover:border-indigo-500/60"
          >
            <div className="flex items-center gap-4">
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-600/20">
                <FileText className="h-6 w-6 text-indigo-300" />
              </span>
              <div>
                <h3 className="text-lg font-semibold text-zinc-50">
                  {latest ? "Re-analyze your resume" : "Start your resume analysis"}
                </h3>
                <p className="mt-1 text-sm text-zinc-400">
                  Upload your resume on the resume analysis page — get a match
                  score, competency gaps, and suggestions.
                </p>
              </div>
            </div>
            <span className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-600/25 transition group-hover:bg-indigo-500">
              Go to resume analysis <ArrowRight className="h-4 w-4" />
            </span>
          </Link>
        </section>
      </div>
    </AppShell>
  );
}
