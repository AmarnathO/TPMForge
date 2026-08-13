import { Lock } from "lucide-react";
import { SubscribeCard } from "@/components/subscribe-card";

export type PaywallHighlight = {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  text: string;
};

export function MembershipPaywall({
  email,
  eyebrow = "Members-only",
  title,
  description,
  highlights,
}: {
  email: string;
  eyebrow?: string;
  title: string;
  description: string;
  highlights: PaywallHighlight[];
}) {
  return (
    <div className="mx-auto max-w-4xl">
      <div className="rounded-3xl border border-indigo-500/30 bg-gradient-to-br from-indigo-950/50 to-zinc-900/70 p-8 sm:p-12">
        <div className="flex items-center gap-2 text-sm font-medium text-indigo-300">
          <Lock className="h-4 w-4" />
          {eyebrow}
        </div>
        <h1 className="mt-3 text-3xl font-bold tracking-tight text-zinc-50">
          {title}
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-zinc-400">
          {description}
        </p>

        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
          {highlights.map((h) => (
            <div
              key={h.title}
              className="rounded-2xl border border-zinc-800 bg-zinc-950/60 p-5"
            >
              <h.icon className="h-5 w-5 text-indigo-400" />
              <p className="mt-3 text-sm font-semibold text-zinc-100">
                {h.title}
              </p>
              <p className="mt-1.5 text-xs leading-relaxed text-zinc-500">
                {h.text}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-10">
          <div className="mb-6">
            <p className="text-sm font-semibold text-zinc-100">
              Choose your membership
            </p>
            <p className="mt-1 text-xs text-zinc-500">
              Unlocks your full reports, roadmap, and 1:1 mentor sessions.
            </p>
          </div>
          <SubscribeCard email={email} />
        </div>
      </div>
    </div>
  );
}
