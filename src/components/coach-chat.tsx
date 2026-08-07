"use client";

import { useEffect, useRef, useState } from "react";
import { useActionState } from "react";
import {
  Bot,
  Send,
  Loader2,
  AlertTriangle,
  Sparkles,
  RotateCcw,
} from "lucide-react";
import { coachChat, type CoachMessage } from "@/app/actions/coach";
import { cn } from "@/lib/utils";

const SUGGESTIONS = [
  "What should I learn first based on my gaps?",
  "Explain REST API design like I'm new to it",
  "Quiz me on SQL joins",
  "Give me a scenario to practice dependency management",
  "How do I improve my executive communication?",
];

function renderContent(content: string) {
  const parts = content.split(/(\([A-Z0-9]+-[A-Z0-9]+-[A-Z0-9]+\))/g);
  return parts.map((part, i) =>
    /^\([A-Z0-9]+-[A-Z0-9]+-[A-Z0-9]+\)$/.test(part) ? (
      <code
        key={i}
        className="rounded bg-zinc-700/60 px-1 py-0.5 text-[11px] text-indigo-300"
      >
        {part}
      </code>
    ) : (
      <span key={i}>{part}</span>
    )
  );
}

export function CoachChat({
  hasAnalysis,
  initialMessages = [],
  initialConversationId,
}: {
  hasAnalysis: boolean;
  initialMessages?: CoachMessage[];
  initialConversationId?: string;
}) {
  const [state, formAction, pending] = useActionState(coachChat, {
    status: "idle",
    messages: initialMessages,
    conversationId: initialConversationId,
  });
  const [draft, setDraft] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [state.messages.length, pending]);

  const canSend = draft.trim().length > 0 && !pending;

  return (
    <div className="flex flex-col overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900/40">
      <div className="flex items-center gap-3 border-b border-zinc-800 px-5 py-4">
        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600">
          <Bot className="h-5 w-5 text-white" />
        </span>
        <div>
          <p className="text-sm font-semibold text-zinc-100">AI Coach</p>
          <p className="flex items-center gap-1.5 text-xs text-zinc-500">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
            Grounded in the TPM competency graph
          </p>
        </div>
        {state.messages.length > 0 && (
          <form action={formAction} className="ml-auto">
            <input type="hidden" name="intent" value="reset" />
            <button
              type="submit"
              className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-700 px-3 py-1.5 text-xs text-zinc-400 transition hover:border-zinc-500 hover:text-zinc-200"
              title="Start a new conversation"
            >
              <RotateCcw className="h-3.5 w-3.5" /> New chat
            </button>
          </form>
        )}
      </div>

      <div ref={scrollRef} className="flex-1 space-y-5 overflow-y-auto px-5 py-6">
        {state.messages.length === 0 ? (
          <div>
            <div className="mx-auto max-w-md rounded-2xl border border-zinc-800 bg-zinc-950/60 p-6 text-center">
              <Sparkles className="mx-auto h-6 w-6 text-indigo-400" />
              <h3 className="mt-3 text-base font-semibold text-zinc-100">
                Ask your TPM mentor anything
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-zinc-500">
                Explain concepts, quiz yourself, practice scenarios, or plan
                your next step. {hasAnalysis
                  ? "Your answers are personalized to your readiness gaps."
                  : "Upload a resume to personalize answers to your gaps."}
              </p>
            </div>
            <div className="mt-5 flex flex-wrap justify-center gap-2">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setDraft(s)}
                  className="rounded-full border border-zinc-700 bg-zinc-900 px-4 py-2 text-xs text-zinc-300 transition hover:border-indigo-500 hover:text-zinc-100"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        ) : (
          state.messages.map((m, i) => (
            <div
              key={i}
              className={cn(
                "flex",
                m.role === "user" ? "justify-end" : "justify-start"
              )}
            >
              <div
                className={cn(
                  "max-w-[85%] whitespace-pre-wrap rounded-2xl px-4 py-3 text-sm leading-relaxed",
                  m.role === "user"
                    ? "rounded-br-md bg-indigo-600 text-white"
                    : "rounded-bl-md border border-zinc-800 bg-zinc-950/70 text-zinc-200"
                )}
              >
                {renderContent(m.content)}
              </div>
            </div>
          ))
        )}

        {pending && (
          <div className="flex justify-start">
            <div className="flex items-center gap-2 rounded-2xl rounded-bl-md border border-zinc-800 bg-zinc-950/70 px-4 py-3 text-sm text-zinc-400">
              <Loader2 className="h-4 w-4 animate-spin" />
              Coaching…
            </div>
          </div>
        )}

        {state.status === "error" && state.error && (
          <div className="flex items-start gap-3 rounded-xl border border-rose-500/40 bg-rose-500/10 p-4 text-sm text-rose-300">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
            <p>{state.error}</p>
          </div>
        )}
      </div>

      <form
        action={formAction}
        className="border-t border-zinc-800 p-4"
        onSubmit={() => {
          setTimeout(() => setDraft(""), 0);
        }}
      >
        <input type="hidden" name="message" value={draft} />
        <div className="flex items-end gap-3">
          <textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey && canSend) {
                e.preventDefault();
                e.currentTarget.form?.requestSubmit();
              }
            }}
            rows={1}
            placeholder={
              pending
                ? "Coaching…"
                : "Ask about a competency, a scenario, or your next step…"
            }
            disabled={pending}
            className="max-h-40 min-h-[44px] flex-1 resize-none rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-sm text-zinc-100 placeholder:text-zinc-600 focus:border-indigo-500 focus:outline-none disabled:opacity-60"
          />
          <button
            type="submit"
            disabled={!canSend}
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-lg shadow-indigo-600/25 transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-40"
            aria-label="Send message"
          >
            <Send className="h-4 w-4" />
          </button>
        </div>
        <p className="mt-2 text-[11px] text-zinc-600">
          Answers are grounded in the competency graph and adapted to your
          readiness gaps.
        </p>
      </form>
    </div>
  );
}
