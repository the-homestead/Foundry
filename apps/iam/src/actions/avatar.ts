"use server";

import { getPublicURL, UserStorage } from "@foundry/iam/lib/storage";
import { revalidateTag } from "next/cache";

export async function uploadAvatar(formData: FormData, userId: string): Promise<string> {
    const file = formData.get("file") as File;
    if (!file) {
        throw new Error("No file provided");
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Upload to BunnyCDN
    const filename = await UserStorage.uploadAvatar(userId, buffer, file.name, { contentType: file.type });

    // Return the full public URL
    // The storage path already includes "foundry/users/..." so we don't need to append foundry again
    const fullPath = `users/${userId}/avatar/${filename}`;
    // Revalidate any cached avatar UI/server components for this user
    try {
        // short TTL for user-specific, frequently-changing bits
        // biome-ignore lint/suspicious/noExplicitAny: cast required to pass runtime profile through Next.js API
        await revalidateTag(`user-avatar:${userId}`, { profile: "short" } as unknown as any);
    } catch (err) {
        // non-fatal — we still return the URL
        console.error("revalidateTag(user-avatar) failed:", err);
    }

    return getPublicURL(fullPath);
}

export async function removeAvatar(userId: string): Promise<void> {
    // We can't actually "remove" the active avatar easily without knowing which one it is
    // But based on the UserStorage logic, we probably want to just let the user set a "null" avatar in DB
    // The storage logic keeps 5 most recent, so we don't necessarily delete the files immediately
    // For now, this action might just be used to update the DB state (which is handled in the client/auth)
    // If we want to strictly delete ALL avatars:
    await UserStorage.cleanupAvatars(userId);
    try {
        // biome-ignore lint/suspicious/noExplicitAny: cast required to pass runtime profile through Next.js API
        await revalidateTag(`user-avatar:${userId}`, { profile: "short" } as unknown as any);
    } catch (err) {
        console.error("revalidateTag(user-avatar) failed:", err);
    }
}
