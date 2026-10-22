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

export const baseFrontmatter = s
  .object({
    id: slug,
    title: s.string().min(1).max(120),
    summary: s.string().min(1).max(200),
    category: s.enum(categories),
    module: slug,
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

export const lessonFrontmatter = baseFrontmatter.extend({
  type: s.literal("lesson"),
  kind: s.enum(lessonKinds),
});
