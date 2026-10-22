import { describe, expect, it } from "vitest";

import {
  categorySchema,
  conceptFrontmatter,
  lessonFrontmatter,
  moduleSchema,
  pathSchema,
  problemFrontmatter,
} from "@/lib/content/schema";

const validLesson = {
  id: "load-balancing",
  title: "Load Balancing",
  summary: "How to spread traffic across servers.",
  category: "system-design",
  module: "foundations",
  type: "lesson",
  kind: "building-block",
  difficulty: "foundational",
  seniority: ["senior", "staff"],
  status: "draft",
  authors: ["akshay"],
  updated: "2026-10-23",
};

// Structural type so the helper accepts any of the schemas under test.
type Schema = {
  safeParse(
    input: unknown,
  ):
    | { success: true }
    | { success: false; error: { issues: { path: (string | number)[] }[] } };
};

function issuePaths(schema: Schema, input: unknown): string[] {
  const result = schema.safeParse(input);
  return result.success
    ? []
    : result.error.issues.map((issue) => issue.path.join("."));
}

describe("lessonFrontmatter", () => {
  it("accepts a valid lesson and defaults the optional lists", () => {
    const lesson = lessonFrontmatter.parse(validLesson);
    expect(lesson.prerequisites).toEqual([]);
    expect(lesson.related).toEqual([]);
    expect(lesson.concepts).toEqual([]);
    expect(lesson.tags).toEqual([]);
  });

  it("accepts an optional review block", () => {
    const reviewed = {
      ...validLesson,
      review: { by: "akshay", date: "2026-10-23" },
    };
    expect(lessonFrontmatter.safeParse(reviewed).success).toBe(true);
  });

  it.each(["id", "title", "summary", "module", "kind", "updated"])(
    "requires %s",
    (field) => {
      const lesson: Record<string, unknown> = { ...validLesson };
      delete lesson[field];
      expect(issuePaths(lessonFrontmatter, lesson)).toContain(field);
    },
  );

  it.each([
    ["id", "Load_Balancing"],
    ["module", "Foundations"],
    ["category", "frontend"],
    ["kind", "tutorial"],
    ["difficulty", "easy"],
    ["status", "done"],
    ["type", "problem"],
    ["updated", "23/10/2026"],
  ])("rejects an invalid %s (%s)", (field, value) => {
    expect(
      issuePaths(lessonFrontmatter, { ...validLesson, [field]: value }),
    ).toContain(field);
  });

  it("rejects an empty seniority list", () => {
    expect(
      issuePaths(lessonFrontmatter, { ...validLesson, seniority: [] }),
    ).toContain("seniority");
  });

  it("rejects non-slug references", () => {
    expect(
      issuePaths(lessonFrontmatter, {
        ...validLesson,
        prerequisites: ["Consistent Hashing"],
      }),
    ).toContain("prerequisites.0");
  });

  // Catches typos such as "prerequisite" that would otherwise be dropped.
  it("rejects unknown fields", () => {
    const result = lessonFrontmatter.safeParse({
      ...validLesson,
      prerequisite: ["replication"],
    });
    expect(result.success).toBe(false);
  });
});

const validProblem = {
  id: "url-shortener",
  title: "Design a URL Shortener",
  summary: "Design a service that creates short links.",
  category: "system-design",
  type: "problem",
  difficulty: "foundational",
  seniority: ["senior"],
  estimatedInterviewTime: 45,
  focusAreas: ["hashing", "caching"],
  status: "draft",
  authors: ["akshay"],
  updated: "2026-10-23",
};

describe("problemFrontmatter", () => {
  it("accepts a valid problem and defaults companies", () => {
    expect(problemFrontmatter.parse(validProblem).companies).toEqual([]);
  });

  it("does not take a module (problems are listed on the category)", () => {
    expect(
      problemFrontmatter.safeParse({ ...validProblem, module: "foundations" })
        .success,
    ).toBe(false);
  });

  it.each([
    ["estimatedInterviewTime", 10],
    ["estimatedInterviewTime", 45.5],
    ["focusAreas", []],
    ["type", "lesson"],
  ])("rejects an invalid %s (%j)", (field, value) => {
    expect(
      issuePaths(problemFrontmatter, { ...validProblem, [field]: value }),
    ).toContain(field);
  });
});

const validConcept = {
  id: "health-check",
  term: "Health check",
  definition: "A periodic probe that decides whether a server gets traffic.",
};

describe("conceptFrontmatter", () => {
  it("accepts a concept without a lesson and defaults aliases", () => {
    const concept = conceptFrontmatter.parse(validConcept);
    expect(concept.aliases).toEqual([]);
    expect(concept.lesson).toBeUndefined();
  });

  it.each([
    ["definition", ""],
    ["definition", "x".repeat(401)],
    ["lesson", "Load Balancing"],
  ])("rejects an invalid %s", (field, value) => {
    expect(
      issuePaths(conceptFrontmatter, { ...validConcept, [field]: value }),
    ).toContain(field);
  });
});

const validPath = {
  id: "staff-loop-4-weeks",
  title: "Staff loop in 4 weeks",
  audience: "Staff candidates",
  description: "A focused journey.",
  groups: [{ title: "Week 1", items: ["load-balancing"] }],
};

describe("pathSchema", () => {
  it("accepts a valid path", () => {
    expect(pathSchema.safeParse(validPath).success).toBe(true);
  });

  it("requires at least one group, each with at least one item", () => {
    expect(issuePaths(pathSchema, { ...validPath, groups: [] })).toContain(
      "groups",
    );
    expect(
      issuePaths(pathSchema, {
        ...validPath,
        groups: [{ title: "Week 1", items: [] }],
      }),
    ).toContain("groups.0.items");
  });
});

describe("moduleSchema", () => {
  const validModule = {
    id: "foundations",
    category: "system-design",
    title: "Foundations",
    summary: "The building blocks.",
    items: ["load-balancing"],
  };

  it("accepts a valid module", () => {
    expect(moduleSchema.safeParse(validModule).success).toBe(true);
  });

  it("requires at least one item", () => {
    expect(issuePaths(moduleSchema, { ...validModule, items: [] })).toContain(
      "items",
    );
  });
});

describe("categorySchema", () => {
  const validCategory = {
    id: "system-design",
    title: "System Design",
    summary: "Design scalable systems.",
    modules: ["foundations"],
  };

  it("accepts a valid category and defaults problems", () => {
    expect(categorySchema.parse(validCategory).problems).toEqual([]);
  });

  it("only allows known categories", () => {
    expect(
      issuePaths(categorySchema, { ...validCategory, id: "dsa" }),
    ).toContain("id");
  });
});
