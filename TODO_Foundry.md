# Foundry Project Plan - Browse Page & Admin Dashboard

## 1. Database Schema

- [x] Create `games` schema in `packages/database/src/schemas/games`
  - `id` (uuid)
  - `slug` (varchar, unique)
  - `name` (text)
  - `description` (text)
  - `images` (jsonb: cover, icon, background)
  - `capabilities` (jsonb: supported filters like version, modloader)
  - `stats` (jsonb: project_count, download_count, modpack_count)
- [x] Create `categories` schema
  - `id` (uuid)
  - `game_id` (uuid, fk)
  - `slug` (varchar)
  - `name` (text)
  - `icon` (text)
- [x] Update `projects` schema
  - Add `game_id` (uuid, fk to games)
  - Index `game_id` for performance

## 2. Frontend - Browse Page (User Facing)

### Phase 1: Game Selection (`/browse`)

- [ ] Create Game Selector Layout
  - [ ] Fetch games from DB (or mock for now)
  - [ ] Display games in a clean grid
  - [ ] Medium/Large generic card component for Game
    - Image/Cover art
    - Title
    - Badges: Project Count, Total Downloads, Modpacks Count
- [ ] Search/Filter for Games (optional for v1 but good to have)

### Phase 2: Project Browser (`/browse/[game]`)

- [x] Dynamic Route Setup
- [x] Layout Structure
  - Sidebar (Left or Right - configurable)
  - Main Content Grid
- [x] **Sidebar Components** (Modular & Collapsible)
  - [x] Game Version Selector (if applicable)
  - [x] Mod Loader Selector (if applicable)
  - [x] Categories Tree/List
  - [ ] Sliders (File Size, etc.)
  - [ ] Text Filters (Name, Description, Author)
  - [ ] Toggles (Adult Content, Supported Launchers)
  - [ ] "Switch Side" button feature
- [x] **Main Content Area**
    - [x] Control Bar
        - Grid Spacing Slider
        - Grid Columns Dropdown
        - Sort Dropdown
    - [x] Project Grid
        - Project Card Component (Thumbnail, Title, Author, Downloads, Updated)
    - [ ] Pagination/Infinite Scroll

## 3. Admin Dashboard (`/admin`)
- [x] Dashboard Shell/Layout
- [x] Game Management
    - [x] List Games
    - [ ] Add/Edit Game
        - [x] Add Game Form (TanStack Form + Zod)
        - [ ] Edit Game Flow
        - [x] Configure capabilities (Does it have mod loaders? Versions?)
        - [ ] Configure Sidebar options per game
- [ ] Category Management
- [ ] Project Management (Review/Edit)
- [ ] User Management Reference (Integrate `management` fully)

## 4. Advanced Features (Todo)

- [ ] **Data Management**
    - [ ] Seed Script for Games/Categories
    - [ ] "Scan for Games" feature (if local)?
- [ ] **Search & Filtering Logic**
    - [ ] Implement URL State Sync (nuqs or next-usequerystate)
    - [ ] Backend filtering implementation (Drizzle dynamic queries)
    - [ ] Full text search integration (Postgres TSVector or Meilisearch?)

## 5. Implementation Details

- **Mobile First**: responsive grid (1 col mobile, up to X col desktop).
- **Theme**: Use `@foundry/ui` primitives.

---

## Getting Started

1. Define `games` schema.
2. Seed mock data.
3. Build `/browse` (Game Selector).
4. Build `/browse/[game]` (Skeleton).
