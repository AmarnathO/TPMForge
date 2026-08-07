"use client";

import { useActionState } from "react";
import { CheckCircle2, Loader2, Mail } from "lucide-react";
import { newsletterInitialState, subscribeToNewsletter } from "@/app/actions/newsletter";
import { cn } from "@/lib/utils";

export function NewsletterForm() {
  const [state, formAction, pending] = useActionState(
    subscribeToNewsletter,
    newsletterInitialState
  );

  if (state.status === "success") {
    return (
      <div className="flex items-center gap-2 rounded-xl border border-emerald-500/40 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300">
        <CheckCircle2 className="h-4 w-4 shrink-0" />
        {state.message ?? "Subscribed!"}
      </div>
    );
  }

  return (
    <div>
      <form action={formAction} className="flex gap-2">
        <div className="relative flex-1">
          <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
          <input
            type="email"
            name="email"
            required
            placeholder="you@example.com"
            className="w-full rounded-xl border border-zinc-700 bg-zinc-950 py-2.5 pl-10 pr-3 text-sm text-zinc-100 placeholder:text-zinc-600 focus:border-indigo-500 focus:outline-none"
          />
        </div>
        <button
          type="submit"
          disabled={pending}
          className="shrink-0 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-600/25 transition hover:bg-indigo-500 disabled:opacity-60"
        >
          {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Subscribe"}
        </button>
      </form>
      {state.status === "error" && state.message && (
        <p
          className={cn(
            "mt-2 text-xs text-rose-400"
          )}
        >
          {state.message}
        </p>
      )}
    </div>
  );
}
