import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { extractResume } from "@/lib/resume-parser";
import {
  OpenRouterClient,
  calculateReadiness,
  generateQuiz,
  generateScenario,
  getEnv,
  getLearningOrder,
  getPublishedCompetencies,
  gradeScenarioAnswer,
  mapResumeToScores,
  seedGraph,
} from "@tpmforge/core";describe("resume → readiness integration (live OpenRouter free model)", () => {
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

describe("coach chat (live OpenRouter free model)", () => {
  const live = process.env.OPENROUTER_API_KEY ? it : it.skip;

  live(
    "grounds a coach reply on the competency graph",
    async () => {
      const client = new OpenRouterClient({ env: getEnv() });
      const competencies = getPublishedCompetencies(seedGraph);

      const catalog = competencies
        .map(
          (c) =>
            `- ${c.id}: ${c.title} (level ${c.level}, ${c.difficulty}, ~${c.estimatedStudyHours}h) — ${c.description}`
        )
        .join("\n");

      const messages = [
        {
          role: "system" as const,
          content: [
            "You are the TPMForge AI Coach, a senior TPM mentor.",
            "Ground every answer in the competency catalog. Cite competency IDs in parentheses.",
            "Be concise and practical.",
            `Catalog:\n${catalog}`,
          ].join("\n\n"),
        },
        { role: "user" as const, content: "Explain REST API design basics." },
      ];

      const result = await client.complete({
        modelId: client.modelIdFor("coach_chat"),
        fallback: client.fallbacksFor("coach_chat"),
        messages,
        maxTokens: 600,
        temperature: 0.4,
      });

      expect(result.content.length).toBeGreaterThan(20);
      console.log("COACH MODEL:", result.model);
      console.log("COACH TOKENS:", result.tokensUsed);
      console.log("COACH REPLY (first 200):", result.content.slice(0, 200));
    },
    180_000
  );
});

describe("assessment practice (live OpenRouter free model)", () => {
  const live = process.env.OPENROUTER_API_KEY ? it : it.skip;

  live(
    "generates a scenario, grades an answer, and generates a quiz",
    async () => {
      const client = new OpenRouterClient({ env: getEnv() });
      const competency = getPublishedCompetencies(seedGraph)[0];

      const scenario = await generateScenario(client, { competency });
      expect(scenario.scenario.length).toBeGreaterThan(30);
      expect(scenario.question.length).toBeGreaterThan(10);
      console.log("SCENARIO MODEL:", scenario.model);
      console.log("SCENARIO:", scenario.scenario.slice(0, 160));

      const grading = await gradeScenarioAnswer(client, {
        competency,
        scenario: scenario.scenario,
        question: scenario.question,
        answer:
          "I would align with the sponsor on priorities, publish a decision log, and set a weekly checkpoint to re-validate scope changes against team capacity.",
      });
      expect(grading.score).toBeGreaterThan(0);
      expect(grading.score).toBeLessThanOrEqual(100);
      expect(grading.feedback.length).toBeGreaterThan(10);
      console.log("GRADE MODEL:", grading.model);
      console.log("GRADE SCORE:", grading.score);
      console.log("FEEDBACK:", grading.feedback.slice(0, 160));

      const quiz = await generateQuiz(client, { competency, count: 5 });
      expect(quiz.questions.length).toBeGreaterThan(0);
      expect(quiz.questions[0].options.length).toBeGreaterThanOrEqual(2);
      console.log("QUIZ MODEL:", quiz.model);
      console.log("QUIZ TOKENS:", quiz.tokensUsed);
      console.log("QUIZ Q1:", quiz.questions[0].question.slice(0, 140));
    },
    240_000
  );
});
