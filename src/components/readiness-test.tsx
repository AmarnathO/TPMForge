"use client";

import { useActionState, useState } from "react";
import {
  ClipboardList,
  Loader2,
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";
import {
  submitReadinessTest,
  type ReadinessTestState,
} from "@/app/actions/readiness-test";
import {
  ASPECTS,
  READINESS_QUESTIONS,
  DIFFICULTY_LABEL,
  DIFFICULTY_MIX,
  questionsForAspect,
  scoreAspect,
  type QuestionDifficulty,
  type ReadinessAspect,
} from "@/lib/readiness-test";
import { StandView } from "@/components/stand-view";

const initialState: ReadinessTestState = { status: "idle" };

function difficultyStyle(difficulty: QuestionDifficulty) {
  switch (difficulty) {
    case "basic":
      return "border-emerald-500/30 bg-emerald-500/10 text-emerald-300";
    case "intermediate":
      return "border-amber-500/30 bg-amber-500/10 text-amber-300";
    case "pro":
      return "border-rose-500/30 bg-rose-500/10 text-rose-300";
  }
}

export function ReadinessTest() {
  const [state, formAction, pending] = useActionState(
    submitReadinessTest,
    initialState
  );
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [activeAspect, setActiveAspect] = useState<ReadinessAspect | null>(null);
  const [qIndex, setQIndex] = useState(0);
  const [retake, setRetake] = useState(false);
  const [aspectResult, setAspectResult] = useState<{
    aspect: ReadinessAspect;
    score: number;
  } | null>(null);

  const total = READINESS_QUESTIONS.length;
  const answered = Object.keys(answers).length;
  const progress = Math.round((answered / total) * 100);

  const result =
    state.status === "success" && !retake ? state.result : undefined;

  const resetTest = () => {
    setRetake(true);
    setAnswers({});
    setActiveAspect(null);
    setQIndex(0);
    setAspectResult(null);
  };

  if (result) {
    return (
      <div className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-semibold text-zinc-100">
              Your TPM stand
            </h3>
            <p className="mt-1 text-xs text-zinc-500">
              Based on the 36-question business · technology · product test.
            </p>
          </div>
          <button
            type="button"
            onClick={resetTest}
            className="rounded-lg border border-zinc-700 px-3 py-2 text-xs font-medium text-zinc-300 transition hover:border-zinc-500 hover:text-zinc-100"
          >
            Retake test
          </button>
        </div>
        <StandView stand={result} />
      </div>
    );
  }

  const activeQuestions = activeAspect ? questionsForAspect(activeAspect) : [];
  const activeQuestion = activeQuestions[qIndex]!;
  const answeredInAspect = (aspect: ReadinessAspect) =>
    questionsForAspect(aspect).filter((q) => answers[q.id] !== undefined).length;

  const goToAspect = (aspect: ReadinessAspect) => {
    const qs = questionsForAspect(aspect);
    const firstUnanswered = qs.findIndex((q) => answers[q.id] === undefined);
    setQIndex(firstUnanswered === -1 ? 0 : firstUnanswered);
    setActiveAspect(aspect);
  };

  return (
    <form action={formAction} className="space-y-6">
      <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600/20">
              <ClipboardList className="h-5 w-5 text-indigo-300" />
            </span>
            <div>
              <p className="text-sm font-semibold text-zinc-100">
                TPM readiness test
              </p>
              <p className="text-xs text-zinc-500">
                12 questions each on business, technology, and product — 2 basic,
                4 intermediate, 6 pro.
              </p>
            </div>
          </div>
          <span className="text-sm font-semibold text-indigo-300">
            {answered}/{total}
          </span>
        </div>
        <div className="mt-4 h-1.5 w-full overflow-hidden rounded-full bg-zinc-800">
          <div
            className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-violet-500 transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {activeAspect === null && aspectResult === null ? (
        <>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {ASPECTS.map((aspect) => {
              const count = answeredInAspect(aspect.key);
              const done = count === questionsForAspect(aspect.key).length;
              const sectionScore = done
                ? scoreAspect(aspect.key, answers)
                : null;
              return (
                <button
                  key={aspect.key}
                  type="button"
                  onClick={() => goToAspect(aspect.key)}
                  className="flex flex-col items-start gap-4 rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6 text-left transition hover:border-indigo-500/60 hover:bg-zinc-900"
                >
                  <div className="flex w-full items-start justify-between gap-3">
                    <span
                      className={`flex h-11 w-11 items-center justify-center rounded-xl ${
                        done
                          ? "bg-emerald-500/20"
                          : "bg-indigo-600/20"
                      }`}
                    >
                      {done ? (
                        <CheckCircle2 className="h-6 w-6 text-emerald-400" />
                      ) : (
                        <span className="text-lg font-bold text-indigo-300">
                          {aspect.label.charAt(0)}
                        </span>
                      )}
                    </span>
                    <span className="text-sm font-semibold text-indigo-300">
                      {done && sectionScore !== null
                        ? `${sectionScore}/100`
                        : `${count}/${questionsForAspect(aspect.key).length}`}
                    </span>
                  </div>
                  <div>
                    <h3 className="text-base font-semibold text-zinc-100">
                      {aspect.label}
                    </h3>
                    <p className="mt-1 text-xs text-zinc-500">
                      {aspect.blurb}
                    </p>
                    <p className="mt-2 text-xs text-zinc-600">
                      {DIFFICULTY_MIX.basic} basic · {DIFFICULTY_MIX.intermediate}{" "}
                      intermediate · {DIFFICULTY_MIX.pro} pro
                    </p>
                  </div>
                  <span className="mt-auto inline-flex items-center gap-1.5 rounded-lg border border-zinc-700 px-3 py-1.5 text-xs font-medium text-zinc-300 transition hover:border-zinc-500">
                    {done
                      ? "Review section"
                      : count > 0
                        ? "Continue"
                        : "Start section"}
                    <ArrowRight className="h-3.5 w-3.5" />
                  </span>
                </button>
              );
            })}
          </div>

          {state.status === "error" && (
            <div className="flex items-start gap-3 rounded-xl border border-rose-500/40 bg-rose-500/10 p-4 text-sm text-rose-300">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
              <p>{state.message}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={pending || answered < total}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-indigo-600/25 transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {pending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Scoring your stand…
              </>
            ) : answered < total ? (
              `Answer ${total - answered} more question${total - answered === 1 ? "" : "s"} to see your stand`
            ) : (
              "See my TPM stand"
            )}
          </button>
        </>
      ) : aspectResult !== null ? (
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-sm font-semibold text-zinc-100">
                {ASPECTS.find((a) => a.key === aspectResult.aspect)?.label} pillar
                score
              </p>
              <p className="mt-1 text-xs text-zinc-500">
                From the 12 questions in this section.
              </p>
            </div>
            <p className="text-3xl font-bold text-indigo-300">
              {aspectResult.score}/100
            </p>
          </div>
          <div className="mt-4 h-1.5 w-full overflow-hidden rounded-full bg-zinc-800">
            <div
              className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-violet-500 transition-all duration-500"
              style={{ width: `${aspectResult.score}%` }}
            />
          </div>
          <p className="mt-4 text-sm text-zinc-400">
            {aspectResult.score >= 80
              ? "Strong grasp of this pillar — you can reason fluently in this area."
              : aspectResult.score >= 65
                ? "A solid foundation here — sharpen the edge cases and you'll be fluent."
                : aspectResult.score >= 50
                  ? "You know the fundamentals — practice will make this instinctive."
                  : "This pillar is early-stage — the roadmap below will move it fast."}
          </p>
          <button
            type="button"
            onClick={() => setAspectResult(null)}
            className="mt-5 inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-600/25 transition hover:bg-indigo-500"
          >
            Continue to sections <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      ) : (
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6">
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setActiveAspect(null)}
                className="flex items-center gap-1.5 rounded-lg border border-zinc-700 px-2.5 py-1.5 text-xs font-medium text-zinc-400 transition hover:border-zinc-500 hover:text-zinc-100"
              >
                <ArrowLeft className="h-3.5 w-3.5" /> Sections
              </button>
              <span className="text-sm font-medium text-zinc-300">
                {ASPECTS.find((a) => a.key === activeAspect)?.label}
              </span>
              <span
                className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${difficultyStyle(activeQuestion.difficulty)}`}
              >
                {DIFFICULTY_LABEL[activeQuestion.difficulty]}
              </span>
            </div>
            <span className="text-xs font-medium text-zinc-500">
              Question {qIndex + 1} of {activeQuestions.length}
            </span>
          </div>

          <fieldset>
            <legend className="text-base font-medium text-zinc-100">
              {activeQuestion.prompt}
            </legend>
            <div className="mt-4 space-y-2">
              {activeQuestion.options.map((opt, oi) => {
                const selected = answers[activeQuestion.id] === oi;
                return (
                  <label
                    key={oi}
                    className={`flex cursor-pointer items-start gap-3 rounded-xl border px-4 py-3 text-sm transition ${
                      selected
                        ? "border-indigo-500/60 bg-indigo-500/10 text-zinc-100"
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
                          [activeQuestion.id]: oi,
                        }))
                      }
                      className="mt-0.5 h-4 w-4 shrink-0 accent-indigo-500"
                    />
                    <span>{opt.label}</span>
                  </label>
                );
              })}
            </div>
          </fieldset>

          <div className="mt-6 flex items-center justify-between gap-3">
            <button
              type="button"
              disabled={qIndex === 0}
              onClick={() => setQIndex((i) => i - 1)}
              className="inline-flex items-center gap-2 rounded-xl border border-zinc-700 px-4 py-2.5 text-sm font-medium text-zinc-300 transition hover:border-zinc-500 hover:text-zinc-100 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <ArrowLeft className="h-4 w-4" /> Back
            </button>
            <button
              type="button"
              disabled={answers[activeQuestion.id] === undefined}
              onClick={() => {
                if (qIndex === activeQuestions.length - 1) {
                  const aspect = activeAspect!;
                  const score = scoreAspect(aspect, answers);
                  setActiveAspect(null);
                  setAspectResult({ aspect, score: score ?? 0 });
                } else {
                  setQIndex((i) => i + 1);
                }
              }}
              className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-600/25 transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {qIndex === activeQuestions.length - 1 ? (
                <>
                  Finish section <CheckCircle2 className="h-4 w-4" />
                </>
              ) : (
                <>
                  Next <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {Object.entries(answers).map(([id, value]) => (
        <input key={id} type="hidden" name={id} value={value} />
      ))}
    </form>
  );
}
