// import "server-only";
import { and, eq } from "drizzle-orm";
import { accountTable, db, schema, type User, userTable } from "..";

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

/**
 * Returns true when the user has an email/password credential set in the DB.
 */
export async function userHasPassword(userId: string): Promise<boolean> {
    try {
        // Passwords are stored on the `account` table for credential-provider accounts.
        const acct = await db.query.accountTable.findFirst({
            where: and(eq(accountTable.userId, userId), eq(accountTable.providerId, "credential")),
            columns: { password: true },
        });

        return Boolean(acct?.password);
    } catch (err) {
        console.error("userHasPassword failed:", err);
        return false;
    }
}

/**
 * Return all passkeys for a given user id.
 */
export async function getPasskeysByUserId(userId: string) {
    try {
        const rows = await db.select().from(schema.passkey).where(eq(schema.passkey.userId, userId)).orderBy(schema.passkey.createdAt);
        return rows ?? [];
    } catch (err) {
        console.error("getPasskeysByUserId failed:", err);
        return [];
    }
}

/**
 * Delete a passkey row that belongs to the provided userId.
 * Returns true when a row was deleted.
 */
export async function deletePasskeyById(userId: string, passkeyId: string): Promise<boolean> {
    try {
        // Use a single where() with an `and` clause to satisfy Drizzle typings.
        const res = await db
            .delete(schema.passkey)
            .where(and(eq(schema.passkey.id, passkeyId), eq(schema.passkey.userId, userId)))
            .returning();
        return (res?.length ?? 0) > 0;
    } catch (err) {
        console.error("deletePasskeyById failed:", err);
        return false;
    }
}
