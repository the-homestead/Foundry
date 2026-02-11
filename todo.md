# Foundry Admin & Browse Roadmap

This checklist tracks the admin dashboard redesign, game configuration, and browse experience build-out.

## ✅ Immediate foundation

- [ ] Confirm browse IA (game-first → projects/modpacks) and approve UI layout in `apps/web/src/app/[locale]/(projects)/browse`.
- [ ] Define the core entities to manage in admin: games, categories, tags, projects, modpacks, packs, loaders, versions.
- [ ] Align on moderation & visibility rules (adult content, launcher support, verified status).

## 🧩 Admin dashboard (adash) redesign

- [ ] Create a dashboard shell with modular sections (games, categories, projects, modpacks, packs, users, reports).
- [ ] Add a navigation system (left rail + search) for quick switching between admin modules.
- [ ] Build CRUD views for:
  - [ ] Games (name, slug, logo/cover, supported loaders, versions, default sidebar config)
  - [ ] Categories (per-game mapping, order, icon)
  - [ ] Tags (global + per-game, allow/deny lists)
  - [ ] Projects/Mods (ownership, visibility, status)
  - [ ] Modpacks (included projects, versions)
  - [ ] Packs (distribution bundles, manifests)
- [ ] Add a flexible sidebar-config editor (field builder) to control per-game filters:
  - [ ] Field types: select, multiselect, range slider, text input, toggle
  - [ ] Grouping: sections (collapse by default), ordering, labels
  - [ ] Visibility rules: game-specific, view-specific (games / modpacks / projects)
- [ ] Add bulk actions (publish, unpublish, highlight, feature, archive).
- [ ] Add audit log view for admin actions and content changes.

## 🗂️ Database & schemas (packages/database)

- [ ] Add `games` table (id, slug, name, description, cover, logo, active, order).
- [ ] Add `game_versions`, `loaders`, `environments`, `licenses` tables.
- [ ] Add `categories` table with per-game join table.
- [ ] Add `tags` table (global + per-game mapping).
- [ ] Add `sidebar_configs` table (game_id, view, json schema).
- [ ] Add `projects` + `modpacks` metadata tables (downloads, likes, last_updated, size).
- [ ] Add `project_downloads`/`project_stats` rollups for sorting.
- [ ] Create migrations + Drizzle relations for all new tables.

## 🔌 Backend API (services/backend)

- [ ] Public endpoints for games list + game stats.
- [ ] Browse endpoints for projects/modpacks (filters, sorting, pagination).
- [ ] Admin endpoints for CRUD operations + validation.
- [ ] Endpoint for sidebar configuration per game + view.
- [ ] Rate limits, caching, and search indexing strategy.

## 🧭 Browse UX (apps/web)

- [ ] Game selection step with hero art, stats badges, and quick actions.
- [ ] Sidebar: collapse/expand, side switch, per-game field rendering.
- [ ] Main grid: spacing slider, grid count selector, sort options.
- [ ] Responsive layout: mobile-first, stacked controls, sticky filters.
- [ ] Empty states for "no game selected" and "no results".

## 🔎 Filtering & sorting rules

- [ ] Define which sort options apply per view (games, projects, modpacks).
- [ ] Implement filter rules for Minecraft vs Skyrim (loader, version, environment, etc.).
- [ ] Add tag include/exclude filters and file size range.
- [ ] Add language selector + content toggles (adult content, launcher support, updated only).

## ✅ Quality & testing

- [ ] Add test coverage for filter parsing and sorting on the backend.
- [ ] Snapshot UI tests for the browse page layout.
- [ ] Load tests for browse endpoints with high filter volume.

## 🧭 Next decisions

- [ ] Decide how admin permissions map to roles and organizations.
- [ ] Decide where the sidebar schema editor lives (adash vs separate admin route).
- [ ] Decide on analytics capture (sorting, filters, search usage).
