"use server";

import { GameStorage, getPublicURL } from "@foundry/web/lib/storage";

export async function uploadGameAssets(formData: FormData, gameSlug: string): Promise<{ icon?: string; cover?: string; background?: string }> {
    const icon = formData.get("icon") as File;
    const cover = formData.get("cover") as File;
    const background = formData.get("background") as File;

    if (!gameSlug) {
        throw new Error("Game slug is required");
    }

    const results: { icon?: string; cover?: string; background?: string } = {};

    // For games, we might want to store them by slug or ID.
    // Assuming slug is unique and sufficient for the folder path from `StoragePaths.Game.root`.
    // However, `StoragePaths.Game.root` expects an ID.
    // If we only have slug here before creation, we might need a temporary or slug-based path strategy.
    // BUT usually we create the game record first, get an ID, and then upload assets.
    // IF this helper requires an ID, we should pass ID.
    // Let's assume for now we are using the SLUG as the ID for storage path purposes
    // OR we should be passing the ID.

    // In the GameForm component, we don't have an ID yet for new games.
    // Option: Use slug for storage path structure.

    const gameId = gameSlug; // Using slug as ID for storage path

    if (icon) {
        const buffer = Buffer.from(await icon.arrayBuffer());
        // Upload to bunny, assuming we just overwrite 'icon.png' or similar for simplicity,
        // or keep original name. UserStorage used timestamp_name.
        // For game assets which are more static, maybe just 'icon' + ext is fine?
        // Let's stick to original filename for now to be safe with extensions.
        const ext = icon.name.split(".").pop();
        const filename = `icon.${ext}`;

        // We'll use the uploadFile from storage lib directly via GameStorage helpers if possible,
        // or we need to access the path builder directly.
        // GameStorage.listFiles uses StoragePaths.Game[type](gameId).
        // Let's add upload helpers to GameStorage? Or just manually construct path here?

        // Re-using the manual upload pattern for now since GameStorage didn't have upload helpers in the previous edit.
        await GameStorage.uploadFile(gameId, "images", buffer, filename, { contentType: icon.type });
        results.icon = getPublicURL(`games/${gameId}/images/${filename}`);
    }

    if (cover) {
        const buffer = Buffer.from(await cover.arrayBuffer());
        const ext = cover.name.split(".").pop();
        const filename = `cover.${ext}`;
        await GameStorage.uploadFile(gameId, "images", buffer, filename, { contentType: cover.type });
        results.cover = getPublicURL(`games/${gameId}/images/${filename}`);
    }

    if (background) {
        const buffer = Buffer.from(await background.arrayBuffer());
        const ext = background.name.split(".").pop();
        const filename = `background.${ext}`;
        await GameStorage.uploadFile(gameId, "images", buffer, filename, { contentType: background.type });
        results.background = getPublicURL(`games/${gameId}/images/${filename}`);
    }

    return results;
}
