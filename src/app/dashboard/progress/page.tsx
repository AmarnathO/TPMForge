import type { Metadata } from "next";
import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { AppShell } from "@/components/app-shell";
import {
  getCoachStats,
  getPerCompetencyStats,
  getPracticeStats,
  getReadinessTrend,
  getRecentPractice,
} from "@/lib/progress";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Progress",
};

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
    });
  } catch {
    return iso;
  }
}

function TrendChart({
  points,
}: {
  points: { date: string; score: number }[];
}) {
  const width = 640;
  const height = 180;
  const pad = 24;
  const min = Math.min(0, ...points.map((p) => p.score));
  const max = Math.max(100, ...points.map((p) => p.score));
  const range = max - min || 1;

  const coords = points.map((p, i) => {
    const x =
      points.length === 1
        ? width / 2
        : pad + (i / (points.length - 1)) * (width - pad * 2);
    const y = height - pad - ((p.score - min) / range) * (height - pad * 2);
    return { x, y, score: p.score, date: p.date };
  });

  const line = coords.map((c, i) => `${i === 0 ? "M" : "L"}${c.x.toFixed(1)},${c.y.toFixed(1)}`).join(" ");
  const area = `${line} L${coords[coords.length - 1].x.toFixed(1)},${height - pad} L${coords[0].x.toFixed(1)},${height - pad} Z`;
  const last = coords[coords.length - 1];

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className="h-auto w-full"
      role="img"
      aria-label="Readiness score trend"
    >
      <defs>
        <linearGradient id="trendFill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#6366f1" stopOpacity="0.35" />
          <stop offset="100%" stopColor="#6366f1" stopOpacity="0" />
        </linearGradient>
      </defs>
      {[0, 25, 50, 75, 100].map((tick) => {
        const y = height - pad - ((tick - min) / range) * (height - pad * 2);
        return (
          <g key={tick}>
            <line
              x1={pad}
              x2={width - pad}
              y1={y}
              y2={y}
              stroke="#3f3f46"
              strokeDasharray="3 3"
              strokeWidth="1"
            />
            <text x={pad - 6} y={y + 4} textAnchor="end" className="fill-zinc-600" fontSize="10">
              {tick}
            </text>
          </g>
        );
      })}
      {points.length > 1 && <path d={area} fill="url(#trendFill)" />}
      {points.length > 1 && (
        <path d={line} fill="none" stroke="#6366f1" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      )}
      {last && (
        <g>
          <circle cx={last.x} cy={last.y} r="5" fill="#6366f1" stroke="#18181b" strokeWidth="2" />
          <text x={last.x} y={last.y - 10} textAnchor="middle" className="fill-indigo-300" fontSize="11" fontWeight="600">
            {last.score}
          </text>
          <text x={last.x} y={height - 6} textAnchor="middle" className="fill-zinc-600" fontSize="10">
            {formatDate(last.date)}
          </text>
        </g>
      )}
    </svg>
  );
}

export default async function ProgressPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const [trend, practice, perCompetency, coach, recent] = await Promise.all([
    getReadinessTrend(supabase, user.id),
    getPracticeStats(supabase, user.id),
    getPerCompetencyStats(supabase, user.id),
    getCoachStats(supabase, user.id),
    getRecentPractice(supabase, user.id),
  ]);

  const latestScore = trend.length > 0 ? trend[trend.length - 1].score : null;
  const firstScore = trend.length > 0 ? trend[0].score : null;
  const delta =
    latestScore !== null && firstScore !== null ? latestScore - firstScore : null;

  const stats: { label: string; value: string; hint: string }[] = [
    {
      label: "Readiness score",
      value: latestScore !== null ? String(latestScore) : "—",
      hint:
        delta === null
          ? "Upload a resume to get scored"
          : delta === 0
            ? "No change since first scan"
            : delta > 0
              ? `▲ ${delta} pts since first scan`
              : `▼ ${Math.abs(delta)} pts since first scan`,
    },
    {
      label: "Practice attempts",
      value: String(practice.totalAttempts),
      hint: `${practice.scenarioCount} scenarios · ${practice.quizCount} quizzes`,
    },
    {
      label: "Average practice score",
      value: practice.avgScore !== null ? String(practice.avgScore) : "—",
      hint: practice.bestScore !== null ? `Best: ${practice.bestScore}` : "No attempts yet",
    },
    {
      label: "Coach activity",
      value: String(coach.messages),
      hint: `${coach.conversations} conversation${coach.conversations === 1 ? "" : "s"}`,
    },
  ];

  return (
    <AppShell user={{ email: user.email ?? "" }}>
      <div className="mx-auto max-w-6xl px-6 py-10">
        <div className="mb-8">
          <p className="text-sm text-indigo-400">Progress</p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-zinc-50">
            Your journey, measured
          </h1>
          <p className="mt-2 text-sm text-zinc-400">
            Readiness scans, practice evidence, and coaching activity — all in
            one place.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((s) => (
            <div
              key={s.label}
              className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6"
            >
              <p className="text-xs font-medium uppercase tracking-wider text-zinc-500">
                {s.label}
              </p>
              <p className="mt-2 text-3xl font-bold text-zinc-50">{s.value}</p>
              <p className="mt-2 text-xs text-zinc-500">{s.hint}</p>
            </div>
          ))}
        </div>

        <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-5">
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6 lg:col-span-3">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-zinc-100">
                Readiness trend
              </h2>
              {trend.length > 0 && (
                <Link
                  href="/dashboard/readiness"
                  className="text-xs text-indigo-400 hover:text-indigo-300"
                >
                  View report →
                </Link>
              )}
            </div>
            {trend.length > 0 ? (
              <div className="mt-4">
                <TrendChart points={trend} />
              </div>
            ) : (
              <p className="mt-4 text-sm text-zinc-500">
                No readiness scans yet. Upload your resume to start your first
                assessment.
              </p>
            )}
          </div>

          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6 lg:col-span-2">
            <h2 className="text-sm font-semibold text-zinc-100">
              Practice by competency
            </h2>
            {perCompetency.length > 0 ? (
              <ul className="mt-4 space-y-4">
                {perCompetency.slice(0, 6).map((c) => (
                  <li key={c.competencyId}>
                    <div className="flex items-baseline justify-between text-sm">
                      <span className="text-zinc-300">{c.title}</span>
                      <span className="text-zinc-500">
                        {c.avgScore} · {c.attempts}×
                      </span>
                    </div>
                    <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-zinc-800">
                      <div
                        className={cn(
                          "h-full rounded-full",
                          c.avgScore >= 75
                            ? "bg-emerald-500"
                            : c.avgScore >= 50
                              ? "bg-amber-500"
                              : "bg-rose-500"
                        )}
                        style={{ width: `${Math.min(100, c.avgScore)}%` }}
                      />
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-4 text-sm text-zinc-500">
                No practice attempts yet. Head to{" "}
                <Link
                  href="/dashboard/practice"
                  className="text-indigo-400 hover:text-indigo-300"
                >
                  Practice
                </Link>{" "}
                to build evidence.
              </p>
            )}
          </div>
        </div>

        <div className="mt-8 rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6">
          <h2 className="text-sm font-semibold text-zinc-100">
            Recent practice
          </h2>
          {recent.length > 0 ? (
            <ul className="mt-4 divide-y divide-zinc-800/70">
              {recent.map((r) => (
                <li
                  key={r.id}
                  className="flex items-center justify-between gap-4 py-3 text-sm"
                >
                  <span className="text-zinc-300">{r.competencyTitle}</span>
                  <span className="flex items-center gap-3">
                    <span
                      className={cn(
                        "rounded-full px-2 py-0.5 text-[11px] font-medium",
                        r.kind === "scenario"
                          ? "bg-indigo-500/15 text-indigo-300"
                          : "bg-violet-500/15 text-violet-300"
                      )}
                    >
                      {r.kind}
                    </span>
                    {r.score !== null && (
                      <span
                        className={cn(
                          "w-8 text-right font-semibold",
                          r.score >= 75
                            ? "text-emerald-400"
                            : r.score >= 50
                              ? "text-amber-400"
                              : "text-rose-400"
                        )}
                      >
                        {r.score}
                      </span>
                    )}
                    <span className="w-20 text-right text-xs text-zinc-600">
                      {formatDate(r.created_at)}
                    </span>
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-4 text-sm text-zinc-500">
              Your attempt history will appear here.
            </p>
          )}
        </div>
      </div>
    </AppShell>
  );
}
