# Application Architecture

> Status: **Approved** · Last updated: 2026-10-23
>
> Describes how the CrackTechInterviews application is structured and how content becomes pages. Related: [content-model.md](content-model.md) (content schema) and [mvp-features-ux.md](mvp-features-ux.md) (features and design).

## 1. Overview

All heavy lifting happens at **build time**. At runtime the site is pre-rendered HTML served from a CDN, with small interactive components loaded only where they are used.

```
 content/*.mdx, *.yaml ─┐
 diagrams/  scenarios/ ─┼─► Velite ──► typed, validated data ──► lib/content ──► Next.js pages
                        │   (schemas, cross-reference checks,      (query layer)    (statically
                        │    review gate, computed fields)                           generated)
                        └─► search index (JSON) ─────────────────────────────────────► ⌘K search
                                                                                          │
                                                                         Vercel CDN ◄─────┘

 Client-side islands (loaded only where used):
 theme toggle · search palette · progress · scenario player · diagram lightbox · concept hover cards · think-first
```

## 2. Technology stack

| Concern | Choice |
|---|---|
| Framework | Next.js (App Router, latest stable) + TypeScript (strict) |
| Rendering | Static generation; Server Components by default |
| Styling | Tailwind CSS + shadcn/ui (Radix primitives) |
| Content pipeline | MDX + YAML, validated by Velite |
| Code highlighting | Shiki (build time) |
| Search | Build-time JSON index + MiniSearch (client-side) |
| Animation | Motion (Framer Motion) on SVG |
| Hosting | Vercel |
| Analytics / errors | Plausible or PostHog · Sentry |
| Testing | Vitest (unit) · Playwright (smoke / end-to-end) |
| Tooling | pnpm · Node 24 LTS · ESLint · Prettier · GitHub Actions |

**Backend:** none in the MVP. When accounts, progress sync, or payments are added, they use Next.js route handlers and server actions with Postgres (Neon or Supabase) and Drizzle. A separate FastAPI service is introduced **only** for AI/ML workloads that need Python, consumed through an OpenAPI-generated TypeScript client.

## 3. Architectural rules

1. **Pages never read content directly — only through `lib/content`.**
   The query layer (`getLesson`, `getModuleTree`, `getBacklinks`, `getPath`, …) is the single place that knows content comes from files. Moving to a CMS or database later changes only this layer.

2. **Server Components by default.**
   Lessons render as static HTML. Only interactive pieces are Client Components, keeping lesson pages light.

3. **Category is a route parameter, not hardcoded.**
   Routes live under `app/[category]/…`. Launching `/lld` or `/dsa` is a content change, not new route code.

4. **Features are isolated modules.**
   Progress, search, and scenarios each live in their own folder with a small public interface and tests. Features do not import each other's internals.

5. **Routes stay thin.**
   Route files compose components and call `lib/content`; business logic lives in `features/` and `lib/`. When a backend is introduced, logic goes into a service layer (`lib/services/*`) with thin route handlers, so a domain can later move to its own service.

## 4. Folder structure

```
content/                             authored content (see content-model.md)
diagrams/
scenarios/
src/
  app/                               routes only
    page.tsx                         landing
    [category]/page.tsx              category hub
    [category]/[slug]/page.tsx       lesson
    [category]/problems/page.tsx     problems index
    [category]/problems/[slug]/      problem
    concepts/                        glossary + concept pages
    paths/                           paths index + path pages
    about/
  components/
    ui/                              shadcn/ui primitives
    layout/                          header, sidebar, TOC, footer
    mdx/                             Callout, Concept, Diagram, Scenario, ThinkFirst, Comparison, …
  features/
    progress/                        ProgressStore interface, localStorage adapter, hooks
    search/                          index loading + ⌘K palette
    scenarios/                       engine (pure TS) + renderer (React SVG + Motion)
  lib/
    content/                         content query layer
    seo/                             metadata, structured data, OG helpers
  styles/                            design tokens and theme
```

Single Next.js application — not a monorepo. A monorepo is reconsidered only when the FastAPI service is introduced.

## 5. Core modules

### 5.1 Content pipeline (`velite` + `lib/content`)

- Velite loads `content/`, `diagrams/`, and `scenarios/`, validates them against the schemas in [content-model.md](content-model.md), and emits typed data.
- Build fails on: schema errors, unresolved references, prerequisite cycles, published items without a review block, diagrams without alt text.
- Computed at build time: reading time, table of contents, backlinks, search index.
- `lib/content` exposes typed query functions; it is the only consumer of Velite output. Queries are pure functions (`createContentQueries`) bound to the generated data, so they are unit tested against fixtures.
- Visibility: production returns published items only; drafts and in-review items are included in development or when `SHOW_DRAFTS=true` (preview deployments).

### 5.2 Scenario engine (`features/scenarios`)

Split into two layers:

| Layer | Responsibility | Tested with |
|---|---|---|
| **Engine** (pure TypeScript) | Validate scenario YAML; compile steps into an ordered list of frames (node states, active edges, packet positions, narration) | Vitest — deterministic, no DOM |
| **Renderer** (React) | Draw frames as SVG; animate transitions with Motion; player controls (play / pause / step / restart); keyboard support; reduced-motion fallback to static frames | Playwright smoke tests |

**Layout:** authors place nodes on a grid (`at: [col, row]`). No automatic layout in the MVP — it adds significant complexity and produces less polished results than deliberate placement.

### 5.3 Progress (`features/progress`)

- `ProgressStore` interface: `get`, `set`, `subscribe`.
- MVP implementation: `localStorage` adapter with a versioned schema and migrations.
- Consumed through `useSyncExternalStore`, so UI stays in sync across components and tabs.
- A future account-backed implementation plugs in behind the same interface, with a one-time merge of local progress.

### 5.4 Search (`features/search`)

- At build time, a compact JSON index is generated from content: titles, summaries, headings, concept terms, and aliases.
- In the browser, MiniSearch (open source, MIT) loads the index lazily when the palette is first opened.
- Works with any Next.js output mode and requires no server.

### 5.5 Concept hover cards

- Each page receives, at build time, only the definitions of concepts it references.
- No runtime fetching; cards work offline and add no network requests.

## 6. Quality and delivery

- **Branching:** `main` is protected. Every change is one branch → one commit → pull request.
- **CI (GitHub Actions)** on every pull request: install → lint → typecheck → unit tests → build (which includes content validation). Playwright smoke tests are added in M5.
- **Previews:** Vercel deploys a preview for every pull request; merging to `main` deploys production.
- **Testing focus:** content query layer, scenario engine, and progress store get unit tests; key pages get smoke tests.
