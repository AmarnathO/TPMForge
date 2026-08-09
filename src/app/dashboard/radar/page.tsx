import type { Metadata } from "next";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowRight, ClipboardList, UploadCloud } from "lucide-react";
import type { DimensionScores } from "@tpmforge/core";
import { createClient } from "@/lib/supabase/server";
import { AppShell } from "@/components/app-shell";
import { RadarChart } from "@/components/radar-chart";
import { getLatestAnalysis } from "@/lib/analysis";
import {
  aspectsToRadar,
  getLatestReadinessTest,
} from "@/lib/readiness";
import { ASPECTS } from "@/lib/readiness-test";

export const metadata: Metadata = {
  title: "Radar",
};

const DIMENSION_CARDS: {
  key: keyof DimensionScores;
  label: string;
  blurb: string;
}[] = [
  { key: "knowledge", label: "Knowledge", blurb: "Facts, concepts, and vocabulary of TPM work." },
  { key: "understanding", label: "Understanding", blurb: "Why things work — tradeoffs and context." },
  { key: "application", label: "Application", blurb: "Using skills in real situations." },
  { key: "communication", label: "Communication", blurb: "Stories, docs, and updates that land." },
  { key: "decision_making", label: "Decision", blurb: "Prioritizing under ambiguity." },
  { key: "execution", label: "Execution", blurb: "Shipping across teams and dependencies." },
];

const DIMENSION_KEYS: (keyof DimensionScores)[] = [
  "knowledge",
  "understanding",
  "application",
  "communication",
  "decision_making",
  "execution",
];

function scoreLabel(score: number) {
  if (score >= 75) return { label: "Strong", cls: "text-emerald-400" };
  if (score >= 60) return { label: "Developing", cls: "text-amber-400" };
  if (score >= 40) return { label: "Emerging", cls: "text-orange-400" };
  return { label: "Needs work", cls: "text-rose-400" };
}

function aspectColor(score: number) {
  if (score >= 75) return "bg-emerald-500";
  if (score >= 60) return "bg-indigo-500";
  if (score >= 40) return "bg-amber-500";
  return "bg-rose-500";
}

export default async function RadarPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const [latest, testRow] = await Promise.all([
    getLatestAnalysis(supabase, user.id),
    getLatestReadinessTest(supabase, user.id),
  ]);

  const testAspects = testRow?.aspect_scores ?? null;
  const radar: DimensionScores = testAspects
    ? aspectsToRadar(testAspects)
    : ((latest?.radar_data ?? {
        knowledge: 0,
        understanding: 0,
        application: 0,
        communication: 0,
        decision_making: 0,
        execution: 0,
      }) as DimensionScores);

  const maxDimension = DIMENSION_KEYS.reduce(
    (best, d) => (radar[d] > radar[best] ? d : best),
    DIMENSION_KEYS[0]
  );
  const minDimension = DIMENSION_KEYS.reduce(
    (best, d) => (radar[d] < radar[best] ? d : best),
    DIMENSION_KEYS[0]
  );

  return (
    <AppShell user={{ email: user.email ?? "" }}>
      <div className="mx-auto max-w-7xl px-6 py-10">
        <div className="mb-10">
          <p className="text-sm text-indigo-400">Radar</p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-zinc-50">
            Six-dimension radar
          </h1>
          <p className="mt-2 text-sm text-zinc-400">
            {testAspects
              ? "Where you land on each dimension, derived from your readiness test."
              : "Where you land on each dimension, mapped from your latest resume."}
          </p>
        </div>

        {!latest && !testRow ? (
          <div className="rounded-2xl border border-dashed border-zinc-700 bg-zinc-900/40 p-10 text-center">
            <UploadCloud className="mx-auto h-8 w-8 text-zinc-600" />
            <h3 className="mt-4 text-base font-semibold text-zinc-100">
              No radar data yet
            </h3>
            <p className="mx-auto mt-2 max-w-md text-sm text-zinc-500">
              Take the 36-question readiness test or upload your resume to build
              your radar.
            </p>
            <Link
              href="/dashboard/readiness#test"
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-600/25 transition hover:bg-indigo-500"
            >
              <ClipboardList className="h-4 w-4" /> Take the readiness test
            </Link>
            <Link
              href="/dashboard/resume"
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-600/25 transition hover:bg-indigo-500"
            >
              Analyze my resume <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
              <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-8">
                <p className="text-xs font-medium uppercase tracking-wider text-zinc-500">
                  Dimension radar
                </p>
                <div className="mx-auto mt-4 h-80 max-w-sm">
                  <RadarChart data={radar} />
                </div>
                <div className="mt-6 grid grid-cols-1 gap-3 rounded-xl border border-zinc-800 bg-zinc-950/60 p-4 text-sm sm:grid-cols-2">
                  <p className="text-zinc-400">
                    <span className="font-semibold text-emerald-400">Strongest:</span>{" "}
                    {DIMENSION_CARDS.find((d) => d.key === maxDimension)?.label}
                  </p>
                  <p className="text-zinc-400">
                    <span className="font-semibold text-rose-400">Weakest:</span>{" "}
                    {DIMENSION_CARDS.find((d) => d.key === minDimension)?.label}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4">
                {testAspects ? (
                  <>
                    <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-5">
                      <p className="text-xs font-medium uppercase tracking-wider text-zinc-500">
                        Three TPM pillars
                      </p>
                      <div className="mt-4 space-y-5">
                        {ASPECTS.map((aspect) => {
                          const score = testAspects[aspect.key];
                          return (
                            <div key={aspect.key}>
                              <div className="flex items-center justify-between gap-3">
                                <p className="text-sm text-zinc-300">
                                  {aspect.label}
                                </p>
                                <span className="text-sm font-bold text-zinc-100">
                                  {score}
                                </span>
                              </div>
                              <div className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-zinc-800">
                                <div
                                  className={`h-full rounded-full ${aspectColor(score)}`}
                                  style={{ width: `${score}%` }}
                                />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                    <div className="rounded-2xl border border-zinc-800 bg-zinc-950/60 p-5 text-xs text-zinc-500">
                      Your radar is derived from your readiness test. Upload a
                      resume for a separate competency-based radar.
                      <div className="mt-4">
                        <Link
                          href="/dashboard/resume"
                          className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-600/25 transition hover:bg-indigo-500"
                        >
                          Go to resume analysis <ArrowRight className="h-4 w-4" />
                        </Link>
                      </div>
                    </div>
                  </>
                ) : (
                  DIMENSION_CARDS.map((card) => {
                    const score = radar[card.key];
                    const status = scoreLabel(score);
                    return (
                      <div
                        key={card.key}
                        className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-5"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="text-sm font-semibold text-zinc-100">
                              {card.label}
                            </p>
                            <p className="mt-1 text-xs leading-relaxed text-zinc-500">
                              {card.blurb}
                            </p>
                          </div>
                          <span className={`text-2xl font-bold ${status.cls}`}>
                            {score}
                          </span>
                        </div>
                        <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-zinc-800">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-violet-500"
                            style={{ width: `${score}%` }}
                          />
                        </div>
                        <p className={`mt-2 text-xs font-medium ${status.cls}`}>
                          {status.label}
                        </p>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </AppShell>
  );
}
