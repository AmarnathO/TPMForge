import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AppShell } from "@/components/app-shell";
import { CoachChat } from "@/components/coach-chat";
import { getLatestAnalysis } from "@/lib/analysis";
import type { CoachMessage } from "@/app/actions/coach";

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

  const { data: conversation } = await supabase
    .from("coach_conversations")
    .select("id")
    .eq("user_id", user.id)
    .order("updated_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  let initialMessages: CoachMessage[] = [];
  let conversationId: string | undefined;
  if (conversation) {
    conversationId = conversation.id;
    const { data: rows } = await supabase
      .from("coach_messages")
      .select("role, content")
      .eq("conversation_id", conversation.id)
      .order("created_at", { ascending: true })
      .limit(40);
    initialMessages = (rows ?? [])
      .filter(
        (r): r is { role: "user" | "assistant"; content: string } =>
          r.role === "user" || r.role === "assistant"
      )
      .map((r) => ({ role: r.role, content: r.content }));
  }

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
            next step — grounded in the competency graph. Conversations are
            saved, so pick up where you left off.
          </p>
        </div>

        <div className="h-[calc(100vh-18rem)] min-h-[420px]">
          <CoachChat
            hasAnalysis={Boolean(latest)}
            initialMessages={initialMessages}
            initialConversationId={conversationId}
          />
        </div>
      </div>
    </AppShell>
  );
}
