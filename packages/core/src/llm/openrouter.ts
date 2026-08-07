import { getEnv, type LLMEnv } from "./env";
import { modelFor, type ModelRole } from "./models";

export interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface CompletionParams {
  modelId: string;
  messages: ChatMessage[];
  maxTokens?: number;
  temperature?: number;
  jsonMode?: boolean;
  fallback?: string[];
}

export interface CompletionResult {
  content: string;
  model: string;
  tokensUsed: number;
}

export class OpenRouterError extends Error {
  constructor(
    message: string,
    public readonly status?: number,
    public readonly model?: string
  ) {
    super(message);
    this.name = "OpenRouterError";
  }
}

export interface OpenRouterOptions {
  fetchImpl?: typeof fetch;
  env?: LLMEnv;
}

interface CircuitBreakerState {
  failures: number;
  firstFailureAt: number;
  openUntil: number;
}

const BREAKER_THRESHOLD = 5;
const BREAKER_WINDOW_MS = 60_000;
const BREAKER_COOLDOWN_MS = 300_000;

/**
 * Minimal OpenRouter client with per-model fallback and circuit breaking.
 * Dependency-free (fetch only) so it runs in Next.js route handlers, Edge
 * middleware, and plain node scripts.
 */
export class OpenRouterClient {
  private readonly env: LLMEnv;
  private readonly fetchImpl: typeof fetch;
  private readonly breakers = new Map<string, CircuitBreakerState>();

  constructor(options: OpenRouterOptions = {}) {
    this.env = options.env ?? getEnv();
    this.fetchImpl = options.fetchImpl ?? fetch;
  }

  get envConfig(): LLMEnv {
    return this.env;
  }

  modelIdFor(role: ModelRole): string {
    return this.env.modelOverrides[role] ?? modelFor(role).id;
  }

  fallbacksFor(role: ModelRole): string[] {
    return modelFor(role).fallback;
  }

  async complete(params: CompletionParams): Promise<CompletionResult> {
    if (!this.env.apiKey) {
      throw new OpenRouterError(
        "OPENROUTER_API_KEY is not set",
        undefined,
        params.modelId
      );
    }

    const chain = [params.modelId, ...(params.fallback ?? [])].filter(
      (m, i, arr) => arr.indexOf(m) === i
    );

    let lastError: unknown = null;
    for (const model of chain) {
      if (this.isBreakerOpen(model)) continue;
      try {
        const result = await this.callModel(model, params);
        this.recordSuccess(model);
        return result;
      } catch (err) {
        lastError = err;
        if (err instanceof OpenRouterError) {
          this.recordFailure(model);
          if (!this.isRetryable(err.status)) throw err;
        } else {
          throw err;
        }
      }
    }

    throw new OpenRouterError(
      `All models failed for role. Last error: ${
        lastError instanceof Error ? lastError.message : String(lastError)
      }`,
      undefined,
      params.modelId
    );
  }

  private async callModel(
    model: string,
    params: CompletionParams
  ): Promise<CompletionResult> {
    const body: Record<string, unknown> = {
      model,
      messages: params.messages,
      max_tokens: params.maxTokens,
      temperature: params.temperature,
      include_reasoning: false,
    };
    if (params.jsonMode) {
      body.response_format = { type: "json_object" };
    }

    let response: Response;
    try {
      response = await this.fetchImpl(`${this.env.baseUrl}/chat/completions`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.env.apiKey}`,
          "Content-Type": "application/json",
          "HTTP-Referer": this.env.siteUrl,
          "X-Title": this.env.siteName,
        },
        body: JSON.stringify(body),
      });
    } catch (err) {
      throw new OpenRouterError(
        `Network error calling ${model}: ${(err as Error).message}`,
        undefined,
        model
      );
    }

    if (!response.ok) {
      throw new OpenRouterError(
        `OpenRouter ${response.status} for ${model}: ${await safeText(
          response
        )}`,
        response.status,
        model
      );
    }

    const data = (await response.json()) as {
      choices?: { message?: { content?: string } }[];
      usage?: { total_tokens?: number };
      error?: { message?: string };
    };

    if (data.error) {
      throw new OpenRouterError(
        `OpenRouter error for ${model}: ${data.error.message}`,
        undefined,
        model
      );
    }

    const content = data.choices?.[0]?.message?.content ?? "";
    if (!content) {
      throw new OpenRouterError(
        `Empty completion from ${model}`,
        undefined,
        model
      );
    }

    return {
      content,
      model,
      tokensUsed: data.usage?.total_tokens ?? 0,
    };
  }

  private isRetryable(status?: number): boolean {
    return status === 429 || (status !== undefined && status >= 500);
  }

  private isBreakerOpen(model: string): boolean {
    const state = this.breakers.get(model);
    if (!state || state.openUntil === 0) return false;
    if (state.openUntil < Date.now()) {
      this.breakers.delete(model);
      return false;
    }
    return true;
  }

  private recordSuccess(model: string): void {
    this.breakers.delete(model);
  }

  private recordFailure(model: string): void {
    const now = Date.now();
    const state =
      this.breakers.get(model) ?? { failures: 0, firstFailureAt: now, openUntil: 0 };
    if (now - state.firstFailureAt > BREAKER_WINDOW_MS) {
      state.failures = 0;
      state.firstFailureAt = now;
    }
    state.failures += 1;
    if (state.failures >= BREAKER_THRESHOLD) {
      state.openUntil = now + BREAKER_COOLDOWN_MS;
    }
    this.breakers.set(model, state);
  }
}

async function safeText(response: Response): Promise<string> {
  try {
    return (await response.text()).slice(0, 500);
  } catch {
    return "";
  }
}
