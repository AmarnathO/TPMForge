"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Loader2,
  CheckCircle2,
  AlertTriangle,
  Lock,
  Zap,
  Sparkles,
} from "lucide-react";
import { createRazorpayOrder, verifyRazorpayPayment, type Plan } from "@/app/actions/billing";
import { formatINR } from "@/lib/utils";
import { cn } from "@/lib/utils";

type RazorpayResponse = {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
};

declare global {
  interface Window {
    Razorpay?: new (options: Record<string, unknown>) => {
      open: () => void;
    };
  }
}

const PLANS: { id: Plan; label: string; price: number; note: string; featured?: boolean }[] = [
  {
    id: "monthly",
    label: "Monthly",
    price: 2000,
    note: "₹2,000/mo · flexible, cancel anytime",
  },
  {
    id: "annual",
    label: "Annual",
    price: 19200,
    note: "₹19,200/yr · save 20% (₹1,600/mo)",
    featured: true,
  },
];

function loadRazorpayScript(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (window.Razorpay) return resolve();
    const existing = document.querySelector(
      'script[src="https://checkout.razorpay.com/v1/checkout.js"]'
    );
    if (existing) {
      (existing as HTMLScriptElement).onload = () => resolve();
      return;
    }
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("checkout script failed to load"));
    document.body.appendChild(script);
  });
}

export function SubscribeCard({
  email,
  compact = false,
}: {
  email: string;
  compact?: boolean;
}) {
  const router = useRouter();
  const [busyPlan, setBusyPlan] = useState<Plan | null>(null);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  async function handleSubscribe(plan: Plan) {
    setBusyPlan(plan);
    setStatus("idle");
    setMessage("");
    try {
      const orderForm = new FormData();
      orderForm.set("plan", plan);
      const orderResult = await createRazorpayOrder(orderForm);

      if ("error" in orderResult) {
        setStatus("error");
        setMessage(orderResult.error);
        setBusyPlan(null);
        return;
      }

      await loadRazorpayScript();
      if (!window.Razorpay) {
        setStatus("error");
        setMessage("Payment gateway failed to load. Refresh and try again.");
        setBusyPlan(null);
        return;
      }

      const rzp = new window.Razorpay({
        key: orderResult.keyId,
        amount: orderResult.amount,
        currency: orderResult.currency,
        name: "TPMForge",
        description: `TPMForge ${plan} membership`,
        order_id: orderResult.orderId,
        prefill: { email },
        theme: { color: "#6366f1" },
        handler: async (response: RazorpayResponse) => {
          const verifyForm = new FormData();
          verifyForm.set("plan", plan);
          verifyForm.set("order_id", response.razorpay_order_id);
          verifyForm.set("payment_id", response.razorpay_payment_id);
          verifyForm.set("signature", response.razorpay_signature);
          const result = await verifyRazorpayPayment(verifyForm);
          setBusyPlan(null);
          if (result.success) {
            setStatus("success");
            setMessage(result.message);
            router.refresh();
          } else {
            setStatus("error");
            setMessage(result.error);
          }
        },
        modal: {
          ondismiss: () => setBusyPlan(null),
        },
      });

      rzp.open();
    } catch (err) {
      console.error("[billing] checkout failed:", err);
      setStatus("error");
      setMessage("Couldn't start the checkout. Please try again.");
      setBusyPlan(null);
    }
  }

  return (
    <div className="space-y-5">
      <div
        className={cn(
          "grid gap-4",
          compact ? "sm:grid-cols-2" : "sm:grid-cols-2"
        )}
      >
        {PLANS.map((plan) => (
          <button
            key={plan.id}
            type="button"
            disabled={busyPlan !== null}
            onClick={() => handleSubscribe(plan.id)}
            className={cn(
              "relative rounded-2xl border p-6 text-left transition disabled:cursor-not-allowed disabled:opacity-60",
              plan.featured
                ? "border-indigo-500/60 bg-gradient-to-br from-indigo-950/60 to-zinc-900/70 hover:border-indigo-400"
                : "border-zinc-800 bg-zinc-900/40 hover:border-zinc-600"
            )}
          >
            {plan.featured && (
              <span className="absolute -top-2.5 left-6 inline-flex items-center gap-1 rounded-full bg-indigo-600 px-2.5 py-0.5 text-[11px] font-semibold text-white">
                <Zap className="h-3 w-3" /> Best value
              </span>
            )}
            <p className="text-sm font-semibold text-zinc-100">{plan.label}</p>
            <p className="mt-2 text-3xl font-bold text-zinc-50">
              {formatINR(plan.price)}
            </p>
            <p className="mt-1 text-xs text-zinc-500">{plan.note}</p>
            <span
              className={cn(
                "mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold",
                plan.featured
                  ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/25 hover:bg-indigo-500"
                  : "border border-zinc-700 text-zinc-200 hover:border-zinc-500"
              )}
            >
              {busyPlan === plan.id ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> Opening checkout…
                </>
              ) : (
                <>
                  <Lock className="h-4 w-4" /> Subscribe with Razorpay
                </>
              )}
            </span>
          </button>
        ))}
      </div>

      {status === "success" && (
        <div className="flex items-start gap-3 rounded-xl border border-emerald-500/40 bg-emerald-500/10 p-4 text-sm text-emerald-300">
          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
          <p>{message}</p>
        </div>
      )}
      {status === "error" && (
        <div className="flex items-start gap-3 rounded-xl border border-rose-500/40 bg-rose-500/10 p-4 text-sm text-rose-300">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
          <p>{message}</p>
        </div>
      )}

      <div className="flex items-start gap-2 text-xs text-zinc-600">
        <Sparkles className="mt-0.5 h-3.5 w-3.5 shrink-0" />
        <p>
          Secure payments by Razorpay. Test mode: use test card 4111 1111 1111
          1111 with any future expiry and CVV.
        </p>
      </div>
    </div>
  );
}
