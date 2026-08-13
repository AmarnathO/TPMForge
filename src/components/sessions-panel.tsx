import Link from "next/link";
import { CalendarClock, Video, ArrowRight } from "lucide-react";

const BOOKING_EMAIL = "hello@tpmforge.app";

export function SessionsPanel({
  plan,
  email,
}: {
  plan: string | null;
  email: string;
}) {
  if (plan !== "one-time" && plan !== "monthly") return null;

  const isMonthly = plan === "monthly";
  const subject = isMonthly
    ? `Session booking — ${email}`
    : `Mock interview booking — ${email}`;
  const body = isMonthly
    ? `Hi, I'm on the monthly plan. Please help me book this month's 2 sessions (1 hour each).`
    : `Hi, I purchased the one-time plan. Please schedule my mock interview within a week.`;
  const href = `mailto:${BOOKING_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

  return (
    <div className="rounded-2xl border border-indigo-500/30 bg-gradient-to-br from-indigo-500/10 via-zinc-900/40 to-zinc-900/40 p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-600/20">
            <Video className="h-5 w-5 text-indigo-300" />
          </span>
          <div>
            <p className="text-sm font-semibold text-zinc-100">
              {isMonthly
                ? "2 × 1-hour mentor sessions included this month"
                : "Your mock interview is included"}
            </p>
            <p className="mt-1 text-xs leading-relaxed text-zinc-500">
              {isMonthly
                ? "Your monthly plan comes with two 1-hour sessions with a real TPM every month. Email us to book your slots and we'll schedule them with you."
                : "Your one-time plan includes a 1-hour mock interview with a real TPM, scheduled within a week of purchase. Email us to book your slot."}
            </p>
          </div>
        </div>
        <Link
          href={href}
          className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-600/25 transition hover:bg-indigo-500"
        >
          <CalendarClock className="h-4 w-4" /> Book your session
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
}
