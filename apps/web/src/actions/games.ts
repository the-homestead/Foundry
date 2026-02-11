"use server";

import { db, eq } from "@foundry/database";
import { games } from "@foundry/database/schemas/games/tables";
import { type GameFormData, gameFormSchema } from "@foundry/web/lib/schemas/games";
import { revalidatePath } from "next/cache";

export async function createGame(data: GameFormData) {
    const parsed = gameFormSchema.safeParse(data);
    if (!parsed.success) {
        return { error: "Validation failed" };
    }

    const { name, slug, description, images, capabilities } = parsed.data;

    // Transform comma-separated strings to arrays
    const versions = capabilities.versions
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
    const modloaders = capabilities.modloaders
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);

    try {
        // Generate UUID for the game
        const gameId = crypto.randomUUID();

        await db.insert(games).values({
            id: gameId,
            name,
            slug,
            description,
            images: {
                cover: images.cover || "",
                icon: images.icon || "",
                background: images.background || "",
            },
            capabilities: {
                versions,
                modloaders,
            },
            stats: {
                project_count: 0,
                download_count: 0,
                modpack_count: 0,
            },
        });

        return { success: true, gameId };
    } catch (e: unknown) {
        console.error("Failed to create game", e);
        // Simple duplicate check hack for now
        if (typeof e === "object" && e !== null && "code" in e && (e as Record<string, unknown>).code === "23505") {
            return { error: "Slug already exists" };
        }
        return { error: "Failed to create game." };
    }
}

export async function updateGameImages(gameId: string, images: { icon?: string; cover?: string; background?: string }) {
    try {
        // Get current game data
        const [game] = await db.select().from(games).where(eq(games.id, gameId)).limit(1);

        if (!game) {
            return { error: "Game not found" };
        }

        const currentImages = game.images as { icon: string; cover: string; background: string };

        // Merge new images with existing ones
        await db
            .update(games)
            .set({
                images: {
                    icon: images.icon || currentImages.icon,
                    cover: images.cover || currentImages.cover,
                    background: images.background || currentImages.background,
                },
            })
            .where(eq(games.id, gameId));

        revalidatePath("/admin/games");
        return { success: true };
    } catch (e: unknown) {
        console.error("Failed to update game images", e);
        return { error: "Failed to update game images" };
    }
}

export async function updateGame(gameId: string, data: GameFormData) {
    const parsed = gameFormSchema.safeParse(data);
    if (!parsed.success) {
        return { error: "Validation failed" };
    }

    const { name, slug, description, images, capabilities } = parsed.data;

    // Transform comma-separated strings to arrays
    const versions = capabilities.versions
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
    const modloaders = capabilities.modloaders
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);

    try {
        await db
            .update(games)
            .set({
                name,
                slug,
                description,
                images: {
                    cover: images.cover || "",
                    icon: images.icon || "",
                    background: images.background || "",
                },
                capabilities: {
                    versions,
                    modloaders,
                },
            })
            .where(eq(games.id, gameId));

        revalidatePath("/adash/games");
        revalidatePath(`/adash/games/${gameId}`);
        return { success: true };
    } catch (e: unknown) {
        console.error("Failed to update game", e);
        if (typeof e === "object" && e !== null && "code" in e && (e as Record<string, unknown>).code === "23505") {
            return { error: "Slug already exists" };
        }
        return { error: "Failed to update game." };
    }
}
