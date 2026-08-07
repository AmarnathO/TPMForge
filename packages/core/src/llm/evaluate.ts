import type { DimensionScores, Rubric } from "../types";
import { DIMENSIONS } from "../types";
import { clampScore, normalizeScores } from "../scoring";
import { OpenRouterClient, OpenRouterError } from "./openrouter";

export interface EvaluationResult {
  scores: DimensionScores;
  model: string;
  tokensUsed: number;
  raw: string;
}

const JSON_EXTRACT = /```(?:json)?\s*([\s\S]*?)```|(\{[\s\S]*\})/;

export function parseJsonContent(content: string): Record<string, unknown> | null {
  const match = content.match(JSON_EXTRACT);
  const candidate = match?.[1] ?? match?.[2] ?? content;
  try {
    const parsed = JSON.parse(candidate);
    return typeof parsed === "object" && parsed !== null
      ? (parsed as Record<string, unknown>)
      : null;
  } catch {
    return null;
  }
}

function rubricSystemPrompt(rubric: Rubric): string {
  const levels = rubric.levels
    .slice()
    .sort((a, b) => a.score - b.score)
    .map(
      (l) =>
        `- ${l.score}/100: ${l.descriptor}${
          l.examples.length > 0 ? ` (examples: ${l.examples.join("; ")})` : ""
        }`
    )
    .join("\n");

  return [
    "You are an expert TPM evaluator. Score a candidate's answer against the rubric for a single dimension.",
    "",
    `Dimension: ${rubric.dimension}`,
    "",
    "Rubric levels:",
    levels,
    "",
    `Respond with ONLY JSON, no markdown, matching this exact shape:`,
    `{"${rubric.dimension}": <integer 0-100>}`,
    "",
    "Anchor the score to the rubric level descriptions above. Never invent evidence.",
  ].join("\n");
}

/**
 * Score a single open-text answer against one rubric dimension using the
 * free OpenRouter `grading` model. Returns a dimension score 0-100.
 */
export async function evaluateAnswer(
  client: OpenRouterClient,
  params: {
    question: string;
    answer: string;
    rubric: Rubric;
    maxTokens?: number;
  }
): Promise<EvaluationResult> {
  const { question, answer, rubric } = params;

  const messages = [
    { role: "system" as const, content: rubricSystemPrompt(rubric) },
    {
      role: "user" as const,
      content: `Question: ${question}\n\nCandidate answer:\n${answer}`,
    },
  ];

  const result = await client.complete({
    modelId: client.modelIdFor("grading"),
    fallback: client.fallbacksFor("grading"),
    messages,
    maxTokens: params.maxTokens ?? 1500,
    temperature: 0.1,
    jsonMode: true,
  });

  return parseEvaluation(result.content, rubric.dimension, result.model, result.tokensUsed);
}

function parseEvaluation(
  content: string,
  dimension: keyof DimensionScores,
  model: string,
  tokensUsed: number
): EvaluationResult {
  const parsed = parseJsonContent(content);
  const value =
    parsed && typeof parsed[dimension] === "number"
      ? clampScore(parsed[dimension] as number)
      : 0;
  return {
    scores: normalizeScores({ [dimension]: value }),
    model,
    tokensUsed,
    raw: content,
  };
}

export interface ResumeMappingResult {
  scores: Partial<Record<string, Partial<DimensionScores>>>;
  model: string;
  tokensUsed: number;
  raw: string;
}

const RESUME_PROMPT = [
  "You are a TPM readiness analyst. Given a resume and a list of competency IDs, map the resume evidence to each competency's six dimensions (knowledge, understanding, application, communication, decision_making, execution), each 0-100.",
  "Anchor to explicit resume evidence. Unknown or unaddressed competencies score 0 for every dimension. Never inflate.",
  "",
  "Respond with ONLY JSON matching this shape:",
  `{"scores": {"<competency_id>": {"knowledge": 0, "understanding": 0, "application": 0, "communication": 0, "decision_making": 0, "execution": 0}}}`,
  "",
  "Include every competency ID supplied. Do not add IDs that were not supplied.",
].join("\n");

/**
 * Map resume text to per-competency dimension scores using the free
 * OpenRouter `resume_mapping` model.
 */
export async function mapResumeToScores(
  client: OpenRouterClient,
  params: {
    resumeText: string;
    competencies: Array<{ id: string; title: string; description: string }>;
    maxTokens?: number;
  }
): Promise<ResumeMappingResult> {
  const competencyList = params.competencies
    .map((c) => `- ${c.id}: ${c.title} — ${c.description}`)
    .join("\n");

  const messages = [
    { role: "system" as const, content: RESUME_PROMPT },
    {
      role: "user" as const,
      content: `Competencies:\n${competencyList}\n\nResume:\n${params.resumeText}`,
    },
  ];

  const result = await client.complete({
    modelId: client.modelIdFor("resume_mapping"),
    fallback: client.fallbacksFor("resume_mapping"),
    messages,
    maxTokens: params.maxTokens ?? 2000,
    temperature: 0.2,
    jsonMode: true,
  });

  const parsed = parseJsonContent(result.content);
  const rawScores =
    parsed && typeof parsed.scores === "object" && parsed.scores !== null
      ? (parsed.scores as Record<string, unknown>)
      : {};

  const scores: ResumeMappingResult["scores"] = {};
  for (const competency of params.competencies) {
    const raw = rawScores[competency.id];
    const dim = (raw ?? {}) as Record<string, unknown>;
    const normalized: Partial<DimensionScores> = {};
    for (const d of DIMENSIONS) {
      if (typeof dim[d] === "number") {
        normalized[d] = clampScore(dim[d] as number);
      }
    }
    scores[competency.id] = normalized;
  }

  return {
    scores,
    model: result.model,
    tokensUsed: result.tokensUsed,
    raw: result.content,
  };
}

export { OpenRouterClient, OpenRouterError };
