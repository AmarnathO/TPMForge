import type { Metadata } from "next";
import { redirect } from "next/navigation";
import Link from "next/link";
import {
  CalendarDays,
  Clock,
  Flag,
  UploadCloud,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
} from "lucide-react";
import {
  buildRoadmap,
  getPublishedCompetencies,
  seedGraph,
} from "@tpmforge/core";
import { createClient } from "@/lib/supabase/server";
import { AppShell } from "@/components/app-shell";
import { RoadmapPaywall } from "@/components/roadmap-paywall";
import { getLatestAnalysis } from "@/lib/analysis";
import { getSubscription, isSubscriptionActive } from "@/lib/subscription";

export const metadata: Metadata = {
  title: "Roadmap",
};

const DIFFICULTY_STYLE: Record<string, string> = {
  beginner: "bg-emerald-500/10 text-emerald-400",
  intermediate: "bg-sky-500/10 text-sky-400",
  advanced: "bg-violet-500/10 text-violet-400",
  expert: "bg-rose-500/10 text-rose-400",
};

export default async function RoadmapPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const [profileResult, latest, subscription] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", user.id).single(),
    getLatestAnalysis(supabase, user.id),
    getSubscription(supabase, user.id),
  ]);

  const subscribed = isSubscriptionActive(subscription);

  if (!subscribed) {
    return (
      <AppShell user={{ email: user.email ?? "" }}>
        <div className="mx-auto max-w-7xl px-6 py-10">
          {!latest ? (
            <div className="rounded-2xl border border-dashed border-zinc-700 bg-zinc-900/40 p-10 text-center">
              <UploadCloud className="mx-auto h-8 w-8 text-zinc-600" />
              <h3 className="mt-4 text-base font-semibold text-zinc-100">
                No roadmap yet
              </h3>
              <p className="mx-auto mt-2 max-w-md text-sm text-zinc-500">
                Your roadmap is built from your resume&apos;s competency gaps.
                Take the readiness test and upload a resume to get started —
                then unlock the plan with a membership.
              </p>
              <div className="mx-auto mt-6 max-w-lg">
                <Link
                  href="/dashboard/resume"
                  className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-600/25 transition hover:bg-indigo-500"
                >
                  Analyze my resume <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          ) : (
            <RoadmapPaywall email={user.email ?? ""} />
          )}
        </div>
      </AppShell>
    );
  }

  const profile = profileResult.data;
  const weeklyHours = profile?.weekly_hours ?? 5;
  const timelineWeeks = profile?.timeline_weeks ?? 12;

  const gapReport = (latest?.gap_report ?? {}) as {
    gaps?: { id: string }[];
  };
  const gapIds = (gapReport.gaps ?? []).map((g) => g.id);
  const targetIds =
    gapIds.length > 0
      ? gapIds
      : getPublishedCompetencies(seedGraph).map((c) => c.id);

  const plan = buildRoadmap(seedGraph, targetIds, {
    weeklyHours,
    timelineWeeks,
  });

  return (
    <AppShell user={{ email: user.email ?? "" }}>
      <div className="mx-auto max-w-7xl px-6 py-10">
        <div className="mb-10">
          <p className="text-sm text-indigo-400">Roadmap</p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-zinc-50">
            Your personalized roadmap
          </h1>
          <p className="mt-2 text-sm text-zinc-400">
            Gaps from your readiness report, expanded to their prerequisites and
            sequenced week by week.
          </p>
          {subscription && (
            <p className="mt-3 inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-400">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
              {subscription.plan} membership active
              {subscription.ends_at
                ? ` · until ${new Date(subscription.ends_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}`
                : ""}
            </p>
          )}
        </div>

        {!latest ? (
          <div className="rounded-2xl border border-dashed border-zinc-700 bg-zinc-900/40 p-10 text-center">
            <UploadCloud className="mx-auto h-8 w-8 text-zinc-600" />
            <h3 className="mt-4 text-base font-semibold text-zinc-100">
              No roadmap yet
            </h3>
            <p className="mx-auto mt-2 max-w-md text-sm text-zinc-500">
              Your roadmap is built from your resume&apos;s competency gaps. Take
              the readiness test and upload a resume to get started.
            </p>
            <div className="mx-auto mt-6 max-w-lg">
              <Link
                href="/dashboard/resume"
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-600/25 transition hover:bg-indigo-500"
              >
                Analyze my resume <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <SummaryCard
                icon={<Clock className="h-4 w-4 text-indigo-400" />}
                label="Total effort"
                value={`${plan.totalHours} hrs`}
                hint={`At ${weeklyHours} hrs/week`}
              />
              <SummaryCard
                icon={<CalendarDays className="h-4 w-4 text-indigo-400" />}
                label="Roadmap length"
                value={`${plan.neededWeeks} weeks`}
                hint={`Timeline: ${timelineWeeks} weeks`}
              />
              {plan.feasibleInTimeline ? (
                <SummaryCard
                  icon={<CheckCircle2 className="h-4 w-4 text-emerald-400" />}
                  label="Timeline fit"
                  value="On track"
                  hint="Fits within your goal timeline"
                  accent="text-emerald-400"
                />
              ) : (
                <SummaryCard
                  icon={<AlertTriangle className="h-4 w-4 text-amber-400" />}
                  label="Timeline fit"
                  value="Tight"
                  hint={`Needs ${plan.neededWeeks} weeks vs ${timelineWeeks} available`}
                  accent="text-amber-400"
                />
              )}
            </div>

            <div className="mt-8 space-y-4">
              {plan.weeks.length === 0 && (
                <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6 text-sm text-zinc-400">
                  Your gap list is empty — your roadmap is clear. Re-upload a
                  newer resume or challenge yourself with harder targets soon.
                </div>
              )}
              {plan.weeks.map((week, idx) => (
                <div
                  key={week.week}
                  className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-indigo-600/20 text-sm font-bold text-indigo-300">
                        {week.week}
                      </span>
                      <div>
                        <p className="text-sm font-semibold text-zinc-100">
                          Week {week.week}
                        </p>
                        <p className="text-xs text-zinc-500">
                          {week.hours} hrs ·{" "}
                          {week.competencyIds.length} competencies
                        </p>
                      </div>
                    </div>
                    {idx === 0 && (
                      <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-400">
                        <Flag className="h-3 w-3" /> Start here
                      </span>
                    )}
                  </div>
                  <ul className="mt-4 space-y-3">
                    {week.competencyIds.map((id) => {
                      const comp = seedGraph.competencies[id];
                      if (!comp) return null;
                      return (
                        <li
                          key={id}
                          className="flex items-center justify-between gap-3 rounded-xl border border-zinc-800 bg-zinc-950/50 px-4 py-3"
                        >
                          <div className="flex min-w-0 items-center gap-3">
                            <span
                              className={`shrink-0 rounded-md px-2 py-0.5 text-[11px] font-medium capitalize ${DIFFICULTY_STYLE[comp.difficulty]}`}
                            >
                              {comp.difficulty}
                            </span>
                            <div className="min-w-0">
                              <p className="truncate text-sm text-zinc-200">
                                {comp.title}
                              </p>
                              <p className="truncate text-xs text-zinc-600">
                                {comp.description}
                              </p>
                            </div>
                          </div>
                          <span className="shrink-0 text-xs font-medium text-zinc-500">
                            {comp.estimatedStudyHours}h
                          </span>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              ))}
            </div>

            <p className="mt-6 text-xs text-zinc-600">
              Sequenced from the TPM competency graph — every prerequisite is
              placed before what depends on it. Re-upload a resume to
              regenerate.
            </p>
          </>
        )}
      </div>
    </AppShell>
  );
}

function SummaryCard({
  icon,
  label,
  value,
  hint,
  accent,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  hint: string;
  accent?: string;
}) {
  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-5">
      <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-zinc-500">
        {icon}
        {label}
      </div>
      <p className={`mt-2 text-2xl font-bold text-zinc-50 ${accent ?? ""}`}>
        {value}
      </p>
      <p className="mt-1 text-xs text-zinc-600">{hint}</p>
    </div>
  );
}
