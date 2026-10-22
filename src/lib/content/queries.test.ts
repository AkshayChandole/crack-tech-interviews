import { describe, expect, it } from "vitest";

import type { Concept, Lesson, Problem } from "#site/content";
import {
  type ContentSource,
  createContentQueries,
} from "@/lib/content/queries";

const base = {
  category: "system-design" as const,
  summary: "Summary.",
  difficulty: "foundational" as const,
  seniority: ["senior" as const],
  prerequisites: [] as string[],
  related: [] as string[],
  concepts: [] as string[],
  tags: [] as string[],
  status: "published" as Lesson["status"],
  authors: ["akshay"],
  review: { by: "akshay", date: "2026-10-23" },
  updated: "2026-10-23",
  toc: [],
  metadata: { readingTime: 1, wordCount: 100 },
  body: "",
};

function lesson(id: string, module: string, extra: Partial<Lesson> = {}) {
  return {
    ...base,
    id,
    title: id,
    type: "lesson",
    module,
    kind: "concept",
    ...extra,
  } satisfies Lesson;
}

function problem(id: string, extra: Partial<Problem> = {}) {
  return {
    ...base,
    id,
    title: id,
    type: "problem",
    companies: [],
    estimatedInterviewTime: 45,
    focusAreas: ["caching"],
    ...extra,
  } satisfies Problem;
}

function concept(id: string, term: string): Concept {
  return { id, term, aliases: [], definition: "Definition.", body: "" };
}

// Source arrays are deliberately out of reading order: ordering must come
// from the category and module files.
function source(): ContentSource {
  return {
    lessons: [
      lesson("sharding", "data", {
        prerequisites: ["replication"],
        concepts: ["hotspot"],
      }),
      lesson("load-balancing", "foundations"),
      lesson("replication", "data"),
      lesson("draft-lesson", "data", { status: "draft", review: undefined }),
      lesson("caching-draft", "caching", {
        status: "in-review",
        review: undefined,
      }),
    ],
    problems: [
      problem("chat", { related: ["sharding"] }),
      problem("url-shortener", { concepts: ["hotspot"] }),
      problem("draft-problem", {
        status: "draft",
        review: undefined,
        related: ["sharding"],
      }),
    ],
    concepts: [
      concept("quorum", "Quorum"),
      concept("hotspot", "Hotspot"),
      concept("cap", "CAP theorem"),
    ],
    paths: [
      {
        id: "staff",
        title: "Staff",
        audience: "Staff",
        description: "Path.",
        groups: [
          { title: "Week 1", items: ["sharding", "draft-lesson", "chat"] },
        ],
      },
    ],
    modules: [
      {
        id: "data",
        category: "system-design",
        title: "Data",
        summary: "Data.",
        items: ["replication", "draft-lesson", "sharding"],
      },
      {
        id: "caching",
        category: "system-design",
        title: "Caching",
        summary: "Caching.",
        items: ["caching-draft"],
      },
      {
        id: "foundations",
        category: "system-design",
        title: "Foundations",
        summary: "Foundations.",
        items: ["load-balancing"],
      },
    ],
    categories: [
      {
        id: "system-design",
        title: "System Design",
        summary: "System design.",
        modules: ["foundations", "data", "caching"],
        problems: ["url-shortener", "draft-problem", "chat"],
      },
    ],
  };
}

const ids = (items: { id: string }[]) => items.map((item) => item.id);

const production = createContentQueries(source(), { includeDrafts: false });
const development = createContentQueries(source(), { includeDrafts: true });

describe("ordering", () => {
  it("orders modules and lessons by the category and module files", () => {
    const tree = production.getModuleTree("system-design");
    expect(tree.map(({ module }) => module.id)).toEqual([
      "foundations",
      "data",
    ]);
    expect(ids(tree[1].lessons)).toEqual(["replication", "sharding"]);
  });

  it("orders problems by the category file", () => {
    expect(ids(production.getProblems("system-design"))).toEqual([
      "url-shortener",
      "chat",
    ]);
  });

  it("flattens lessons in reading order", () => {
    expect(ids(production.getLessons("system-design"))).toEqual([
      "load-balancing",
      "replication",
      "sharding",
    ]);
  });

  it("sorts concepts by term", () => {
    expect(production.getConcepts().map((c) => c.term)).toEqual([
      "CAP theorem",
      "Hotspot",
      "Quorum",
    ]);
  });

  it("returns nothing for an unknown category", () => {
    expect(production.getModuleTree("dsa")).toEqual([]);
    expect(production.getProblems("dsa")).toEqual([]);
  });
});

describe("draft visibility", () => {
  it("hides drafts and in-review items in production", () => {
    expect(
      production.getLesson("system-design", "draft-lesson"),
    ).toBeUndefined();
    expect(
      production.getProblem("system-design", "draft-problem"),
    ).toBeUndefined();
    expect(production.getItem("caching-draft")).toBeUndefined();
  });

  it("hides modules whose lessons are all unpublished", () => {
    const moduleIds = production
      .getModuleTree("system-design")
      .map(({ module }) => module.id);
    expect(moduleIds).not.toContain("caching");
  });

  it("shows everything when drafts are included", () => {
    expect(development.getLesson("system-design", "draft-lesson")?.id).toBe(
      "draft-lesson",
    );
    expect(
      development.getModuleTree("system-design").map(({ module }) => module.id),
    ).toEqual(["foundations", "data", "caching"]);
    expect(ids(development.getProblems("system-design"))).toEqual([
      "url-shortener",
      "draft-problem",
      "chat",
    ]);
  });
});

describe("lookups", () => {
  it("finds a lesson only in its own category", () => {
    expect(production.getLesson("system-design", "sharding")?.id).toBe(
      "sharding",
    );
    expect(production.getLesson("dsa", "sharding")).toBeUndefined();
  });

  it("does not return a problem as a lesson, or a lesson as a problem", () => {
    expect(production.getLesson("system-design", "chat")).toBeUndefined();
    expect(production.getProblem("system-design", "sharding")).toBeUndefined();
  });

  it("resolves item ids in order, dropping hidden and unknown ones", () => {
    expect(
      ids(production.getItems(["chat", "draft-lesson", "missing", "sharding"])),
    ).toEqual(["chat", "sharding"]);
  });
});

describe("getLessonNeighbors", () => {
  it("links across module boundaries", () => {
    const { previous, next } = production.getLessonNeighbors(
      "system-design",
      "replication",
    );
    expect(previous?.id).toBe("load-balancing");
    expect(next?.id).toBe("sharding");
  });

  it("has no previous for the first lesson or next for the last", () => {
    expect(
      production.getLessonNeighbors("system-design", "load-balancing").previous,
    ).toBeUndefined();
    expect(
      production.getLessonNeighbors("system-design", "sharding").next,
    ).toBeUndefined();
  });

  it("skips hidden lessons", () => {
    // draft-lesson sits between replication and sharding in the module.
    expect(
      production.getLessonNeighbors("system-design", "replication").next?.id,
    ).toBe("sharding");
    expect(
      development.getLessonNeighbors("system-design", "replication").next?.id,
    ).toBe("draft-lesson");
  });

  it("returns no neighbors for an unknown lesson", () => {
    expect(production.getLessonNeighbors("system-design", "missing")).toEqual({
      previous: undefined,
      next: undefined,
    });
  });
});

describe("backlinks", () => {
  it("lists visible items that reference an item", () => {
    expect(ids(production.getBacklinks("sharding"))).toEqual(["chat"]);
    expect(ids(development.getBacklinks("sharding"))).toEqual([
      "chat",
      "draft-problem",
    ]);
    expect(ids(production.getBacklinks("replication"))).toEqual(["sharding"]);
  });

  it("lists visible items that use a concept", () => {
    expect(ids(production.getItemsForConcept("hotspot"))).toEqual([
      "sharding",
      "url-shortener",
    ]);
  });
});

describe("getPath", () => {
  it("resolves group items and drops hidden ones", () => {
    const path = production.getPath("staff");
    expect(path?.groups[0].title).toBe("Week 1");
    expect(ids(path?.groups[0].items ?? [])).toEqual(["sharding", "chat"]);
  });

  it("returns undefined for an unknown path", () => {
    expect(production.getPath("missing")).toBeUndefined();
  });
});
