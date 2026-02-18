"use server";

import { deletePasskeyById, getPasskeysByUserId } from "@foundry/database";
import PasskeyNotice from "@foundry/email/emails/user/passkey-notice";
import auth from "@foundry/iam/lib/auth";
import { revalidateTag } from "next/cache";
import { headers } from "next/headers";
import { createTranslator, type Locale } from "next-intl";
import { Resend } from "resend";

// Short-lived in-memory cache to dedupe rapid consecutive reads (dev/hydration)
const _passkeysCache = new Map<string, { ts: number; data: unknown }>();

/**
 * Revalidate cached passkeys list for the current user.
 * Tag: `passkeys:<userId>`
 */
export async function revalidatePasskeysTag(): Promise<void> {
    try {
        const session = await auth.api.getSession({ headers: await headers() });
        const userId = session?.user?.id;
        if (!userId) {
            return;
        }

        // biome-ignore lint/suspicious/noExplicitAny: cast required to pass runtime profile through Next.js API
        await revalidateTag(`passkeys:${userId}`, { profile: "short" } as unknown as any);
        // clear short-lived in-memory cache so subsequent reads reflect the update
        _passkeysCache.delete(userId);
    } catch (err) {
        console.error("revalidatePasskeysTag failed:", err);
    }
}

/**
 * Return the current user's passkeys (server action).
 */
export async function getUserPasskeys(): Promise<any[]> {
    try {
        const session = await auth.api.getSession({ headers: await headers() });
        const userId = session?.user?.id;
        if (!userId) {
            return [];
        }

        // small in-process cache to dedupe rapid consecutive calls (dev/hydration)
        const TTL = 1000;
        const now = Date.now();
        const cached = _passkeysCache.get(userId);
        if (cached && now - cached.ts < TTL) {
            return cached.data as any[];
        }

        const rows = await getPasskeysByUserId(userId);
        _passkeysCache.set(userId, { ts: now, data: rows ?? [] });
        return rows ?? [];
    } catch (err) {
        console.error("getUserPasskeys failed:", err);
        return [];
    }
}

/**
 * Delete a passkey for the current user.
 * Returns { success: boolean } so callers can show messages.
 */
export async function deletePasskey(passkeyId: string): Promise<{ success: boolean }> {
    try {
        const session = await auth.api.getSession({ headers: await headers() });
        const userId = session?.user?.id;
        if (!userId) {
            return { success: false };
        }

        const ok = await deletePasskeyById(userId, passkeyId);
        if (!ok) {
            return { success: false };
        }

        // revalidate cache components that depend on passkeys
        await revalidateTag(`passkeys:${userId}`, { profile: "short" } as unknown as any);
        // ensure the short-lived in-memory cache is cleared immediately
        _passkeysCache.delete(userId);

        // send passkey-deleted email (best-effort)
        try {
            const to = session.user.email;
            if (to) {
                const locale = "en";
                const t = createTranslator({ messages: await import(`../../messages/${locale}.json`), namespace: "emails", locale });
                const resend = new Resend(process.env.RESEND_API_KEY);
                await resend.emails.send({
                    from: `${process.env.EMAIL_SENDER_ADDRESS}`,
                    to,
                    subject: t("passkey.subject", { action: "deleted" }),
                    react: PasskeyNotice({
                        locale: locale as Locale,
                        action: "deleted",
                        device: undefined,
                        manageUrl: `${process.env.NEXT_PUBLIC_APP_URL ?? ""}/account?tab=security`,
                        name: session.user.name ?? to,
                    }),
                });
            }
        } catch (err) {
            console.error("send passkey-deleted email failed:", err);
        }

        return { success: true };
    } catch (err) {
        console.error("deletePasskey failed:", err);
        return { success: false };
    }
}
