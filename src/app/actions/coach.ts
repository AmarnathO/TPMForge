"use server";

import { createClient } from "@/lib/supabase/server";
import {
  OpenRouterClient,
  getEnv,
  getPublishedCompetencies,
  seedGraph,
  type Competency,
} from "@tpmforge/core";
import { getLatestAnalysis } from "@/lib/analysis";

export type CoachMessage = {
  role: "user" | "assistant";
  content: string;
};

export type CoachState = {
  status: "idle" | "success" | "error";
  messages: CoachMessage[];
  conversationId?: string;
  error?: string;
  model?: string;
};

const MAX_MESSAGE_LENGTH = 2000;
const HISTORY_LIMIT = 8;

type CoachDB = Awaited<ReturnType<typeof createClient>>;

async function newConversation(
  supabase: CoachDB,
  userId: string
): Promise<string> {
  const { data, error } = await supabase
    .from("coach_conversations")
    .insert({ user_id: userId, title: "Coach conversation" })
    .select("id")
    .single();
  if (error) throw error;
  return data.id;
}

async function persistMessages(
  supabase: CoachDB,
  conversationId: string,
  messages: CoachMessage[]
): Promise<void> {
  const { error } = await supabase.from("coach_messages").insert(
    messages.map((m) => ({
      conversation_id: conversationId,
      role: m.role,
      content: m.content,
    }))
  );
  if (error) {
    console.error("[coach] persist failed:", error);
  }
  await supabase
    .from("coach_conversations")
    .update({ updated_at: new Date().toISOString() })
    .eq("id", conversationId);
}

function matchCompetencies(
  message: string,
  competencies: Competency[]
): Competency[] {
  const tokens = new Set(
    message
      .toLowerCase()
      .split(/[^a-z0-9]+/)
      .filter((t) => t.length > 3)
  );
  if (tokens.size === 0) return [];

  const scored: { comp: Competency; score: number }[] = [];
  for (const comp of competencies) {
    const haystack = `${comp.title} ${comp.description} ${comp.id} ${comp.difficulty}`.toLowerCase();
    let score = 0;
    for (const token of tokens) {
      if (haystack.includes(token)) score += 1;
    }
    if (score > 0) scored.push({ comp, score });
  }
  return scored
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
    .map((s) => s.comp);
}

function systemPrompt(params: {
  readinessScore: number | null;
  gaps: { id: string; title: string; overall: number }[];
  matched: Competency[];
  catalog: Competency[];
}): string {
  const sections: string[] = [
    "You are the TPMForge AI Coach — a senior Technical Program Manager mentor helping the learner become a world-class TPM.",
    "Ground every answer in the TPM competency graph provided. Never invent facts, frameworks, or evidence.",
    "Reference competencies by their ID in parentheses, e.g. (TECH-API-REST-001). Prefer matched competencies when relevant.",
    "Be concise and practical. Adapt depth to the learner's weakest areas. End with a concrete next step or a short practice prompt when it helps.",
  ];

  if (params.readinessScore !== null) {
    sections.push(
      `The learner's current TPM readiness score is ${params.readinessScore}/100.`
    );
  }
  if (params.gaps.length > 0) {
    sections.push(
      `Their top gaps (competency: score): ${params.gaps
        .slice(0, 5)
        .map((g) => `${g.title} (${g.id}): ${g.overall}/100`)
        .join(", ")}.`
    );
  }

  if (params.matched.length > 0) {
    sections.push(
      `The learner is asking about: ${params.matched
        .map(
          (c) =>
            `${c.title} (${c.id}) — ${c.description}. Difficulty: ${c.difficulty}. Prerequisites: ${
              c.prerequisites.length > 0 ? c.prerequisites.join(", ") : "none"
            }.`
        )
        .join(" ")}`
    );
  }

  sections.push(
    `Competency catalog:\n${params.catalog
      .map(
        (c) =>
          `- ${c.id}: ${c.title} (level ${c.level}, ${c.difficulty}, ~${c.estimatedStudyHours}h) — ${c.description}`
      )
      .join("\n")}`
  );

  return sections.join("\n\n");
}

export async function coachChat(
  prev: CoachState,
  formData: FormData
): Promise<CoachState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return {
      status: "error",
      messages: prev.messages,
      conversationId: prev.conversationId,
      error: "Please sign in first.",
    };
  }

  const rawMessage = String(formData.get("message") ?? "").trim();
  if (formData.get("intent") === "reset") {
    const conversationId = await newConversation(supabase, user.id);
    return { status: "idle", messages: [], conversationId };
  }
  if (!rawMessage) {
    return { status: "error", messages: prev.messages, conversationId: prev.conversationId, error: "Type a message first." };
  }
  const message = rawMessage.slice(0, MAX_MESSAGE_LENGTH);

  let conversationId = prev.conversationId;
  if (!conversationId) {
    conversationId = await newConversation(supabase, user.id);
  }

  const latest = await getLatestAnalysis(supabase, user.id);
  const gapReport = (latest?.gap_report ?? {}) as {
    gaps?: { id: string; title: string; overall: number }[];
  };
  const gaps = gapReport.gaps ?? [];

  const allCompetencies = getPublishedCompetencies(seedGraph);
  const matched = matchCompetencies(message, allCompetencies);

  const history = prev.messages
    .slice(-HISTORY_LIMIT)
    .map((m) => ({ role: m.role as "user" | "assistant", content: m.content }));

  const system = systemPrompt({
    readinessScore: latest?.readiness_score ?? null,
    gaps,
    matched,
    catalog: allCompetencies,
  });

  const messages = [
    { role: "system" as const, content: system },
    ...history,
    { role: "user" as const, content: message },
  ];

  const client = new OpenRouterClient({ env: getEnv() });

  let reply: string;
  let model: string;
  try {
    const result = await client.complete({
      modelId: client.modelIdFor("coach_chat"),
      fallback: client.fallbacksFor("coach_chat"),
      messages,
      maxTokens: 600,
      temperature: 0.4,
    });
    reply = result.content.trim();
    model = result.model;
  } catch (err) {
    console.error("[coach] completion failed:", err);
    if (conversationId && message) {
      await persistMessages(supabase, conversationId, [
        { role: "user", content: message },
      ]);
    }
    return {
      status: "error",
      messages: [...prev.messages, { role: "user", content: message }],
      conversationId,
      error:
        "The AI coach is temporarily unavailable (free models can throttle). Try again in a minute.",
    };
  }

  if (conversationId) {
    await persistMessages(supabase, conversationId, [
      { role: "user", content: message },
      { role: "assistant", content: reply },
    ]);
  }

  return {
    status: "success",
    messages: [
      ...prev.messages,
      { role: "user", content: message },
      { role: "assistant", content: reply },
    ],
    conversationId,
    model,
  };
}
