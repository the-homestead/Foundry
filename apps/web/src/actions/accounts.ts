"use server";

import { getLinkedAccountsByUserId, type LinkedAccount } from "@foundry/database";
import { getServerSession } from "@foundry/web/lib/get-server-session";
import { headers } from "next/headers";

/**
 * Fetches all linked OAuth accounts for the current user.
 * @returns Array of linked account objects with provider info.
 */
export async function getLinkedAccounts(): Promise<LinkedAccount[]> {
    try {
        // Get the current session server-side using Better Auth
        const session = await getServerSession(await headers());

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
