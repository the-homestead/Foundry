// import type {
//     GanttFeature,
//     GanttMarker,
//     KanbanCard,
//     KanbanColumn,
//     ProjectActivityEntry,
//     ProjectCreator,
//     ProjectFile,
//     ProjectGalleryImage,
//     ProjectIssueTemplate,
//     ProjectLink,
//     ProjectPost,
// } from "@foundry/types";
// import { eq } from "drizzle-orm";
// import { db } from "../index";
// import {
//     project_activity,
//     project_creators,
//     project_files,
//     project_gallery,
//     project_gantt,
//     project_gantt_markers,
//     project_issue_templates,
//     project_kanban_cards,
//     project_kanban_columns,
//     project_links,
//     project_posts,
// } from "../schemas/projects/tables";

// export async function getProjectFiles(projectId: string): Promise<ProjectFile[]> {
//     const rows = await db.select().from(project_files).where(eq(project_files.project_id, projectId));
//     return rows.map((row) => ({
//         id: row.id,
//         project_id: row.project_id,
//         name: row.name,
//         version: row.version,
//         size: row.size,
//         uploaded: row.uploaded instanceof Date ? row.uploaded.toISOString() : String(row.uploaded),
//         downloads: row.downloads,
//         unique_downloads: row.unique_downloads === null ? undefined : row.unique_downloads,
//         channel: row.channel,
//         last_downloaded: row.last_downloaded instanceof Date ? row.last_downloaded.toISOString() : row.last_downloaded ? String(row.last_downloaded) : undefined,
//         banner_url: row.banner_url,
//         dependencies: row.dependencies,
//     }));
// }

// export async function getProjectGantt(projectId: string): Promise<GanttFeature[]> {
//     const rows = await db.select().from(project_gantt).where(eq(project_gantt.project_id, projectId));
//     return rows.map((row) => ({
//         id: row.id,
//         project_id: row.project_id,
//         name: row.name,
//         startAt: row.start_at instanceof Date ? row.start_at.toISOString() : String(row.start_at),
//         endAt: row.end_at instanceof Date ? row.end_at.toISOString() : String(row.end_at),
//         status: row.status as GanttFeature["status"],
//         lane: row.lane,
//         metadata: row.metadata,
//     }));
// }

// export async function getProjectGanttMarkers(projectId: string): Promise<GanttMarker[]> {
//     const rows = await db.select().from(project_gantt_markers).where(eq(project_gantt_markers.project_id, projectId));
//     return rows.map((row) => ({
//         id: row.id,
//         project_id: row.project_id,
//         label: row.label,
//         date: row.date instanceof Date ? row.date.toISOString() : String(row.date),
//     }));
// }

// export async function getProjectKanbanColumns(projectId: string): Promise<KanbanColumn[]> {
//     const rows = await db.select().from(project_kanban_columns).where(eq(project_kanban_columns.project_id, projectId));
//     return rows.map((row) => ({
//         id: row.id,
//         project_id: row.project_id,
//         name: row.name,
//     }));
// }

// export async function getProjectKanbanCards(projectId: string): Promise<KanbanCard[]> {
//     const rows = await db.select().from(project_kanban_cards).where(eq(project_kanban_cards.project_id, projectId));
//     return rows.map((row) => ({
//         id: row.id,
//         project_id: row.project_id,
//         name: row.name,
//         column: row.column,
//     }));
// }

// export async function getProjectGallery(projectId: string): Promise<ProjectGalleryImage[]> {
//     const rows = await db.select().from(project_gallery).where(eq(project_gallery.project_id, projectId));
//     return rows.map((row) => ({
//         id: row.id,
//         project_id: row.project_id,
//         title: row.title,
//         tone: row.tone,
//         aspect: row.aspect,
//         image: row.image === null ? undefined : row.image,
//     }));
// }

// export async function getProjectPosts(projectId: string): Promise<ProjectPost[]> {
//     const rows = await db.select().from(project_posts).where(eq(project_posts.project_id, projectId));
//     return rows.map((row) => ({
//         id: row.id,
//         project_id: row.project_id,
//         title: row.title,
//         date: row.date instanceof Date ? row.date.toISOString() : String(row.date),
//         excerpt: row.excerpt,
//         content: row.content,
//         comments: row.comments,
//     }));
// }

// export async function getProjectIssueTemplates(projectId: string): Promise<ProjectIssueTemplate[]> {
//     const rows = await db.select().from(project_issue_templates).where(eq(project_issue_templates.project_id, projectId));
//     return rows.map((row) => ({
//         id: row.id,
//         project_id: row.project_id,
//         title: row.title,
//         description: row.description,
//     }));
// }

// export async function getProjectActivity(projectId: string): Promise<ProjectActivityEntry[]> {
//     const rows = await db.select().from(project_activity).where(eq(project_activity.project_id, projectId));
//     return rows.map((row) => ({
//         id: row.id,
//         project_id: row.project_id,
//         title: row.title,
//         content: row.content,
//         created_at: row.created_at instanceof Date ? row.created_at.toISOString() : String(row.created_at),
//     }));
// }

// export async function getProjectLinks(projectId: string): Promise<ProjectLink[]> {
//     const rows = await db.select().from(project_links).where(eq(project_links.project_id, projectId));
//     return rows.map((row) => ({
//         id: row.id,
//         project_id: row.project_id,
//         label: row.label,
//         url: row.url,
//     }));
// }

// export async function getProjectCreators(projectId: string): Promise<ProjectCreator[]> {
//     const rows = await db.select().from(project_creators).where(eq(project_creators.project_id, projectId));
//     return rows.map((row) => ({
//         id: row.id,
//         project_id: row.project_id,
//         name: row.name,
//         role: row.role,
//         avatar_url: row.avatar_url,
//     }));
// }
