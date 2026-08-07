import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { extractResume } from "@/lib/resume-parser";
import {
  OpenRouterClient,
  calculateReadiness,
  getEnv,
  getLearningOrder,
  getPublishedCompetencies,
  mapResumeToScores,
  seedGraph,
} from "@tpmforge/core";

describe("resume → readiness integration (live OpenRouter free model)", () => {
  const live = process.env.OPENROUTER_API_KEY ? it : it.skip;

  live(
    "maps a real resume and produces a readiness report",
    async () => {
      const buf = readFileSync(
        path.join(process.cwd(), "packages/core/test/fixtures/resume.pdf")
      );
      const file = new File([buf], "resume.pdf");
      const { text } = await extractResume(file);
      expect(text.length).toBeGreaterThan(50);

      const client = new OpenRouterClient({ env: getEnv() });
      const competencies = getPublishedCompetencies(seedGraph);

      const mapped = await mapResumeToScores(client, {
        resumeText: text,
        competencies: competencies.map((c) => ({
          id: c.id,
          title: c.title,
          description: c.description,
        })),
      });

      const scores: Record<string, Record<string, number>> = {};
      for (const [id, s] of Object.entries(mapped.scores)) {
        if (s) scores[id] = s as Record<string, number>;
      }

      const report = calculateReadiness(seedGraph, scores);
      const nextSteps = getLearningOrder(
        seedGraph,
        report.gaps.map((g) => g.id)
      )
        .slice(0, 6)
        .map((c) => c.id);

      expect(mapped.model).toContain(":");
      expect(report.readinessScore).toBeGreaterThanOrEqual(0);
      expect(report.readinessScore).toBeLessThanOrEqual(100);
      expect(nextSteps.length).toBeGreaterThan(0);

      console.log("MODEL:", mapped.model);
      console.log("TOKENS:", mapped.tokensUsed);
      console.log("READINESS:", report.readinessScore);
      console.log("RADAR:", JSON.stringify(report.radar));
      console.log(
        "TOP GAPS:",
        report.gaps
          .slice(0, 5)
          .map((g) => `${g.title} (${g.overall})`)
          .join(" | ")
      );
      console.log("NEXT STEPS:", nextSteps.join(", "));
    },
    180_000
  );
});
