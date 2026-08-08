import type { ResumeReportPayload } from "@/app/actions/resume";
import { RadarChart } from "@/components/radar-chart";

function gapColor(score: number) {
  if (score < 40) return "bg-red-500";
  if (score < 60) return "bg-amber-500";
  return "bg-indigo-500";
}

export function ReadinessReportView({
  report,
}: {
  report: ResumeReportPayload;
}) {
  const topGaps = report.gaps.slice(0, 6);

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6">
          <p className="text-xs font-medium uppercase tracking-wider text-zinc-500">
            Resume match score
          </p>
          <p className="mt-2 text-5xl font-bold text-zinc-50">
            {report.readinessScore}
            <span className="text-2xl text-zinc-500">/100</span>
          </p>
          <p className="mt-3 text-xs text-zinc-500">
            {report.scoredCount} of {report.competencyCount} competencies scored
            from {report.fileName}
          </p>
        </div>

        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6 lg:col-span-2">
          <p className="text-xs font-medium uppercase tracking-wider text-zinc-500">
            Competency radar
          </p>
          <div className="mx-auto mt-2 h-64 max-w-xs">
            <RadarChart data={report.radar} />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6">
          <h3 className="text-sm font-semibold text-zinc-100">
            Priority gaps
          </h3>
          {topGaps.length === 0 ? (
            <p className="mt-3 text-sm text-zinc-500">
              No significant gaps below threshold. Strong profile.
            </p>
          ) : (
            <ul className="mt-4 space-y-4">
              {topGaps.map((gap) => (
                <li key={gap.id}>
                  <div className="flex items-center justify-between gap-3">
                    <p className="truncate text-sm text-zinc-300">{gap.title}</p>
                    <span className="text-xs font-medium text-zinc-500">
                      {gap.overall}
                    </span>
                  </div>
                  <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-zinc-800">
                    <div
                      className={`h-full rounded-full ${gapColor(gap.overall)}`}
                      style={{ width: `${gap.overall}%` }}
                    />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6">
          <h3 className="text-sm font-semibold text-zinc-100">
            Suggestions
          </h3>
          {report.nextSteps.length === 0 ? (
            <p className="mt-3 text-sm text-zinc-500">
              Your roadmap is clear. No foundational work needed yet.
            </p>
          ) : (
            <ol className="mt-4 space-y-3">
              {report.nextSteps.map((step, i) => (
                <li key={step.id} className="flex items-start gap-3">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-indigo-600/20 text-xs font-semibold text-indigo-300">
                    {i + 1}
                  </span>
                  <div>
                    <p className="text-sm text-zinc-300">{step.title}</p>
                    <p className="text-xs text-zinc-600">{step.id}</p>
                  </div>
                </li>
              ))}
            </ol>
          )}
        </div>
      </div>

      <p className="text-xs text-zinc-600">
        Scored by {report.model} · {report.tokensUsed} tokens used
      </p>
    </div>
  );
}
