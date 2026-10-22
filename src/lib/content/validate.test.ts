import { describe, expect, it } from "vitest";

import {
  type ContentData,
  requiredProblemSections,
  validateContent,
} from "@/lib/content/validate";

const item = {
  category: "system-design",
  status: "draft" as const,
  prerequisites: [],
  related: [],
  concepts: [],
};

// A small, fully consistent content set; each test breaks one thing.
function validData(): ContentData {
  return {
    lessons: [
      { ...item, id: "replication", module: "data" },
      {
        ...item,
        id: "sharding",
        module: "data",
        prerequisites: ["replication"],
        concepts: ["hotspot"],
      },
    ],
    problems: [
      {
        ...item,
        id: "url-shortener",
        related: ["sharding"],
        toc: requiredProblemSections.map((title) => ({ title })),
      },
    ],
    concepts: [{ id: "hotspot", lesson: "sharding" }],
    paths: [
      { id: "staff", groups: [{ items: ["sharding", "url-shortener"] }] },
    ],
    modules: [
      {
        id: "data",
        category: "system-design",
        items: ["replication", "sharding"],
      },
    ],
    categories: [
      { id: "system-design", modules: ["data"], problems: ["url-shortener"] },
    ],
  };
}

describe("validateContent", () => {
  it("accepts consistent content", () => {
    expect(validateContent(validData())).toEqual([]);
  });

  describe("unique ids", () => {
    it("rejects a lesson and a problem sharing an id", () => {
      const data = validData();
      data.problems[0].id = "sharding";
      expect(validateContent(data)).toContain(
        'Duplicate lesson/problem id "sharding"',
      );
    });

    it("rejects duplicate concept ids", () => {
      const data = validData();
      data.concepts.push({ id: "hotspot" });
      expect(validateContent(data)).toContain('Duplicate concept id "hotspot"');
    });
  });

  describe("references", () => {
    it.each([
      [
        "prerequisites",
        (d: ContentData) => d.lessons[1].prerequisites.push("caching"),
        'lesson "sharding": prerequisites entry "caching" does not exist',
      ],
      [
        "related",
        (d: ContentData) => d.problems[0].related.push("rate-limiter"),
        'problem "url-shortener": related entry "rate-limiter" does not exist',
      ],
      [
        "concepts",
        (d: ContentData) => d.lessons[1].concepts.push("quorum"),
        'lesson "sharding": concept "quorum" does not exist',
      ],
      [
        "concept lesson",
        (d: ContentData) => (d.concepts[0].lesson = "caching"),
        'concept "hotspot": lesson "caching" does not exist',
      ],
      [
        "path items",
        (d: ContentData) => d.paths[0].groups[0].items.push("caching"),
        'path "staff": item "caching" does not exist',
      ],
      [
        "category problems",
        (d: ContentData) => d.categories[0].problems.push("chat"),
        'category "system-design": problem "chat" does not exist',
      ],
      [
        "category modules",
        (d: ContentData) => d.categories[0].modules.push("caching"),
        'category "system-design": module "caching" does not exist in this category',
      ],
      [
        "module items",
        (d: ContentData) => d.modules[0].items.push("url-shortener"),
        'module "data": item "url-shortener" is not a lesson',
      ],
      [
        "item category",
        (d: ContentData) => (d.lessons[0].category = "lld"),
        'lesson "replication": category "lld" has no category.yaml',
      ],
    ])("reports a missing %s target", (_, breakData, message) => {
      const data = validData();
      breakData(data);
      expect(validateContent(data)).toContain(message);
    });
  });

  describe("module and category membership", () => {
    it("requires a lesson's module to list it", () => {
      const data = validData();
      data.modules[0].items = ["replication"];
      expect(validateContent(data)).toContain(
        'lesson "sharding": not listed in the items of module "data"',
      );
    });

    it("rejects a lesson listed under a module it doesn't name", () => {
      const data = validData();
      data.modules.push({
        id: "storage",
        category: "system-design",
        items: ["sharding"],
      });
      data.categories[0].modules.push("storage");
      expect(validateContent(data)).toContain(
        'module "storage": item "sharding" belongs to a different module',
      );
    });

    it("requires a module to be listed on its category", () => {
      const data = validData();
      data.categories[0].modules = [];
      expect(validateContent(data)).toContain(
        'module "data": not listed in the modules of category "system-design"',
      );
    });

    it("requires a problem to be listed on its category", () => {
      const data = validData();
      data.categories[0].problems = [];
      expect(validateContent(data)).toContain(
        'problem "url-shortener": not listed in the problems of category "system-design"',
      );
    });
  });

  describe("prerequisite cycles", () => {
    it("detects a direct cycle", () => {
      const data = validData();
      data.lessons[0].prerequisites = ["sharding"];
      expect(validateContent(data)).toContain(
        "Prerequisite cycle: replication → sharding → replication",
      );
    });

    it("detects a self-reference", () => {
      const data = validData();
      data.lessons[0].prerequisites = ["replication"];
      expect(validateContent(data)).toContain(
        "Prerequisite cycle: replication → replication",
      );
    });

    it("detects a longer cycle across lessons and problems", () => {
      const data = validData();
      data.problems[0].prerequisites = ["sharding"];
      data.lessons[0].prerequisites = ["url-shortener"];
      expect(validateContent(data)).toContain(
        "Prerequisite cycle: replication → url-shortener → sharding → replication",
      );
    });
  });

  describe("review gate", () => {
    it("requires published items to have a review block", () => {
      const data = validData();
      data.lessons[0].status = "published";
      expect(validateContent(data)).toContain(
        'lesson "replication": is published but has no review block (review: { by, date })',
      );
    });

    it("accepts a reviewed published item", () => {
      const data = validData();
      data.lessons[0].status = "published";
      data.lessons[0].review = { by: "akshay", date: "2026-10-23" };
      expect(validateContent(data)).toEqual([]);
    });

    it("rejects a published item that links to an unpublished one", () => {
      const data = validData();
      data.lessons[1].status = "published";
      data.lessons[1].review = { by: "akshay", date: "2026-10-23" };
      expect(validateContent(data)).toContain(
        'lesson "sharding": is published but its prerequisites entry "replication" is not',
      );
    });
  });

  describe("problem sections", () => {
    it("reports missing sections", () => {
      const data = validData();
      data.problems[0].toc = data.problems[0].toc.filter(
        (entry) => entry.title !== "Data model",
      );
      expect(validateContent(data)).toContain(
        'problem "url-shortener": top-level sections must match the required list (missing: Data model)',
      );
    });

    it("reports unexpected sections", () => {
      const data = validData();
      data.problems[0].toc.push({ title: "Bonus" });
      expect(validateContent(data)).toContain(
        'problem "url-shortener": top-level sections must match the required list (unexpected: Bonus)',
      );
    });

    it("reports sections in the wrong order", () => {
      const data = validData();
      data.problems[0].toc.reverse();
      expect(validateContent(data)).toContain(
        'problem "url-shortener": top-level sections must match the required list (sections are out of order)',
      );
    });
  });
});
