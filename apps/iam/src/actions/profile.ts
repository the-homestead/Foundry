"use server";

import auth from "@foundry/iam/lib/auth";
import { revalidateTag } from "next/cache";
import { headers } from "next/headers";

/**
 * Revalidate cached profile data for the current user.
 * Tag: `user-profile:<userId>`
 */
export async function revalidateUserProfileTag(): Promise<void> {
    try {
        const session = await auth.api.getSession({ headers: await headers() });
        const userId = session?.user?.id;
        if (!userId) {
            return;
        }

        // biome-ignore lint/suspicious/noExplicitAny: cast required to pass runtime profile through Next.js API
        await revalidateTag(`user-profile:${userId}`, { profile: "short" } as unknown as any);
    } catch (err) {
        console.error("revalidateUserProfileTag failed:", err);
    }
}
