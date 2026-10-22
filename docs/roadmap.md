# Implementation Roadmap

> Status: **Approved** · Last updated: 2026-10-23
>
> The ordered plan for building the MVP. Each step is **one small, reviewable pull request**. Related: [architecture.md](architecture.md), [content-model.md](content-model.md), [mvp-features-ux.md](mvp-features-ux.md).

## How each step is delivered

1. Create a branch from the latest `main`.
2. Make the change as **one focused commit**.
3. Explain the change for review.
4. After approval: push the branch and open a pull request.
5. CI runs (from step 3 onward) and Vercel creates a preview (from step 30 onward).
6. The owner reviews and merges. `main` is protected; nothing is pushed to it directly.

Steps run in order. A step's scope can be split further if it turns out larger than expected, but never combined with another step.

**Status legend:** ☐ not started · ◐ in progress · ☑ done

---

## M0 · Foundation

| # | Status | Pull request | Done when |
|---|---|---|---|
| 1 | ☑ | `chore: scaffold Next.js app` | App runs locally; TypeScript strict, Tailwind, ESLint, pnpm, Node 24 LTS pinned; `.gitignore` and README |
| 2 | ☑ | `chore: add Prettier and Vitest` | `pnpm format`, `pnpm test` work; one sample test passes |
| 3 | ☑ | `ci: add GitHub Actions for lint, typecheck, test and build` | Checks run and pass on pull requests |
| 4 | ☑ | `feat: add design tokens, Geist fonts and light/dark theme` | Circuit (teal) tokens, zinc neutrals, diagram palette; theme toggle with system default |
| 5 | ☑ | `chore: set up shadcn/ui` | Base primitives available and themed with our tokens |

## M1 · Content pipeline

| # | Status | Pull request | Done when |
|---|---|---|---|
| 6 | ☑ | `feat(content): set up Velite with base and lesson schemas` | One sample lesson validates and builds |
| 7 | ☑ | `feat(content): add problem, concept, path, module and category schemas` | Sample of each type validates |
| 8 | ☑ | `feat(content): validate references, prerequisite cycles and review gate` | Build fails on broken references, cycles, or unreviewed published items |
| 9 | ☑ | `feat(content): add content query layer with tests` | `lib/content` functions covered by unit tests; drafts and in-review items excluded in production |

## M2 · Reading experience

| # | Status | Pull request | Done when |
|---|---|---|---|
| 10 | ☑ | `feat: add app shell (header, nav, footer)` | Responsive shell with navigation and theme toggle |
| 11 | ☐ | `feat: render lesson pages from MDX with metadata header` | Sample lesson renders at `/system-design/[slug]` |
| 12 | ☐ | `feat: add module sidebar and prev/next navigation` | Sidebar tree and prev/next follow module order; mobile drawer |
| 13 | ☐ | `feat: add scroll-aware TOC and reading progress bar` | TOC highlights the current section |
| 14 | ☐ | `feat: add MDX components (callouts, takeaways, comparisons, code blocks)` | All components render in a sample lesson |
| 15 | ☐ | `feat: add problem page with interview timeline and think-first mode` | Sample problem renders with timeline rail, senior vs. staff comparison, and think-first prompts |
| 16 | ☐ | `feat: add System Design hub and problems index with filters` | Hub shows modules; problems filter by difficulty and focus area |
| 17 | ☐ | `feat: add concept hover cards, glossary and backlinks` | Hover cards work by mouse, keyboard, and touch |
| 18 | ☐ | `feat: add paths index and path pages` | Sample path renders with grouped items |

## M3 · Diagrams

| # | Status | Pull request | Done when |
|---|---|---|---|
| 19 | ☐ | `feat: add diagram registry with zoomable lightbox` | `<Diagram>` renders light/dark SVG; lightbox supports pan, zoom, and keyboard |
| 20 | ☐ | `feat(scenarios): add scenario schema and timeline engine with tests` | Engine compiles sample scenarios into frames; unit tested |
| 21 | ☐ | `feat(scenarios): add SVG renderer and player controls` | Load balancer scenario plays, pauses, steps; reduced-motion fallback |

## M4 · Engagement

| # | Status | Pull request | Done when |
|---|---|---|---|
| 22 | ☐ | `feat: add local progress tracking and bookmarks` | Mark complete and bookmark persist across reloads and sync across tabs |
| 23 | ☐ | `feat: add search index and ⌘K palette` | Search finds lessons, problems, and concepts, including aliases |
| 24 | ☐ | `feat: add page feedback and report-issue link` | Feedback recorded; issue link pre-fills page details |

## M5 · Production readiness

| # | Status | Pull request | Done when |
|---|---|---|---|
| 25 | ☐ | `feat: add SEO metadata, sitemap and structured data` | Metadata, sitemap, robots, and structured data on all page types |
| 26 | ☐ | `feat: generate OG images per page` | Each lesson, problem, and concept has a generated preview image |
| 27 | ☐ | `feat: add analytics and Sentry` | Page views and errors reported in production only |
| 28 | ☐ | `test: add Playwright smoke tests to CI` | Key pages load and core interactions pass in CI |
| 29 | ☐ | `feat: build landing page with live scenario hero` | Landing page complete with live scenario |
| 30 | ☐ | Vercel deployment and domain | Production deploys on merge; previews on pull requests; domain live |

Step 30 is mostly configuration in Vercel and the domain registrar by the owner, with guidance.

---

## Content track

Runs in parallel from M2 onward, once lessons can be rendered.

- Content is added in **small batches** (typically 1–3 items per pull request), each through the review gate.
- Each lesson or problem ships with its diagrams and, where planned, its scenario.
- Suggested order: Interview Framework → Foundations → Data Storage → Caching → Messaging & Streaming → Distributed Systems → Reliability at Scale, with problems added once their prerequisite lessons exist.

**MVP launch criteria:** all 30 lessons and 10 problems published and reviewed, at least one path, steps 1–30 complete.

## Owner tasks outside the codebase

| Task | When |
|---|---|
| Protect `main` (pull request required) | ☑ Done |
| Require CI checks to pass before merge | After step 3 |
| Create Vercel project and connect the repo | Before step 30 (can be done earlier for previews) |
| Set `SHOW_DRAFTS=true` for the Vercel Preview environment, so drafts can be reviewed on preview deployments | With the Vercel project |
| Choose and register a domain | Before step 30 |
| Create analytics and Sentry accounts | Before step 27 |
