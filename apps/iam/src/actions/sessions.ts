"use server";

import auth from "@foundry/iam/lib/auth";
import { revalidateTag } from "next/cache";
import { headers } from "next/headers";

/**
 * Revalidate cached session list for the current user.
 * Tag: `sessions:<userId>`
 */
export async function revalidateSessionsTag(): Promise<void> {
    try {
        const session = await auth.api.getSession({ headers: await headers() });
        const userId = session?.user?.id;
        if (!userId) {
            return;
        }

        // biome-ignore lint/suspicious/noExplicitAny: cast required to pass runtime profile through Next.js API
        await revalidateTag(`sessions:${userId}`, { profile: "short" } as unknown as any);
    } catch (err) {
        console.error("revalidateSessionsTag failed:", err);
    }
}
