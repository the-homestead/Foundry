import "server-only";
import { eq } from "drizzle-orm";
import { accountTable, db, type User, userTable } from "..";

/**
 * Fetches a user from the database by their ID.
 * @param userId - The ID of the user to fetch.
 * @returns The user object or null if not found.
 */
export async function getUserById(userId: string): Promise<null | User> {
    try {
        const user = await db.query.userTable.findFirst({
            where: eq(userTable.id, userId),
        });
        return user ?? null; // Return user or null if undefined
    } catch (error) {
        console.error("Failed to fetch user by ID:", error);
        return null;
    }
}

export interface LinkedAccount {
    id: string;
    accountId: string;
    providerId: string;
    userId: string;
    createdAt: Date;
    updatedAt: Date;
}

/**
 * Fetches all linked OAuth accounts for a user.
 * @param userId - The ID of the user to fetch linked accounts for.
 * @returns Array of linked account objects with provider info.
 */
export async function getLinkedAccountsByUserId(userId: string): Promise<LinkedAccount[]> {
    try {
        const accounts = await db.query.accountTable.findMany({
            where: eq(accountTable.userId, userId),
            columns: {
                id: true,
                accountId: true,
                providerId: true,
                userId: true,
                createdAt: true,
                updatedAt: true,
            },
        });
        return accounts;
    } catch (error) {
        console.error("Failed to fetch linked accounts:", error);
        return [];
    }
}
