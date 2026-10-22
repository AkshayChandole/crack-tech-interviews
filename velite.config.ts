import { defineCollection, defineConfig, s } from "velite";

import { lessonFrontmatter } from "./src/lib/content/schema";

const lessons = defineCollection({
  name: "Lesson",
  pattern: "*/lessons/**/*.mdx",
  schema: lessonFrontmatter.extend({
    toc: s.toc(),
    metadata: s.metadata(),
    body: s.mdx(),
  }),
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
  collections: { lessons },
  // Validation errors fail the build instead of only being logged.
  strict: true,
});
