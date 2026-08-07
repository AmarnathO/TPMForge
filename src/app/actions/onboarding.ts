"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export type OnboardingState = {
  status: "idle" | "success" | "error";
  message?: string;
};

const onboardingSchema = z.object({
  currentRole: z.string().min(1, { error: "Please select your current role." }),
  targetRole: z.string().min(1, { error: "Please select your target role." }),
  timelineWeeks: z.coerce
    .number()
    .int()
    .min(4, { error: "Timeline should be at least 4 weeks." })
    .max(156, { error: "Timeline should be under 3 years." }),
  weeklyHours: z.coerce
    .number()
    .int()
    .min(1, { error: "At least 1 hour per week." })
    .max(40, { error: "At most 40 hours per week." }),
});

export async function completeOnboarding(
  _prev: OnboardingState,
  formData: FormData
): Promise<OnboardingState> {
  if (
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  ) {
    return {
      status: "error",
      message: "Onboarding isn't configured yet. Add Supabase credentials to .env.local.",
    };
  }

  const parsed = onboardingSchema.safeParse({
    currentRole: formData.get("currentRole"),
    targetRole: formData.get("targetRole"),
    timelineWeeks: formData.get("timelineWeeks"),
    weeklyHours: formData.get("weeklyHours"),
  });

  if (!parsed.success) {
    return {
      status: "error",
      message: parsed.error.issues[0]?.message ?? "Please fill in all fields.",
    };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { status: "error", message: "Please sign in first." };
  }

  const { error } = await supabase
    .from("profiles")
    .update({
      current_role: parsed.data.currentRole,
      target_role: parsed.data.targetRole,
      timeline_weeks: parsed.data.timelineWeeks,
      weekly_hours: parsed.data.weeklyHours,
      onboarding_completed: true,
      onboarding_completed_at: new Date().toISOString(),
    })
    .eq("id", user.id);

  if (error) {
    console.error("[onboarding] update failed:", error);
    return { status: "error", message: "Something went wrong. Please try again." };
  }

  revalidatePath("/", "layout");
  redirect("/dashboard");
}
