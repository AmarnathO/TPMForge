"use server";

import { createClient } from "@/lib/supabase/server";

export type NewsletterState = {
  status: "idle" | "success" | "error";
  message?: string;
};

export const newsletterInitialState: NewsletterState = { status: "idle" };

export async function subscribeToNewsletter(
  _prev: NewsletterState,
  formData: FormData
): Promise<NewsletterState> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return {
      status: "error",
      message: "Please enter a valid email address.",
    };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("newsletter_subscribers").insert({
    email,
    source: "site",
  });

  if (error && error.code === "23505") {
    return { status: "success", message: "You're already subscribed — thank you!" };
  }
  if (error) {
    console.error("[newsletter] insert failed:", error);
    return {
      status: "error",
      message: "Something went wrong. Please try again.",
    };
  }

  return {
    status: "success",
    message: "Subscribed! Check your inbox soon.",
  };
}
