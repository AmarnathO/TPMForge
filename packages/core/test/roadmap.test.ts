import { describe, expect, it } from "vitest";
import { seedGraph } from "../src/seed";
import { buildRoadmap } from "../src/roadmap";

const TARGETS = [
  "PROD-ROADMAP-PRIORITIZATION-001",
  "PROG-PLAN-QUARTERLY-001",
  "LEAD-COMM-EXECUTIVE-001",
];

describe("buildRoadmap", () => {
  it("includes prerequisites in topo order", () => {
    const plan = buildRoadmap(seedGraph, TARGETS, {
      weeklyHours: 10,
      timelineWeeks: 8,
    });
    const flat = plan.weeks.flatMap((w) => w.competencyIds);
    const order = new Map(flat.map((id, i) => [id, i]));
    const roadmapPrereq = seedGraph.competencies["PROD-ROADMAP-PRIORITIZATION-001"];
    for (const prereq of roadmapPrereq.prerequisites) {
      expect(order.get(prereq)).toBeLessThan(order.get(roadmapPrereq.id)!);
    }
  });

  it("packs hours into weekly buckets without overflowing capacity", () => {
    const plan = buildRoadmap(seedGraph, TARGETS, {
      weeklyHours: 10,
      timelineWeeks: 8,
    });
    for (const week of plan.weeks) {
      const singleLargeCompetency =
        week.competencyIds.length === 1 &&
        seedGraph.competencies[week.competencyIds[0]].estimatedStudyHours > 10;
      if (!singleLargeCompetency) {
        expect(week.hours).toBeLessThanOrEqual(10);
      }
    }
    expect(plan.totalHours).toBeGreaterThan(0);
  });

  it("reports infeasibility when timeline is too short", () => {
    const plan = buildRoadmap(seedGraph, TARGETS, {
      weeklyHours: 10,
      timelineWeeks: 2,
    });
    expect(plan.neededWeeks).toBeGreaterThan(2);
    expect(plan.feasibleInTimeline).toBe(false);
  });

  it("ignores unknown target ids", () => {
    const plan = buildRoadmap(seedGraph, [...TARGETS, "NOPE-999"], {
      weeklyHours: 10,
      timelineWeeks: 8,
    });
    const flat = plan.weeks.flatMap((w) => w.competencyIds);
    expect(flat).not.toContain("NOPE-999");
  });
});
