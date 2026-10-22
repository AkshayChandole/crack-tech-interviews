# CrackTechInterviews

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

## Scripts

| Command | Description |
|---|---|
| `pnpm dev` | Start the development server |
| `pnpm build` | Create a production build |
| `pnpm start` | Serve the production build |
| `pnpm lint` | Run ESLint |
| `pnpm typecheck` | Generate route types and run the TypeScript compiler |

## Documentation

- [Content model](docs/content-model.md)
- [MVP features & UI/UX](docs/mvp-features-ux.md)
- [Architecture](docs/architecture.md)
- [Roadmap](docs/roadmap.md)

## Contributing

`main` is protected. Every change goes through a pull request from its own branch, one focused commit per pull request. See the [roadmap](docs/roadmap.md) for the delivery workflow.
