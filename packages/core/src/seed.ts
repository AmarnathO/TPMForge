import type { Category, Competency, CompetencyGraph, Domain } from "./types";

const categories: Category[] = [
  { id: "CAT-TECH", name: "Technology", description: "CS fundamentals, infrastructure, tools" },
  { id: "CAT-PROD", name: "Product", description: "Strategy, discovery, roadmap, metrics" },
  { id: "CAT-BIZ", name: "Business", description: "Finance, strategy, unit economics" },
  { id: "CAT-PROG", name: "Program Management", description: "Planning, governance, dependencies, release" },
  { id: "CAT-LEAD", name: "Leadership", description: "Communication, influence, hiring, coaching" },
  { id: "CAT-COMM", name: "Communication", description: "Storytelling, presentations, documentation" },
];

const domains: Domain[] = [
  { id: "DOM-NET", name: "Networking", description: "Network protocols", categoryId: "CAT-TECH" },
  { id: "DOM-API", name: "APIs & Protocols", description: "API design and contracts", categoryId: "CAT-TECH" },
  { id: "DOM-DB", name: "Databases", description: "Relational data modeling", categoryId: "CAT-TECH" },
  { id: "DOM-METRICS", name: "Product Metrics", description: "Measurement and analysis", categoryId: "CAT-PROD" },
  { id: "DOM-DISCOVERY", name: "Discovery & Research", description: "User research and validation", categoryId: "CAT-PROD" },
  { id: "DOM-ROADMAP", name: "Roadmapping", description: "Prioritization and roadmaps", categoryId: "CAT-PROD" },
  { id: "DOM-UNIT", name: "Unit Economics", description: "Costs, revenue, margins", categoryId: "CAT-BIZ" },
  { id: "DOM-PLAN", name: "Planning & Estimation", description: "Capacity and quarterly planning", categoryId: "CAT-PROG" },
  { id: "DOM-DEP", name: "Dependency Management", description: "Cross-team dependencies", categoryId: "CAT-PROG" },
  { id: "DOM-EXEC-COMM", name: "Executive Communication", description: "Executive-facing updates", categoryId: "CAT-LEAD" },
  { id: "DOM-INFLUENCE", name: "Influence Without Authority", description: "Stakeholder influence", categoryId: "CAT-LEAD" },
  { id: "DOM-STORY", name: "Storytelling", description: "Narrative and persuasion", categoryId: "CAT-COMM" },
  { id: "DOM-PRESENT", name: "Presentations", description: "Slides and delivery", categoryId: "CAT-COMM" },
];

const c = (
  id: string,
  slug: string,
  title: string,
  description: string,
  categoryId: string,
  domainId: string,
  level: 1 | 2 | 3 | 4 | 5,
  difficulty: Competency["difficulty"],
  importance: 1 | 2 | 3 | 4 | 5,
  estimatedStudyHours: number,
  prerequisites: string[],
  status: Competency["status"] = "published"
): Competency => ({
  id,
  slug,
  title,
  description,
  categoryId,
  domainId,
  level,
  difficulty,
  importance,
  estimatedStudyHours,
  prerequisites,
  status,
});

export const seedCompetencies: Competency[] = [
  // --- Technology ---
  c("TECH-NET-HTTP-001", "http-basics", "HTTP Basics",
    "Methods, status codes, headers, caching, and how the web works end-to-end.",
    "CAT-TECH", "DOM-NET", 2, "beginner", 3, 3, []),
  c("TECH-API-FUND-001", "api-fundamentals", "API Fundamentals",
    "What APIs are, resource modeling, and interface contracts.",
    "CAT-TECH", "DOM-API", 2, "beginner", 4, 4, ["TECH-NET-HTTP-001"]),
  c("TECH-API-REST-001", "rest-api-design", "REST API Design",
    "Resource-oriented APIs, versioning, error handling, pagination, auth, OpenAPI docs.",
    "CAT-TECH", "DOM-API", 3, "intermediate", 5, 8, ["TECH-NET-HTTP-001", "TECH-API-FUND-001"]),
  c("TECH-DB-SQL-001", "sql-basics", "SQL Basics",
    "SELECT, WHERE, JOINs, aggregations, and writing correct queries.",
    "CAT-TECH", "DOM-DB", 2, "beginner", 3, 5, []),
  c("TECH-DB-SQL-002", "schema-design", "Schema Design",
    "Normalization, keys, and modeling relational data.",
    "CAT-TECH", "DOM-DB", 3, "intermediate", 4, 6, ["TECH-DB-SQL-001"]),
  c("TECH-DB-SQL-003", "sql-query-optimization", "SQL Joins & Query Optimization",
    "Complex joins, query plans, indexes, transaction isolation, and slow-query tuning.",
    "CAT-TECH", "DOM-DB", 3, "intermediate", 4, 10, ["TECH-DB-SQL-001", "TECH-DB-SQL-002"]),

  // --- Product ---
  c("PROD-METRICS-001", "product-metrics", "Product Metrics",
    "North-star metrics, funnels, and picking the right measure.",
    "CAT-PROD", "DOM-METRICS", 3, "intermediate", 4, 5, []),
  c("PROD-DISCOVERY-001", "discovery-research", "Discovery & Research",
    "Customer interviews, validation, and turning insights into requirements.",
    "CAT-PROD", "DOM-DISCOVERY", 3, "intermediate", 4, 6, []),
  c("BIZ-UNIT-ECON-001", "unit-economics", "Unit Economics",
    "CAC, LTV, margin, and how features move the business.",
    "CAT-BIZ", "DOM-UNIT", 3, "intermediate", 4, 5, []),
  c("PROD-ROADMAP-PRIORITIZATION-001", "roadmap-prioritization", "Roadmap Prioritization Frameworks",
    "RICE/WSJF/ICE, balancing quick wins vs strategic bets, communicating rationale.",
    "CAT-PROD", "DOM-ROADMAP", 3, "intermediate", 5, 6, ["PROD-METRICS-001", "PROD-DISCOVERY-001", "BIZ-UNIT-ECON-001"]),

  // --- Program Management ---
  c("PROG-PLAN-ROADMAP-001", "roadmap-planning-basics", "Roadmap & Planning Basics",
    "Turning strategy into a credible, sequenced plan.",
    "CAT-PROG", "DOM-PLAN", 3, "intermediate", 5, 6, ["PROD-ROADMAP-PRIORITIZATION-001"]),
  c("PROG-DEP-MGMT-001", "dependency-management", "Dependency Management",
    "Mapping cross-team dependencies and unblocking delivery.",
    "CAT-PROG", "DOM-DEP", 3, "intermediate", 4, 5, []),
  c("PROG-PLAN-QUARTERLY-001", "quarterly-planning-capacity", "Quarterly Planning & Capacity",
    "Capacity modeling, scope negotiation, OKRs, dependency graphs, exec sign-off.",
    "CAT-PROG", "DOM-PLAN", 4, "advanced", 5, 12, ["PROG-PLAN-ROADMAP-001", "PROG-DEP-MGMT-001", "LEAD-INFLUENCE-001"]),

  // --- Communication ---
  c("COMM-STORY-001", "storytelling", "Storytelling",
    "Building narratives that make technical work land with non-technical audiences.",
    "CAT-COMM", "DOM-STORY", 3, "intermediate", 3, 3, []),
  c("COMM-PRESENT-001", "presentations", "Presentations",
    "Structuring decks and delivering with clarity and confidence.",
    "CAT-COMM", "DOM-PRESENT", 3, "intermediate", 4, 4, ["COMM-STORY-001"]),

  // --- Leadership ---
  c("LEAD-INFLUENCE-001", "influence-without-authority", "Influence Without Authority",
    "Getting buy-in from stakeholders you don't manage.",
    "CAT-LEAD", "DOM-INFLUENCE", 4, "advanced", 5, 6, ["COMM-PRESENT-001"]),
  c("LEAD-COMM-EXECUTIVE-001", "executive-communication", "Executive Communication",
    "Translating status to business impact, exec updates, Q&A under pressure, presence.",
    "CAT-LEAD", "DOM-EXEC-COMM", 4, "advanced", 5, 8, ["COMM-STORY-001", "COMM-PRESENT-001", "BIZ-UNIT-ECON-001"]),
];

export function buildGraph(): CompetencyGraph {
  const categoryMap: Record<string, Category> = {};
  for (const cat of categories) categoryMap[cat.id] = cat;

  const domainMap: Record<string, Domain> = {};
  for (const domain of domains) domainMap[domain.id] = domain;

  const competencyMap: Record<string, Competency> = {};
  for (const comp of seedCompetencies) competencyMap[comp.id] = comp;

  return {
    categories: categoryMap,
    domains: domainMap,
    competencies: competencyMap,
  };
}

export const seedGraph: CompetencyGraph = buildGraph();
