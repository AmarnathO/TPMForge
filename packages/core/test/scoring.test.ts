import { describe, expect, it } from "vitest";
import {
  calculateOverallScore,
  calculateReadiness,
  clampScore,
  normalizeScores,
  seedGraph,
} from "@tpmforge/core";

describe("scoring kernel", () => {
  it("computes the weighted overall score (documented golden set -> 71)", () => {
    const scores = normalizeScores({
      knowledge: 82,
      understanding: 75,
      application: 60,
      communication: 78,
      decision_making: 68,
      execution: 70,
    });
    expect(calculateOverallScore(scores)).toBe(71);
  });

  it("clamps scores to 0-100", () => {
    expect(clampScore(105)).toBe(100);
    expect(clampScore(-5)).toBe(0);
    expect(clampScore(73.4)).toBe(73);
    expect(clampScore(Number.NaN)).toBe(0);
    expect(clampScore(Number.POSITIVE_INFINITY)).toBe(0);
  });

  it("normalizes partial/missing dimensions to 0", () => {
    const normalized = normalizeScores({ knowledge: 50 });
    expect(normalized.understanding).toBe(0);
    expect(normalized.application).toBe(0);
    expect(normalized.knowledge).toBe(50);
  });

  it("computes importance-weighted readiness and per-dimension radar", () => {
    const report = calculateReadiness(seedGraph, {
      "TECH-API-REST-001": {
        knowledge: 90,
        understanding: 80,
        application: 70,
        communication: 80,
        decision_making: 75,
        execution: 80,
      },
      "LEAD-COMM-EXECUTIVE-001": {
        knowledge: 70,
        understanding: 70,
        application: 50,
        communication: 60,
        decision_making: 60,
        execution: 60,
      },
    });

    const rest = report.competencies.find((c) => c.id === "TECH-API-REST-001")!;
    expect(rest.overall).toBe(78);

    expect(report.radar.knowledge).toBe(80);
    expect(report.readinessScore).toBeGreaterThan(0);
    expect(report.readinessScore).toBeLessThanOrEqual(100);
  });

  it("ranks gaps by importance-weighted gap size", () => {
    const report = calculateReadiness(seedGraph, {
      "TECH-API-REST-001": {
        knowledge: 90,
        understanding: 80,
        application: 70,
        communication: 80,
        decision_making: 75,
        execution: 80,
      },
      "TECH-DB-SQL-001": {
        knowledge: 40,
        understanding: 30,
        application: 20,
        communication: 50,
        decision_making: 40,
        execution: 30,
      },
    });

    const gapIds = report.gaps.map((g) => g.id);
    expect(gapIds).toContain("TECH-DB-SQL-001");
    expect(gapIds[0]).toBe("TECH-DB-SQL-001");
  });

  it("returns empty gaps when everything is above threshold", () => {
    const high = Object.fromEntries(
      Object.keys(seedGraph.competencies).map((id) => [
        id,
        {
          knowledge: 95,
          understanding: 95,
          application: 95,
          communication: 95,
          decision_making: 95,
          execution: 95,
        },
      ])
    );
    const report = calculateReadiness(seedGraph, high, { gapThreshold: 60 });
    expect(report.gaps).toEqual([]);
  });

  it("ignores scores for unknown competencies", () => {
    const report = calculateReadiness(seedGraph, {
      "DOES-NOT-EXIST": { knowledge: 100 },
    });
    expect(report.competencies).toEqual([]);
    expect(report.readinessScore).toBe(0);
  });
});
