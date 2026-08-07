import Link from "next/link";
import { Lock, Map, CalendarDays, GitBranch, ArrowRight } from "lucide-react";
import { SubscribeCard } from "@/components/subscribe-card";

export function RoadmapPaywall({ email }: { email: string }) {
  const highlights = [
    {
      icon: GitBranch,
      title: "Prerequisite-aware sequencing",
      text: "Every competency is expanded to its prerequisites and ordered topologically — learn what you need, when you need it.",
    },
    {
      icon: CalendarDays,
      title: "Week-by-week plan",
      text: "Study hours packed into weekly buckets sized for your real schedule and target timeline.",
    },
    {
      icon: Map,
      title: "Feasibility check",
      text: "Know up front if your timeline is realistic — or exactly how much time you really need.",
    },
  ];

  return (
    <div className="mx-auto max-w-4xl">
      <div className="rounded-3xl border border-indigo-500/30 bg-gradient-to-br from-indigo-950/50 to-zinc-900/70 p-8 sm:p-12">
        <div className="flex items-center gap-2 text-sm font-medium text-indigo-300">
          <Lock className="h-4 w-4" />
          Members-only
        </div>
        <h1 className="mt-3 text-3xl font-bold tracking-tight text-zinc-50">
          Your personalized roadmap is ready
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-zinc-400">
          Your readiness scan and practice evidence are free forever. The
          roadmap — a sequenced, week-by-week study plan built from your exact
          gaps — unlocks with a TPMForge membership.
        </p>

        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
          {highlights.map((h) => (
            <div
              key={h.title}
              className="rounded-2xl border border-zinc-800 bg-zinc-950/60 p-5"
            >
              <h.icon className="h-5 w-5 text-indigo-400" />
              <p className="mt-3 text-sm font-semibold text-zinc-100">
                {h.title}
              </p>
              <p className="mt-1.5 text-xs leading-relaxed text-zinc-500">
                {h.text}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-10">
          <div className="mb-6">
            <p className="text-sm font-semibold text-zinc-100">
              Choose your membership
            </p>
            <p className="mt-1 text-xs text-zinc-500">
              Unlocks your roadmap plus everything else in your dashboard.
            </p>
          </div>
          <SubscribeCard email={email} />
        </div>
      </div>

      <div className="mt-6 flex flex-wrap items-center justify-center gap-3 text-sm">
        <span className="text-zinc-500">
          Not ready to pay yet? Keep building evidence for free:
        </span>
        <Link
          href="/dashboard/practice"
          className="inline-flex items-center gap-1 text-indigo-400 transition hover:text-indigo-300"
        >
          Practice assessments <ArrowRight className="h-3.5 w-3.5" />
        </Link>
        <span className="text-zinc-700">·</span>
        <Link
          href="/dashboard/coach"
          className="inline-flex items-center gap-1 text-indigo-400 transition hover:text-indigo-300"
        >
          Talk to the AI coach <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>
    </div>
  );
}
