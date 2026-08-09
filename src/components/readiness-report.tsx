import type { ResumeReportPayload } from "@/app/actions/resume";
import { RadarChart } from "@/components/radar-chart";

function gapColor(score: number) {
  if (score < 40) return "bg-red-500";
  if (score < 60) return "bg-amber-500";
  return "bg-indigo-500";
}

function CoachList({
  title,
  items,
  tone = "zinc",
}: {
  title: string;
  items: string[];
  tone?: "zinc" | "emerald" | "rose" | "amber";
}) {
  if (items.length === 0) return null;
  const dot = {
    zinc: "bg-zinc-500",
    emerald: "bg-emerald-500",
    rose: "bg-rose-500",
    amber: "bg-amber-500",
  }[tone];
  return (
    <div>
      <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
        {title}
      </h4>
      <ul className="mt-3 space-y-2">
        {items.map((item, i) => (
          <li key={i} className="flex items-start gap-2.5">
            <span
              className={`mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full ${dot}`}
            />
            <p className="text-sm leading-relaxed text-zinc-300">{item}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function ReadinessReportView({
  report,
}: {
  report: ResumeReportPayload;
}) {
  const topGaps = report.gaps.slice(0, 6);
  const coach = report.coach;

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

      {coach && (
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6 lg:p-8">
          <div className="mb-6">
            <p className="text-xs font-medium uppercase tracking-wider text-indigo-400">
              TPM Career &amp; Resume Coach
            </p>
            <h3 className="mt-1 text-lg font-semibold text-zinc-50">
              Professional Career Evaluation
            </h3>
          </div>

          {coach.profile && (
            <div className="mb-6 rounded-xl border border-zinc-800 bg-zinc-950/60 p-4">
              <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
                Candidate profile
              </p>
              <p className="mt-2 text-sm leading-relaxed text-zinc-300">
                {coach.profile}
              </p>
            </div>
          )}

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <div className="rounded-xl border border-zinc-800 bg-zinc-950/60 p-5">
              <p className="text-xs font-medium uppercase tracking-wider text-zinc-500">
                TPM readiness score
              </p>
              <p className="mt-2 text-4xl font-bold text-indigo-400">
                {coach.readinessScore}
                <span className="text-xl text-zinc-500">/100</span>
              </p>
            </div>
            <div className="rounded-xl border border-zinc-800 bg-zinc-950/60 p-5 sm:col-span-2">
              <p className="text-xs font-medium uppercase tracking-wider text-zinc-500">
                Executive assessment
              </p>
              <p className="mt-2 text-sm leading-relaxed text-zinc-300">
                {coach.executiveAssessment}
              </p>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-1 gap-8 lg:grid-cols-2">
            <CoachList title="Top strengths" items={coach.strengths} tone="emerald" />
            <CoachList title="Critical gaps" items={coach.criticalGaps} tone="rose" />
            <CoachList title="Resume issues" items={coach.resumeIssues} tone="amber" />
            <CoachList title="Missing evidence" items={coach.missingEvidence} />
            <CoachList title="Technical gaps" items={coach.technicalGaps} />
            <CoachList title="Impact gaps" items={coach.impactGaps} />
            <CoachList title="Portfolio recommendations" items={coach.portfolioRecommendations} />
            <CoachList title="Certification recommendations" items={coach.certificationRecommendations} />
            <CoachList title="LinkedIn recommendations" items={coach.linkedinRecommendations} />
            <CoachList title="Content strategy" items={coach.contentStrategy} />
          </div>

          {coach.bulletImprovements.length > 0 && (
            <div className="mt-8">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                Bullet improvements
              </h4>
              <div className="mt-3 space-y-4">
                {coach.bulletImprovements.map((item, i) => (
                  <div
                    key={i}
                    className="rounded-xl border border-zinc-800 bg-zinc-950/60 p-4"
                  >
                    <p className="text-xs font-medium text-zinc-500">
                      <span className="text-rose-400">Current:</span>{" "}
                      <span className="text-zinc-400">{item.current}</span>
                    </p>
                    <p className="mt-2 text-sm leading-relaxed text-emerald-300">
                      <span className="text-xs font-medium text-emerald-500">
                        Recommended:{" "}
                      </span>
                      {item.recommended}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {coach.roadmap.length > 0 && (
            <div className="mt-8">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                Career roadmap
              </h4>
              <ol className="mt-3 space-y-3">
                {coach.roadmap.map((step, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-indigo-600/20 text-xs font-semibold text-indigo-300">
                      {i + 1}
                    </span>
                    <p className="text-sm leading-relaxed text-zinc-300">
                      {step}
                    </p>
                  </li>
                ))}
              </ol>
            </div>
          )}

          {coach.plan306090.length > 0 && (
            <div className="mt-8">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                30 / 60 / 90 day plan
              </h4>
              <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-3">
                {coach.plan306090.map((phase) => (
                  <div
                    key={phase.phase}
                    className="rounded-xl border border-zinc-800 bg-zinc-950/60 p-4"
                  >
                    <p className="text-sm font-semibold text-zinc-100">
                      {phase.phase}
                    </p>
                    <ul className="mt-2 space-y-1.5">
                      {phase.actions.map((action, i) => (
                        <li
                          key={i}
                          className="text-xs leading-relaxed text-zinc-400"
                        >
                          {action}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="mt-8 flex flex-wrap items-center gap-6 rounded-xl border border-indigo-500/30 bg-indigo-500/5 p-5">
            <div className="flex items-center gap-4">
              <p className="text-xs font-medium uppercase tracking-wider text-indigo-300">
                Interview readiness
              </p>
              <p className="text-3xl font-bold text-indigo-400">
                {coach.interviewReadiness.score}
                <span className="text-base text-zinc-500">/100</span>
              </p>
            </div>
            {coach.interviewReadiness.notes && (
              <p className="flex-1 text-sm leading-relaxed text-zinc-300">
                {coach.interviewReadiness.notes}
              </p>
            )}
          </div>
        </div>
      )}

      <p className="text-xs text-zinc-600">
        Scored by {report.model} · {report.tokensUsed} tokens used
      </p>
    </div>
  );
}
