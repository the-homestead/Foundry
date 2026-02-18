import { jsonb, pgTable, text, uuid, varchar } from "drizzle-orm/pg-core";

export const games = pgTable("games", {
    id: uuid("id").primaryKey().notNull(),
    slug: varchar("slug", { length: 64 }).notNull().unique(),
    name: text("name").notNull(),
    description: text("description").notNull(),
    images: jsonb("images").notNull(), // { cover: string, icon: string, background: string, banner: string }
    capabilities: jsonb("capabilities").notNull(), // { versions: [], modloaders: [] }
    stats: jsonb("stats").notNull(), // { project_count: 0, download_count: 0, modpack_count: 0 }
});

export const categories = pgTable("categories", {
    id: uuid("id").primaryKey().notNull(),
    game_id: uuid("game_id")
        .notNull()
        .references(() => games.id),
    parent_id: uuid("parent_id"),
    slug: varchar("slug", { length: 64 }).notNull(),
    name: text("name").notNull(),
    description: text("description"),
    icon: text("icon"),
});
