
# Foundry — Monorepo Studio ✨

## Foundry — quick intro

Foundry is a developer-focused monorepo scaffold powered by Turborepo. It combines a Next.js web app, a Hono backend API, and shared packages for UI, database, configs and types.

Heart & soul
: We build fast, composable UIs and simple, well-typed server primitives. Keep things small and ergonomic — reuse `@foundry/ui`, share types via `@foundry/types`, and keep the backend focused on small, testable routes.

---

## Repo layout (visual)

```
Foundry/
├─ apps/
│  ├─ web/               # Next.js App Router app (UI)
│  └─ desktop/           # desktop app (placeholder)
├─ services/
│  ├─ backend/           # Hono API (OpenAPI + Zod + auth)
│  └─ discord/           # Discord service (placeholder)
├─ packages/
│  ├─ ui/                # Shared UI primitives and styles
│  ├─ database/          # Drizzle ORM, schemas, migrations
│  ├─ configs/           # Shared runtime/build configs
│  └─ types/             # Shared TypeScript types
├─ .github/
└─ turbo.json            # Turborepo task config
```

Notes:
- `apps/web/src/app/layout.tsx` wires global providers and theming from `@foundry/ui`.
- Backend routes use `createRouter()` from `services/backend/src/lib/create-app.ts` and `hono-openapi` for route descriptions.

---

## Quick start

Prerequisites

- Node.js >= 25.2.1
- pnpm >= 10.28.0
- PostgreSQL (for local DB work)

Install dependencies

```bash
pnpm install
```

Start everything (recommended)

```bash
pnpm turbo dev
```

Or start selectively

```bash
pnpm --filter @foundry/web dev     # web only
pnpm --filter @foundry/backend dev # backend only
```

Build for production

```bash
pnpm turbo build
```

---

## Command cheat sheet

- Install: `pnpm install`
- Dev (all): `pnpm turbo dev`
- Dev (web): `pnpm --filter @foundry/web dev`
- Dev (backend): `pnpm --filter @foundry/backend dev`
- Build: `pnpm turbo build`
- Typecheck: `pnpm turbo check-types`
- Lint & format: `pnpm turbo check` and `pnpm turbo fix`

### Database & auth

- Check DB: `pnpm turbo db:check`
- Migrate DB: `pnpm turbo db:migrate`
- Generate Drizzle types: `pnpm turbo db:generate`
- Regenerate Better Auth tables: `pnpm turbo db:auth`

---

## Environment

These appear in `turbo.json` and are used across the monorepo:

- `NEXT_PUBLIC_APP_URL` — public URL (client)
- `NEXT_SERVER_APP_URL` — server base URL (backend & auth)
- `DATABASE_URL` — Postgres connection string (required)
- `AUTH_SECRET` — better-auth secret
- OAuth (optional): `AUTH_GOOGLE_ID/SECRET`, `AUTH_GITHUB_ID/SECRET`, `AUTH_DISCORD_ID/SECRET`

Store local values in `.env.local` and never commit secrets.

---

## Auth & Database details

- `services/backend/src/lib/auth.ts` configures Better Auth and the Drizzle adapter. When social provider env vars are present the provider is enabled.
- `services/backend/src/lib/auth-db.ts` wraps the Better Auth CLI and post-processes generated schema output into `packages/database/src/schemas/users/tables.ts`.
- Do not edit generated files in `packages/database/src/schemas/users/*`; update the auth config and run `pnpm turbo db:auth`.

---

## Conventions & best practices

- Prefer `@foundry/ui` imports for UI consistency.
- Write backend routes using `createRouter()` + Zod schemas + `describeRoute`/`validator` from `hono-openapi`.
- Keep generated files untouched; change generators/configs instead.
- Run `pnpm turbo fix` before committing to satisfy Ultracite rules.

---

## Contributing

- Fork, create a branch, open a PR to `main`.
- Run `pnpm turbo check` and `pnpm turbo build` locally before submitting.
- Add tests next to new logic (no test runner enforced by default).

---

## Troubleshooting

- Backend fails to start: ensure `DATABASE_URL` and `AUTH_SECRET` are set.
- Missing OAuth behavior: confirm provider env vars are present and correct.
- Cross-package type errors: `pnpm turbo check-types` shows the failures.

---

## Want me to add?

- CI (GitHub Actions) for `pnpm turbo build && pnpm turbo check`
- `.env.example` with required variables
- Badges (build / lint / license) in the header

Reply with the items you want and I will add them.

---


<!-- Badges grouped by category for clarity -->

### AI models

[![GitHub Copilot](https://img.shields.io/badge/github%20copilot-000000?style=for-the-badge&logo=githubcopilot&logoColor=white)](https://github.com/features/copilot)
[![ChatGPT](https://img.shields.io/badge/ChatGPT-74aa9c?style=for-the-badge&logo=openai&logoColor=white)](https://chat.openai.com)
[![Claude](https://img.shields.io/badge/Claude-D97757?style=for-the-badge&logo=claude&logoColor=white)](https://www.anthropic.com)

---

### Hosting & metrics

[![Vercel](https://img.shields.io/badge/Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white)](https://vercel.com)
[![WakaTime](https://img.shields.io/badge/WakaTime-000000?style=for-the-badge&logo=WakaTime&logoColor=white)](https://wakatime.com)
[![Website](https://img.shields.io/badge/website-000000?style=for-the-badge&logo=About.me&logoColor=white)](https://foundry.homestead.systems)

---

### Backend & data

[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org)
[![Better Auth](https://img.shields.io/badge/Better%20Auth-000000?style=for-the-badge&logo=betterauth&logoColor=white)](https://betterauth.dev)
[![Hono](https://img.shields.io/badge/hono-E36002?style=for-the-badge&logo=hono&logoColor=white)](https://hono.dev)
[![Sentry](https://img.shields.io/badge/Sentry-black?style=for-the-badge&logo=Sentry&logoColor=%23362D59)](https://sentry.io)

---

### Frontend & UI

[![Next.js](https://img.shields.io/badge/next%20js-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)](https://nextjs.org)
[![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactjs.org)
[![shadcn/ui](https://img.shields.io/badge/shadcn%2Fui-000000?style=for-the-badge&logo=shadcnui&logoColor=white)](https://github.com/shadcn)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com)
[![PostCSS](https://img.shields.io/badge/postcss-DD3A0A?style=for-the-badge&logo=postcss&logoColor=white)](https://postcss.org)

---

### Build & tooling

[![Turborepo](https://img.shields.io/badge/Turborepo-0C0606?style=for-the-badge&logo=turborepo&logoColor=EF4444)](https://turborepo.org)
[![pnpm](https://img.shields.io/badge/pnpm-yellow?style=for-the-badge&logo=pnpm&logoColor=white)](https://pnpm.io)
[![Node.js](https://img.shields.io/badge/Node%20js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)](https://nodejs.org)
[![Biome](https://img.shields.io/badge/biome-60a5fa?style=for-the-badge&logo=biome&logoColor=white)](https://biomejs.dev)
[![Drizzle](https://img.shields.io/badge/drizzle-C5F74F?style=for-the-badge&logo=drizzle&logoColor=black)](https://orm.drizzle.team)

---

### Editors & IDEs

[![VSCode](https://img.shields.io/badge/VSCode-0078D4?style=for-the-badge&logo=visual%20studio%20code&logoColor=white)](https://code.visualstudio.com)
[![NeoVim](https://img.shields.io/badge/NeoVim-%2357A143.svg?&style=for-the-badge&logo=neovim&logoColor=white)](https://neovim.io)

---

### Community & comms

[![Discord](https://img.shields.io/badge/Discord-5865F2?style=for-the-badge&logo=discord&logoColor=white)](https://discord.gg/qM9Tk2xQ79)
[![TeamSpeak](https://img.shields.io/badge/TeamSpeak-2580C3?style=for-the-badge&logo=teamspeak&logoColor=white)](https://ts.homestead.systems)

---

### Planned / optional

[![Epic Games](https://img.shields.io/badge/Epic%20Games-313131?style=for-the-badge&logo=Epic%20Games&logoColor=white)](https://www.epicgames.com)
[![Origin](https://img.shields.io/badge/Origin-F56C2D?style=for-the-badge&logo=origin&logoColor=white)](https://www.origin.com)
[![Steam](https://img.shields.io/badge/Steam-000000?style=for-the-badge&logo=steam&logoColor=white)](https://store.steampowered.com)

---