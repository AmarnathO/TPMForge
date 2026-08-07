import type { ModelRole } from "./models";

export interface LLMEnv {
  apiKey: string;
  baseUrl: string;
  siteUrl: string;
  siteName: string;
  modelOverrides: Partial<Record<ModelRole, string>>;
}

const ROLE_ENV_MAP: Record<ModelRole, string> = {
  grading: "OPENROUTER_MODEL_GRADING",
  resume_mapping: "OPENROUTER_MODEL_RESUME_MAPPING",
  coach_chat: "OPENROUTER_MODEL_COACH_CHAT",
  content_generation: "OPENROUTER_MODEL_CONTENT_GENERATION",
  embeddings: "OPENROUTER_MODEL_EMBEDDINGS",
};

/**
 * Read OpenRouter configuration from the environment. No framework imports —
 * works in Next.js server code, node scripts, and CI.
 */
export function getEnv(source: NodeJS.ProcessEnv = process.env): LLMEnv {
  const modelOverrides: Partial<Record<ModelRole, string>> = {};
  for (const [role, envName] of Object.entries(ROLE_ENV_MAP)) {
    const value = source[envName];
    if (value && value.trim().length > 0) {
      modelOverrides[role as ModelRole] = value.trim();
    }
  }

  return {
    apiKey: source.OPENROUTER_API_KEY ?? "",
    baseUrl:
      (source.OPENROUTER_BASE_URL ?? "https://openrouter.ai/api/v1").replace(
        /\/+$/,
        ""
      ),
    siteUrl: source.OPENROUTER_SITE_URL ?? "http://localhost:3000",
    siteName: source.OPENROUTER_SITE_NAME ?? "TPMForge",
    modelOverrides,
  };
}
