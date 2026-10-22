import { s } from "velite";

// Frontmatter schemas from docs/content-model.md. Kept free of Velite's
// context-dependent helpers (s.mdx, s.toc, …) so they can be unit tested;
// velite.config.ts adds the computed fields.

export const categories = ["system-design"] as const;
export const difficulties = [
  "foundational",
  "intermediate",
  "advanced",
] as const;
export const seniorities = ["senior", "staff"] as const;
export const statuses = ["draft", "in-review", "published"] as const;
export const lessonKinds = ["concept", "building-block", "pattern"] as const;

// Lowercase words separated by single hyphens, e.g. "consistent-hashing".
const slug = s
  .string()
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Must be a lowercase kebab-case slug");

const slugList = s.array(slug).default([]);

const isoDate = s
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Must be a date in YYYY-MM-DD format");

const title = s.string().min(1).max(120);
const summary = s.string().min(1).max(200);

// Fields shared by every content item (lessons, problems, future types).
export const baseFrontmatter = s
  .object({
    id: slug,
    title,
    summary,
    category: s.enum(categories),
    difficulty: s.enum(difficulties),
    seniority: s.array(s.enum(seniorities)).min(1),
    prerequisites: slugList,
    related: slugList,
    concepts: slugList,
    tags: slugList,
    status: s.enum(statuses),
    authors: s.array(s.string().min(1)).min(1),
    review: s.object({ by: s.string().min(1), date: isoDate }).optional(),
    updated: isoDate,
  })
  .strict();

// Lessons belong to a module; problems are listed directly on the category.
export const lessonFrontmatter = baseFrontmatter.extend({
  type: s.literal("lesson"),
  module: slug,
  kind: s.enum(lessonKinds),
});

export const problemFrontmatter = baseFrontmatter.extend({
  type: s.literal("problem"),
  companies: slugList,
  estimatedInterviewTime: s.number().int().min(15).max(90),
  focusAreas: s.array(slug).min(1),
});

export const conceptFrontmatter = s
  .object({
    id: slug,
    term: s.string().min(1).max(80),
    aliases: s.array(s.string().min(1)).default([]),
    definition: s.string().min(1).max(400),
    lesson: slug.optional(),
  })
  .strict();

export const pathSchema = s
  .object({
    id: slug,
    title,
    audience: s.string().min(1).max(200),
    description: s.string().min(1).max(400),
    groups: s
      .array(s.object({ title, items: s.array(slug).min(1) }).strict())
      .min(1),
  })
  .strict();

// A module owns the order of its lessons.
export const moduleSchema = s
  .object({
    id: slug,
    category: s.enum(categories),
    title,
    summary,
    items: s.array(slug).min(1),
  })
  .strict();

// A category owns the order of its modules and problems.
export const categorySchema = s
  .object({
    id: s.enum(categories),
    title,
    summary,
    modules: s.array(slug).min(1),
    problems: slugList,
  })
  .strict();
