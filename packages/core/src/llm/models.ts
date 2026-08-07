export type ModelRole =
  | "resume_mapping"
  | "coach_chat"
  | "grading"
  | "content_generation"
  | "embeddings";

export interface ModelConfig {
  id: string;
  fallback: string[];
  purpose: string;
  maxTokens: number;
  jsonMode: boolean;
  temperature: number;
}

/**
 * OpenRouter free-tier model routing. Centralized config so swapping a
 * delisted free model is a one-line change, not a deploy-wide refactor.
 */
export const MODELS: Record<ModelRole, ModelConfig> = {
  resume_mapping: {
    id: "nvidia/nemotron-3-super-120b-a12b:free",
    fallback: ["poolside/laguna-s-2.1:free", "google/gemma-4-31b-it:free", "openrouter/free"],
    purpose: "Resume text → competency scores",
    maxTokens: 2000,
    jsonMode: true,
    temperature: 0.2,
  },
  coach_chat: {
    id: "nvidia/nemotron-3-ultra-550b-a55b:free",
    fallback: ["google/gemma-4-31b-it:free", "openrouter/free"],
    purpose: "RAG-grounded Coach responses",
    maxTokens: 1000,
    jsonMode: false,
    temperature: 0.4,
  },
  grading: {
    id: "openai/gpt-oss-20b:free",
    fallback: ["google/gemma-4-31b-it:free", "openrouter/free"],
    purpose: "Open-text → rubric dimension scores",
    maxTokens: 1500,
    jsonMode: true,
    temperature: 0.1,
  },
  content_generation: {
    id: "nvidia/nemotron-3-ultra-550b-a55b:free",
    fallback: ["openrouter/free"],
    purpose: "Batch generate questions/cases/projects (offline only)",
    maxTokens: 4000,
    jsonMode: true,
    temperature: 0.8,
  },
  embeddings: {
    id: "nvidia/nemotron-3-embed-1b:free",
    fallback: [],
    purpose: "Asset + blog chunk embedding → pgvector",
    maxTokens: 1000,
    jsonMode: false,
    temperature: 0,
  },
};

export function modelFor(role: ModelRole): ModelConfig {
  return MODELS[role];
}
