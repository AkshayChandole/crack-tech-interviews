# CrackTechInterviews

[![CI](https://github.com/AkshayChandole/crack-tech-interviews/actions/workflows/ci.yml/badge.svg)](https://github.com/AkshayChandole/crack-tech-interviews/actions/workflows/ci.yml)

Deep, visual system design interview preparation for senior and staff engineers.

## Getting started

Requirements: **Node.js 24 LTS** (see `.nvmrc`) and **pnpm** (version pinned in `package.json`, enabled via Corepack).

```bash
nvm use
corepack enable pnpm
pnpm install
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

In development, [http://localhost:3000/dev/tokens](http://localhost:3000/dev/tokens) previews the design tokens (colors, typography, diagram palette) in both themes. Design tokens live in `src/styles/tokens.css`.

## Scripts

| Command             | Description                                                          |
| ------------------- | -------------------------------------------------------------------- |
| `pnpm dev`          | Start the development server                                         |
| `pnpm build`        | Create a production build                                            |
| `pnpm start`        | Serve the production build                                           |
| `pnpm content`      | Build and validate content with Velite                               |
| `pnpm lint`         | Run ESLint                                                           |
| `pnpm typecheck`    | Build content, generate route types, and run the TypeScript compiler |
| `pnpm format`       | Format all files with Prettier                                       |
| `pnpm format:check` | Check formatting without changing files                              |
| `pnpm test`         | Run unit tests once                                                  |
| `pnpm test:watch`   | Run unit tests in watch mode                                         |

## Content

All content lives in `content/` and is validated against the schemas in `src/lib/content/schema.ts` (see the [content model](docs/content-model.md)):

| Type     | Location                               |
| -------- | -------------------------------------- |
| Category | `content/<category>/category.yaml`     |
| Module   | `content/<category>/modules/<id>.yaml` |
| Lesson   | `content/<category>/lessons/<id>.mdx`  |
| Problem  | `content/<category>/problems/<id>.mdx` |
| Concept  | `content/concepts/<id>.mdx`            |
| Path     | `content/paths/<id>.yaml`              |

Invalid content fails `pnpm content`, `pnpm typecheck`, and `pnpm build`.

`pnpm dev` and `pnpm build` run Velite automatically (watching for changes in dev). Generated output goes to `.velite/` and is imported as `#site/content`.

## UI components

UI primitives come from [shadcn/ui](https://ui.shadcn.com) (Radix base, Nova style) and live in `src/components/ui/`. Add a component with:

```bash
pnpm dlx shadcn@latest add <component>
```

Review the diff before committing: if the CLI adds color variables to `src/app/globals.css`, move them into `src/styles/tokens.css` as hex values so the contrast test covers them. Don't run `shadcn init` again; it overwrites the design tokens.

## Documentation

- [Content model](docs/content-model.md)
- [MVP features & UI/UX](docs/mvp-features-ux.md)
- [Architecture](docs/architecture.md)
- [Roadmap](docs/roadmap.md)

## Contributing

`main` is protected. Every change goes through a pull request from its own branch, one focused commit per pull request. See the [roadmap](docs/roadmap.md) for the delivery workflow.

CI runs on every pull request and on pushes to `main`: format check, lint, typecheck, unit tests, and build. Run the same checks locally before pushing:

```bash
pnpm format:check && pnpm lint && pnpm typecheck && pnpm test && pnpm build
```
