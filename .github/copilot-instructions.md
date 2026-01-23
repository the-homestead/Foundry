---
applyTo: "**/*.{ts,tsx,js,jsx}"
---

# Foundry AI instructions

## Architecture
- Monorepo with Turborepo + pnpm workspaces: apps (Next.js), services (Hono API), packages (ui/database/configs/types).
- Web app uses Next.js App Router under [apps/web/src/app](apps/web/src/app), with root layout in [apps/web/src/app/layout.tsx](apps/web/src/app/layout.tsx#L1) that wires Theme providers, sidebar layout, and UI CSS from @foundry/ui.
- UI components live in [packages/ui/src](packages/ui/src); prefer imports from @foundry/ui (see exported entrypoints in [packages/ui/package.json](packages/ui/package.json#L1)).
- Backend service is Hono in [services/backend/src/index.ts](services/backend/src/index.ts#L1): registers routes, serves OpenAPI at /openapi.json, rate-limits requests, and listens on port 3100.
- Route pattern: use `createRouter()` from [services/backend/src/lib/create-app.ts](services/backend/src/lib/create-app.ts#L1) with Zod v4 schemas from [services/backend/src/schemas/index.ts](services/backend/src/schemas/index.ts#L1) and `hono-openapi` describeRoute/validator (example in [services/backend/src/routes/main.ts](services/backend/src/routes/main.ts#L1)).

## Auth + DB
- Auth is configured in [services/backend/src/lib/auth.ts](services/backend/src/lib/auth.ts#L1) using Better Auth + Drizzle adapter; OAuth providers are enabled only when env vars are present.
- Client auth hooks live in [apps/web/src/lib/auth-client.ts](apps/web/src/lib/auth-client.ts#L1); use `useSession()` and client-side redirects for auth-gated pages.
- Database setup is in [packages/database/src/index.ts](packages/database/src/index.ts#L1) (Drizzle + pg pool + dotenv-mono). `DATABASE_URL` is required.
- Auth tables are auto-generated in [packages/database/src/schemas/users/tables.ts](packages/database/src/schemas/users/tables.ts#L1). Update schema via [services/backend/src/lib/auth.ts](services/backend/src/lib/auth.ts#L1) and regenerate using [services/backend/src/lib/auth-db.ts](services/backend/src/lib/auth-db.ts#L1); do not edit generated tables directly.

## Commands
- Web dev: `pnpm --filter @foundry/web dev`. Backend dev: `pnpm --filter @foundry/backend dev`.
- Lint/format: `pnpm dlx ultracite check` and `pnpm dlx ultracite fix`.
- DB tools: `pnpm --filter @foundry/database db:check|db:migrate|db:generate`.
- UI components: `pnpm --filter @foundry/ui ui:add <component>`.
