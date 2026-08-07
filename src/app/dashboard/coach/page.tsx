import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AppShell } from "@/components/app-shell";
import { CoachChat } from "@/components/coach-chat";
import { getLatestAnalysis } from "@/lib/analysis";

export const metadata: Metadata = {
  title: "AI Coach",
};

export const maxDuration = 60;

export default async function CoachPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const latest = await getLatestAnalysis(supabase, user.id);

  return (
    <AppShell user={{ email: user.email ?? "" }}>
      <div className="mx-auto max-w-4xl px-6 py-10">
        <div className="mb-8">
          <p className="text-sm text-indigo-400">AI Coach</p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-zinc-50">
            Your TPM mentor
          </h1>
          <p className="mt-2 text-sm text-zinc-400">
            Explain concepts, quiz yourself, practice scenarios, or plan your
            next step — grounded in the competency graph.
          </p>
        </div>

        <div className="h-[calc(100vh-18rem)] min-h-[420px]">
          <CoachChat hasAnalysis={Boolean(latest)} />
        </div>
      </div>
    </AppShell>
  );
}
