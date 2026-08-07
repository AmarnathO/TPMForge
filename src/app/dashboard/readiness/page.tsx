import type { Metadata } from "next";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowRight, UploadCloud } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { AppShell } from "@/components/app-shell";
import { ReadinessReportView } from "@/components/readiness-report";
import { ResumeUpload } from "@/components/resume-upload";
import {
  analysisToPayload,
  getLatestAnalysis,
} from "@/lib/analysis";

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

  const latest = await getLatestAnalysis(supabase, user.id);

  return (
    <AppShell user={{ email: user.email ?? "" }}>
      <div className="mx-auto max-w-7xl px-6 py-10">
        <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-sm text-indigo-400">Readiness</p>
            <h1 className="mt-1 text-2xl font-bold tracking-tight text-zinc-50">
              Your TPM readiness report
            </h1>
            <p className="mt-2 text-sm text-zinc-400">
              Six dimensions, scored against the competency graph from your
              latest resume.
            </p>
          </div>
          <Link
            href="/dashboard/roadmap"
            className="inline-flex items-center gap-2 rounded-xl border border-zinc-700 px-4 py-2 text-sm font-medium text-zinc-300 transition hover:border-zinc-500 hover:text-zinc-100"
          >
            See roadmap <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {latest ? (
          <>
            <ReadinessReportView report={analysisToPayload(latest)} />
            <div className="mt-12 rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6">
              <h3 className="text-sm font-semibold text-zinc-100">
                Refresh your report
              </h3>
              <p className="mt-1 text-xs text-zinc-500">
                Upload a newer resume to update your readiness score and gaps.
              </p>
              <div className="mt-4">
                <ResumeUpload />
              </div>
            </div>
          </>
        ) : (
          <div className="rounded-2xl border border-dashed border-zinc-700 bg-zinc-900/40 p-10 text-center">
            <UploadCloud className="mx-auto h-8 w-8 text-zinc-600" />
            <h3 className="mt-4 text-base font-semibold text-zinc-100">
              No readiness report yet
            </h3>
            <p className="mx-auto mt-2 max-w-md text-sm text-zinc-500">
              Upload your resume to get your TPM readiness score, dimension
              radar, and prioritized gaps.
            </p>
            <div className="mx-auto mt-6 max-w-lg">
              <ResumeUpload />
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
