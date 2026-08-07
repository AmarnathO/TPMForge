import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getPublishedCompetencies, seedGraph } from "@tpmforge/core";
import { createClient } from "@/lib/supabase/server";
import { AppShell } from "@/components/app-shell";
import { PracticeStudio } from "@/components/practice-studio";

export const metadata: Metadata = {
  title: "Practice",
};

export const maxDuration = 60;

export default async function PracticePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const competencies = getPublishedCompetencies(seedGraph).map((c) => ({
    id: c.id,
    title: c.title,
  }));

  return (
    <AppShell user={{ email: user.email ?? "" }}>
      <div className="mx-auto max-w-4xl px-6 py-10">
        <div className="mb-8">
          <p className="text-sm text-indigo-400">Assessment Practice</p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-zinc-50">
            Build evidence, not just plans
          </h1>
          <p className="mt-2 text-sm text-zinc-400">
            Answer realistic TPM scenarios and applied quizzes. Your scores are
            saved as evidence that feeds your readiness report.
          </p>
        </div>

        <PracticeStudio competencies={competencies} />
      </div>
    </AppShell>
  );
}
