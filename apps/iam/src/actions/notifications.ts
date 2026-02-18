"use server";

import { db, eq, userNotificationSettingsTable } from "@foundry/database";
import auth from "@foundry/iam/lib/auth";
import { revalidateTag } from "next/cache";
import { headers } from "next/headers";

interface NotificationPrefs {
    userId?: string | null;
    emailSecurity: boolean;
    emailAccountUpdates: boolean;
    emailOrganization: boolean;
    emailApiKey: boolean;
    emailMarketing: boolean;
}

const DEFAULTS: Omit<NotificationPrefs, "userId"> = {
    emailSecurity: true,
    emailAccountUpdates: true,
    emailOrganization: true,
    emailApiKey: true,
    emailMarketing: false,
};

/**
 * Server action — returns the current user's notification preferences.
 * Falls back to schema defaults when no DB row exists.
 */
export async function getUserNotificationSettings(): Promise<NotificationPrefs> {
    const session = await auth.api.getSession({ headers: await headers() });
    const userId = session?.user?.id;
    if (!userId) {
        return { userId: null, ...DEFAULTS } as NotificationPrefs;
    }

    try {
        const row = await db.select().from(userNotificationSettingsTable).where(eq(userNotificationSettingsTable.userId, userId)).limit(1);
        if (!row?.[0]) {
            return { userId, ...DEFAULTS } as NotificationPrefs;
        }

        return {
            userId,
            emailSecurity: Boolean(row[0].emailSecurity),
            emailAccountUpdates: Boolean(row[0].emailAccountUpdates),
            emailOrganization: Boolean(row[0].emailOrganization),
            emailApiKey: Boolean(row[0].emailApiKey),
            emailMarketing: Boolean(row[0].emailMarketing),
        };
    } catch (err: unknown) {
        // If the DB table doesn't exist (dev env without migrations),
        // fall back to sensible defaults instead of throwing a 500.
        // Postgres undefined_table errors have code '42P01'.
        const pgCode = (err as { code?: unknown })?.code;
        if (pgCode === "42P01") {
            // expected in dev when migrations haven't run — keep log concise
            // eslint-disable-next-line no-console
            console.info("getUserNotificationSettings: user_notification_settings table missing; returning defaults");
        } else {
            // eslint-disable-next-line no-console
            console.warn("getUserNotificationSettings: database read failed — falling back to defaults", err);
        }

        return { userId, ...DEFAULTS } as NotificationPrefs;
    }
}

/**
 * Server action — partial update / upsert of the current user's prefs.
 * Revalidates `user-profile:<userId>` tag so cached UI reflects the change.
 */
export async function updateUserNotificationSettings(changes: Partial<Pick<NotificationPrefs, "emailOrganization" | "emailApiKey" | "emailMarketing">>) {
    const session = await auth.api.getSession({ headers: await headers() });
    const userId = session?.user?.id;
    if (!userId) {
        throw new Error("Not authenticated");
    }

    try {
        const existing = await db.select().from(userNotificationSettingsTable).where(eq(userNotificationSettingsTable.userId, userId)).limit(1);

        if (existing?.[0]) {
            // update only fields provided
            const payload: Record<string, unknown> = {};
            if (typeof changes.emailOrganization === "boolean") {
                payload.emailOrganization = changes.emailOrganization;
            }
            if (typeof changes.emailApiKey === "boolean") {
                payload.emailApiKey = changes.emailApiKey;
            }
            if (typeof changes.emailMarketing === "boolean") {
                payload.emailMarketing = changes.emailMarketing;
            }

            if (Object.keys(payload).length > 0) {
                await db.update(userNotificationSettingsTable).set(payload).where(eq(userNotificationSettingsTable.userId, userId));
            }
        } else {
            // insert with defaults and apply provided overrides
            await db.insert(userNotificationSettingsTable).values({
                userId,
                emailSecurity: DEFAULTS.emailSecurity,
                emailAccountUpdates: DEFAULTS.emailAccountUpdates,
                emailOrganization: changes.emailOrganization ?? DEFAULTS.emailOrganization,
                emailApiKey: changes.emailApiKey ?? DEFAULTS.emailApiKey,
                emailMarketing: changes.emailMarketing ?? DEFAULTS.emailMarketing,
            });
        }
    } catch (err: unknown) {
        // If the table is missing, don't fail the request — log and continue.
        // The UI will continue to show the default preferences.
        const pgCode = (err as { code?: unknown })?.code;
        if (pgCode === "42P01") {
            // eslint-disable-next-line no-console
            console.info("updateUserNotificationSettings: user_notification_settings table missing; skipping write");
        } else {
            // eslint-disable-next-line no-console
            console.warn("updateUserNotificationSettings: database write failed (table may be missing)", err);
        }

        return { userId, ...DEFAULTS } as NotificationPrefs;
    }

    // best-effort revalidation for UI that caches user profile data
    try {
        // biome-ignore lint/suspicious/noExplicitAny: revalidateTag profile hint
        await revalidateTag(`user-profile:${userId}`, { profile: "short" } as unknown as any);
    } catch (err) {
        console.error("revalidate user-profile tag failed:", err);
    }

    // return updated prefs
    return getUserNotificationSettings();
}
