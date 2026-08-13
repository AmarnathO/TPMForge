"use server";

import { createHmac, timingSafeEqual } from "node:crypto";
import { createClient } from "@/lib/supabase/server";

export type Plan = "one-time" | "monthly";

const PLANS: Record<
  Plan,
  { label: string; priceRupees: number; amountPaise: number; periodLabel: string; note: string }
> = {
  "one-time": {
    label: "One-time",
    priceRupees: 2000,
    amountPaise: 200000,
    periodLabel: "one-time payment",
    note: "1 resume analysis · 1 assessment · 1 mock interview scheduled within a week.",
  },
  monthly: {
    label: "Monthly",
    priceRupees: 1600,
    amountPaise: 160000,
    periodLabel: "billed monthly",
    note: "Regular resume analysis & assessments · 2 × 1-hr sessions with your mentor every month.",
  },
};

export type CreateOrderResult =
  | { orderId: string; amount: number; currency: string; keyId: string }
  | { error: string };

export type VerifyResult =
  | { success: true; message: string }
  | { success: false; error: string };

function razorpayConfig() {
  const keyId = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  if (!keyId || !keySecret) {
    return null;
  }
  return { keyId, keySecret };
}

export async function createRazorpayOrder(
  formData: FormData
): Promise<CreateOrderResult> {
  const config = razorpayConfig();
  if (!config) {
    return { error: "Payments aren't configured yet. Please try again later." };
  }

  const plan = String(formData.get("plan") ?? "") as Plan;
  if (!(plan in PLANS)) {
    return { error: "Please pick a valid plan." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { error: "Please sign in first." };
  }

  const planConfig = PLANS[plan];
  const auth = Buffer.from(`${config.keyId}:${config.keySecret}`).toString("base64");
  const receipt = `tpmf_${user.id.slice(0, 8)}_${Date.now()}`;

  let response: Response;
  try {
    response = await fetch("https://api.razorpay.com/v1/orders", {
      method: "POST",
      headers: {
        Authorization: `Basic ${auth}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        amount: planConfig.amountPaise,
        currency: "INR",
        receipt,
        notes: { user_id: user.id },
      }),
    });
  } catch (err) {
    console.error("[billing] order request failed:", err);
    return { error: "Couldn't reach the payment gateway. Try again." };
  }

  if (!response.ok) {
    console.error("[billing] order API error:", response.status, await response.text());
    return { error: "The payment gateway rejected the request. Try again." };
  }

  const data = (await response.json()) as { id: string; amount: number; currency: string };
  return {
    orderId: data.id,
    amount: data.amount,
    currency: data.currency,
    keyId: config.keyId,
  };
}

export async function verifyRazorpayPayment(
  formData: FormData
): Promise<VerifyResult> {
  const config = razorpayConfig();
  if (!config) {
    return { success: false, error: "Payments aren't configured yet." };
  }

  const plan = String(formData.get("plan") ?? "") as Plan;
  const orderId = String(formData.get("order_id") ?? "");
  const paymentId = String(formData.get("payment_id") ?? "");
  const signature = String(formData.get("signature") ?? "");

  if (!(plan in PLANS) || !orderId || !paymentId || !signature) {
    return { success: false, error: "Payment verification failed. Missing details." };
  }

  const expected = createHmac("sha256", config.keySecret)
    .update(`${orderId}|${paymentId}`)
    .digest("hex");
  const received = Buffer.from(signature);
  const expectedBuf = Buffer.from(expected);
  if (received.length !== expectedBuf.length || !timingSafeEqual(received, expectedBuf)) {
    return { success: false, error: "Payment signature verification failed." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { success: false, error: "Please sign in first." };
  }

  const existing = await supabase
    .from("subscriptions")
    .select("id")
    .eq("razorpay_payment_id", paymentId)
    .maybeSingle();
  if (existing.data) {
    return { success: true, message: "You're already subscribed." };
  }

  const planConfig = PLANS[plan];
  const now = new Date();
  const endsAt =
    plan === "monthly"
      ? new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString()
      : null;

  const { error } = await supabase.from("subscriptions").insert({
    user_id: user.id,
    plan,
    amount_paise: planConfig.amountPaise,
    currency: "INR",
    status: "active",
    razorpay_order_id: orderId,
    razorpay_payment_id: paymentId,
    starts_at: now.toISOString(),
    ends_at: endsAt,
  });

  if (error) {
    console.error("[billing] subscription insert failed:", error);
    return { success: false, error: "Payment succeeded but we couldn't save your subscription. Please contact support." };
  }

  return {
    success: true,
    message:
      plan === "one-time"
        ? "Payment successful. Your reports, roadmap, and mock interview are unlocked!"
        : "Payment successful. Your membership and monthly sessions are unlocked!",
  };
}
