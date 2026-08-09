"use server";

import { createClient } from "@/lib/supabase/server";
import {
  OpenRouterClient,
  clampScore,
  getEnv,
} from "@tpmforge/core";
import {
  PRODUCT_QUESTIONS,
  PRODUCT_AGENT_SYSTEM_PROMPT,
  buildProductAgentPrompt,
  productDescriptiveQuestions,
  scoreProductMcq,
  scoreProductByCategory,
  type ProductAgentResult,
  type ProductAnswers,
} from "@/lib/product-agent";
import { parseJsonContent } from "@tpmforge/core";

export type ProductAgentState = {
  status: "idle" | "processing" | "success" | "error";
  message?: string;
  result?: ProductAgentResult;
};

const DIMENSION_KEYS = [
  "discovery",
  "strategy",
  "prioritization",
  "metrics",
  "execution",
  "communication",
] as const;

export async function submitProductAssessment(
  _prev: ProductAgentState,
  formData: FormData
): Promise<ProductAgentState> {
  if (
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  ) {
    return { status: "error", message: "The product agent isn't configured yet." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { status: "error", message: "Please sign in first." };
  }

  const answers: ProductAnswers = {};
  for (const q of PRODUCT_QUESTIONS) {
    const value = formData.get(q.id);
    const text = typeof value === "string" ? value.trim() : "";
    if (q.kind === "mcq") {
      if (text === "" || Number.isNaN(Number(text))) {
        return {
          status: "error",
          message: `Please answer question "${q.question.slice(0, 48)}…" before submitting.`,
        };
      }
      answers[q.id] = text;
    } else if (text.length < 20) {
      return {
        status: "error",
        message: `Please give a real written answer for "${q.question.slice(0, 48)}…" (at least 20 characters).`,
      };
    } else {
      answers[q.id] = text;
    }
  }

  const mcq = scoreProductMcq(answers);
  const descriptive = productDescriptiveQuestions();

  const byCategory = scoreProductByCategory(answers);

  let result: ProductAgentResult = {
    overallScore: mcq.score,
    mcqScore: mcq.score,
    descriptiveScore: null,
    categoryScores: byCategory.categoryScores,
    dimensionScores: {},
    summary: "",
    answerFeedback: {},
    roadmap: [],
    model: "",
    tokensUsed: 0,
    graded: false,
  };

  try {
    const client = new OpenRouterClient({ env: getEnv() });
    const completion = await client.complete({
      modelId: client.modelIdFor("product_agent"),
      fallback: client.fallbacksFor("product_agent"),
      messages: [
        { role: "system", content: PRODUCT_AGENT_SYSTEM_PROMPT },
        { role: "user", content: buildProductAgentPrompt(answers) },
      ],
      maxTokens: 2400,
      temperature: 0.2,
      jsonMode: true,
    });

    const parsed = parseJsonContent(completion.content) ?? {};

    const rawAnswers = Array.isArray(parsed.answers) ? parsed.answers : [];
    const answerFeedback: ProductAgentResult["answerFeedback"] = {};
    for (const raw of rawAnswers) {
      const item = (raw ?? {}) as Record<string, unknown>;
      const id = typeof item.id === "string" ? item.id : "";
      if (!id || typeof item.score !== "number") continue;
      answerFeedback[id] = {
        score: clampScore(item.score),
        feedback: typeof item.feedback === "string" ? item.feedback : "",
        strengths: Array.isArray(item.strengths)
          ? item.strengths.filter((s): s is string => typeof s === "string")
          : [],
        gaps: Array.isArray(item.gaps)
          ? item.gaps.filter((g): g is string => typeof g === "string")
          : [],
      };
    }

    const dimensionScores: Record<string, number> = {};
    const rawDimensions = (parsed.dimensions ?? {}) as Record<string, unknown>;
    for (const key of DIMENSION_KEYS) {
      const value = rawDimensions[key];
      dimensionScores[key] = typeof value === "number" ? clampScore(value) : 0;
    }

    const roadmap = Array.isArray(parsed.roadmap)
      ? parsed.roadmap
          .map((item) => item as Record<string, unknown>)
          .filter(
            (item) =>
              typeof item?.topic === "string" &&
              typeof item?.why === "string" &&
              typeof item?.exercise === "string"
          )
          .map((item) => ({
            topic: String(item.topic),
            why: String(item.why),
            exercise: String(item.exercise),
            duration: typeof item.duration === "string" ? String(item.duration) : "",
          }))
          .slice(0, 7)
      : [];

    const scored = descriptive.filter((q) => typeof answerFeedback[q.id]?.score === "number");
    const descriptiveScore =
      scored.length > 0
        ? Math.round(
            scored.reduce((sum, q) => sum + answerFeedback[q.id].score, 0) /
              scored.length
          )
        : null;

    const descriptiveScores: Record<string, number> = {};
    for (const q of scored) descriptiveScores[q.id] = answerFeedback[q.id].score;

    const category = scoreProductByCategory(answers, descriptiveScores);

    result = {
      overallScore:
        descriptiveScore === null
          ? mcq.score
          : category.overallScore,
      mcqScore: mcq.score,
      descriptiveScore,
      categoryScores: category.categoryScores,
      dimensionScores,
      summary: typeof parsed.summary === "string" ? parsed.summary : "",
      answerFeedback,
      roadmap,
      model: completion.model,
      tokensUsed: completion.tokensUsed,
      graded: true,
    };
  } catch (err) {
    console.error("[product-agent] LLM evaluation failed:", err);
  }

  const insertBase = {
    user_id: user.id,
    answers,
    mcq_score: mcq.score,
    descriptive_score: result.descriptiveScore,
    dimension_scores: result.dimensionScores,
    overall_score: result.overallScore,
    summary: result.summary,
    answer_feedback: result.answerFeedback,
    roadmap: result.roadmap,
    model: result.model,
    tokens_used: result.tokensUsed,
    graded: result.graded,
  };

  let { error } = await supabase
    .from("product_assessments")
    .insert({ ...insertBase, category_scores: result.categoryScores });

  if (error && String(error.message).includes("category_scores")) {
    ({ error } = await supabase
      .from("product_assessments")
      .insert(insertBase));
  }

  if (error) {
    console.error("[product-agent] insert failed:", error);
    return {
      status: "error",
      message: "Could not save your assessment. Please try again in a moment.",
    };
  }

  if (!result.graded) {
    return {
      status: "success",
      message:
        "Your multiple-choice answers were saved, but the AI evaluation is temporarily unavailable. Please retake the assessment to get your full product score.",
      result,
    };
  }

  return {
    status: "success",
    message: "Your Product Mentor assessment is ready.",
    result,
  };
}
