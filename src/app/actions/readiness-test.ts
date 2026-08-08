"use server";

import { createClient } from "@/lib/supabase/server";
import {
  READINESS_QUESTIONS,
  deriveStand,
  scoreReadinessAnswers,
  type ReadinessAnswers,
  type TpmStand,
} from "@/lib/readiness-test";

export type ReadinessTestState = {
  status: "idle" | "success" | "error";
  message?: string;
  result?: TpmStand & { completedAt: string };
};

export async function submitReadinessTest(
  _prev: ReadinessTestState,
  formData: FormData
): Promise<ReadinessTestState> {
  if (
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  ) {
    return {
      status: "error",
      message: "The readiness test isn't configured yet.",
    };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { status: "error", message: "Please sign in first." };
  }

  const answers: ReadinessAnswers = {};
  for (const q of READINESS_QUESTIONS) {
    const value = formData.get(q.id);
    const index = typeof value === "string" && value !== "" ? Number(value) : -1;
    if (Number.isInteger(index) && index >= 0 && q.options[index]) {
      answers[q.id] = index;
    }
  }

  if (Object.keys(answers).length < READINESS_QUESTIONS.length) {
    return {
      status: "error",
      message: `Please answer all ${READINESS_QUESTIONS.length} questions (${Object.keys(answers).length}/${READINESS_QUESTIONS.length} answered so far).`,
    };
  }

  const aspects = scoreReadinessAnswers(answers);
  const stand = deriveStand(aspects);

  const { error } = await supabase.from("readiness_tests").insert({
    user_id: user.id,
    answers,
    aspect_scores: aspects,
    overall_score: stand.overall,
    stand_label: stand.label,
  });

  if (error) {
    console.error("[readiness-test] insert failed:", error);
    return {
      status: "error",
      message: "Could not save your test. Please try again in a moment.",
    };
  }

  return {
    status: "success",
    message: "Your TPM stand is ready.",
    result: { ...stand, completedAt: new Date().toISOString() },
  };
}
