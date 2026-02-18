"use server";

import { getLinkedAccountsByUserId, type LinkedAccount, userHasPassword } from "@foundry/database";
import auth from "@foundry/iam/lib/auth";
import { revalidateTag } from "next/cache";
import { headers } from "next/headers";

/**
 * Fetches all linked OAuth accounts for the current user.
 * @returns Array of linked account objects with provider info.
 */
export async function getLinkedAccounts(): Promise<LinkedAccount[]> {
    try {
        // Get the current session server-side using Better Auth
        const session = await auth.api.getSession({ headers: await headers() });

        if (!session?.user?.id) {
            throw new Error("Not authenticated");
        }

        // Fetch linked accounts from database
        const accounts = await getLinkedAccountsByUserId(session.user.id);

        return accounts;
    } catch (error) {
        console.error("Failed to fetch linked accounts:", error);
        return [];
    }
}

/**
 * Revalidate cached data for the current user's linked accounts.
 * - Intended to be called from client after a mutation (link / unlink)
 * - Uses a per-user tag so Cache Components can be invalidated selectively
 */
export async function revalidateLinkedAccountsTag(): Promise<void> {
    try {
        const session = await auth.api.getSession({ headers: await headers() });
        const userId = session?.user?.id;
        if (!userId) {
            return;
        }

        // Use a stable tag format; components that cache linked-account data
        // should use the same tag (e.g. `linked-accounts:${userId}`)
        // pass explicit second param to satisfy ambient typing in this workspace
        // biome-ignore lint/suspicious/noExplicitAny: cast required to pass runtime profile through Next.js API
        await revalidateTag(`linked-accounts:${userId}`, { profile: "short" } as unknown as any);
    } catch (err) {
        // don't fail the client if tag revalidation couldn't be scheduled
        console.error("revalidateLinkedAccountsTag failed:", err);
    }
}

/**
 * Server action: return whether the current user has an email/password credential.
 */
export async function currentUserHasPassword(): Promise<boolean> {
    try {
        const session = await auth.api.getSession({ headers: await headers() });
        const userId = session?.user?.id;
        if (!userId) {
            return false;
        }

        return await userHasPassword(userId);
    } catch (err) {
        console.error("currentUserHasPassword failed:", err);
        return false;
    }
}
