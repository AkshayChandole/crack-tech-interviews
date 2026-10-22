import { describe, expect, it } from "vitest";

import { lessonFrontmatter } from "@/lib/content/schema";

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

function issuePaths(input: unknown): string[] {
  const result = lessonFrontmatter.safeParse(input);
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
      const { [field as keyof typeof validLesson]: _, ...rest } = validLesson;
      expect(issuePaths(rest)).toContain(field);
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
    expect(issuePaths({ ...validLesson, [field]: value })).toContain(field);
  });

  it("rejects an empty seniority list", () => {
    expect(issuePaths({ ...validLesson, seniority: [] })).toContain(
      "seniority",
    );
  });

  it("rejects non-slug references", () => {
    expect(
      issuePaths({ ...validLesson, prerequisites: ["Consistent Hashing"] }),
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
