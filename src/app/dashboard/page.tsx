import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AppShell } from "@/components/app-shell";
import { formatINR } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Dashboard",
};

export default async function DashboardPage() {
  if (
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  ) {
    redirect("/login");
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  return (
    <AppShell user={{ email: user.email ?? "" }}>
      <div className="mx-auto max-w-7xl px-6 py-10">
        <div className="mb-10">
          <p className="text-sm text-indigo-400">Dashboard</p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-zinc-50">
            Welcome back, {profile?.full_name || "forger"}
          </h1>
          <p className="mt-2 text-sm text-zinc-400">
            {profile?.target_role
              ? `Your goal: ${profile.target_role} · ${profile.timeline_weeks ?? "—"} week plan · ${profile.weekly_hours ?? "—"} hrs/week`
              : "Complete your setup to unlock your personalized roadmap."}
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          <DashboardCard
            label="Readiness score"
            value={profile?.onboarding_completed ? "—" : "Pending"}
            hint="From your first resume scan"
          />
          <DashboardCard
            label="Gap focus"
            value="—"
            hint="Prioritized after radar mapping"
          />
          <DashboardCard
            label="Next milestone"
            value="Resume scan"
            hint="Step 1 of your journey"
          />
        </div>

        <div className="mt-10 rounded-2xl border border-zinc-800 bg-zinc-900/40 p-8">
          <h2 className="text-lg font-semibold text-zinc-100">
            Your next step
          </h2>
          <p className="mt-2 max-w-xl text-sm text-zinc-400">
            Upload your resume to get your first TPM readiness score, radar
            chart, and prioritized gap analysis — the foundation of your
            personal roadmap.
          </p>
          <a
            href="#"
            className="mt-5 inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-600/25 transition hover:bg-indigo-500"
          >
            Upload resume
          </a>
        </div>

        <p className="mt-10 text-xs text-zinc-600">
          Pro upgrade starts at {formatINR(999)}/mo — early-bird pricing for
          founding members.
        </p>
      </div>
    </AppShell>
  );
}

function DashboardCard({
  label,
  value,
  hint,
}: {
  label: string;
  value: string;
  hint: string;
}) {
  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6">
      <p className="text-xs font-medium uppercase tracking-wider text-zinc-500">
        {label}
      </p>
      <p className="mt-2 text-3xl font-bold text-zinc-50">{value}</p>
      <p className="mt-2 text-xs text-zinc-500">{hint}</p>
    </div>
  );
}
