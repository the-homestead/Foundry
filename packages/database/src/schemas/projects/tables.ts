import { integer, jsonb, pgTable, text, timestamp, uuid, varchar } from "drizzle-orm/pg-core";
import { games } from "../games/tables";

export const projects = pgTable("projects", {
    id: uuid("id").primaryKey().notNull(),
    slug: varchar("slug", { length: 64 }).notNull().unique(),
    name: text("name").notNull(),
    metadata: jsonb("metadata").notNull(),
    categories: jsonb("categories").notNull(),
    sub_categories: jsonb("sub_categories").notNull(),
    description: text("description").notNull(),
    license: text("license"),
    version: varchar("version", { length: 32 }).notNull(),
    links: jsonb("links").notNull(),
    status: integer("status").notNull(),
    type: varchar("type", { length: 32 }).notNull(),
    body: text("body").notNull(),
    icon_url: text("icon_url"),
    banner_url: text("banner_url"),
    color: varchar("color", { length: 16 }),
    created_at: timestamp("created_at", { withTimezone: true }).notNull(),
    updated_at: timestamp("updated_at", { withTimezone: true }).notNull(),
    owner_id: text("owner_id").notNull(),
    game_id: uuid("game_id")
        .notNull()
        .references(() => games.id),
});

export const project_files = pgTable("project_files", {
    id: uuid("id").primaryKey().notNull(),
    project_id: uuid("project_id")
        .notNull()
        .references(() => projects.id),
    name: text("name").notNull(),
    version: varchar("version", { length: 32 }).notNull(),
    size: varchar("size", { length: 32 }).notNull(),
    uploaded: timestamp("uploaded", { withTimezone: true }).notNull(),
    downloads: integer("downloads").notNull().default(0),
    unique_downloads: integer("unique_downloads"),
    channel: varchar("channel", { length: 32 }).notNull(),
    last_downloaded: timestamp("last_downloaded", { withTimezone: true }),
    banner_url: text("banner_url"),
    dependencies: jsonb("dependencies"),
});

export const project_gantt = pgTable("project_gantt", {
    id: uuid("id").primaryKey().notNull(),
    project_id: uuid("project_id")
        .notNull()
        .references(() => projects.id),
    name: text("name").notNull(),
    start_at: timestamp("start_at", { withTimezone: true }).notNull(),
    end_at: timestamp("end_at", { withTimezone: true }).notNull(),
    status: jsonb("status").notNull(),
    lane: varchar("lane", { length: 32 }).notNull(),
    metadata: jsonb("metadata"),
});

export const project_gantt_markers = pgTable("project_gantt_markers", {
    id: uuid("id").primaryKey().notNull(),
    project_id: uuid("project_id")
        .notNull()
        .references(() => projects.id),
    label: text("label").notNull(),
    date: timestamp("date", { withTimezone: true }).notNull(),
});

export const project_kanban_columns = pgTable("project_kanban_columns", {
    id: uuid("id").primaryKey().notNull(),
    project_id: uuid("project_id")
        .notNull()
        .references(() => projects.id),
    name: text("name").notNull(),
});

export const project_kanban_cards = pgTable("project_kanban_cards", {
    id: uuid("id").primaryKey().notNull(),
    project_id: uuid("project_id")
        .notNull()
        .references(() => projects.id),
    name: text("name").notNull(),
    column: uuid("column")
        .notNull()
        .references(() => project_kanban_columns.id),
});

export const project_gallery = pgTable("project_gallery", {
    id: uuid("id").primaryKey().notNull(),
    project_id: uuid("project_id")
        .notNull()
        .references(() => projects.id),
    title: text("title").notNull(),
    tone: varchar("tone", { length: 64 }).notNull(),
    aspect: integer("aspect").notNull(),
    image: text("image"),
});
// Posts table: stores project blog/news posts
export const project_posts = pgTable("project_posts", {
    id: uuid("id").primaryKey().notNull(),
    project_id: uuid("project_id")
        .notNull()
        .references(() => projects.id),
    title: text("title").notNull(),
    date: timestamp("date", { withTimezone: true }).notNull(),
    excerpt: text("excerpt").notNull(),
    content: text("content").notNull(),
    comments: integer("comments").notNull().default(0),
});

// Issue templates table: stores reusable issue templates for the project
export const project_issue_templates = pgTable("project_issue_templates", {
    id: uuid("id").primaryKey().notNull(),
    project_id: uuid("project_id")
        .notNull()
        .references(() => projects.id),
    title: text("title").notNull(),
    description: text("description").notNull(),
});

// Activity table: stores timeline/activity entries for the project
export const project_activity = pgTable("project_activity", {
    id: uuid("id").primaryKey().notNull(),
    project_id: uuid("project_id")
        .notNull()
        .references(() => projects.id),
    title: text("title").notNull(),
    content: text("content").notNull(),
    created_at: timestamp("created_at", { withTimezone: true }).notNull(),
});

// Links table: stores additional project links (besides the main links JSON)
export const project_links = pgTable("project_links", {
    id: uuid("id").primaryKey().notNull(),
    project_id: uuid("project_id")
        .notNull()
        .references(() => projects.id),
    label: text("label").notNull(),
    url: text("url").notNull(),
});

// Creators table: stores project creators/contributors
export const project_creators = pgTable("project_creators", {
    id: uuid("id").primaryKey().notNull(),
    project_id: uuid("project_id")
        .notNull()
        .references(() => projects.id),
    name: text("name").notNull(),
    role: text("role").notNull(),
    avatar_url: text("avatar_url"),
});

// Likes table: stores user likes/dislikes for projects
export const project_likes = pgTable("project_likes", {
    id: uuid("id").primaryKey().notNull(),
    project_id: uuid("project_id")
        .notNull()
        .references(() => projects.id),
    user_id: text("user_id").notNull(),
    is_like: integer("is_like").notNull(), // 1 for like, -1 for dislike, 0 for removed
    created_at: timestamp("created_at", { withTimezone: true }).notNull(),
    updated_at: timestamp("updated_at", { withTimezone: true }).notNull(),
});

// Collaborators table: stores users who can edit the project
export const project_collaborators = pgTable("project_collaborators", {
    id: uuid("id").primaryKey().notNull(),
    project_id: uuid("project_id")
        .notNull()
        .references(() => projects.id),
    user_id: text("user_id").notNull(),
    permission_level: varchar("permission_level", { length: 32 }).notNull(), // 'edit', 'admin', etc.
    added_at: timestamp("added_at", { withTimezone: true }).notNull(),
    added_by: text("added_by").notNull(),
});
