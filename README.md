# Tactik

Revenue Lifecycle Management (RLM) platform. This repo currently houses the **CPQ module** (Configure, Price, Quote). See [`docs/prd/cpq-module.md`](docs/prd/cpq-module.md).

## Monorepo layout

```
apps/
  web/          Next.js 15 (App Router) + @jasperlepardo/base-design-system
packages/
  pricing/      Pure, framework-free pricing engine (Vitest) — PRD §5.4
  db/           Prisma schema + client — the §6 data model
  shared/       Shared TS types + Zod schemas
docs/prd/       Product requirements
```

Managed with **npm workspaces** (Node ≥ 20).

## Prerequisites

The UI depends on `@jasperlepardo/base-design-system`, published to **GitHub Packages**.
You need a token with `read:packages` exported as `GITHUB_TOKEN` before installing:

```bash
export GITHUB_TOKEN=$(gh auth token)   # or a classic PAT with read:packages
```

The repo's `.npmrc` points the `@jasperlepardo` scope at GitHub Packages and reads `${GITHUB_TOKEN}`.

## Setup

```bash
cp .env.example .env          # fill in DATABASE_URL
export GITHUB_TOKEN=$(gh auth token)
npm install
npm run db:generate           # generate the Prisma client
npm test                      # run the pricing engine tests
npm run dev                   # start the web app on :3000
```

## Theming / design tokens

Two layers:

- **Light / dark switching** is runtime, via the `data-theme` attribute on `<html>`.
  `themeScript` (in `apps/web/src/app/layout.tsx`) applies the saved theme before paint;
  the `ThemeToggle` component switches it with the design system's `useTheme()` hook.
- **Token values** (brand color, surfaces, radii) are overridden from this repo — no forking.
  Edit [`apps/web/jspr.config.mjs`](apps/web/jspr.config.mjs), then regenerate:

  ```bash
  cd apps/web && npm run tokens   # → npx jspr gen tokens
  ```

  This writes token CSS to `apps/web/src/generated/` (imported last in `globals.css`
  so the values win over the package defaults). Requires `style-dictionary` (dev dep).

## Database

CPQ data lives in PostgreSQL. With `DATABASE_URL` set:

```bash
npm run db:migrate            # create/apply migrations
npm run -w @tactik/db studio  # browse data
```
