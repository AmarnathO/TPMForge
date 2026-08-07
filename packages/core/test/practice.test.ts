import { describe, expect, it, vi } from "vitest";
import {
  OpenRouterClient,
  generateQuiz,
  generateScenario,
  getEnv,
  gradeScenarioAnswer,
  modelFor,
  seedGraph,
} from "@tpmforge/core";

const ENV = {
  OPENROUTER_API_KEY: "sk-test",
  OPENROUTER_BASE_URL: "https://openrouter.ai/api/v1",
  OPENROUTER_SITE_URL: "https://example.com",
  OPENROUTER_SITE_NAME: "TPMForge",
} as unknown as NodeJS.ProcessEnv;

function mockFetch(content: string, totalTokens = 10) {
  return vi.fn(async () =>
    new Response(
      JSON.stringify({
        choices: [{ message: { content } }],
        usage: { total_tokens: totalTokens },
      }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    )
  );
}

function client(content: string, totalTokens?: number) {
  return new OpenRouterClient({
    env: getEnv(ENV),
    fetchImpl: mockFetch(content, totalTokens) as unknown as typeof fetch,
  });
}

const COMPETENCY = seedGraph.competencies["PROD-ROADMAP-PRIORITIZATION-001"];

describe("generateScenario", () => {
  it("returns a parsed scenario and question from the free content model", async () => {
    const result = await generateScenario(client(JSON.stringify({
      scenario: "An exec sponsor keeps injecting new asks.",
      question: "How do you protect the plan?",
    })), { competency: COMPETENCY });

    expect(result.scenario).toContain("exec sponsor");
    expect(result.question).toContain("protect the plan");
    expect(result.model).toBe(modelFor("content_generation").id);
    expect(result.tokensUsed).toBe(10);
  });

  it("throws when the model omits the scenario or question", async () => {
    await expect(
      generateScenario(client(JSON.stringify({ scenario: "only" })), {
        competency: COMPETENCY,
      })
    ).rejects.toThrow("incomplete");
  });

  it("parses JSON wrapped in code fences", async () => {
    const result = await generateScenario(
      client("```json\n{\"scenario\": \"S\", \"question\": \"Q\"}\n```"),
      { competency: COMPETENCY }
    );
    expect(result.scenario).toBe("S");
    expect(result.question).toBe("Q");
  });
});

describe("generateQuiz", () => {
  it("returns up to the requested number of valid questions", async () => {
    const questions = Array.from({ length: 5 }, (_, i) => ({
      question: `Question ${i}`,
      options: ["A", "B", "C", "D"],
      answer_index: 1,
      explanation: "Because.",
    }));
    const result = await generateQuiz(client(JSON.stringify({ questions })), {
      competency: COMPETENCY,
      count: 5,
    });

    expect(result.questions).toHaveLength(5);
    expect(result.questions[0].answerIndex).toBe(1);
    expect(result.questions[0].options).toHaveLength(4);
  });

  it("drops malformed questions and normalizes out-of-range answer indexes", async () => {
    const result = await generateQuiz(
      client(JSON.stringify({
        questions: [
          { question: "Good", options: ["A", "B"], answer_index: 1 },
          { question: "Bad options", options: [], answer_index: 0 },
          { question: "Missing stem" },
          { question: "Bad index", options: ["A", "B"], answer_index: 9 },
          { question: "Trims", options: ["  A  ", "", "B"], answer_index: 0 },
        ],
      })),
      { competency: COMPETENCY }
    );

    const ids = result.questions.map((q) => q.question);
    expect(ids).toEqual(["Good", "Bad index", "Trims"]);
    expect(result.questions.find((q) => q.question === "Bad index")?.answerIndex).toBe(0);
    expect(result.questions.find((q) => q.question === "Trims")?.options).toEqual(["  A  ", "B"]);
  });

  it("throws when no valid questions are returned", async () => {
    await expect(
      generateQuiz(client(JSON.stringify({ questions: [{ question: "x" }] })), {
        competency: COMPETENCY,
      })
    ).rejects.toThrow("no valid questions");
  });
});

describe("gradeScenarioAnswer", () => {
  it("parses score, feedback, strengths, and gaps via the free grading model", async () => {
    const result = await gradeScenarioAnswer(
      client(JSON.stringify({
        score: 78,
        feedback: "Good structure, weak follow-through.",
        strengths: ["Clear reasoning"],
        gaps: ["No retro plan"],
      })),
      {
        competency: COMPETENCY,
        scenario: "S",
        question: "Q",
        answer: "I would start by…",
      }
    );

    expect(result.score).toBe(78);
    expect(result.feedback).toContain("follow-through");
    expect(result.strengths).toEqual(["Clear reasoning"]);
    expect(result.gaps).toEqual(["No retro plan"]);
    expect(result.model).toBe(modelFor("grading").id);
  });

  it("clamps out-of-range scores", async () => {
    const result = await gradeScenarioAnswer(
      client(JSON.stringify({ score: 140, feedback: "f", strengths: [], gaps: [] })),
      { competency: COMPETENCY, scenario: "S", question: "Q", answer: "a" }
    );
    expect(result.score).toBe(100);
  });

  it("defaults gracefully when the model returns no score", async () => {
    const result = await gradeScenarioAnswer(
      client(JSON.stringify({ feedback: "f" })),
      { competency: COMPETENCY, scenario: "S", question: "Q", answer: "a" }
    );
    expect(result.score).toBe(0);
  });
});
