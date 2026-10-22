import "server-only";

import * as source from "#site/content";

import { createContentQueries } from "./queries";

// The only entry point pages use to read content (see docs/architecture.md).
// Production shows published items only; set SHOW_DRAFTS=true to include
// drafts, e.g. on preview deployments.
export const content = createContentQueries(source, {
  includeDrafts:
    process.env.NODE_ENV !== "production" || process.env.SHOW_DRAFTS === "true",
});

export type { Item, ModuleWithLessons, PathWithItems } from "./queries";
export * from "./labels";
export * from "./urls";
