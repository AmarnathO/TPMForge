import type { Competency, CompetencyGraph } from "./types";

/**
 * Collect a competency and all of its prerequisites (transitively) as a set
 * of node IDs.
 */
export function collectPrerequisites(
  graph: CompetencyGraph,
  nodeId: string,
  acc: Set<string> = new Set()
): Set<string> {
  const node = graph.competencies[nodeId];
  if (!node) return acc;

  for (const prereq of node.prerequisites) {
    if (!acc.has(prereq)) {
      acc.add(prereq);
      collectPrerequisites(graph, prereq, acc);
    }
  }
  return acc;
}

/**
 * Kahn's algorithm topological sort over the competency graph restricted to
 * the given node IDs. Returns IDs ordered so every prerequisite precedes its
 * dependents. Detects cycles by returning fewer nodes than requested.
 */
export function topoSort(
  graph: CompetencyGraph,
  nodeIds: string[]
): string[] {
  const nodes = new Set(nodeIds);
  const inDegree = new Map<string, number>();
  const dependents = new Map<string, string[]>();

  for (const id of nodes) {
    inDegree.set(id, 0);
    dependents.set(id, []);
  }

  for (const id of nodes) {
    const node = graph.competencies[id];
    if (!node) continue;
    for (const prereq of node.prerequisites) {
      if (!nodes.has(prereq)) continue;
      inDegree.set(id, (inDegree.get(id) ?? 0) + 1);
      dependents.get(prereq)?.push(id);
    }
  }

  const queue: string[] = [];
  for (const [id, degree] of inDegree) {
    if (degree === 0) queue.push(id);
  }
  // Stable ordering (by ID) so output is deterministic.
  queue.sort();

  const order: string[] = [];
  while (queue.length > 0) {
    const current = queue.shift()!;
    order.push(current);
    for (const dependent of dependents.get(current) ?? []) {
      const next = (inDegree.get(dependent) ?? 0) - 1;
      inDegree.set(dependent, next);
      if (next === 0) queue.push(dependent);
    }
    queue.sort();
  }

  return order;
}

/**
 * The learning order for a set of target competencies: all prerequisites
 * (minus already-completed ones), topologically sorted.
 */
export function getLearningOrder(
  graph: CompetencyGraph,
  targetIds: string[],
  completedIds: string[] = []
): Competency[] {
  const completed = new Set(completedIds);
  const required = new Set<string>();

  for (const target of targetIds) {
    if (!graph.competencies[target]) continue;
    required.add(target);
    for (const prereq of collectPrerequisites(graph, target)) {
      required.add(prereq);
    }
  }

  for (const done of completed) {
    required.delete(done);
  }

  const ordered = topoSort(graph, Array.from(required));
  return ordered
    .map((id) => graph.competencies[id])
    .filter((c): c is Competency => Boolean(c));
}

export function getPublishedCompetencies(graph: CompetencyGraph): Competency[] {
  return Object.values(graph.competencies).filter(
    (c) => c.status === "published"
  );
}

export interface GraphValidationError {
  type: "missing_prereq" | "self_prereq" | "duplicate_id" | "bad_domain";
  message: string;
}

/**
 * Structural validation: every prerequisite must exist, prerequisites must
 * not reference themselves, and domains must reference an existing category.
 */
export function validateGraph(graph: CompetencyGraph): GraphValidationError[] {
  const errors: GraphValidationError[] = [];

  for (const [id, competency] of Object.entries(graph.competencies)) {
    for (const prereq of competency.prerequisites) {
      if (prereq === id) {
        errors.push({ type: "self_prereq", message: `${id} depends on itself` });
        continue;
      }
      if (!graph.competencies[prereq]) {
        errors.push({
          type: "missing_prereq",
          message: `${id} references missing prerequisite ${prereq}`,
        });
      }
    }
    const domain = graph.domains[competency.domainId];
    if (domain && !graph.categories[domain.categoryId]) {
      errors.push({
        type: "bad_domain",
        message: `${competency.domainId} references missing category ${domain.categoryId}`,
      });
    }
  }

  return errors;
}
