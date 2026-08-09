import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft, FileText, RefreshCw } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { AppShell } from "@/components/app-shell";
import { ResumeUpload } from "@/components/resume-upload";
import { ReadinessReportView } from "@/components/readiness-report";
import { getLatestAnalysis, analysisToPayload } from "@/lib/analysis";

export const metadata: Metadata = {
  title: "Resume analysis",
};

export const maxDuration = 60;

export default async function ResumeAnalysisPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const latest = await getLatestAnalysis(supabase, user.id);

  return (
    <AppShell user={{ email: user.email ?? "" }}>
      <div className="mx-auto max-w-7xl px-6 py-10">
        <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-sm text-indigo-400">Resume analysis</p>
            <h1 className="mt-1 text-2xl font-bold tracking-tight text-zinc-50">
              Resume analysis, scoring &amp; suggestions
            </h1>
            <p className="mt-2 text-sm text-zinc-400">
              Match score, competency gaps, and learning suggestions to fix
              your resume.
            </p>
          </div>
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 rounded-xl border border-zinc-700 px-4 py-2 text-sm font-medium text-zinc-300 transition hover:border-zinc-500 hover:text-zinc-100"
          >
            <ArrowLeft className="h-4 w-4" /> Back to overview
          </Link>
        </div>

        {latest ? (
          <>
            <ReadinessReportView report={analysisToPayload(latest)} />
            <div className="mt-10">
              <div className="mb-4 flex items-center gap-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-600/20">
                  <RefreshCw className="h-4 w-4 text-indigo-300" />
                </span>
                <div>
                  <h3 className="text-sm font-semibold text-zinc-100">
                    Re-analyze with a newer resume
                  </h3>
                  <p className="text-xs text-zinc-500">
                    Upload an updated resume to refresh your match score, gaps,
                    and suggestions.
                  </p>
                </div>
              </div>
              <ResumeUpload redirectTo="/dashboard/resume" />
            </div>
          </>
        ) : (
          <div className="mx-auto max-w-2xl">
            <div className="rounded-2xl border border-dashed border-zinc-700 bg-zinc-900/40 p-10 text-center">
              <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-600/20">
                <FileText className="h-6 w-6 text-indigo-300" />
              </span>
              <h2 className="mt-4 text-lg font-semibold text-zinc-100">
                No resume analyzed yet
              </h2>
              <p className="mx-auto mt-2 max-w-md text-sm text-zinc-500">
                Upload your resume to get a match score against the TPM
                competency graph, priority gaps, and suggestions to fix.
              </p>
              <div className="mt-6">
                <ResumeUpload redirectTo="/dashboard/resume" />
              </div>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
