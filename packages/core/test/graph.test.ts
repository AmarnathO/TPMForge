import { describe, expect, it } from "vitest";
import {
  collectPrerequisites,
  getLearningOrder,
  getPublishedCompetencies,
  seedGraph,
  topoSort,
  validateGraph,
  type CompetencyGraph,
} from "@tpmforge/core";

function expectOrderRespectsPrereqs(order: string[]): void {
  const positions = new Map(order.map((id, i) => [id, i]));
  for (const id of order) {
    const node = seedGraph.competencies[id];
    for (const prereq of node.prerequisites) {
      expect(positions.get(prereq) ?? -1, `${prereq} before ${id}`).toBeLessThan(
        positions.get(id)!
      );
    }
  }
}

describe("graph traversal", () => {
  it("collects prerequisites transitively", () => {
    const set = collectPrerequisites(seedGraph, "PROG-PLAN-QUARTERLY-001");
    expect(set.has("PROG-PLAN-ROADMAP-001")).toBe(true);
    expect(set.has("PROD-ROADMAP-PRIORITIZATION-001")).toBe(true);
    expect(set.has("PROD-METRICS-001")).toBe(true);
    expect(set.has("LEAD-INFLUENCE-001")).toBe(true);
    expect(set.has("COMM-PRESENT-001")).toBe(true);
  });

  it("topologically sorts prerequisites before dependents", () => {
    const order = topoSort(seedGraph, Object.keys(seedGraph.competencies));
    expect(order).toHaveLength(Object.keys(seedGraph.competencies).length);
    expectOrderRespectsPrereqs(order);
  });

  it("produces a stable ordering", () => {
    const a = topoSort(seedGraph, Object.keys(seedGraph.competencies));
    const b = topoSort(seedGraph, Object.keys(seedGraph.competencies));
    expect(a).toEqual(b);
  });

  it("computes a learning order that excludes completed competencies", () => {
    const order = getLearningOrder(
      seedGraph,
      ["PROG-PLAN-QUARTERLY-001"],
      ["TECH-NET-HTTP-001", "COMM-STORY-001"]
    );
    const ids = order.map((c) => c.id);
    expect(ids).not.toContain("TECH-NET-HTTP-001");
    expect(ids).not.toContain("COMM-STORY-001");
    expect(ids[ids.length - 1]).toBe("PROG-PLAN-QUARTERLY-001");
    expectOrderRespectsPrereqs(ids);
  });

  it("starts from foundations for a target with no completed work", () => {
    const order = getLearningOrder(seedGraph, ["LEAD-COMM-EXECUTIVE-001"]);
    const first = order[0].id;
    const firstNode = seedGraph.competencies[first];
    expect(firstNode.prerequisites).toHaveLength(0);
  });

  it("detects missing prerequisites and self-references", () => {
    const broken: CompetencyGraph = {
      categories: seedGraph.categories,
      domains: seedGraph.domains,
      competencies: {
        A: {
          ...seedGraph.competencies["TECH-NET-HTTP-001"],
          id: "A",
          slug: "a",
          title: "A",
          prerequisites: ["MISSING", "A"],
        },
      },
    };
    const errors = validateGraph(broken);
    const types = errors.map((e) => e.type);
    expect(types).toContain("missing_prereq");
    expect(types).toContain("self_prereq");
  });

  it("validates a clean graph with no errors", () => {
    expect(validateGraph(seedGraph)).toEqual([]);
  });

  it("detects domains referencing a missing category", () => {
    const broken: CompetencyGraph = {
      categories: {},
      domains: {
        ...seedGraph.domains,
        "DOM-ORPHAN": {
          id: "DOM-ORPHAN",
          name: "Orphan",
          description: "",
          categoryId: "CAT-NOPE",
        },
      },
      competencies: {
        ...seedGraph.competencies,
        C: {
          ...seedGraph.competencies["TECH-NET-HTTP-001"],
          id: "C",
          slug: "c",
          title: "C",
          domainId: "DOM-ORPHAN",
        },
      },
    };
    const errors = validateGraph(broken);
    expect(errors.some((e) => e.type === "bad_domain")).toBe(true);
  });

  it("exposes only published competencies", () => {
    const published = getPublishedCompetencies(seedGraph);
    expect(published.every((c) => c.status === "published")).toBe(true);
    expect(published.length).toBe(Object.keys(seedGraph.competencies).length);
  });

  it("handles cycles by returning a partial order", () => {
    const cyclic: CompetencyGraph = {
      categories: seedGraph.categories,
      domains: seedGraph.domains,
      competencies: {
        X: { ...seedGraph.competencies["TECH-NET-HTTP-001"], id: "X", slug: "x", title: "X", prerequisites: ["Y"] },
        Y: { ...seedGraph.competencies["TECH-NET-HTTP-001"], id: "Y", slug: "y", title: "Y", prerequisites: ["X"] },
      },
    };
    const order = topoSort(cyclic, ["X", "Y"]);
    expect(order.length).toBeLessThan(2);
  });
});
