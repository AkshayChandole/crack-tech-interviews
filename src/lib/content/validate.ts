// Cross-content checks that a per-file schema can't express: references must
// resolve, ids must be unique, prerequisites must not form cycles, published
// content must be reviewed, and problems must follow the required structure.
// Runs in Velite's `prepare` hook (see velite.config.ts); any error fails the build.

type Status = "draft" | "in-review" | "published";

interface ItemData {
  id: string;
  category: string;
  status: Status;
  prerequisites: string[];
  related: string[];
  concepts: string[];
  review?: { by: string; date: string };
}

interface TocEntry {
  title: string;
}

export interface ContentData {
  lessons: (ItemData & { module: string })[];
  problems: (ItemData & { toc: TocEntry[] })[];
  concepts: { id: string; lesson?: string }[];
  paths: { id: string; groups: { items: string[] }[] }[];
  modules: { id: string; category: string; items: string[] }[];
  categories: { id: string; modules: string[]; problems: string[] }[];
}

// Top-level (h2) headings every problem must have, in this order.
export const requiredProblemSections = [
  "Problem statement & clarifying questions",
  "Functional & non-functional requirements",
  "Back-of-the-envelope estimates",
  "API design",
  "Data model",
  "High-level design",
  "Deep dives",
  "Bottlenecks & failure modes",
  "Trade-offs & alternatives considered",
  "Senior vs. staff: what a staff-level answer adds",
  "Follow-up questions",
  "45-minute interview timeline",
] as const;

export function validateContent(data: ContentData): string[] {
  const errors: string[] = [];
  const items = [
    ...data.lessons.map((item) => ({ ...item, kind: "lesson" })),
    ...data.problems.map((item) => ({ ...item, kind: "problem" })),
  ];

  // Unique ids. Lessons and problems share one namespace because
  // prerequisites, related links, and paths refer to either by id.
  const checkUnique = (label: string, ids: string[]) => {
    const seen = new Set<string>();
    for (const id of ids) {
      if (seen.has(id)) errors.push(`Duplicate ${label} id "${id}"`);
      seen.add(id);
    }
  };
  checkUnique(
    "lesson/problem",
    items.map((item) => item.id),
  );
  checkUnique(
    "concept",
    data.concepts.map((concept) => concept.id),
  );
  checkUnique(
    "path",
    data.paths.map((path) => path.id),
  );
  checkUnique(
    "module",
    data.modules.map((mod) => mod.id),
  );
  checkUnique(
    "category",
    data.categories.map((category) => category.id),
  );

  const itemsById = new Map(items.map((item) => [item.id, item]));
  const lessonIds = new Set(data.lessons.map((lesson) => lesson.id));
  const problemIds = new Set(data.problems.map((problem) => problem.id));
  const conceptIds = new Set(data.concepts.map((concept) => concept.id));
  const modulesById = new Map(data.modules.map((mod) => [mod.id, mod]));
  const categoriesById = new Map(
    data.categories.map((category) => [category.id, category]),
  );

  for (const item of items) {
    const label = `${item.kind} "${item.id}"`;

    if (!categoriesById.has(item.category)) {
      errors.push(`${label}: category "${item.category}" has no category.yaml`);
    }
    for (const field of ["prerequisites", "related"] as const) {
      for (const ref of item[field]) {
        const target = itemsById.get(ref);
        if (!target) {
          errors.push(`${label}: ${field} entry "${ref}" does not exist`);
        } else if (
          item.status === "published" &&
          target.status !== "published"
        ) {
          // Unpublished items are left out of production, so this link would break.
          errors.push(
            `${label}: is published but its ${field} entry "${ref}" is not`,
          );
        }
      }
    }
    for (const ref of item.concepts) {
      if (!conceptIds.has(ref)) {
        errors.push(`${label}: concept "${ref}" does not exist`);
      }
    }
    if (item.status === "published" && !item.review) {
      errors.push(
        `${label}: is published but has no review block (review: { by, date })`,
      );
    }
  }

  // Every lesson belongs to exactly one module, and it's the one it names.
  for (const lesson of data.lessons) {
    const label = `lesson "${lesson.id}"`;
    const mod = modulesById.get(lesson.module);
    if (!mod) {
      errors.push(`${label}: module "${lesson.module}" does not exist`);
    } else if (!mod.items.includes(lesson.id)) {
      errors.push(
        `${label}: not listed in the items of module "${lesson.module}"`,
      );
    }
  }

  for (const mod of data.modules) {
    const label = `module "${mod.id}"`;
    for (const ref of mod.items) {
      if (!lessonIds.has(ref)) {
        errors.push(`${label}: item "${ref}" is not a lesson`);
      } else if (data.lessons.find((l) => l.id === ref)?.module !== mod.id) {
        errors.push(`${label}: item "${ref}" belongs to a different module`);
      }
    }
    const category = categoriesById.get(mod.category);
    if (!category) {
      errors.push(`${label}: category "${mod.category}" does not exist`);
    } else if (!category.modules.includes(mod.id)) {
      errors.push(
        `${label}: not listed in the modules of category "${mod.category}"`,
      );
    }
  }

  for (const category of data.categories) {
    const label = `category "${category.id}"`;
    for (const ref of category.modules) {
      if (modulesById.get(ref)?.category !== category.id) {
        errors.push(
          `${label}: module "${ref}" does not exist in this category`,
        );
      }
    }
    for (const ref of category.problems) {
      if (!problemIds.has(ref)) {
        errors.push(`${label}: problem "${ref}" does not exist`);
      }
    }
  }

  for (const problem of data.problems) {
    const categoryProblems = categoriesById.get(problem.category)?.problems;
    if (categoryProblems && !categoryProblems.includes(problem.id)) {
      errors.push(
        `problem "${problem.id}": not listed in the problems of category "${problem.category}"`,
      );
    }

    const headings = problem.toc.map((entry) => entry.title.trim());
    const expected: readonly string[] = requiredProblemSections;
    if (headings.join("\n") !== expected.join("\n")) {
      const missing = expected.filter((title) => !headings.includes(title));
      const extra = headings.filter((title) => !expected.includes(title));
      const details = [
        missing.length && `missing: ${missing.join("; ")}`,
        extra.length && `unexpected: ${extra.join("; ")}`,
        !missing.length && !extra.length && "sections are out of order",
      ].filter(Boolean);
      errors.push(
        `problem "${problem.id}": top-level sections must match the required list (${details.join(" | ")})`,
      );
    }
  }

  for (const concept of data.concepts) {
    if (concept.lesson && !lessonIds.has(concept.lesson)) {
      errors.push(
        `concept "${concept.id}": lesson "${concept.lesson}" does not exist`,
      );
    }
  }

  for (const path of data.paths) {
    for (const group of path.groups) {
      for (const ref of group.items) {
        if (!itemsById.has(ref)) {
          errors.push(`path "${path.id}": item "${ref}" does not exist`);
        }
      }
    }
  }

  errors.push(...findPrerequisiteCycles(items));
  return errors;
}

// Depth-first search; reports each cycle once, e.g. "a → b → a".
function findPrerequisiteCycles(
  items: { id: string; prerequisites: string[] }[],
): string[] {
  const graph = new Map(items.map((item) => [item.id, item.prerequisites]));
  const state = new Map<string, "visiting" | "done">();
  const stack: string[] = [];
  const cycles: string[] = [];

  const visit = (id: string) => {
    state.set(id, "visiting");
    stack.push(id);
    for (const next of graph.get(id) ?? []) {
      if (!graph.has(next)) continue; // Missing ids are reported elsewhere.
      if (state.get(next) === "visiting") {
        const cycle = [...stack.slice(stack.indexOf(next)), next];
        cycles.push(`Prerequisite cycle: ${cycle.join(" → ")}`);
      } else if (!state.has(next)) {
        visit(next);
      }
    }
    stack.pop();
    state.set(id, "done");
  };

  for (const id of graph.keys()) {
    if (!state.has(id)) visit(id);
  }
  return cycles;
}
