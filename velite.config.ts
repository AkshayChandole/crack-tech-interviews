import { defineCollection, defineConfig, s } from "velite";

import {
  categorySchema,
  conceptFrontmatter,
  lessonFrontmatter,
  moduleSchema,
  pathSchema,
  problemFrontmatter,
} from "./src/lib/content/schema";

const lessons = defineCollection({
  name: "Lesson",
  pattern: "*/lessons/**/*.mdx",
  schema: lessonFrontmatter.extend({
    toc: s.toc(),
    metadata: s.metadata(),
    body: s.mdx(),
  }),
});

const problems = defineCollection({
  name: "Problem",
  pattern: "*/problems/**/*.mdx",
  schema: problemFrontmatter.extend({
    toc: s.toc(),
    metadata: s.metadata(),
    body: s.mdx(),
  }),
});

const concepts = defineCollection({
  name: "Concept",
  pattern: "concepts/**/*.mdx",
  schema: conceptFrontmatter.extend({
    body: s.mdx(),
  }),
});

const paths = defineCollection({
  name: "Path",
  pattern: "paths/**/*.yaml",
  schema: pathSchema,
});

const modules = defineCollection({
  name: "Module",
  pattern: "*/modules/*.yaml",
  schema: moduleSchema,
});

// Velite ignores files starting with "_", so the category file is category.yaml.
const categories = defineCollection({
  name: "Category",
  pattern: "*/category.yaml",
  schema: categorySchema,
});

export default defineConfig({
  root: "content",
  output: {
    data: ".velite",
    assets: "public/static",
    base: "/static/",
    name: "[name]-[hash:6].[ext]",
    clean: true,
  },
  collections: { lessons, problems, concepts, paths, modules, categories },
  // Validation errors fail the build instead of only being logged.
  strict: true,
});
