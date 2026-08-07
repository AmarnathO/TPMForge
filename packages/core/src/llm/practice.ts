import type { Competency } from "../types";
import { clampScore } from "../scoring";
import { OpenRouterClient } from "./openrouter";
import { parseJsonContent } from "./evaluate";

export interface Scenario {
  scenario: string;
  question: string;
}

export interface ScenarioResult extends Scenario {
  model: string;
  tokensUsed: number;
  raw: string;
}

export interface QuizQuestion {
  question: string;
  options: string[];
  answerIndex: number;
  explanation?: string;
}

export interface QuizResult {
  questions: QuizQuestion[];
  model: string;
  tokensUsed: number;
  raw: string;
}

export interface ScenarioGrading {
  score: number;
  feedback: string;
  strengths: string[];
  gaps: string[];
}

export interface ScenarioGradingResult extends ScenarioGrading {
  model: string;
  tokensUsed: number;
  raw: string;
}

const SCENARIO_PROMPT = [
  "You are a TPM scenario generator. Create a realistic, single-paragraph workplace scenario for the given competency, then pose ONE open-ended question to the learner.",
  "The scenario must feel like real TPM work: cross-team, ambiguous, deadline-driven, with stakeholders. Never reveal the 'right' answer in the scenario.",
  "Respond with ONLY JSON, no markdown, matching this exact shape:",
  `{"scenario": "<2-4 sentence context>", "question": "<one open-ended question>"}`,
].join("\n");

const QUIZ_PROMPT = [
  "You are a TPM question writer. Create multiple-choice questions for the given competency.",
  "Each question must have a single correct answer and 3 plausible distractors. Make questions applied, not trivia.",
  "Respond with ONLY JSON, no markdown, matching this exact shape:",
  `{"questions": [{"question": "<stem>", "options": ["<a>", "<b>", "<c>", "<d>"], "answer_index": 0, "explanation": "<why correct>"}]}`,
  "answer_index is the 0-based index of the correct option. Do not repeat options.",
].join("\n");

const GRADING_PROMPT = [
  "You are a senior TPM evaluator. Grade the learner's answer to the scenario against what a strong TPM would do.",
  "Score 0-100. Be honest and specific. Feedback: 2-4 sentences. Strengths and gaps: 1-3 short bullet points each.",
  "Anchor to the evidence in the answer. Never invent claims the learner didn't make.",
  "Respond with ONLY JSON, no markdown, matching this exact shape:",
  `{"score": 72, "feedback": "<2-4 sentences>", "strengths": ["<bullet>"], "gaps": ["<bullet>"]}`,
].join("\n");

function competencyBlock(competency: Competency): string {
  return [
    `Competency: ${competency.title} (${competency.id})`,
    `Description: ${competency.description}`,
    `Difficulty: ${competency.difficulty} · Level ${competency.level}`,
    `Prerequisites: ${competency.prerequisites.length > 0 ? competency.prerequisites.join(", ") : "none"}`,
  ].join("\n");
}

export async function generateScenario(
  client: OpenRouterClient,
  params: { competency: Competency; maxTokens?: number }
): Promise<ScenarioResult> {
  const messages = [
    { role: "system" as const, content: SCENARIO_PROMPT },
    { role: "user" as const, content: competencyBlock(params.competency) },
  ];
  const result = await client.complete({
    modelId: client.modelIdFor("content_generation"),
    fallback: client.fallbacksFor("content_generation"),
    messages,
    maxTokens: params.maxTokens ?? 900,
    temperature: 0.8,
    jsonMode: true,
  });

  const parsed = parseJsonContent(result.content);
  const scenario = String(parsed?.scenario ?? "").trim();
  const question = String(parsed?.question ?? "").trim();

  if (!scenario || !question) {
    throw new Error("Scenario generation returned incomplete content.");
  }

  return {
    scenario,
    question,
    model: result.model,
    tokensUsed: result.tokensUsed,
    raw: result.content,
  };
}

export async function generateQuiz(
  client: OpenRouterClient,
  params: { competency: Competency; count?: number; maxTokens?: number }
): Promise<QuizResult> {
  const count = params.count ?? 5;
  const messages = [
    { role: "system" as const, content: QUIZ_PROMPT },
    {
      role: "user" as const,
      content: `${competencyBlock(params.competency)}\n\nGenerate exactly ${count} questions.`,
    },
  ];
  const result = await client.complete({
    modelId: client.modelIdFor("content_generation"),
    fallback: client.fallbacksFor("content_generation"),
    messages,
    maxTokens: params.maxTokens ?? 2000,
    temperature: 0.7,
    jsonMode: true,
  });

  const parsed = parseJsonContent(result.content);
  const rawQuestions = Array.isArray(parsed?.questions) ? parsed.questions : [];

  const questions: QuizQuestion[] = [];
  for (const raw of rawQuestions.slice(0, count)) {
    const q = (raw ?? {}) as Record<string, unknown>;
    const options = Array.isArray(q.options)
      ? q.options.filter((o): o is string => typeof o === "string" && o.trim().length > 0)
      : [];
    if (typeof q.question !== "string" || options.length < 2) continue;
    const answerIndex =
      typeof q.answer_index === "number" && q.answer_index >= 0 && q.answer_index < options.length
        ? q.answer_index
        : 0;
    questions.push({
      question: q.question,
      options,
      answerIndex,
      explanation: typeof q.explanation === "string" ? q.explanation : undefined,
    });
  }

  if (questions.length === 0) {
    throw new Error("Quiz generation returned no valid questions.");
  }

  return {
    questions,
    model: result.model,
    tokensUsed: result.tokensUsed,
    raw: result.content,
  };
}

export async function gradeScenarioAnswer(
  client: OpenRouterClient,
  params: {
    competency: Competency;
    scenario: string;
    question: string;
    answer: string;
    maxTokens?: number;
  }
): Promise<ScenarioGradingResult> {
  const messages = [
    { role: "system" as const, content: GRADING_PROMPT },
    {
      role: "user" as const,
      content: [
        competencyBlock(params.competency),
        "",
        `Scenario:\n${params.scenario}`,
        "",
        `Question:\n${params.question}`,
        "",
        `Learner's answer:\n${params.answer}`,
      ].join("\n"),
    },
  ];

  const result = await client.complete({
    modelId: client.modelIdFor("grading"),
    fallback: client.fallbacksFor("grading"),
    messages,
    maxTokens: params.maxTokens ?? 900,
    temperature: 0.2,
    jsonMode: true,
  });

  const parsed = parseJsonContent(result.content);
  const score = clampScore(
    parsed && typeof parsed.score === "number" ? (parsed.score as number) : 0
  );
  const strengths = Array.isArray(parsed?.strengths)
    ? parsed.strengths.filter((s): s is string => typeof s === "string")
    : [];
  const gaps = Array.isArray(parsed?.gaps)
    ? parsed.gaps.filter((g): g is string => typeof g === "string")
    : [];

  return {
    score,
    feedback: typeof parsed?.feedback === "string" ? parsed.feedback : "",
    strengths,
    gaps,
    model: result.model,
    tokensUsed: result.tokensUsed,
    raw: result.content,
  };
}
