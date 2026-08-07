"use client";

import { useActionState } from "react";
import { Upload, FileText, Loader2, AlertTriangle } from "lucide-react";
import { analyzeResume, type ResumeState } from "@/app/actions/resume";
import { ReadinessReportView } from "@/components/readiness-report";
import { MAX_RESUME_BYTES } from "@/app/actions/resume";

const initialState: ResumeState = { status: "idle" };

const MAX_RESUME_MB = Math.round(MAX_RESUME_BYTES / 1024 / 1024);

export function ResumeUpload() {
  const [state, formAction, pending] = useActionState(
    analyzeResume,
    initialState
  );

  return (
    <div className="space-y-6">
      <form
        action={formAction}
        className="rounded-2xl border border-dashed border-zinc-700 bg-zinc-900/40 p-8"
      >
        <div className="flex flex-col items-center gap-4 text-center">
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-600/20">
            <Upload className="h-6 w-6 text-indigo-300" />
          </span>
          <div>
            <h2 className="text-lg font-semibold text-zinc-100">
              Upload your resume
            </h2>
            <p className="mt-1 text-sm text-zinc-500">
              PDF, DOCX, or TXT · up to {MAX_RESUME_MB} MB. We map your
              experience to the TPM competency graph.
            </p>
          </div>
          <div className="flex w-full max-w-md flex-col items-center gap-3 sm:flex-row">
            <label className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-sm font-medium text-zinc-200 transition hover:border-zinc-500">
              <FileText className="h-4 w-4 text-zinc-500" />
              Choose file
              <input
                type="file"
                name="resume"
                accept=".pdf,.docx,.txt,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                className="sr-only"
                required
              />
            </label>
            <button
              type="submit"
              disabled={pending}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-600/25 transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
            >
              {pending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Analyzing… up to a minute
                </>
              ) : (
                "Analyze resume"
              )}
            </button>
          </div>
        </div>
      </form>

      {state.status === "error" && (
        <div className="flex items-start gap-3 rounded-xl border border-rose-500/40 bg-rose-500/10 p-4 text-sm text-rose-300">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
          <p>{state.message}</p>
        </div>
      )}

      {state.status === "success" && state.report && (
        <ReadinessReportView report={state.report} />
      )}
    </div>
  );
}
