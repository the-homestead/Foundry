"use server";

import { randomUUID } from "node:crypto";
import { db } from "@foundry/database";
import { projects } from "@foundry/database/schemas/projects/tables";
import { getServerSession } from "@foundry/web/lib/get-server-session";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

interface CreateProjectData {
    name: string;
    slug: string;
    description: string;
    gameId: string;
    type: string;
    categories: string[];
}

/**
 * Create a new project linked to a specific game
 */
export async function createProject(data: CreateProjectData) {
    try {
        // Check if user is authenticated
        const session = (await getServerSession(await headers())) as { user?: { id?: string } } | null;

        if (!session?.user) {
            return { success: false, error: "You must be logged in to create a project" };
        }

        // Validate required fields
        const hasRequiredFields = data.name && data.slug && data.gameId;
        if (!hasRequiredFields) {
            return { success: false, error: "Name, slug, and game are required" };
        }

        // Check if slug already exists
        const existingProject = await db.query.projects.findFirst({
            where: (projects, { eq }) => eq(projects.slug, data.slug),
        });

        if (existingProject) {
            return { success: false, error: "A project with this slug already exists" };
        }

        // Create the project
        const projectId = randomUUID();
        const now = new Date();

        await db.insert(projects).values({
            id: projectId,
            slug: data.slug,
            name: data.name,
            description: data.description,
            game_id: data.gameId,
            type: data.type,
            categories: data.categories,
            sub_categories: [],
            metadata: {},
            links: {},
            status: 0, // Unapproved status - requires moderation
            version: "0.1.0",
            body: "",
            license: null,
            icon_url: null,
            banner_url: null,
            color: null,
            created_at: now,
            updated_at: now,
            owner_id: session.user.id, // Use authenticated user ID
        });

        // Revalidate the browse page
        revalidatePath("/browse");

        // Redirect to the new project page in edit mode
        redirect(`/project/${data.slug}/edit`);
    } catch (error) {
        console.error("Error creating project:", error);
        return { success: false, error: "Failed to create project" };
    }
}

/**
 * Generate a URL-friendly slug from a project name
 */
export async function generateSlug(name: string): Promise<string> {
    const slug = name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");

    // Check if slug exists and append number if needed
    let counter = 1;
    let finalSlug = slug;

    while (true) {
        const existing = await db.query.projects.findFirst({
            where: (projects, { eq }) => eq(projects.slug, finalSlug),
        });

        if (!existing) {
            break;
        }

        finalSlug = `${slug}-${counter}`;
        counter++;
    }

    return finalSlug;
}
