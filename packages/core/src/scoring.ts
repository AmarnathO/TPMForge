import type {
  CompetencyGraph,
  Dimension,
  DimensionScores,
} from "./types";
import { DIMENSIONS } from "./types";

export const DIMENSION_WEIGHTS: Record<Dimension, number> = {
  knowledge: 1,
  understanding: 1,
  application: 1.5,
  communication: 1,
  decision_making: 1.5,
  execution: 1,
};

export function clampScore(n: number): number {
  if (!Number.isFinite(n)) return 0;
  return Math.max(0, Math.min(100, Math.round(n)));
}

/**
 * Weighted average of the six dimensions. Weighting favours application,
 * decision-making and execution (the dimensions that separate good TPMs).
 */
export function calculateOverallScore(dimensions: DimensionScores): number {
  let sum = 0;
  let weightSum = 0;
  for (const dim of DIMENSIONS) {
    sum += clampScore(dimensions[dim]) * DIMENSION_WEIGHTS[dim];
    weightSum += DIMENSION_WEIGHTS[dim];
  }
  return Math.round(sum / weightSum);
}

export function normalizeScores(
  raw: Partial<DimensionScores> | undefined
): DimensionScores {
  const out = {} as DimensionScores;
  for (const dim of DIMENSIONS) {
    const value = raw?.[dim];
    out[dim] = clampScore(typeof value === "number" ? value : 0);
  }
  return out;
}

export interface CompetencyResult {
  id: string;
  title: string;
  overall: number;
  dimensions: DimensionScores;
  importance: number;
}

export interface Gap {
  id: string;
  title: string;
  overall: number;
  importance: number;
  prerequisiteIds: string[];
}

export interface ReadinessReport {
  readinessScore: number;
  radar: DimensionScores;
  competencies: CompetencyResult[];
  gaps: Gap[];
}

export interface ReadinessOptions {
  gapThreshold?: number;
}

/**
 * Aggregate per-competency dimension scores into a readiness report.
 * - readinessScore: importance-weighted average across scored competencies
 * - radar: average score per dimension across scored competencies
 * - gaps: scored competencies below the threshold, ranked by gap size
 *   (importance-weighted) then importance
 */
export function calculateReadiness(
  graph: CompetencyGraph,
  scores: Record<string, Partial<DimensionScores>>,
  options: ReadinessOptions = {}
): ReadinessReport {
  const gapThreshold = options.gapThreshold ?? 60;

  const results: CompetencyResult[] = [];
  const radarTotal: Record<Dimension, number> = {
    knowledge: 0,
    understanding: 0,
    application: 0,
    communication: 0,
    decision_making: 0,
    execution: 0,
  };

  for (const [id, raw] of Object.entries(scores)) {
    const competency = graph.competencies[id];
    if (!competency) continue;

    const dimensions = normalizeScores(raw);
    const overall = calculateOverallScore(dimensions);
    const importance = competency.importance;

    for (const dim of DIMENSIONS) {
      radarTotal[dim] += dimensions[dim];
    }

    results.push({
      id,
      title: competency.title,
      overall,
      dimensions,
      importance,
    });
  }

  const count = results.length;

  let readinessSum = 0;
  let importanceSum = 0;
  for (const r of results) {
    readinessSum += r.overall * r.importance;
    importanceSum += r.importance;
  }
  const readinessScore =
    importanceSum > 0 ? Math.round(readinessSum / importanceSum) : 0;

  const radar = {} as DimensionScores;
  for (const dim of DIMENSIONS) {
    radar[dim] = count > 0 ? Math.round(radarTotal[dim] / count) : 0;
  }

  const gaps: Gap[] = results
    .filter((r) => r.overall < gapThreshold)
    .map((r) => ({
      id: r.id,
      title: r.title,
      overall: r.overall,
      importance: r.importance,
      prerequisiteIds: graph.competencies[r.id]?.prerequisites ?? [],
    }))
    .sort((a, b) => {
      const gapA = gapThreshold - a.overall;
      const gapB = gapThreshold - b.overall;
      return gapB * b.importance - gapA * a.importance;
    });

  return {
    readinessScore,
    radar,
    competencies: results,
    gaps,
  };
}
