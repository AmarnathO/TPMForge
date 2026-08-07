"use client";

import { useState } from "react";
import { useActionState } from "react";
import {
  Sparkles,
  ClipboardList,
  Send,
  Loader2,
  AlertTriangle,
  RotateCcw,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { practice } from "@/app/actions/practice";
import { cn } from "@/lib/utils";

type Mode = "scenario" | "quiz";

export function PracticeStudio({
  competencies,
}: {
  competencies: { id: string; title: string }[];
}) {
  const [state, formAction, pending] = useActionState(practice, {
    status: "idle",
    mode: "scenario",
    competencyId: "",
    competencyTitle: "",
  });
  const [mode, setMode] = useState<Mode>("scenario");
  const [competencyId, setCompetencyId] = useState(competencies[0]?.id ?? "");
  const [answer, setAnswer] = useState("");

  const busy = pending;
  const competency = competencies.find((c) => c.id === competencyId);

  return (
    <div className="space-y-6">
      {/* Mode + competency selector */}
      <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex rounded-xl border border-zinc-800 bg-zinc-950 p-1">
            {(
              [
                ["scenario", "Scenario", "Practice a real TPM situation"],
                ["quiz", "Quiz", "Applied multiple-choice questions"],
              ] as [Mode, string, string][]
            ).map(([m, label, hint]) => (
              <button
                key={m}
                type="button"
                onClick={() => setMode(m)}
                disabled={busy}
                className={cn(
                  "rounded-lg px-4 py-2 text-sm font-medium transition disabled:opacity-60",
                  mode === m
                    ? "bg-indigo-600 text-white shadow"
                    : "text-zinc-400 hover:text-zinc-200"
                )}
              >
                {label}
                <span className="ml-1 hidden text-[11px] text-zinc-500 sm:inline">
                  {hint}
                </span>
              </button>
            ))}
          </div>

          <select
            value={competencyId}
            onChange={(e) => setCompetencyId(e.target.value)}
            disabled={busy}
            className="rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-2.5 text-sm text-zinc-200 focus:border-indigo-500 focus:outline-none disabled:opacity-60"
          >
            {competencies.map((c) => (
              <option key={c.id} value={c.id}>
                {c.title}
              </option>
            ))}
          </select>
        </div>
      </div>

      {state.status === "error" && state.error && (
        <div className="flex items-start gap-3 rounded-xl border border-rose-500/40 bg-rose-500/10 p-4 text-sm text-rose-300">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
          <p>{state.error}</p>
        </div>
      )}

      {state.status === "idle" && (
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-10 text-center">
          <Sparkles className="mx-auto h-8 w-8 text-indigo-400" />
          <h3 className="mt-4 text-lg font-semibold text-zinc-100">
            {mode === "scenario" ? "Scenario practice" : "Applied quiz"}
          </h3>
          <p className="mx-auto mt-2 max-w-md text-sm text-zinc-500">
            {mode === "scenario"
              ? "Get a realistic TPM scenario for the selected competency, write your answer, and receive a rubric-graded score with feedback."
              : "Answer five applied multiple-choice questions and get instant scoring with explanations."}
          </p>
          <form action={formAction} className="mt-6">
            <input type="hidden" name="intent" value={mode === "scenario" ? "start_scenario" : "start_quiz"} />
            <input type="hidden" name="mode" value={mode} />
            <input type="hidden" name="competency_id" value={competencyId} />
            <button
              type="submit"
              disabled={busy || !competency}
              className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-600/25 transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {busy ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Generating…
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  {mode === "scenario" ? "Generate scenario" : "Generate quiz"}
                </>
              )}
            </button>
          </form>
        </div>
      )}

      {state.status === "ready" && state.mode === "scenario" && (
        <div className="space-y-6">
          <div className="rounded-2xl border border-indigo-500/30 bg-gradient-to-br from-indigo-950/40 to-zinc-900/60 p-6">
            <p className="text-xs font-medium uppercase tracking-wider text-indigo-400">
              Scenario · {state.competencyTitle}
            </p>
            <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-zinc-200">
              {state.scenario}
            </p>
            <p className="mt-4 border-l-2 border-indigo-500 pl-3 text-sm font-medium text-zinc-100">
              {state.question}
            </p>
          </div>

          <form action={formAction} className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6">
            <input type="hidden" name="intent" value="submit_scenario" />
            <input type="hidden" name="mode" value="scenario" />
            <input type="hidden" name="competency_id" value={state.competencyId} />
            <label className="text-sm font-semibold text-zinc-100">
              Your answer
            </label>
            <textarea
              name="answer"
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              rows={6}
              placeholder="How would you handle this? Be specific about what you'd do and why…"
              className="mt-3 w-full resize-y rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-sm text-zinc-100 placeholder:text-zinc-600 focus:border-indigo-500 focus:outline-none"
            />
            <div className="mt-4 flex items-center gap-3">
              <button
                type="submit"
                disabled={busy || answer.trim().length === 0}
                className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-600/25 transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {busy ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" /> Grading…
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4" /> Submit answer
                  </>
                )}
              </button>
              <form action={formAction}>
                <input type="hidden" name="intent" value="reset" />
                <button
                  type="submit"
                  disabled={busy}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-zinc-700 px-4 py-2.5 text-sm text-zinc-400 transition hover:border-zinc-500 hover:text-zinc-200 disabled:opacity-60"
                >
                  <RotateCcw className="h-4 w-4" /> Cancel
                </button>
              </form>
            </div>
          </form>
        </div>
      )}

      {state.status === "ready" && state.mode === "quiz" && state.quiz && (
        <form action={formAction} className="space-y-4">
          <input type="hidden" name="intent" value="submit_quiz" />
          <input type="hidden" name="mode" value="quiz" />
          <input type="hidden" name="competency_id" value={state.competencyId} />
          {state.quiz.map((q, qi) => (
            <div key={qi} className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6">
              <p className="text-sm font-medium text-zinc-100">
                <span className="mr-2 text-indigo-400">{qi + 1}.</span>
                {q.question}
              </p>
              <div className="mt-4 space-y-2">
                {q.options.map((option, oi) => (
                  <label
                    key={oi}
                    className="flex cursor-pointer items-start gap-3 rounded-xl border border-zinc-800 bg-zinc-950/60 px-4 py-3 text-sm text-zinc-300 transition hover:border-indigo-500/60"
                  >
                    <input
                      type="radio"
                      name={`answer-${qi}`}
                      value={oi}
                      required
                      className="mt-0.5 h-4 w-4 accent-indigo-500"
                    />
                    <span>{option}</span>
                  </label>
                ))}
              </div>
            </div>
          ))}
          <div className="flex items-center gap-3">
            <button
              type="submit"
              disabled={busy}
              className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-600/25 transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {busy ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> Checking…
                </>
              ) : (
                <>
                  <ClipboardList className="h-4 w-4" /> Check answers
                </>
              )}
            </button>
            <form action={formAction}>
              <input type="hidden" name="intent" value="reset" />
              <button
                type="submit"
                disabled={busy}
                className="inline-flex items-center gap-1.5 rounded-xl border border-zinc-700 px-4 py-2.5 text-sm text-zinc-400 transition hover:border-zinc-500 hover:text-zinc-200 disabled:opacity-60"
              >
                <RotateCcw className="h-4 w-4" /> Cancel
              </button>
            </form>
          </div>
        </form>
      )}

      {state.status === "complete" && (
        <div className="space-y-6">
          <div
            className={cn(
              "rounded-2xl border p-6",
              state.score !== undefined && state.score >= 75
                ? "border-emerald-500/40 bg-emerald-500/10"
                : state.score !== undefined && state.score >= 50
                  ? "border-amber-500/40 bg-amber-500/10"
                  : "border-rose-500/40 bg-rose-500/10"
            )}
          >
            <div className="flex items-center gap-4">
              <span
                className={cn(
                  "flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl text-2xl font-bold",
                  state.score !== undefined && state.score >= 75
                    ? "bg-emerald-500/20 text-emerald-300"
                    : state.score !== undefined && state.score >= 50
                      ? "bg-amber-500/20 text-amber-300"
                      : "bg-rose-500/20 text-rose-300"
                )}
              >
                {state.score}
              </span>
              <div>
                <p className="text-sm font-semibold text-zinc-100">
                  {state.mode === "scenario" ? (
                    <>
                      Scenario graded · {state.competencyTitle}
                    </>
                  ) : (
                    <>
                      Quiz result · {state.competencyTitle}
                    </>
                  )}
                </p>
                {state.mode === "quiz" && (
                  <p className="mt-1 text-sm text-zinc-400">
                    {state.correctCount} of {state.totalCount} correct
                  </p>
                )}
              </div>
            </div>
          </div>

          {state.mode === "scenario" && state.feedback && (
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
              <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6 lg:col-span-2">
                <h3 className="text-sm font-semibold text-zinc-100">Feedback</h3>
                <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-zinc-300">
                  {state.feedback}
                </p>
              </div>
              <div className="space-y-4">
                {state.strengths && state.strengths.length > 0 && (
                  <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-5">
                    <h3 className="text-xs font-medium uppercase tracking-wider text-emerald-400">
                      Strengths
                    </h3>
                    <ul className="mt-3 space-y-2">
                      {state.strengths.map((s, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-zinc-300">
                          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" />
                          {s}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {state.gaps && state.gaps.length > 0 && (
                  <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-5">
                    <h3 className="text-xs font-medium uppercase tracking-wider text-rose-400">
                      Gaps
                    </h3>
                    <ul className="mt-3 space-y-2">
                      {state.gaps.map((g, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-zinc-300">
                          <XCircle className="mt-0.5 h-4 w-4 shrink-0 text-rose-400" />
                          {g}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          )}

          {state.mode === "quiz" && state.quiz && (
            <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6">
              <h3 className="text-sm font-semibold text-zinc-100">Explanations</h3>
              <ul className="mt-4 space-y-4">
                {state.quiz.map((q, i) => (
                  <li key={i} className="text-sm">
                    <p className="font-medium text-zinc-200">{q.question}</p>
                    <p className="mt-1 text-zinc-500">
                      <span className="font-medium text-emerald-400">Correct: </span>
                      {q.options[q.answerIndex]}
                      {q.explanation ? (
                        <span className="mt-1 block text-zinc-400">{q.explanation}</span>
                      ) : null}
                    </p>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <form action={formAction}>
            <input type="hidden" name="intent" value="reset" />
            <button
              type="submit"
              disabled={busy}
              className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-600/25 transition hover:bg-indigo-500 disabled:opacity-60"
            >
              <RotateCcw className="h-4 w-4" /> Practice again
            </button>
          </form>
        </div>
      )}

      <p className="text-xs text-zinc-600">
        Practice builds evidence toward your readiness score. {competency ? `Selected: ${competency.title}.` : ""}
      </p>
    </div>
  );
}
