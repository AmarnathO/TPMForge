import type { CompetencyGraph } from "./types";
import { getLearningOrder } from "./graph";

export interface RoadmapWeek {
  week: number;
  competencyIds: string[];
  hours: number;
}

export interface RoadmapPlan {
  weeks: RoadmapWeek[];
  totalHours: number;
  neededWeeks: number;
  feasibleInTimeline: boolean;
  targetIds: string[];
}

export interface RoadmapOptions {
  weeklyHours: number;
  timelineWeeks: number;
  completedIds?: string[];
}

/**
 * Build a week-by-week roadmap from the competency graph: take the target
 * competencies, expand to include prerequisites, order topologically, then
 * greedily pack estimated study hours into weekly buckets. Deterministic and
 * free — no LLM needed.
 */
export function buildRoadmap(
  graph: CompetencyGraph,
  targetIds: string[],
  options: RoadmapOptions
): RoadmapPlan {
  const weeklyHours = Math.max(1, options.weeklyHours);
  const timelineWeeks = Math.max(1, options.timelineWeeks);

  const ordered = getLearningOrder(
    graph,
    targetIds.filter((id) => Boolean(graph.competencies[id])),
    options.completedIds ?? []
  );

  const weeks: RoadmapWeek[] = [];
  let week = 1;
  let weekHours = 0;
  let bucket: string[] = [];

  for (const competency of ordered) {
    const hours = competency.estimatedStudyHours;
    if (weekHours + hours > weeklyHours && weekHours > 0) {
      weeks.push({ week, competencyIds: bucket, hours: weekHours });
      week += 1;
      bucket = [];
      weekHours = 0;
    }
    bucket.push(competency.id);
    weekHours += hours;
  }
  if (bucket.length > 0) {
    weeks.push({ week, competencyIds: bucket, hours: weekHours });
  }

  const totalHours = ordered.reduce(
    (sum, c) => sum + c.estimatedStudyHours,
    0
  );

  return {
    weeks,
    totalHours,
    neededWeeks: weeks.length,
    feasibleInTimeline: weeks.length <= timelineWeeks,
    targetIds,
  };
}
