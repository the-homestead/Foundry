"use server";

import { canEditProject, db, eq, getProjectBySlug, getProjectGitHubLink, getProjectLikeCounts, getUserProjectLike, setProjectLike } from "@foundry/database";
import { project_files, project_gallery, projects } from "@foundry/database/schemas/projects/tables";
import { getServerSession } from "@foundry/web/lib/get-server-session";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";

/**
 * Track a download for a project file
 */
export async function trackDownload(fileId: string) {
    try {
        // Increment download count
        const [file] = await db.select().from(project_files).where(eq(project_files.id, fileId)).limit(1);

        if (!file) {
            return { success: false, error: "File not found" };
        }

        await db
            .update(project_files)
            .set({
                downloads: file.downloads + 1,
                last_downloaded: new Date(),
            })
            .where(eq(project_files.id, fileId));

        // Revalidate the project page to show updated download count
        revalidatePath("/project/[...id]");

        return { success: true };
    } catch (error) {
        console.error("Error tracking download:", error);
        return { success: false, error: "Failed to track download" };
    }
}

/**
 * Add project to user's collection (placeholder - needs user auth and collections table)
 */
// biome-ignore lint/suspicious/useAwait: Placeholder function for future async implementation
export async function addToCollection(projectId: string) {
    // TODO: Implement collections functionality
    // This would require:
    // 1. User authentication check
    // 2. Collections table in database
    // 3. Insert into user_collections table

    console.log(`TODO: Add project ${projectId} to user collection`);

    return { success: true, message: "Collection feature coming soon!" };
}

/**
 * Follow/subscribe to project updates (placeholder - needs user auth and subscriptions table)
 */
// biome-ignore lint/suspicious/useAwait: Placeholder function for future async implementation
export async function followProject(projectId: string) {
    // TODO: Implement follow functionality
    // This would require:
    // 1. User authentication check
    // 2. Project subscriptions table
    // 3. Notification system

    console.log(`TODO: Follow project ${projectId}`);

    return { success: true, message: "Follow feature coming soon!" };
}

/**
 * Rate a project (placeholder - needs user auth and ratings table)
 */
// biome-ignore lint/suspicious/useAwait: Placeholder function for future async implementation
export async function rateProject(projectId: string, rating: number) {
    if (rating < 1 || rating > 5) {
        return { success: false, error: "Rating must be between 1 and 5" };
    }

    // TODO: Implement rating functionality
    // This would require:
    // 1. User authentication check
    // 2. Project ratings table
    // 3. Calculate average rating
    // 4. Prevent duplicate ratings from same user

    console.log(`TODO: Rate project ${projectId} with ${rating} stars`);

    return { success: true, message: "Rating feature coming soon!" };
}

/**
 * Report a project (placeholder - needs user auth and reports table)
 */
// biome-ignore lint/suspicious/useAwait: Placeholder function for future async implementation
export async function reportProject(projectId: string, reason: string, _description: string) {
    // TODO: Implement reporting functionality
    // This would require:
    // 1. User authentication check
    // 2. Project reports table
    // 3. Moderation queue system
    // 4. Email notifications to moderators

    console.log(`TODO: Report project ${projectId} - Reason: ${reason}`);

    return { success: true, message: "Report feature coming soon!" };
}

interface UpdateProjectData {
    name: string;
    slug: string;
    description: string;
    body: string;
    version: string;
    type: string;
    license: string;
    icon_url: string;
    banner_url: string;
    color: string;
    categories: string[];
    links: Record<string, string>;
}

/**
 * Update an existing project
 */
export async function updateProject(projectId: string, data: UpdateProjectData) {
    try {
        // Get authenticated session
        const session = (await getServerSession(await headers())) as { user?: { id?: string } } | null;
        if (!session?.user) {
            return { success: false, error: "You must be logged in to update a project" };
        }

        // Verify user owns this project
        const project = await db.query.projects.findFirst({
            where: eq(projects.id, projectId),
        });

        if (!project) {
            return { success: false, error: "Project not found" };
        }

        if (project.owner_id !== session.user.id) {
            return { success: false, error: "You don't have permission to edit this project" };
        }

        // Update the project
        await db
            .update(projects)
            .set({
                name: data.name,
                slug: data.slug,
                description: data.description,
                body: data.body,
                version: data.version,
                type: data.type,
                license: data.license || null,
                icon_url: data.icon_url || null,
                banner_url: data.banner_url || null,
                color: data.color || null,
                categories: data.categories,
                links: data.links,
                updated_at: new Date(),
            })
            .where(eq(projects.id, projectId));

        // Revalidate the project page
        revalidatePath(`/project/${data.slug}`);
        revalidatePath(`/project/${data.slug}/edit`);

        return { success: true };
    } catch (error) {
        console.error("Error updating project:", error);
        return { success: false, error: "Failed to update project" };
    }
}

/**
 * Toggle like/dislike for a project
 * @param projectSlug The project slug
 * @param action 'like', 'dislike', or 'remove'
 */
export async function toggleProjectLike(projectSlug: string, action: "like" | "dislike" | "remove") {
    const session = (await getServerSession(await headers())) as { user?: { id?: string } } | null;

    if (!session?.user?.id) {
        return { error: "You must be logged in to like/dislike projects" };
    }

    const result = await getProjectBySlug(projectSlug);
    if (!result) {
        return { error: "Project not found" };
    }

    const { project } = result;

    let isLike = 0;
    if (action === "like") {
        isLike = 1;
    } else if (action === "dislike") {
        isLike = -1;
    }

    try {
        await setProjectLike(project.id, session.user.id, isLike);
        revalidatePath(`/project/${projectSlug}`);

        // Get updated counts
        const counts = await getProjectLikeCounts(project.id);
        return { success: true, counts };
    } catch {
        return { error: "Failed to update like status" };
    }
}

/**
 * Get like/dislike counts and user's current status for a project
 */
export async function getProjectLikeData(projectSlug: string) {
    const result = await getProjectBySlug(projectSlug);
    if (!result) {
        return { error: "Project not found" };
    }

    const { project } = result;
    const session = (await getServerSession(await headers())) as { user?: { id?: string } } | null;

    const counts = await getProjectLikeCounts(project.id);

    let userLike: number | null = null;
    if (session?.user?.id) {
        const like = await getUserProjectLike(project.id, session.user.id);
        userLike = like?.is_like ?? null;
    }

    return {
        success: true,
        counts,
        userLike,
    };
}

/**
 * Get GitHub link for a project if it exists
 */
export async function getProjectGitHub(projectSlug: string) {
    const result = await getProjectBySlug(projectSlug);
    if (!result) {
        return { error: "Project not found" };
    }

    const { project } = result;
    const githubUrl = await getProjectGitHubLink(project.id);

    return {
        success: true,
        githubUrl,
    };
}

/**
 * Check if current user can edit the project
 */
export async function checkCanEdit(projectSlug: string) {
    const session = (await getServerSession(await headers())) as { user?: { id?: string } } | null;

    if (!session?.user?.id) {
        return { canEdit: false };
    }

    const result = await getProjectBySlug(projectSlug);
    if (!result) {
        return { error: "Project not found" };
    }

    const { project } = result;
    const canEdit = await canEditProject(project.id, session.user.id, project.owner_id);

    return {
        canEdit,
        isOwner: session.user.id === project.owner_id,
    };
}

/**
 * Update project title
 */
export async function updateProjectTitle(projectSlug: string, title: string) {
    const session = (await getServerSession(await headers())) as { user?: { id?: string } } | null;

    if (!session?.user?.id) {
        return { error: "You must be logged in" };
    }

    const result = await getProjectBySlug(projectSlug);
    if (!result) {
        return { error: "Project not found" };
    }

    const { project } = result;
    const canEdit = await canEditProject(project.id, session.user.id, project.owner_id);

    if (!canEdit) {
        return { error: "You don't have permission to edit this project" };
    }

    try {
        await db
            .update(projects)
            .set({
                name: title,
                updated_at: new Date(),
            })
            .where(eq(projects.id, project.id));

        revalidatePath(`/project/${projectSlug}`);
        return { success: true };
    } catch {
        return { error: "Failed to update title" };
    }
}

/**
 * Update project description (summary)
 */
export async function updateProjectDescription(projectSlug: string, description: string) {
    const session = (await getServerSession(await headers())) as { user?: { id?: string } } | null;

    if (!session?.user?.id) {
        return { error: "You must be logged in" };
    }

    const result = await getProjectBySlug(projectSlug);
    if (!result) {
        return { error: "Project not found" };
    }

    const { project } = result;
    const canEdit = await canEditProject(project.id, session.user.id, project.owner_id);

    if (!canEdit) {
        return { error: "You don't have permission to edit this project" };
    }

    try {
        await db
            .update(projects)
            .set({
                description,
                updated_at: new Date(),
            })
            .where(eq(projects.id, project.id));

        revalidatePath(`/project/${projectSlug}`);
        return { success: true };
    } catch {
        return { error: "Failed to update description" };
    }
}

/**
 * Upload a file to the project
 */
export async function uploadProjectFile(projectSlug: string, fileData: FormData, fileType: "files" | "images" | "optional") {
    const session = (await getServerSession(await headers())) as { user?: { id?: string } } | null;

    if (!session?.user?.id) {
        return { error: "You must be logged in" };
    }

    const result = await getProjectBySlug(projectSlug);
    if (!result) {
        return { error: "Project not found" };
    }

    const { project } = result;
    const canEdit = await canEditProject(project.id, session.user.id, project.owner_id);

    if (!canEdit) {
        return { error: "You don't have permission to upload files to this project" };
    }

    try {
        const file = fileData.get("file") as File;
        if (!file) {
            return { error: "No file provided" };
        }

        // Check file size (50MB limit)
        const maxSize = 50 * 1024 * 1024; // 50MB
        if (file.size > maxSize) {
            return { error: "File size must be less than 50MB" };
        }

        // For executable files, perform VirusTotal check
        const isExecutable = file.name.endsWith(".exe") || file.name.endsWith(".dll") || file.name.endsWith(".msi");

        if (isExecutable) {
            // TODO: Implement VirusTotal API check
            // For now, we'll allow it but this should be implemented
            console.warn("Executable file uploaded - VirusTotal check should be implemented");
        }

        // Import storage functions dynamically to avoid edge runtime issues
        const { uploadFile, StoragePaths } = await import("@foundry/web/lib/storage");

        // Generate storage path
        const timestamp = Date.now();
        const sanitizedFilename = file.name.replace(/[^a-zA-Z0-9.-]/g, "_");
        const filename = `${timestamp}_${sanitizedFilename}`;

        let storagePath: string;
        if (fileType === "files") {
            storagePath = `${StoragePaths.Project.files(project.id)}/${filename}`;
        } else if (fileType === "images") {
            storagePath = `${StoragePaths.Project.images(project.id)}/${filename}`;
        } else {
            storagePath = `${StoragePaths.Project.optional(project.id)}/${filename}`;
        }

        // Convert File to ArrayBuffer for upload
        const arrayBuffer = await file.arrayBuffer();
        const uint8Array = new Uint8Array(arrayBuffer);

        // Upload to Bunny CDN
        await uploadFile(storagePath, uint8Array, {
            contentType: file.type || "application/octet-stream",
        });

        // If it's a main project file, add to database
        if (fileType === "files") {
            const version = (fileData.get("version") as string) || project.version;
            const channel = (fileData.get("channel") as string) || "stable";

            await db.insert(project_files).values({
                id: crypto.randomUUID(),
                project_id: project.id,
                name: file.name,
                version,
                size: `${(file.size / 1024 / 1024).toFixed(2)} MB`,
                uploaded: new Date(),
                downloads: 0,
                channel,
            });
        }

        revalidatePath(`/project/${projectSlug}`);
        return { success: true, filename, path: storagePath };
    } catch (error) {
        console.error("File upload error:", error);
        return { error: "Failed to upload file" };
    }
}

/**
 * Delete a file from the project
 */
export async function deleteProjectFile(projectSlug: string, filePath: string, fileId?: string) {
    const session = await getServerSession(await headers());

    if (!session?.user?.id) {
        return { error: "You must be logged in" };
    }

    const result = await getProjectBySlug(projectSlug);
    if (!result) {
        return { error: "Project not found" };
    }

    const { project } = result;
    const canEdit = await canEditProject(project.id, session.user.id, project.owner_id);

    if (!canEdit) {
        return { error: "You don't have permission to delete files from this project" };
    }

    try {
        const { deleteFile } = await import("@foundry/web/lib/storage");

        // Delete from Bunny CDN
        await deleteFile(filePath);

        // If it's a tracked file, remove from database
        if (fileId) {
            await db.delete(project_files).where(eq(project_files.id, fileId));
        }

        revalidatePath(`/project/${projectSlug}`);
        return { success: true };
    } catch (error) {
        console.error("File deletion error:", error);
        return { error: "Failed to delete file" };
    }
}

/**
 * Upload gallery item (image or video)
 */
export async function uploadGalleryItem(projectSlug: string, fileData: FormData) {
    const session = await getServerSession(await headers());

    if (!session?.user?.id) {
        return { error: "You must be logged in" };
    }

    const result = await getProjectBySlug(projectSlug);
    if (!result) {
        return { error: "Project not found" };
    }

    const { project } = result;
    const canEdit = await canEditProject(project.id, session.user.id, project.owner_id);

    if (!canEdit) {
        return { error: "You don't have permission to upload gallery items" };
    }

    try {
        const file = fileData.get("file") as File;
        if (!file) {
            return { error: "No file provided" };
        }

        // Validate MIME type - only images and videos
        const allowedMimeTypes = ["image/jpeg", "image/png", "image/gif", "image/webp", "video/mp4", "video/webm", "video/ogg"];

        if (!allowedMimeTypes.includes(file.type)) {
            return { error: "Only images (JPEG, PNG, GIF, WebP) and videos (MP4, WebM, OGG) are allowed" };
        }

        // Check file size (100MB limit for gallery)
        const maxSize = 100 * 1024 * 1024; // 100MB
        if (file.size > maxSize) {
            return { error: "File size must be less than 100MB" };
        }

        const { uploadFile, StoragePaths, getPublicURL } = await import("@foundry/web/lib/storage");

        // Generate storage path
        const timestamp = Date.now();
        const sanitizedFilename = file.name.replace(/[^a-zA-Z0-9.-]/g, "_");
        const filename = `${timestamp}_${sanitizedFilename}`;
        const storagePath = `${StoragePaths.Project.images(project.id)}/${filename}`;

        // Convert File to ArrayBuffer
        const arrayBuffer = await file.arrayBuffer();
        const uint8Array = new Uint8Array(arrayBuffer);

        // Upload to Bunny CDN
        await uploadFile(storagePath, uint8Array, {
            contentType: file.type,
        });

        // Get public URL
        const publicUrl = getPublicURL(storagePath);

        // Add to database
        const title = (fileData.get("title") as string) || file.name;
        const tone = (fileData.get("tone") as string) || "from-ctp-blue-400 to-ctp-purple-400";
        // Store aspect ratio as integer (multiply by 100 to preserve decimals)
        // 16:9 = 1.777... * 100 = 178, 4:3 = 1.333... * 100 = 133
        const aspectRatio = file.type.startsWith("video/") ? 16 / 9 : 4 / 3;
        const aspect = Math.round(aspectRatio * 100);

        await db.insert(project_gallery).values({
            id: crypto.randomUUID(),
            project_id: project.id,
            title,
            tone,
            aspect,
            image: publicUrl,
        });

        revalidatePath(`/project/${projectSlug}`);
        return { success: true, url: publicUrl };
    } catch (error) {
        console.error("Gallery upload error:", error);
        return { error: "Failed to upload gallery item" };
    }
}

/**
 * Delete gallery item
 */
export async function deleteGalleryItem(projectSlug: string, galleryId: string, imageUrl: string) {
    const session = (await getServerSession(await headers())) as { user?: { id?: string } } | null;

    if (!session?.user?.id) {
        return { error: "You must be logged in" };
    }

    const result = await getProjectBySlug(projectSlug);
    if (!result) {
        return { error: "Project not found" };
    }

    const { project } = result;
    const canEdit = await canEditProject(project.id, session.user.id, project.owner_id);

    if (!canEdit) {
        return { error: "You don't have permission to delete gallery items" };
    }

    try {
        const { deleteFile, STORAGE_ROOT } = await import("@foundry/web/lib/storage");

        // Extract path from URL
        // URL format: https://data.homestead.systems/foundry/projects/{id}/images/{filename}
        const urlParts = imageUrl.split("/");
        const filename = urlParts.at(-1);

        if (!filename) {
            return { error: "Invalid image URL" };
        }

        const storagePath = `${STORAGE_ROOT}/projects/${project.id}/images/${filename}`;

        // Delete from Bunny CDN
        await deleteFile(storagePath);

        // Delete from database
        await db.delete(project_gallery).where(eq(project_gallery.id, galleryId));

        revalidatePath(`/project/${projectSlug}`);
        return { success: true };
    } catch (error) {
        console.error("Gallery deletion error:", error);
        return { error: "Failed to delete gallery item" };
    }
}

/**
 * Update gallery item order
 */
export async function updateGalleryOrder(projectSlug: string, _orderedIds: string[]) {
    const session = (await getServerSession(await headers())) as { user?: { id?: string } } | null;

    if (!session?.user?.id) {
        return { error: "You must be logged in" };
    }

    const result = await getProjectBySlug(projectSlug);
    if (!result) {
        return { error: "Project not found" };
    }

    const { project } = result;
    const canEdit = await canEditProject(project.id, session.user.id, project.owner_id);

    if (!canEdit) {
        return { error: "You don't have permission to reorder gallery items" };
    }

    // TODO: Implement ordering - need to add an order column to project_gallery table
    // For now, return success as a placeholder
    revalidatePath(`/project/${projectSlug}`);
    return { success: true };
}
