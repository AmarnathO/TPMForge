import type { Metadata } from "next";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowRight, ClipboardList, FileText } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { AppShell } from "@/components/app-shell";
import { ReadinessReportView } from "@/components/readiness-report";
import { ResumeUpload } from "@/components/resume-upload";
import { StandView } from "@/components/stand-view";
import { ReadinessTest } from "@/components/readiness-test";
import { getLatestAnalysis, analysisToPayload } from "@/lib/analysis";
import {
  getLatestReadinessTest,
  standFromRow,
} from "@/lib/readiness";

export const metadata: Metadata = {
  title: "Readiness",
};

export const maxDuration = 60;

export default async function ReadinessPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const [latest, testRow] = await Promise.all([
    getLatestAnalysis(supabase, user.id),
    getLatestReadinessTest(supabase, user.id),
  ]);

  const stand = testRow ? standFromRow(testRow) : null;

  return (
    <AppShell user={{ email: user.email ?? "" }}>
      <div className="mx-auto max-w-7xl px-6 py-10">
        <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-sm text-indigo-400">Readiness</p>
            <h1 className="mt-1 text-2xl font-bold tracking-tight text-zinc-50">
              Your TPM readiness
            </h1>
            <p className="mt-2 text-sm text-zinc-400">
              Your current stand comes from the business · technology · product
              test. Your resume gives a separate analysis, score, and
              suggestions.
            </p>
          </div>
          <Link
            href="/dashboard/roadmap"
            className="inline-flex items-center gap-2 rounded-xl border border-zinc-700 px-4 py-2 text-sm font-medium text-zinc-300 transition hover:border-zinc-500 hover:text-zinc-100"
          >
            See roadmap <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div id="test" className="scroll-mt-24">
          {stand ? (
            <StandView stand={stand} />
          ) : (
            <div className="rounded-2xl border border-dashed border-indigo-500/40 bg-indigo-500/5 p-8">
              <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center">
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-indigo-600/20">
                  <ClipboardList className="h-6 w-6 text-indigo-300" />
                </span>
                <div>
                  <h3 className="text-base font-semibold text-zinc-100">
                    Measure your current TPM stand
                  </h3>
                  <p className="mt-1 text-sm text-zinc-400">
                    30 questions — 10 each on business, technology, and product.
                    Based on your answers, not your resume.
                  </p>
                </div>
              </div>
              <ReadinessTest />
            </div>
          )}
        </div>

        <div className="mt-12">
          <div className="mb-4 flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-600/20">
              <FileText className="h-4 w-4 text-indigo-300" />
            </span>
            <div>
              <h3 className="text-sm font-semibold text-zinc-100">
                Resume analysis, scoring &amp; suggestions
              </h3>
              <p className="text-xs text-zinc-500">
                Your resume is analyzed separately — match score, competency
                gaps, and learning suggestions.
              </p>
            </div>
          </div>
          {latest ? (
            <>
              <ReadinessReportView report={analysisToPayload(latest)} />
              <div className="mt-8 rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6">
                <h3 className="text-sm font-semibold text-zinc-100">
                  Refresh your analysis
                </h3>
                <p className="mt-1 text-xs text-zinc-500">
                  Upload a newer resume to update your match score and
                  suggestions.
                </p>
                <div className="mt-4">
                  <ResumeUpload />
                </div>
              </div>
            </>
          ) : (
            <ResumeUpload />
          )}
        </div>
      </div>
    </AppShell>
  );
}
