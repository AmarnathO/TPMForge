import type { TpmStand } from "@/lib/readiness-test";
import { ASPECTS } from "@/lib/readiness-test";
import { RadarChart } from "@/components/radar-chart";
import { aspectsToRadar } from "@/lib/readiness";

function aspectColor(score: number) {
  if (score >= 75) return "bg-emerald-500";
  if (score >= 60) return "bg-indigo-500";
  if (score >= 40) return "bg-amber-500";
  return "bg-rose-500";
}

export function StandView({
  stand,
}: {
  stand: TpmStand & { completedAt?: string };
}) {
  const radar = aspectsToRadar(stand.aspects);

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6">
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
          {stand.completedAt && (
            <p className="mt-3 text-xs text-zinc-600">
              From the 36-question test ·{" "}
              {new Date(stand.completedAt).toLocaleDateString("en-IN", {
                day: "numeric",
                month: "short",
                year: "numeric",
              })}
            </p>
          )}
        </div>

        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6 lg:col-span-2">
          <p className="text-xs font-medium uppercase tracking-wider text-zinc-500">
            Strength across the three TPM pillars
          </p>
          <div className="mx-auto mt-2 h-64 max-w-xs">
            <RadarChart data={radar} />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6">
          <h3 className="text-sm font-semibold text-zinc-100">
            Where you stand today
          </h3>
          <p className="mt-3 text-sm leading-relaxed text-zinc-400">
            {stand.narrative}
          </p>
          <ul className="mt-4 space-y-4">
            {ASPECTS.map((aspect) => {
              const score = stand.aspects[aspect.key];
              return (
                <li key={aspect.key}>
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm text-zinc-300">{aspect.label}</p>
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
                </li>
              );
            })}
          </ul>
        </div>

        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6">
          <h3 className="text-sm font-semibold text-zinc-100">
            Suggested focus areas
          </h3>
          {stand.focus.length === 0 ? (
            <p className="mt-3 text-sm text-zinc-500">
              You&apos;re well rounded across all three pillars.
            </p>
          ) : (
            <ul className="mt-4 space-y-3">
              {stand.focus.map((item) => (
                <li
                  key={item}
                  className="flex items-center gap-3 rounded-xl border border-zinc-800 bg-zinc-950/50 px-4 py-3 text-sm text-zinc-300"
                >
                  <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-indigo-400" />
                  {item}
                </li>
              ))}
            </ul>
          )}
          <p className="mt-4 text-xs text-zinc-600">
            Pair this with a resume analysis for a complete readiness picture.
          </p>
        </div>
      </div>
    </div>
  );
}
