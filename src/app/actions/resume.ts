"use server";

import { createClient } from "@/lib/supabase/server";
import { extractResume } from "@/lib/resume-parser";
import {
  OpenRouterClient,
  calculateReadiness,
  getEnv,
  getLearningOrder,
  getPublishedCompetencies,
  mapResumeToScores,
  runResumeCoach,
  seedGraph,
  type DimensionScores,
  type ResumeCoachReport,
} from "@tpmforge/core";

export type ResumeState = {
  status: "idle" | "processing" | "success" | "error";
  message?: string;
  report?: ResumeReportPayload;
};

export interface ResumeGap {
  id: string;
  title: string;
  overall: number;
  importance: number;
}

export interface ResumeReportPayload {
  readinessScore: number;
  radar: DimensionScores;
  gaps: ResumeGap[];
  nextSteps: { id: string; title: string }[];
  competencyCount: number;
  scoredCount: number;
  model: string;
  tokensUsed: number;
  fileName: string;
  coach: ResumeCoachReport | null;
}

export async function analyzeResume(
  _prev: ResumeState,
  formData: FormData
): Promise<ResumeState> {
  if (
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  ) {
    return { status: "error", message: "Analysis isn't configured yet." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { status: "error", message: "Please sign in first." };
  }

  const file = formData.get("resume");
  if (!(file instanceof File) || file.size === 0) {
    return { status: "error", message: "Please choose a resume file to upload." };
  }

  let text: string;
  let fileType: string;
  try {
    const extracted = await extractResume(file);
    text = extracted.text.trim();
    fileType = extracted.fileType;
  } catch (err) {
    return {
      status: "error",
      message: err instanceof Error ? err.message : "Could not read the file.",
    };
  }

  if (text.length < 50) {
    return {
      status: "error",
      message: "No readable text found in the file. Try a text-based PDF.",
    };
  }

  const competencies = getPublishedCompetencies(seedGraph);

  const client = new OpenRouterClient({ env: getEnv() });

  let mapped;
  try {
    mapped = await mapResumeToScores(client, {
      resumeText: text,
      competencies: competencies.map((c) => ({
        id: c.id,
        title: c.title,
        description: c.description,
      })),
    });
  } catch (err) {
    console.error("[resume] LLM mapping failed:", err);
    return {
      status: "error",
      message:
        "The AI scoring service is unavailable right now. Free models sometimes throttle — try again in a minute.",
    };
  }

  const scores: Record<string, Partial<DimensionScores>> = {};
  for (const [id, s] of Object.entries(mapped.scores)) {
    if (s) scores[id] = s;
  }

  const scoredCount = Object.keys(scores).length;

  const report = calculateReadiness(seedGraph, scores);

  const gapList = report.gaps.map((g) => ({
    id: g.id,
    title: g.title,
    overall: g.overall,
    importance: g.importance,
  }));

  const nextSteps = getLearningOrder(
    seedGraph,
    report.gaps.map((g) => g.id)
  )
    .slice(0, 6)
    .map((c) => ({ id: c.id, title: c.title }));

  const profileResult = await supabase
    .from("profiles")
    .select("current_role, target_role")
    .eq("id", user.id)
    .single();
  const profile = profileResult.data as
    | { current_role?: string | null; target_role?: string | null }
    | null;

  let coach: ResumeCoachReport | null = null;
  try {
    const coachResult = await runResumeCoach(client, {
      resumeText: text,
      currentRole: profile?.current_role ?? undefined,
      targetRole: profile?.target_role ?? undefined,
      competencyScores: scores,
    });
    coach = {
      profile: coachResult.profile,
      executiveAssessment: coachResult.executiveAssessment,
      readinessScore: coachResult.readinessScore,
      strengths: coachResult.strengths,
      criticalGaps: coachResult.criticalGaps,
      resumeIssues: coachResult.resumeIssues,
      bulletImprovements: coachResult.bulletImprovements,
      missingEvidence: coachResult.missingEvidence,
      technicalGaps: coachResult.technicalGaps,
      impactGaps: coachResult.impactGaps,
      portfolioRecommendations: coachResult.portfolioRecommendations,
      certificationRecommendations: coachResult.certificationRecommendations,
      linkedinRecommendations: coachResult.linkedinRecommendations,
      contentStrategy: coachResult.contentStrategy,
      roadmap: coachResult.roadmap,
      plan306090: coachResult.plan306090,
      interviewReadiness: coachResult.interviewReadiness,
    };
  } catch (err) {
    console.error("[resume] coach evaluation failed:", err);
  }

  const payload: ResumeReportPayload = {
    readinessScore: report.readinessScore,
    radar: report.radar,
    gaps: gapList,
    nextSteps,
    competencyCount: competencies.length,
    scoredCount,
    model: mapped.model,
    tokensUsed: mapped.tokensUsed,
    fileName: file.name,
    coach,
  };

  const { error: insertError } = await supabase.from("resume_analyses").insert({
    user_id: user.id,
    file_name: file.name,
    file_size: file.size,
    file_type: fileType,
    raw_text: text.slice(0, 100_000),
    competency_scores: scores,
    readiness_score: report.readinessScore,
    radar_data: report.radar,
    gap_report: { gaps: gapList, nextSteps, coach },
    model_used: mapped.model,
    tokens_used: mapped.tokensUsed,
    status: "completed",
  });

  if (insertError) {
    console.error("[resume] insert failed:", insertError);
  }

  return { status: "success", message: "Analysis complete.", report: payload };
}
