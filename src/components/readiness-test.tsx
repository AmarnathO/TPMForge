"use client";

import { useActionState, useState } from "react";
import { ClipboardList, Loader2, AlertTriangle } from "lucide-react";
import {
  submitReadinessTest,
  type ReadinessTestState,
} from "@/app/actions/readiness-test";
import {
  ASPECTS,
  READINESS_QUESTIONS,
} from "@/lib/readiness-test";
import { StandView } from "@/components/stand-view";

const initialState: ReadinessTestState = { status: "idle" };

export function ReadinessTest() {
  const [state, formAction, pending] = useActionState(
    submitReadinessTest,
    initialState
  );
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [retake, setRetake] = useState(false);

  const answered = Object.keys(answers).length;
  const total = READINESS_QUESTIONS.length;
  const progress = Math.round((answered / total) * 100);

  const result =
    state.status === "success" && !retake ? state.result : undefined;

  if (result) {
    return (
      <div className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-semibold text-zinc-100">
              Your TPM stand
            </h3>
            <p className="mt-1 text-xs text-zinc-500">
              Based on the 30-question business · technology · product test.
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              setRetake(true);
              setAnswers({});
            }}
            className="rounded-lg border border-zinc-700 px-3 py-2 text-xs font-medium text-zinc-300 transition hover:border-zinc-500 hover:text-zinc-100"
          >
            Retake test
          </button>
        </div>
        <StandView stand={result} />
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-10">
      <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600/20">
              <ClipboardList className="h-5 w-5 text-indigo-300" />
            </span>
            <div>
              <p className="text-sm font-semibold text-zinc-100">
                30-question TPM readiness test
              </p>
              <p className="text-xs text-zinc-500">
                10 questions each on business, technology, and product.
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

      {ASPECTS.map((aspect) => (
        <section key={aspect.key} className="space-y-4">
          <div>
            <h3 className="text-base font-semibold text-zinc-100">
              {aspect.label}
            </h3>
            <p className="text-xs text-zinc-500">{aspect.blurb}</p>
          </div>
          {READINESS_QUESTIONS.filter((q) => q.aspect === aspect.key).map(
            (q, qi) => (
              <fieldset
                key={q.id}
                className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-5"
              >
                <legend className="float-left text-sm font-medium text-zinc-200">
                  <span className="mr-2 text-xs font-semibold text-indigo-400">
                    Q{qi + 1}
                  </span>
                  {q.prompt}
                </legend>
                <div className="mt-4 space-y-2">
                  {q.options.map((opt, oi) => {
                    const selected = answers[q.id] === oi;
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
                          name={q.id}
                          value={oi}
                          checked={selected}
                          onChange={() =>
                            setAnswers((prev) => ({ ...prev, [q.id]: oi }))
                          }
                          className="mt-0.5 h-4 w-4 shrink-0 accent-indigo-500"
                        />
                        <span>{opt.label}</span>
                      </label>
                    );
                  })}
                </div>
              </fieldset>
            )
          )}
        </section>
      ))}

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
    </form>
  );
}
