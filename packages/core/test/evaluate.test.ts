import { describe, expect, it, vi } from "vitest";
import {
  OpenRouterClient,
  OpenRouterError,
  getEnv,
  mapResumeToScores,
  modelFor,
  parseJsonContent,
  type DimensionScores,
  type Rubric,
} from "@tpmforge/core";

const ENV = {
  OPENROUTER_API_KEY: "sk-test",
  OPENROUTER_BASE_URL: "https://openrouter.ai/api/v1",
  OPENROUTER_SITE_URL: "https://example.com",
  OPENROUTER_SITE_NAME: "TPMForge",
} as unknown as NodeJS.ProcessEnv;

function mockFetch(handler: (init: RequestInit) => { status: number; body: unknown }) {
  return vi.fn(async (_url: unknown, init?: RequestInit) => {
    const { status, body } = handler(init ?? {});
    return new Response(JSON.stringify(body), {
      status,
      headers: { "Content-Type": "application/json" },
    });
  });
}

describe("model routing config", () => {
  it("uses free OpenRouter models for evaluation roles", () => {
    expect(modelFor("grading").id).toBe("openai/gpt-oss-20b:free");
    expect(modelFor("resume_mapping").id).toBe("nvidia/nemotron-3-super-120b-a12b:free");
    expect(modelFor("grading").fallback).toContain("google/gemma-4-31b-it:free");
  });

  it("respects per-role model overrides from the environment", () => {
    const env = getEnv({
      ...ENV,
      OPENROUTER_MODEL_GRADING: "custom/model:free",
    });
    const client = new OpenRouterClient({ env });
    expect(client.modelIdFor("grading")).toBe("custom/model:free");
    expect(client.modelIdFor("resume_mapping")).toBe(
      modelFor("resume_mapping").id
    );
  });

  it("defaults base URL and reads the API key", () => {
    const env = getEnv(ENV);
    expect(env.apiKey).toBe("sk-test");
    expect(env.baseUrl).toBe("https://openrouter.ai/api/v1");
  });
});

describe("OpenRouterClient", () => {
  it("throws when no API key is configured", async () => {
    const client = new OpenRouterClient({ env: { ...getEnv(ENV), apiKey: "" } });
    await expect(
      client.complete({ modelId: "a", messages: [{ role: "user", content: "hi" }] })
    ).rejects.toThrow("OPENROUTER_API_KEY");
  });

  it("sends JSON mode and parses a completion", async () => {
    const fetchImpl = mockFetch(() => ({
      status: 200,
      body: {
        choices: [{ message: { content: '{"knowledge": 70}' } }],
        usage: { total_tokens: 42 },
      },
    }));
    const client = new OpenRouterClient({
      env: getEnv(ENV),
      fetchImpl: fetchImpl as unknown as typeof fetch,
    });

    const result = await client.complete({
      modelId: "m",
      messages: [{ role: "user", content: "x" }],
      jsonMode: true,
    });

    expect(result.content).toBe('{"knowledge": 70}');
    expect(result.model).toBe("m");
    expect(result.tokensUsed).toBe(42);

    const sent = JSON.parse((fetchImpl.mock.calls[0][1] as RequestInit).body as string);
    expect(sent.model).toBe("m");
    expect(sent.response_format).toEqual({ type: "json_object" });
  });

  it("falls back to the next model on 429 rate limits", async () => {
    const calls: string[] = [];
    const fetchImpl = vi.fn(async (_url: unknown, init?: RequestInit) => {
      const model = JSON.parse((init as RequestInit).body as string).model;
      calls.push(model);
      if (model === "m") {
        return new Response(JSON.stringify({ error: { message: "rate limited" } }), { status: 429 });
      }
      return new Response(
        JSON.stringify({ choices: [{ message: { content: "ok" } }], usage: { total_tokens: 1 } }),
        { status: 200 }
      );
    });

    const client = new OpenRouterClient({
      env: getEnv(ENV),
      fetchImpl: fetchImpl as unknown as typeof fetch,
    });

    const result = await client.complete({ modelId: "m", fallback: ["m2"], messages: [{ role: "user", content: "x" }] });
    expect(result.model).toBe("m2");
    expect(calls).toEqual(["m", "m2"]);
  });

  it("fails fast on non-retryable errors (400)", async () => {
    const fetchImpl = mockFetch(() => ({
      status: 400,
      body: { error: { message: "bad request" } },
    }));
    const client = new OpenRouterClient({
      env: getEnv(ENV),
      fetchImpl: fetchImpl as unknown as typeof fetch,
    });
    await expect(
      client.complete({ modelId: "m", fallback: ["m2"], messages: [{ role: "user", content: "x" }] })
    ).rejects.toBeInstanceOf(OpenRouterError);
  });

  it("opens the circuit breaker after repeated 429s and skips the broken model", async () => {
    let calls = 0;
    const fetchImpl = vi.fn(async (_url: unknown, init?: RequestInit) => {
      calls += 1;
      const model = JSON.parse((init as RequestInit).body as string).model;
      if (model === "broken") {
        return new Response(JSON.stringify({ error: { message: "rate limited" } }), { status: 429 });
      }
      return new Response(
        JSON.stringify({ choices: [{ message: { content: "ok" } }], usage: { total_tokens: 1 } }),
        { status: 200 }
      );
    });

    const client = new OpenRouterClient({
      env: getEnv(ENV),
      fetchImpl: fetchImpl as unknown as typeof fetch,
    });

    for (let i = 0; i < 6; i++) {
      await client.complete({ modelId: "broken", fallback: ["good"], messages: [{ role: "user", content: "x" }] });
    }
    expect(calls).toBe(11); // 5 broken attempts, then breaker open
    await client.complete({ modelId: "broken", fallback: ["good"], messages: [{ role: "user", content: "x" }] });
    expect(calls).toBe(12); // only the good model, breaker skipped
  });
});

describe("evaluate / parse helpers", () => {
  const rubric: Rubric = {
    id: "r1",
    competencyId: "TECH-API-REST-001",
    dimension: "knowledge",
    levels: [
      { score: 0, descriptor: "No knowledge", examples: [] },
      { score: 100, descriptor: "Deep expert", examples: [] },
    ],
  };

  it("parses JSON with code fences", () => {
    expect(parseJsonContent('```json\n{"a": 1}\n```')).toEqual({ a: 1 });
    expect(parseJsonContent('{"b": 2}')).toEqual({ b: 2 });
    expect(parseJsonContent("nope")).toBeNull();
  });

  it("scores an answer via the free grading model", async () => {
    const fetchImpl = mockFetch(() => ({
      status: 200,
      body: {
        choices: [{ message: { content: '{"knowledge": 75}' } }],
        usage: { total_tokens: 10 },
      },
    }));
    const client = new OpenRouterClient({
      env: getEnv(ENV),
      fetchImpl: fetchImpl as unknown as typeof fetch,
    });

    const result = await evaluateAnswerViaImport(client, rubric);
    expect(result.scores.knowledge).toBe(75);
    expect(result.model).toBe(modelFor("grading").id);
  });

  it("clamps out-of-range scores returned by the model", async () => {
    const fetchImpl = mockFetch(() => ({
      status: 200,
      body: {
        choices: [{ message: { content: '{"knowledge": 150}' } }],
        usage: { total_tokens: 10 },
      },
    }));
    const client = new OpenRouterClient({
      env: getEnv(ENV),
      fetchImpl: fetchImpl as unknown as typeof fetch,
    });

    const result = await evaluateAnswerViaImport(client, rubric);
    expect(result.scores.knowledge).toBe(100);
  });

  it("maps resume text to competency scores", async () => {
    const fetchImpl = mockFetch(() => ({
      status: 200,
      body: {
        choices: [
          {
            message: {
              content: JSON.stringify({
                scores: {
                  "TECH-API-REST-001": {
                    knowledge: 80,
                    understanding: 70,
                    application: 60,
                    communication: 50,
                    decision_making: 40,
                    execution: 30,
                  },
                },
              }),
            },
          },
        ],
        usage: { total_tokens: 20 },
      },
    }));
    const client = new OpenRouterClient({
      env: getEnv(ENV),
      fetchImpl: fetchImpl as unknown as typeof fetch,
    });

    const result = await mapResumeToScores(client, {
      resumeText: "5 years building REST APIs.",
      competencies: [
        {
          id: "TECH-API-REST-001",
          title: "REST API Design",
          description: "Resource-oriented APIs",
        },
      ],
    });

    const scores = result.scores["TECH-API-REST-001"] as Partial<DimensionScores>;
    expect(scores.knowledge).toBe(80);
    expect(scores.application).toBe(60);
    expect(result.model).toBe(modelFor("resume_mapping").id);
  });
});

import { evaluateAnswer } from "@tpmforge/core";

async function evaluateAnswerViaImport(client: OpenRouterClient, rubric: Rubric) {
  return evaluateAnswer(client, {
    question: "What is idempotency?",
    answer: "A request that can be retried safely.",
    rubric,
  });
}
