"use server";

import { apikeyTable, db, eq, userNotificationSettingsTable } from "@foundry/database";
import ApiKeyNotice from "@foundry/email/emails/api-key-notice";
import auth from "@foundry/iam/lib/auth";
import { revalidateTag } from "next/cache";
import { headers } from "next/headers";
import { createTranslator } from "next-intl";
import { Resend } from "resend";

// Short-lived in-memory caches used to dedupe rapid consecutive server-action
// calls (helpful in development where Strict Mode / hydration can trigger
// multiple back-to-back invocations). Entries are expired by TTL in the
// respective functions.
const _apiKeysCache = new Map<string, { ts: number; data: unknown }>();

/**
 * Server action: fetch API keys for the current authenticated user.
 * - Uses request-scoped session to determine user id, then queries DB.
 * - Safe to call from client components as a Server Action.
 */
export async function getApiKeys() {
    const session = await auth.api.getSession({ headers: await headers() });
    const userId = session?.user?.id;
    if (!userId) {
        return [] as unknown[];
    }

    // In dev Strict Mode the client may mount/unmount/mount which can trigger
    // the same server action multiple times in quick succession. Use a very
    // short-lived in-process cache to dedupe back-to-back requests and avoid
    // spamming the DB during hydration/dev checks. This cache is intentionally
    // short-lived (TTL) and cleared when tags are revalidated.
    const TTL = 1000; // milliseconds
    const now = Date.now();
    const cached = _apiKeysCache.get(userId);
    if (cached && now - cached.ts < TTL) {
        return cached.data;
    }

    const keys = await db.select().from(apikeyTable).where(eq(apikeyTable.userId, userId)).orderBy(apikeyTable.createdAt);
    _apiKeysCache.set(userId, { ts: now, data: keys });
    return keys;
}

/**
 * Server action: revalidate all Cache Components that depend on the
 * current user's API-keys. Components should use the same tag format
 * (`api-keys:${userId}`) so this triggers a selective revalidation.
 */
export async function revalidateApiKeysTag(): Promise<void> {
    try {
        const session = await auth.api.getSession({ headers: await headers() });
        const userId = session?.user?.id;
        if (!userId) {
            return;
        }

        // biome-ignore lint/suspicious/noExplicitAny: cast required to pass runtime profile through Next.js API
        await revalidateTag(`api-keys:${userId}`, { profile: "short" } as unknown as any);
        // clear short-lived in-memory cache so subsequent reads reflect the update
        _apiKeysCache.delete(userId);
    } catch (err) {
        // don't throw to the client — best-effort revalidation
        // log server-side so ops can diagnose if needed
        // eslint-disable-next-line no-console
        console.error("revalidateApiKeysTag failed:", err);
    }
}

/**
 * Send an API-key email notification to the current user.
 * - action: created | updated | deleted
 * - For `created` callers should pass keyValue so the user sees the key.
 */
export async function sendApiKeyNotice(
    action: "created" | "updated" | "deleted",
    opts?: { keyId?: string; keyName?: string; prefix?: string; keyValue?: string; manageUrl?: string }
) {
    try {
        const session = await auth.api.getSession({ headers: await headers() });
        const userId = session?.user?.id;
        const to = session?.user?.email;
        if (!(userId && to)) {
            return;
        }

        // respect per-user notification preferences (apiKey notifications are optional)
        const settings = await db.select().from(userNotificationSettingsTable).where(eq(userNotificationSettingsTable.userId, userId)).limit(1);
        const prefs = settings?.[0];
        if (prefs && !prefs.emailApiKey) {
            return;
        }

        let keyName = opts?.keyName;
        let prefix = opts?.prefix;
        const keyValue = opts?.keyValue ?? undefined;

        // If deleted and caller passed keyId, attempt to look up DB details for context
        if (action === "deleted" && opts?.keyId) {
            const row = await db.select().from(apikeyTable).where(eq(apikeyTable.id, opts.keyId)).limit(1);
            if (row?.[0]) {
                keyName = keyName ?? row[0].name ?? undefined;
                prefix = prefix ?? row[0].prefix ?? undefined;
            }
        }

        const locale = "en";
        await new Resend(process.env.RESEND_API_KEY).emails.send({
            from: process.env.EMAIL_SENDER_ADDRESS!,
            to,
            subject: (await createTranslator({ messages: await import(`../../messages/${locale}.json`), namespace: "emails", locale }))("apiKey.subject", { action }),
            // ApiKeyNotice is an async react-email component — call it and pass the promise
            react: ApiKeyNotice({ locale: locale as any, action: action as any, name: keyName, prefix, keyValue, manageUrl: opts?.manageUrl }),
        });
    } catch (err) {
        console.error("sendApiKeyNotice failed:", err);
    }
}
