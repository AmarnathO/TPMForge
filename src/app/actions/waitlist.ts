"use server";

import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

export type WaitlistState = {
  status: "idle" | "success" | "error";
  message?: string;
};

const waitlistSchema = z.object({
  email: z.email({ error: "Please enter a valid email address." }),
});

export async function joinWaitlist(
  _prev: WaitlistState,
  formData: FormData
): Promise<WaitlistState> {
  const parsed = waitlistSchema.safeParse({
    email: formData.get("email"),
  });

  if (!parsed.success) {
    return {
      status: "error",
      message: parsed.error.issues[0]?.message ?? "Please enter a valid email address.",
    };
  }

  if (
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  ) {
    console.warn("[waitlist] Supabase not configured — add credentials to .env.local");
    return {
      status: "error",
      message: "Waitlist storage isn't configured yet. Add your Supabase credentials to .env.local.",
    };
  }

  const supabase = await createClient();

  const { error } = await supabase
    .from("newsletter_subscribers")
    .insert({ email: parsed.data.email, source: "landing" });

  if (error) {
    if (error.code === "23505") {
      return { status: "success", message: "You're already on the list!" };
    }
    console.error("[waitlist] insert failed:", error);
    return { status: "error", message: "Something went wrong. Please try again." };
  }

  return {
    status: "success",
    message: "You're on the list! We'll email you when we launch.",
  };
}
