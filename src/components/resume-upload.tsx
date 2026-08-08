"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import {
  Upload,
  FileText,
  Loader2,
  AlertTriangle,
  CheckCircle2,
} from "lucide-react";
import { analyzeResume, type ResumeState } from "@/app/actions/resume";
import { ReadinessReportView } from "@/components/readiness-report";
import { MAX_RESUME_BYTES } from "@/lib/limits";

const initialState: ResumeState = { status: "idle" };

const MAX_RESUME_MB = Math.round(MAX_RESUME_BYTES / 1024 / 1024);

const REVIEW_STEPS = [
  "Reading your resume…",
  "Extracting your experience…",
  "Mapping to TPM competencies…",
  "Scoring the six dimensions…",
  "Preparing your report…",
];

function formatBytes(bytes: number) {
  if (bytes >= 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  if (bytes >= 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${bytes} B`;
}

export function ResumeUpload() {
  const [state, formAction, pending] = useActionState(
    analyzeResume,
    initialState
  );
  const [fileName, setFileName] = useState<string | null>(null);
  const [fileSize, setFileSize] = useState<number>(0);
  const [reviewStep, setReviewStep] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!pending) return;
    const timer = setInterval(
      () => setReviewStep((s) => (s + 1) % REVIEW_STEPS.length),
      8000
    );
    return () => clearInterval(timer);
  }, [pending]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFileName(file.name);
      setFileSize(file.size);
    } else {
      setFileName(null);
      setFileSize(0);
    }
  };

  const resetFile = () => {
    setFileName(null);
    setFileSize(0);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const hasFile = Boolean(fileName);

  return (
    <div className="space-y-6">
      <form
        action={formAction}
        onSubmit={() => setReviewStep(0)}
        className="rounded-2xl border border-dashed border-zinc-700 bg-zinc-900/40 p-8"
      >
        <div className="flex flex-col items-center gap-4 text-center">
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-600/20">
            {hasFile ? (
              <CheckCircle2 className="h-6 w-6 text-emerald-400" />
            ) : (
              <Upload className="h-6 w-6 text-indigo-300" />
            )}
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

          {hasFile && (
            <div className="flex w-full max-w-md items-center justify-between gap-3 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-left">
              <div className="flex min-w-0 items-center gap-3">
                <FileText className="h-5 w-5 shrink-0 text-emerald-400" />
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-emerald-300">
                    {fileName}
                  </p>
                  <p className="text-xs text-emerald-500/80">
                    {formatBytes(fileSize)} · ready to analyze
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={resetFile}
                className="shrink-0 rounded-lg px-2 py-1 text-xs text-emerald-400 transition hover:bg-emerald-500/20"
              >
                Remove
              </button>
            </div>
          )}

          <div className="flex w-full max-w-md flex-col items-center gap-3 sm:flex-row">
            <label className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-sm font-medium text-zinc-200 transition hover:border-zinc-500">
              <FileText className="h-4 w-4 text-zinc-500" />
              {hasFile ? "Choose another file" : "Choose file"}
              <input
                ref={fileInputRef}
                type="file"
                name="resume"
                accept=".pdf,.docx,.txt,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                onChange={handleFileChange}
                className="sr-only"
                required
              />
            </label>
            <button
              type="submit"
              disabled={pending || !hasFile}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-600/25 transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
            >
              {pending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Analyzing… up to a minute
                </>
              ) : hasFile ? (
                "Analyze my resume"
              ) : (
                "Choose a file first"
              )}
            </button>
          </div>
        </div>
      </form>

      {pending && (
        <div className="rounded-2xl border border-indigo-500/30 bg-indigo-500/5 p-6">
          <div className="flex items-center gap-3">
            <span className="relative flex h-3 w-3">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-indigo-400 opacity-75" />
              <span className="relative inline-flex h-3 w-3 rounded-full bg-indigo-500" />
            </span>
            <p className="text-sm font-medium text-indigo-200">
              {REVIEW_STEPS[reviewStep]}
            </p>
          </div>
          <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-zinc-800">
            <div className="h-full w-1/3 animate-progress rounded-full bg-gradient-to-r from-indigo-500 to-violet-500" />
          </div>
          <div className="mt-4 space-y-2">
            <div className="h-3 w-11/12 animate-pulse rounded-full bg-zinc-800" />
            <div className="h-3 w-4/6 animate-pulse rounded-full bg-zinc-800" />
            <div className="h-3 w-3/4 animate-pulse rounded-full bg-zinc-800" />
          </div>
          <p className="mt-3 text-xs text-zinc-500">
            Free AI models can take up to a minute. Hang tight — your report is
            on its way.
          </p>
        </div>
      )}

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
