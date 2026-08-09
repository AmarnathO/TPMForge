"use client";

import { useActionState, useState } from "react";
import {
  Sparkles,
  ClipboardList,
  ArrowLeft,
  ArrowRight,
  Loader2,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
} from "lucide-react";
import {
  submitProductAssessment,
  type ProductAgentState,
} from "@/app/actions/product-agent";
import {
  PRODUCT_QUESTIONS,
  PRODUCT_DIMENSIONS,
  PRODUCT_DIFFICULTY_LABEL,
  type ProductAgentResult,
  type ProductQuestionDifficulty,
} from "@/lib/product-agent";

const initialState: ProductAgentState = { status: "idle" };

function difficultyStyle(difficulty: ProductQuestionDifficulty) {
  switch (difficulty) {
    case "basic":
      return "border-emerald-500/30 bg-emerald-500/10 text-emerald-300";
    case "intermediate":
      return "border-amber-500/30 bg-amber-500/10 text-amber-300";
    case "advanced":
      return "border-rose-500/30 bg-rose-500/10 text-rose-300";
  }
}

function scoreLabel(score: number) {
  if (score >= 80) return "Product Leader";
  if (score >= 65) return "Strong Product Sense";
  if (score >= 50) return "Developing Product Sense";
  return "Early Stage";
}

function scoreColor(score: number) {
  if (score >= 80) return "text-emerald-400";
  if (score >= 65) return "text-indigo-300";
  if (score >= 50) return "text-amber-300";
  return "text-rose-400";
}

export function ProductAgent({
  initial,
}: {
  initial: ProductAgentResult | null;
}) {
  const [state, formAction, pending] = useActionState(
    submitProductAssessment,
    initialState
  );
  const [localView, setLocalView] = useState<"intro" | "quiz" | "result">("intro");
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [qIndex, setQIndex] = useState(0);

  const view =
    state.status === "success" && state.result ? "result" : localView;
  const result = state.status === "success" && state.result ? state.result : null;
  const showing = view === "result" ? (result ?? initial) : null;

  const total = PRODUCT_QUESTIONS.length;
  const answeredCount = Object.keys(answers).length;
  const progress = Math.round((answeredCount / total) * 100);

  const activeQuestion = PRODUCT_QUESTIONS[qIndex]!;
  const isLast = qIndex === total - 1;

  const startQuiz = () => {
    setAnswers({});
    setQIndex(0);
    setLocalView("quiz");
  };

  const currentAnswered =
    activeQuestion.kind === "mcq"
      ? answers[activeQuestion.id] !== undefined
      : (answers[activeQuestion.id] ?? "").trim().length >= 20;

const CATEGORY_META: {
  key: "metrics" | "product" | "scenario";
  label: string;
  weight: string;
  description: string;
}[] = [
  {
    key: "metrics",
    label: "Metrics & Data",
    weight: "70%",
    description: "Right metric, cohort logic, experiment rigor, quantified impact",
  },
  {
    key: "product",
    label: "Product Problem",
    weight: "20%",
    description: "Problem definition, discovery, and solving",
  },
  {
    key: "scenario",
    label: "Scenario",
    weight: "10%",
    description: "Real-world stakeholder and judgment calls",
  },
];

const renderResult = (r: ProductAgentResult) => {
    const dimensions = PRODUCT_DIMENSIONS.filter(
      (d) => typeof r.dimensionScores?.[d.key] === "number"
    );
    const descriptive = PRODUCT_QUESTIONS.filter(
      (q) => q.kind === "descriptive" && r.answerFeedback?.[q.id]
    );
    return (
      <div className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6">
          <div className="flex items-center gap-4">
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-600/20">
              <Sparkles className="h-6 w-6 text-violet-300" />
            </span>
            <div>
              <p className="text-sm font-semibold text-zinc-100">
                Product Mentor assessment
              </p>
              <p className="mt-1 text-xs text-zinc-500">
                {r.graded
                  ? "6 multiple-choice · 4 written answers evaluated by your Product Mentor"
                  : "Your multiple-choice score is saved — written evaluation was unavailable."}
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className={`text-4xl font-bold ${scoreColor(r.overallScore)}`}>
              {r.overallScore}
              <span className="text-lg text-zinc-500">/100</span>
            </p>
            <p className="mt-1 text-xs font-medium text-zinc-400">
              {scoreLabel(r.overallScore)}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-5">
            <p className="text-xs font-medium text-zinc-500">
              Multiple-choice score
            </p>
            <p className="mt-2 text-2xl font-bold text-indigo-300">
              {r.mcqScore}/100
            </p>
            <p className="mt-1 text-xs text-zinc-500">
              Real-life scenarios, metrics, and trade-offs.
            </p>
          </div>
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-5">
            <p className="text-xs font-medium text-zinc-500">
              Written answer score
            </p>
            <p className="mt-2 text-2xl font-bold text-violet-300">
              {r.descriptiveScore === null ? "—" : `${r.descriptiveScore}/100`}
            </p>
            <p className="mt-1 text-xs text-zinc-500">
              Evaluated by the Product Mentor on six PM dimensions.
            </p>
          </div>
        </div>

        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
            <h3 className="text-sm font-semibold text-zinc-100">
              Metrics-first score breakdown
            </h3>
            <span className="rounded-full border border-zinc-700 px-2.5 py-0.5 text-[11px] font-medium text-zinc-400">
              70 / 20 / 10 weighting
            </span>
          </div>
          <div className="space-y-4">
            {CATEGORY_META.map((c) => {
              const score = r.categoryScores?.[c.key] ?? 0;
              return (
                <div key={c.key}>
                  <div className="mb-1.5 flex items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-medium text-zinc-200">
                        {c.label}
                        <span className="ml-2 rounded-full bg-zinc-800 px-2 py-0.5 text-[11px] text-zinc-400">
                          {c.weight}
                        </span>
                      </p>
                      <p className="text-xs text-zinc-500">{c.description}</p>
                    </div>
                    <span className={`text-sm font-bold ${scoreColor(score)}`}>
                      {score}/100
                    </span>
                  </div>
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-zinc-800">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-violet-500 to-indigo-500"
                      style={{ width: `${score}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {r.summary && (
          <div className="rounded-2xl border border-violet-500/30 bg-violet-500/5 p-6">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-violet-300" />
              <p className="text-sm font-semibold text-violet-200">
                Your Product Mentor says
              </p>
            </div>
            <p className="mt-2 text-sm leading-relaxed text-zinc-300">
              {r.summary}
            </p>
          </div>
        )}

        {dimensions.length > 0 && (
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6">
            <h3 className="text-sm font-semibold text-zinc-100">
              Product dimensions
            </h3>
            <div className="mt-4 space-y-4">
              {dimensions.map((d) => {
                const score = r.dimensionScores[d.key] ?? 0;
                return (
                  <div key={d.key}>
                    <div className="mb-1.5 flex items-center justify-between gap-3">
                      <div>
                        <p className="text-sm font-medium text-zinc-200">
                          {d.label}
                        </p>
                        <p className="text-xs text-zinc-500">{d.description}</p>
                      </div>
                      <span
                        className={`text-sm font-bold ${scoreColor(score)}`}
                      >
                        {score}/100
                      </span>
                    </div>
                    <div className="h-1.5 w-full overflow-hidden rounded-full bg-zinc-800">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-violet-500 to-indigo-500"
                        style={{ width: `${score}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {descriptive.length > 0 && (
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-zinc-100">
              Written answer feedback
            </h3>
            {descriptive.map((q) => {
              const fb = r.answerFeedback[q.id];
              return (
                <div
                  key={q.id}
                  className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6"
                >
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <p className="text-sm font-medium text-zinc-200">
                      {q.question}
                    </p>
                    <span
                      className={`text-sm font-bold ${scoreColor(fb.score)}`}
                    >
                      {fb.score}/100
                    </span>
                  </div>
                  {fb.feedback && (
                    <p className="mt-3 text-sm leading-relaxed text-zinc-400">
                      {fb.feedback}
                    </p>
                  )}
                  {fb.strengths.length > 0 && (
                    <div className="mt-3 space-y-1">
                      {fb.strengths.map((s, i) => (
                        <p
                          key={i}
                          className="flex items-start gap-2 text-xs text-emerald-300"
                        >
                          <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                          {s}
                        </p>
                      ))}
                    </div>
                  )}
                  {fb.gaps.length > 0 && (
                    <div className="mt-2 space-y-1">
                      {fb.gaps.map((g, i) => (
                        <p
                          key={i}
                          className="flex items-start gap-2 text-xs text-amber-300"
                        >
                          <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                          {g}
                        </p>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {r.roadmap.length > 0 && (
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6">
            <h3 className="text-sm font-semibold text-zinc-100">
              Your product understanding roadmap
            </h3>
            <p className="mt-1 text-xs text-zinc-500">
              Personalized by your Product Mentor — ordered by impact.
            </p>
            <div className="mt-4 space-y-3">
              {r.roadmap.map((item, i) => (
                <div
                  key={i}
                  className="flex items-start gap-3 rounded-xl border border-zinc-800 bg-zinc-950/50 p-4"
                >
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-violet-600/20 text-xs font-bold text-violet-300">
                    {i + 1}
                  </span>
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="text-sm font-semibold text-zinc-100">
                        {item.topic}
                      </p>
                      {item.duration && (
                        <span className="rounded-full border border-zinc-700 px-2 py-0.5 text-[11px] text-zinc-400">
                          {item.duration}
                        </span>
                      )}
                    </div>
                    <p className="mt-1 text-xs text-zinc-500">{item.why}</p>
                    <p className="mt-1 text-xs text-zinc-400">
                      <span className="font-medium text-zinc-300">Try:</span>{" "}
                      {item.exercise}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <button
          type="button"
          onClick={() => {
            setLocalView("intro");
            setAnswers({});
            setQIndex(0);
          }}
          className="inline-flex items-center gap-2 rounded-xl border border-zinc-700 px-4 py-2.5 text-sm font-medium text-zinc-300 transition hover:border-zinc-500 hover:text-zinc-100"
        >
          <RotateCcw className="h-4 w-4" /> Retake assessment
        </button>
      </div>
    );
  };

  if (showing) {
    return renderResult(showing);
  }

  if (view === "quiz") {
    return (
      <form action={formAction} className="space-y-6">
        {pending ? (
          <div className="rounded-2xl border border-violet-500/30 bg-violet-500/5 p-6">
            <div className="flex items-center gap-3">
              <span className="relative flex h-3 w-3">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-violet-400 opacity-75" />
                <span className="relative inline-flex h-3 w-3 rounded-full bg-violet-500" />
              </span>
              <p className="text-sm font-medium text-violet-200">
                Your Product Mentor is evaluating your answers…
              </p>
            </div>
            <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-zinc-800">
              <div className="h-full w-1/3 animate-progress rounded-full bg-gradient-to-r from-violet-500 to-indigo-500" />
            </div>
            <div className="mt-4 space-y-2">
              <div className="h-3 w-11/12 animate-pulse rounded-full bg-zinc-800" />
              <div className="h-3 w-4/6 animate-pulse rounded-full bg-zinc-800" />
              <div className="h-3 w-3/4 animate-pulse rounded-full bg-zinc-800" />
            </div>
          </div>
        ) : (
          <>
            <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-600/20">
                    <Sparkles className="h-5 w-5 text-violet-300" />
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-zinc-100">
                      Product Mentor Agent
                    </p>
                    <p className="text-xs text-zinc-500">
                      10 questions · {answeredCount}/{total} answered
                    </p>
                  </div>
                </div>
                <span className="text-sm font-semibold text-violet-300">
                  {progress}%
                </span>
              </div>
              <div className="mt-4 h-1.5 w-full overflow-hidden rounded-full bg-zinc-800">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-violet-500 to-indigo-500 transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>

            <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6">
              <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      if (qIndex === 0) {
                        setLocalView("intro");
                        setAnswers({});
                      } else {
                        setQIndex((i) => i - 1);
                      }
                    }}
                    className="flex items-center gap-1.5 rounded-lg border border-zinc-700 px-2.5 py-1.5 text-xs font-medium text-zinc-400 transition hover:border-zinc-500 hover:text-zinc-100"
                  >
                    <ArrowLeft className="h-3.5 w-3.5" />
                    {qIndex === 0 ? "Start" : "Back"}
                  </button>
                  <span
                    className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${difficultyStyle(activeQuestion.difficulty)}`}
                  >
                    {PRODUCT_DIFFICULTY_LABEL[activeQuestion.difficulty]}
                  </span>
                  <span className="inline-flex items-center rounded-full border border-violet-500/30 bg-violet-500/10 px-2.5 py-0.5 text-xs font-medium text-violet-300">
                    {
                      PRODUCT_DIMENSIONS.find(
                        (d) => d.key === activeQuestion.dimension
                      )?.label
                    }
                  </span>
                </div>
                <span className="text-xs font-medium text-zinc-500">
                  Question {qIndex + 1} of {total}
                </span>
              </div>

              {activeQuestion.scenario && (
                <div className="mb-4 rounded-xl border border-zinc-800 bg-zinc-950/60 p-4 text-sm text-zinc-300">
                  {activeQuestion.scenario}
                </div>
              )}

              <p className="text-base font-medium text-zinc-100">
                {activeQuestion.question}
              </p>

              {activeQuestion.kind === "mcq" ? (
                <div className="mt-4 space-y-2">
                  {activeQuestion.options.map((opt, oi) => {
                    const selected = answers[activeQuestion.id] === String(oi);
                    return (
                      <label
                        key={oi}
                        className={`flex cursor-pointer items-start gap-3 rounded-xl border px-4 py-3 text-sm transition ${
                          selected
                            ? "border-violet-500/60 bg-violet-500/10 text-zinc-100"
                            : "border-zinc-800 bg-zinc-950/50 text-zinc-400 hover:border-zinc-600 hover:text-zinc-200"
                        }`}
                      >
                        <input
                          type="radio"
                          name={activeQuestion.id}
                          value={oi}
                          checked={selected}
                          onChange={() =>
                            setAnswers((prev) => ({
                              ...prev,
                              [activeQuestion.id]: String(oi),
                            }))
                          }
                          className="mt-0.5 h-4 w-4 shrink-0 accent-violet-500"
                        />
                        <span>{opt}</span>
                      </label>
                    );
                  })}
                </div>
              ) : (
                <textarea
                  name={activeQuestion.id}
                  value={answers[activeQuestion.id] ?? ""}
                  onChange={(e) =>
                    setAnswers((prev) => ({
                      ...prev,
                      [activeQuestion.id]: e.target.value,
                    }))
                  }
                  rows={6}
                  placeholder="Write your answer as if your Product Mentor is watching — be specific about metrics, trade-offs, and reasoning…"
                  className="mt-4 w-full resize-y rounded-xl border border-zinc-800 bg-zinc-950/60 px-4 py-3 text-sm text-zinc-200 placeholder:text-zinc-600 focus:border-violet-500/60 focus:outline-none"
                />
              )}

              <div className="mt-6 flex items-center justify-between gap-3">
                <p className="text-xs text-zinc-600">
                  {activeQuestion.kind === "descriptive"
                    ? "Minimum 20 characters for your written answer."
                    : "Choose the single best answer."}
                </p>
                <div className="flex items-center gap-3">
                  {isLast && (
                    <button
                      type="submit"
                      disabled={pending || !currentAnswered}
                      className="inline-flex items-center gap-2 rounded-xl bg-violet-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-violet-600/25 transition hover:bg-violet-500 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {pending ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Evaluating…
                        </>
                      ) : (
                        <>
                          Submit assessment <CheckCircle2 className="h-4 w-4" />
                        </>
                      )}
                    </button>
                  )}
                  {!isLast && (
                    <button
                      type="button"
                      disabled={!currentAnswered}
                      onClick={() => setQIndex((i) => i + 1)}
                      className="inline-flex items-center gap-2 rounded-xl bg-violet-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-violet-600/25 transition hover:bg-violet-500 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      Next <ArrowRight className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          </>
        )}

        {state.status === "error" && (
          <div className="flex items-start gap-3 rounded-xl border border-rose-500/40 bg-rose-500/10 p-4 text-sm text-rose-300">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
            <p>{state.message}</p>
          </div>
        )}

        {state.status === "success" && !state.result?.graded && (
          <div className="flex items-start gap-3 rounded-xl border border-amber-500/40 bg-amber-500/10 p-4 text-sm text-amber-300">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
            <p>{state.message}</p>
          </div>
        )}

        {Object.entries(answers).map(([id, value]) => (
          <input key={id} type="hidden" name={id} value={value} />
        ))}
      </form>
    );
  }

  return (
    <div className="space-y-6">
      {initial && (
        <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-violet-500/30 bg-violet-500/5 p-5">
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-violet-600/20">
              <Sparkles className="h-5 w-5 text-violet-300" />
            </span>
            <div>
              <p className="text-sm font-semibold text-zinc-100">
                You scored {initial.overallScore}/100 ·{" "}
                {scoreLabel(initial.overallScore)}
              </p>
              <p className="text-xs text-zinc-500">
                Your latest Product Mentor assessment.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setLocalView("result")}
            className="rounded-xl border border-zinc-700 px-4 py-2 text-sm font-medium text-zinc-200 transition hover:border-zinc-500"
          >
            View result
          </button>
        </div>
      )}

      <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-8">
        <div className="mx-auto max-w-2xl text-center">
          <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-violet-600/20">
            <Sparkles className="h-7 w-7 text-violet-300" />
          </span>
          <h2 className="mt-4 text-2xl font-bold text-zinc-100">
            Product Mentor Agent
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-zinc-400">
            Ten real-life product questions — six multiple-choice on scenarios,
            metrics, and trade-offs, plus four written answers where you reason
            like a PM. Your Product Mentor, an AI senior PM with 15+ years of
            experience, evaluates your written answers on six dimensions and
            builds a personalized product-understanding roadmap.
          </p>
          <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div className="rounded-xl border border-zinc-800 bg-zinc-950/50 p-4">
              <p className="text-2xl font-bold text-violet-300">10</p>
              <p className="mt-1 text-xs text-zinc-500">real-life questions</p>
            </div>
            <div className="rounded-xl border border-zinc-800 bg-zinc-950/50 p-4">
              <p className="text-2xl font-bold text-violet-300">6</p>
              <p className="mt-1 text-xs text-zinc-500">PM dimensions scored</p>
            </div>
            <div className="rounded-xl border border-zinc-800 bg-zinc-950/50 p-4">
              <p className="text-2xl font-bold text-violet-300">~15 min</p>
              <p className="mt-1 text-xs text-zinc-500">to complete</p>
            </div>
          </div>
          <button
            type="button"
            onClick={startQuiz}
            className="mt-8 inline-flex items-center gap-2 rounded-xl bg-violet-600 px-8 py-3.5 text-sm font-semibold text-white shadow-lg shadow-violet-600/25 transition hover:bg-violet-500"
          >
            <ClipboardList className="h-4 w-4" />
            {initial ? "Retake assessment" : "Start assessment"}
          </button>
        </div>
      </div>
    </div>
  );
}
