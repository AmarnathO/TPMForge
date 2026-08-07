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
  error?: string;
  model?: string;
};

const MAX_MESSAGE_LENGTH = 2000;
const HISTORY_LIMIT = 8;

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
      error: "Please sign in first.",
    };
  }

  const rawMessage = String(formData.get("message") ?? "").trim();
  if (formData.get("intent") === "reset") {
    return { status: "idle", messages: [] };
  }
  if (!rawMessage) {
    return { status: "error", messages: prev.messages, error: "Type a message first." };
  }
  const message = rawMessage.slice(0, MAX_MESSAGE_LENGTH);

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
    return {
      status: "error",
      messages: [...prev.messages, { role: "user", content: message }],
      error:
        "The AI coach is temporarily unavailable (free models can throttle). Try again in a minute.",
    };
  }

  return {
    status: "success",
    messages: [
      ...prev.messages,
      { role: "user", content: message },
      { role: "assistant", content: reply },
    ],
    model,
  };
}
