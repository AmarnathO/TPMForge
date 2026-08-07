"use client";

import { useActionState } from "react";
import { Mail, CheckCircle2, ArrowRight } from "lucide-react";
import { joinWaitlist, type WaitlistState } from "@/app/actions/waitlist";

const initialState: WaitlistState = { status: "idle" };

export function WaitlistForm() {
  const [state, formAction, pending] = useActionState(
    joinWaitlist,
    initialState
  );

  return (
    <div className="w-full max-w-lg">
      <form
        action={formAction}
        className="relative flex flex-col gap-3 rounded-2xl border border-zinc-700/60 bg-zinc-900/70 p-2 shadow-2xl shadow-indigo-950/30 backdrop-blur sm:flex-row sm:items-center sm:rounded-full sm:border-zinc-700/60 sm:bg-zinc-900/60"
      >
        <div className="relative flex-1">
          <Mail className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
          <input
            type="email"
            name="email"
            placeholder="you@company.com"
            autoComplete="email"
            required
            className="w-full rounded-full border-0 bg-transparent py-3 pl-11 pr-4 text-sm text-zinc-100 placeholder:text-zinc-500 focus:outline-none"
          />
        </div>
        <button
          type="submit"
          disabled={pending}
          className="relative overflow-hidden rounded-full bg-gradient-to-r from-indigo-600 via-violet-600 to-indigo-600 px-7 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-600/30 transition hover:brightness-110 btn-shimmer disabled:cursor-not-allowed disabled:opacity-60 sm:shrink-0"
        >
          <span className="relative z-10 inline-flex items-center gap-2">
            {pending ? (
              "Joining..."
            ) : (
              <>
                Get early access <ArrowRight className="h-4 w-4" />
              </>
            )}
          </span>
        </button>
      </form>

      {state.status === "success" && (
        <p
          className="mt-4 flex items-center justify-center gap-2 text-sm font-medium text-emerald-400"
          role="status"
        >
          <CheckCircle2 className="h-4 w-4" /> {state.message}
        </p>
      )}
      {state.status === "error" && (
        <p
          className="mt-4 text-center text-sm font-medium text-rose-400"
          role="alert"
        >
          {state.message}
        </p>
      )}

      <div className="mt-5 flex items-center justify-center gap-6 text-xs text-zinc-500">
        <span className="flex items-center gap-1.5">
          <CheckCircle2 className="h-3.5 w-3.5 text-indigo-400" />
          Free forever
        </span>
        <span className="flex items-center gap-1.5">
          <CheckCircle2 className="h-3.5 w-3.5 text-indigo-400" />
          No spam
        </span>
        <span className="flex items-center gap-1.5">
          <CheckCircle2 className="h-3.5 w-3.5 text-indigo-400" />
          ₹999/mo founding price
        </span>
      </div>
    </div>
  );
}
