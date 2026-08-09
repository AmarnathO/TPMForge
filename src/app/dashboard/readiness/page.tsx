import type { Metadata } from "next";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowRight, ClipboardList, FileText, Sparkles } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { AppShell } from "@/components/app-shell";
import { StandView } from "@/components/stand-view";
import { ReadinessTest } from "@/components/readiness-test";
import {
  getLatestReadinessTest,
  standFromRow,
} from "@/lib/readiness";

export const metadata: Metadata = {
  title: "Readiness",
};

export const maxDuration = 60;

export default async function ReadinessPage({
  searchParams,
}: {
  searchParams: Promise<{ retake?: string }>;
}) {
  const { retake } = await searchParams;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const testRow = await getLatestReadinessTest(supabase, user.id);
  const stand = testRow ? standFromRow(testRow) : null;
  const showTest = !stand || retake === "1";

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
              Your stand comes from the 36-question business · technology ·
              product test.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            {stand && (
              <Link
                href="/dashboard/readiness?retake=1"
                className="inline-flex items-center gap-2 rounded-xl border border-zinc-700 px-4 py-2 text-sm font-medium text-zinc-300 transition hover:border-zinc-500 hover:text-zinc-100"
              >
                Retake test
              </Link>
            )}
            <Link
              href="/dashboard/resume"
              className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-indigo-600/25 transition hover:bg-indigo-500"
            >
              Analyze resume <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>

        <div id="test" className="scroll-mt-24">
          {showTest ? (
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
                    12 questions each on business, technology, and product.
                    Pick a section below — questions appear one at a time, from
                    basic to pro.
                  </p>
                </div>
              </div>
              <ReadinessTest />
            </div>
          ) : (
            <div className="space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="text-sm font-semibold text-zinc-100">
                    Your current stand
                  </h2>
                  <p className="mt-1 text-xs text-zinc-500">
                    Score, competency graph, and suggested focus areas from your
                    readiness test.
                  </p>
                </div>
                <Link
                  href="/dashboard/readiness?retake=1#test"
                  className="inline-flex items-center gap-2 rounded-lg border border-zinc-700 px-3 py-2 text-xs font-medium text-zinc-300 transition hover:border-zinc-500 hover:text-zinc-100"
                >
                  Retake test
                </Link>
              </div>
              <StandView stand={stand!} />
            </div>
          )}
        </div>

        <div className="mt-12 grid grid-cols-1 gap-4 lg:grid-cols-2">
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-start gap-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-indigo-600/20">
                  <FileText className="h-4 w-4 text-indigo-300" />
                </span>
                <div>
                  <h3 className="text-sm font-semibold text-zinc-100">
                    Resume Analysis, Scoring &amp; Suggestions
                  </h3>
                  <p className="mt-1 text-xs text-zinc-500">
                    Upload your resume to get a separate match score, competency
                    gaps, and suggestions to fix it.
                  </p>
                </div>
              </div>
              <Link
                href="/dashboard/resume"
                className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-600/25 transition hover:bg-indigo-500"
              >
                Go to resume analysis <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>

          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-start gap-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-violet-600/20">
                  <Sparkles className="h-4 w-4 text-violet-300" />
                </span>
                <div>
                  <h3 className="text-sm font-semibold text-zinc-100">
                    Product Mentor Agent
                  </h3>
                  <p className="mt-1 text-xs text-zinc-500">
                    Deep-dive your product thinking — real scenarios, metrics,
                    and written answers evaluated by an AI product mentor.
                  </p>
                </div>
              </div>
              <Link
                href="/dashboard/product-agent"
                className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-violet-600/25 transition hover:bg-violet-500"
              >
                Meet your product mentor <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
