import { and, count, desc, eq } from "drizzle-orm";
import { db } from "../../index";
import { project_collaborators, project_likes, project_links } from "./tables";

/**
 * Check if a user is the owner or has edit permission for a project
 */
export async function canEditProject(projectId: string, userId: string, ownerId: string): Promise<boolean> {
    // Check if user is the owner
    if (userId === ownerId) {
        return true;
    }

    // Check if user is a collaborator with edit permission
    const collaborator = await db
        .select()
        .from(project_collaborators)
        .where(and(eq(project_collaborators.project_id, projectId), eq(project_collaborators.user_id, userId)))
        .limit(1);

    const firstCollaborator = collaborator[0];
    if (!firstCollaborator) {
        return false;
    }

    return firstCollaborator.permission_level === "edit" || firstCollaborator.permission_level === "admin";
}

/**
 * Get or create a user's like status for a project
 */
export async function getUserProjectLike(projectId: string, userId: string) {
    const result = await db
        .select()
        .from(project_likes)
        .where(and(eq(project_likes.project_id, projectId), eq(project_likes.user_id, userId)))
        .limit(1);

    return result[0] ?? null;
}

/**
 * Set a user's like/dislike for a project
 * @param isLike 1 for like, -1 for dislike, 0 to remove
 */
export async function setProjectLike(projectId: string, userId: string, isLike: number) {
    const existing = await getUserProjectLike(projectId, userId);
    const now = new Date();

    if (existing) {
        return await db
            .update(project_likes)
            .set({
                is_like: isLike,
                updated_at: now,
            })
            .where(eq(project_likes.id, existing.id))
            .returning();
    }

    return await db
        .insert(project_likes)
        .values({
            id: crypto.randomUUID(),
            project_id: projectId,
            user_id: userId,
            is_like: isLike,
            created_at: now,
            updated_at: now,
        })
        .returning();
}

/**
 * Get the like/dislike counts for a project
 */
export async function getProjectLikeCounts(projectId: string) {
    const likes = await db
        .select({ count: count() })
        .from(project_likes)
        .where(and(eq(project_likes.project_id, projectId), eq(project_likes.is_like, 1)));

    const dislikes = await db
        .select({ count: count() })
        .from(project_likes)
        .where(and(eq(project_likes.project_id, projectId), eq(project_likes.is_like, -1)));

    return {
        likes: likes[0]?.count ?? 0,
        dislikes: dislikes[0]?.count ?? 0,
    };
}

/**
 * Get GitHub link from project links
 */
export async function getProjectGitHubLink(projectId: string): Promise<string | null> {
    const links = await db.select().from(project_links).where(eq(project_links.project_id, projectId));

    const githubLink = links.find((link) => link.url.includes("github.com") || link.label.toLowerCase().includes("github"));

    return githubLink?.url ?? null;
}

/**
 * Add a collaborator to a project
 */
export async function addProjectCollaborator(projectId: string, userId: string, addedBy: string, permissionLevel = "edit") {
    const now = new Date();

    return await db
        .insert(project_collaborators)
        .values({
            id: crypto.randomUUID(),
            project_id: projectId,
            user_id: userId,
            permission_level: permissionLevel,
            added_at: now,
            added_by: addedBy,
        })
        .returning();
}

/**
 * Remove a collaborator from a project
 */
export async function removeProjectCollaborator(projectId: string, userId: string) {
    return await db
        .delete(project_collaborators)
        .where(and(eq(project_collaborators.project_id, projectId), eq(project_collaborators.user_id, userId)))
        .returning();
}

/**
 * Get all collaborators for a project
 */
export async function getProjectCollaborators(projectId: string) {
    return await db.select().from(project_collaborators).where(eq(project_collaborators.project_id, projectId)).orderBy(desc(project_collaborators.added_at));
}
