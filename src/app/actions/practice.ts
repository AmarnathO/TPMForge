"use server";

import { createClient } from "@/lib/supabase/server";
import {
  OpenRouterClient,
  generateQuiz,
  generateScenario,
  getEnv,
  gradeScenarioAnswer,
  seedGraph,
  type QuizQuestion,
} from "@tpmforge/core";

export type PracticeState = {
  status: "idle" | "ready" | "complete" | "error";
  mode: "scenario" | "quiz";
  competencyId: string;
  competencyTitle: string;
  scenario?: string;
  question?: string;
  quiz?: QuizQuestion[];
  score?: number;
  feedback?: string;
  strengths?: string[];
  gaps?: string[];
  correctCount?: number;
  totalCount?: number;
  error?: string;
  model?: string;
};

const initialState: PracticeState = {
  status: "idle",
  mode: "scenario",
  competencyId: "",
  competencyTitle: "",
};

function competencyById(id: string) {
  return seedGraph.competencies[id] ?? null;
}

export async function practice(
  prev: PracticeState,
  formData: FormData
): Promise<PracticeState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { ...prev, status: "error", error: "Please sign in first." };
  }

  const intent = String(formData.get("intent") ?? "");
  const competencyId = String(formData.get("competency_id") ?? "");

  if (intent === "reset") {
    return initialState;
  }

  const competency = competencyById(competencyId);
  if (!competency) {
    return { ...prev, status: "error", error: "Pick a competency to practice." };
  }

  const client = new OpenRouterClient({ env: getEnv() });
  const base = {
    mode: formData.get("mode") === "quiz" ? ("quiz" as const) : ("scenario" as const),
    competencyId,
    competencyTitle: competency.title,
  };

  if (intent === "start_scenario") {
    try {
      const result = await generateScenario(client, { competency });
      return {
        ...base,
        status: "ready",
        scenario: result.scenario,
        question: result.question,
        model: result.model,
      };
    } catch (err) {
      console.error("[practice] scenario generation failed:", err);
      return {
        ...base,
        status: "error",
        error:
          "Couldn't generate a scenario right now. Free models sometimes throttle — try again in a minute.",
      };
    }
  }

  if (intent === "submit_scenario") {
    const answer = String(formData.get("answer") ?? "").trim();
    if (!answer) {
      return { ...prev, status: "error", error: "Write your answer before submitting." };
    }
    try {
      const result = await gradeScenarioAnswer(client, {
        competency,
        scenario: prev.scenario ?? "",
        question: prev.question ?? "",
        answer,
      });

      const { error: insertError } = await supabase.from("practice_attempts").insert({
        user_id: user.id,
        competency_id: competencyId,
        kind: "scenario",
        prompt: { scenario: prev.scenario, question: prev.question },
        answer: { answer },
        score: result.score,
        feedback: result.feedback,
        model_used: result.model,
        tokens_used: result.tokensUsed,
      });
      if (insertError) console.error("[practice] insert failed:", insertError);

      return {
        ...base,
        status: "complete",
        scenario: prev.scenario,
        question: prev.question,
        score: result.score,
        feedback: result.feedback,
        strengths: result.strengths,
        gaps: result.gaps,
        model: result.model,
      };
    } catch (err) {
      console.error("[practice] grading failed:", err);
      return {
        ...prev,
        status: "error",
        error:
          "Grading is temporarily unavailable. Free models sometimes throttle — try again in a minute.",
      };
    }
  }

  if (intent === "start_quiz") {
    try {
      const result = await generateQuiz(client, { competency, count: 5 });
      return {
        ...base,
        status: "ready",
        quiz: result.questions,
        model: result.model,
      };
    } catch (err) {
      console.error("[practice] quiz generation failed:", err);
      return {
        ...base,
        status: "error",
        error:
          "Couldn't generate a quiz right now. Free models sometimes throttle — try again in a minute.",
      };
    }
  }

  if (intent === "submit_quiz") {
    const quiz = prev.quiz ?? [];
    if (quiz.length === 0) {
      return { ...prev, status: "error", error: "Generate a quiz first." };
    }
    const answers: (number | null)[] = quiz.map((_, i) => {
      const value = formData.get(`answer-${i}`);
      const parsed = typeof value === "string" ? Number.parseInt(value, 10) : NaN;
      return Number.isInteger(parsed) ? parsed : null;
    });

    const correctCount = quiz.reduce(
      (acc, q, i) => (answers[i] === q.answerIndex ? acc + 1 : acc),
      0
    );
    const score = Math.round((correctCount / quiz.length) * 100);

    const { error: insertError } = await supabase.from("practice_attempts").insert({
      user_id: user.id,
      competency_id: competencyId,
      kind: "quiz",
      prompt: { questions: quiz.map((q) => ({
        question: q.question,
        options: q.options,
        answerIndex: q.answerIndex,
        explanation: q.explanation,
      })) },
      answer: { answers },
      score,
      feedback: `You answered ${correctCount} of ${quiz.length} correctly.`,
      model_used: prev.model,
      tokens_used: 0,
    });
    if (insertError) console.error("[practice] insert failed:", insertError);

    return {
      ...prev,
      status: "complete",
      score,
      correctCount,
      totalCount: quiz.length,
    };
  }

  return {
    ...base,
    status: "error",
    error: "Unknown request.",
  };
}
