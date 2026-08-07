export type Dimension =
  | "knowledge"
  | "understanding"
  | "application"
  | "communication"
  | "decision_making"
  | "execution";

export const DIMENSIONS: Dimension[] = [
  "knowledge",
  "understanding",
  "application",
  "communication",
  "decision_making",
  "execution",
];

export type DimensionScores = Record<Dimension, number>;

export type Difficulty = "beginner" | "intermediate" | "advanced" | "expert";

export type CompetencyStatus = "draft" | "review" | "published" | "archived";

export interface Category {
  id: string;
  name: string;
  description: string;
}

export interface Domain {
  id: string;
  name: string;
  description: string;
  categoryId: string;
}

export interface Competency {
  id: string;
  slug: string;
  title: string;
  description: string;
  categoryId: string;
  domainId: string;
  parentId?: string;
  level: 1 | 2 | 3 | 4 | 5;
  difficulty: Difficulty;
  importance: 1 | 2 | 3 | 4 | 5;
  estimatedStudyHours: number;
  prerequisites: string[];
  status: CompetencyStatus;
}

export interface RubricLevel {
  score: 0 | 25 | 50 | 75 | 100;
  descriptor: string;
  examples: string[];
}

export interface Rubric {
  id: string;
  competencyId: string;
  dimension: Dimension;
  levels: RubricLevel[];
}

export interface CompetencyGraph {
  categories: Record<string, Category>;
  domains: Record<string, Domain>;
  competencies: Record<string, Competency>;
}

export function isCompetencyGraph(value: unknown): value is CompetencyGraph {
  if (typeof value !== "object" || value === null) return false;
  const v = value as Record<string, unknown>;
  return (
    typeof v.categories === "object" &&
    v.categories !== null &&
    typeof v.domains === "object" &&
    v.domains !== null &&
    typeof v.competencies === "object" &&
    v.competencies !== null
  );
}
