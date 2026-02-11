import { eq } from "drizzle-orm";
import { createSelectSchema } from "drizzle-zod";
import type { z } from "zod";
import { db } from "../index";
import { games } from "../schemas/games/tables";
import {
    project_activity,
    project_creators,
    project_files,
    project_gallery,
    project_gantt,
    project_gantt_markers,
    project_issue_templates,
    project_kanban_cards,
    project_kanban_columns,
    project_links,
    project_posts,
    projects,
} from "../schemas/projects/tables";

// Generate Zod schemas from Drizzle tables
const projectSelectSchema = createSelectSchema(projects);
const gameSelectSchema = createSelectSchema(games);
const projectFileSelectSchema = createSelectSchema(project_files);
const projectGanttSelectSchema = createSelectSchema(project_gantt);
const projectGanttMarkerSelectSchema = createSelectSchema(project_gantt_markers);
const projectKanbanColumnSelectSchema = createSelectSchema(project_kanban_columns);
const projectKanbanCardSelectSchema = createSelectSchema(project_kanban_cards);
const projectGallerySelectSchema = createSelectSchema(project_gallery);
const projectPostSelectSchema = createSelectSchema(project_posts);
const projectIssueTemplateSelectSchema = createSelectSchema(project_issue_templates);
const projectActivitySelectSchema = createSelectSchema(project_activity);
const projectLinkSelectSchema = createSelectSchema(project_links);
const projectCreatorSelectSchema = createSelectSchema(project_creators);

// Infer TypeScript types from Zod schemas
export type ProjectSelect = z.infer<typeof projectSelectSchema>;
export type GameSelect = z.infer<typeof gameSelectSchema>;
export type ProjectFileSelect = z.infer<typeof projectFileSelectSchema>;
export type ProjectGanttSelect = z.infer<typeof projectGanttSelectSchema>;
export type ProjectGanttMarkerSelect = z.infer<typeof projectGanttMarkerSelectSchema>;
export type ProjectKanbanColumnSelect = z.infer<typeof projectKanbanColumnSelectSchema>;
export type ProjectKanbanCardSelect = z.infer<typeof projectKanbanCardSelectSchema>;
export type ProjectGallerySelect = z.infer<typeof projectGallerySelectSchema>;
export type ProjectPostSelect = z.infer<typeof projectPostSelectSchema>;
export type ProjectIssueTemplateSelect = z.infer<typeof projectIssueTemplateSelectSchema>;
export type ProjectActivitySelect = z.infer<typeof projectActivitySelectSchema>;
export type ProjectLinkSelect = z.infer<typeof projectLinkSelectSchema>;
export type ProjectCreatorSelect = z.infer<typeof projectCreatorSelectSchema>;

// Combined type for project with game data
export interface ProjectWithGame {
    project: ProjectSelect;
    game: GameSelect | null;
}

export async function getProjectBySlug(slug: string): Promise<ProjectWithGame | null> {
    const [row] = await db.select().from(projects).where(eq(projects.slug, slug)).limit(1);
    if (!row) {
        return null;
    }

    const project = projectSelectSchema.parse(row);

    // Fetch game data
    const [gameRow] = await db.select().from(games).where(eq(games.id, project.game_id)).limit(1);
    const game = gameRow ? gameSelectSchema.parse(gameRow) : null;

    return { project, game };
}

export async function getProjectFiles(projectId: string): Promise<ProjectFileSelect[]> {
    const rows = await db.select().from(project_files).where(eq(project_files.project_id, projectId));
    return rows.map((row) => projectFileSelectSchema.parse(row));
}

export async function getProjectGantt(projectId: string): Promise<ProjectGanttSelect[]> {
    const rows = await db.select().from(project_gantt).where(eq(project_gantt.project_id, projectId));
    return rows.map((row) => projectGanttSelectSchema.parse(row));
}

export async function getProjectGanttMarkers(projectId: string): Promise<ProjectGanttMarkerSelect[]> {
    const rows = await db.select().from(project_gantt_markers).where(eq(project_gantt_markers.project_id, projectId));
    return rows.map((row) => projectGanttMarkerSelectSchema.parse(row));
}

export async function getProjectKanbanColumns(projectId: string): Promise<ProjectKanbanColumnSelect[]> {
    const rows = await db.select().from(project_kanban_columns).where(eq(project_kanban_columns.project_id, projectId));
    return rows.map((row) => projectKanbanColumnSelectSchema.parse(row));
}

export async function getProjectKanbanCards(projectId: string): Promise<ProjectKanbanCardSelect[]> {
    const rows = await db.select().from(project_kanban_cards).where(eq(project_kanban_cards.project_id, projectId));
    return rows.map((row) => projectKanbanCardSelectSchema.parse(row));
}

export async function getProjectGallery(projectId: string): Promise<ProjectGallerySelect[]> {
    const rows = await db.select().from(project_gallery).where(eq(project_gallery.project_id, projectId));
    return rows.map((row) => projectGallerySelectSchema.parse(row));
}

export async function getProjectPosts(projectId: string): Promise<ProjectPostSelect[]> {
    const rows = await db.select().from(project_posts).where(eq(project_posts.project_id, projectId));
    return rows.map((row) => projectPostSelectSchema.parse(row));
}

export async function getProjectIssueTemplates(projectId: string): Promise<ProjectIssueTemplateSelect[]> {
    const rows = await db.select().from(project_issue_templates).where(eq(project_issue_templates.project_id, projectId));
    return rows.map((row) => projectIssueTemplateSelectSchema.parse(row));
}

export async function getProjectActivity(projectId: string): Promise<ProjectActivitySelect[]> {
    const rows = await db.select().from(project_activity).where(eq(project_activity.project_id, projectId));
    return rows.map((row) => projectActivitySelectSchema.parse(row));
}

export async function getProjectLinks(projectId: string): Promise<ProjectLinkSelect[]> {
    const rows = await db.select().from(project_links).where(eq(project_links.project_id, projectId));
    return rows.map((row) => projectLinkSelectSchema.parse(row));
}

export async function getProjectCreators(projectId: string): Promise<ProjectCreatorSelect[]> {
    const rows = await db.select().from(project_creators).where(eq(project_creators.project_id, projectId));
    return rows.map((row) => projectCreatorSelectSchema.parse(row));
}

export interface ProjectStats {
    totalDownloads: number;
    uniqueDownloads: number;
    fileCount: number;
}

export async function getProjectStats(projectId: string): Promise<ProjectStats> {
    const files = await db.select().from(project_files).where(eq(project_files.project_id, projectId));

    const totalDownloads = files.reduce((sum, file) => sum + file.downloads, 0);
    const uniqueDownloads = files.reduce((sum, file) => sum + (file.unique_downloads ?? 0), 0);
    const fileCount = files.length;

    return {
        totalDownloads,
        uniqueDownloads,
        fileCount,
    };
}
