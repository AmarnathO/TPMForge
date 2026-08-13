import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft, RefreshCw, FileText, Gauge, GitBranch } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { AppShell } from "@/components/app-shell";
import { ResumeUpload } from "@/components/resume-upload";
import { ReadinessReportView } from "@/components/readiness-report";
import { MembershipPaywall } from "@/components/membership-paywall";
import { SessionsPanel } from "@/components/sessions-panel";
import { getLatestAnalysis, analysisToPayload } from "@/lib/analysis";
import { getSubscription, isSubscriptionActive } from "@/lib/subscription";

export const metadata: Metadata = {
  title: "Resume analysis",
};

export const maxDuration = 120;

export default async function ResumeAnalysisPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const [latest, sub] = await Promise.all([
    getLatestAnalysis(supabase, user.id),
    getSubscription(supabase, user.id),
  ]);

  const subscribed = isSubscriptionActive(sub);
  const email = user.email ?? "";

  return (
    <AppShell user={{ email }}>
      <div className="mx-auto max-w-7xl px-6 py-10">
        {latest && !subscribed ? (
          <>
            <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="text-sm text-indigo-400">Resume analysis</p>
                <h1 className="mt-1 text-2xl font-bold tracking-tight text-zinc-50">
                  Resume Analysis, Scoring &amp; Suggestions
                </h1>
                <p className="mt-2 text-sm text-zinc-400">
                  Your resume has been analyzed. Unlock the full report with a
                  membership.
                </p>
              </div>
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-2 rounded-xl border border-zinc-700 px-4 py-2 text-sm font-medium text-zinc-300 transition hover:border-zinc-500 hover:text-zinc-100"
              >
                <ArrowLeft className="h-4 w-4" /> Back to overview
              </Link>
            </div>

            <MembershipPaywall
              email={email}
              eyebrow="Members-only"
              title="Your resume report is ready"
              description="Your resume has been scored against the TPM competency graph. The full report — match score, competency gaps, bullet rewrites, and your personalized roadmap — unlocks with a TPMForge membership."
              highlights={[
                {
                  icon: Gauge,
                  title: "Match score & gaps",
                  text: "Your exact readiness score for every TPM competency, with priority gaps to fix first.",
                },
                {
                  icon: FileText,
                  title: "Career coach report",
                  text: "Executive assessment, bullet-by-bullet rewrites, and interview-ready guidance.",
                },
                {
                  icon: GitBranch,
                  title: "Personalized roadmap",
                  text: "A week-by-week learning plan built from your resume's exact gaps.",
                },
              ]}
            />

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
                    Analysis is free — upload an updated resume to refresh your
                    match score.
                  </p>
                </div>
              </div>
              <ResumeUpload redirectTo="/dashboard/resume" />
            </div>
          </>
        ) : latest ? (
          <>
            <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="text-sm text-indigo-400">Resume analysis</p>
                <h1 className="mt-1 text-2xl font-bold tracking-tight text-zinc-50">
                  Resume Analysis, Scoring &amp; Suggestions
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

            <ReadinessReportView report={analysisToPayload(latest)} />
            <div className="mt-8">
              <SessionsPanel plan={sub?.plan ?? null} email={email} />
            </div>
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
            <div className="mb-8 text-center">
              <p className="text-sm text-indigo-400">Resume analysis</p>
              <h1 className="mt-1 text-2xl font-bold tracking-tight text-zinc-50">
                Upload your resume
              </h1>
              <p className="mx-auto mt-2 max-w-md text-sm text-zinc-400">
                Upload your resume to get a match score against the TPM
                competency graph, priority gaps, and suggestions to fix.
              </p>
            </div>
            <ResumeUpload redirectTo="/dashboard/resume" />
          </div>
        )}
      </div>
    </AppShell>
  );
}
