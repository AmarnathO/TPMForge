import type { SupabaseClient } from "@supabase/supabase-js";

export type SubscriptionRow = {
  id: string;
  plan: "monthly" | "annual";
  amount_paise: number;
  currency: string;
  status: "active" | "cancelled" | "expired";
  razorpay_order_id: string | null;
  razorpay_payment_id: string | null;
  starts_at: string;
  ends_at: string | null;
  created_at: string;
};

export async function getSubscription(
  supabase: SupabaseClient,
  userId: string
): Promise<SubscriptionRow | null> {
  const { data } = await supabase
    .from("subscriptions")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  return (data as SubscriptionRow | null) ?? null;
}

export function isSubscriptionActive(sub: SubscriptionRow | null): boolean {
  if (!sub) return false;
  if (sub.status !== "active") return false;
  if (sub.ends_at && new Date(sub.ends_at).getTime() < Date.now()) return false;
  return true;
}
