"use server";

import { randomBytes } from "node:crypto";
import { db, eq, oauthApplicationTable } from "@foundry/database";
import auth from "@foundry/iam/lib/auth";
import { headers } from "next/headers";

/**
 * Server action: list registered OAuth clients for this issuer.
 */
export async function getOAuthClients(): Promise<unknown> {
    try {
        const session = await auth.api.getSession({ headers: await headers() });
        if (!session?.user?.id) {
            return [] as unknown[];
        }

        const rows = await db.select().from(oauthApplicationTable).orderBy(oauthApplicationTable.createdAt);
        const clients = rows.map((r) => {
            const raw = String(r.redirectUrls ?? "");
            // biome-ignore lint/performance/useTopLevelRegex: <Regex>
            const redirects = raw.startsWith("[") ? JSON.parse(raw) : raw.split(/\r?\n/).filter(Boolean);

            return {
                id: r.id,
                client_id: r.clientId,
                name: r.name,
                redirect_uris: redirects,
                grant_types: [] as string[],
                created_at: r.createdAt ? new Date(r.createdAt).toISOString() : null,
                enabled: !r.disabled,
            };
        });

        return clients;
    } catch (err) {
        console.error("getOAuthClients failed:", err);
        throw err;
    }
}

/**
 * Server action: create a new OAuth client (delegates to Better‑Auth server API).
 */
export interface CreateOAuthClientBody {
    client_name: string;
    redirect_uris: string[];
    scope?: string;
    type?: string;
}

export async function createOAuthClient(body: CreateOAuthClientBody) {
    if (!body || Object.keys(body).length === 0) {
        throw new Error("body is required");
    }

    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user?.id) {
        throw new Error("Not authenticated");
    }

    // basic admin/dev check — management UI should already restrict access but
    // enforce server-side as well
    const role = session.user?.role as string | undefined;
    if (!(role === "admin" || role === "dev")) {
        throw new Error("Forbidden");
    }

    try {
        const clientId = `cli_${randomBytes(6).toString("hex")}`;
        const clientSecret = randomBytes(24).toString("hex");

        const redirectUrls = Array.isArray(body.redirect_uris) ? body.redirect_uris : [];

        const row = {
            id: cryptoRandomId(),
            name: body.client_name ?? null,
            clientId,
            clientSecret,
            redirectUrls: JSON.stringify(redirectUrls),
            type: body.type ?? null,
            disabled: false,
            userId: session.user.id,
            createdAt: new Date(),
            updatedAt: new Date(),
        };

        await db.insert(oauthApplicationTable).values(row);

        return { client_id: clientId, client_secret: clientSecret, ...row } as unknown;
    } catch (err) {
        console.error("createOAuthClient failed:", err);
        throw err;
    }
}

export async function rotateClientSecret(client_id: string) {
    if (!client_id) {
        throw new Error("client_id is required");
    }

    try {
        const session = await auth.api.getSession({ headers: await headers() });
        if (!session?.user?.id) {
            throw new Error("Not authenticated");
        }

        const role = session.user?.role as string | undefined;
        if (!(role === "admin" || role === "dev")) {
            throw new Error("Forbidden");
        }

        const newSecret = randomBytes(24).toString("hex");
        await db.update(oauthApplicationTable).set({ clientSecret: newSecret, updatedAt: new Date() }).where(eq(oauthApplicationTable.clientId, client_id));
        return { client_secret: newSecret } as unknown;
    } catch (err) {
        console.error("rotateClientSecret failed:", err);
        throw err;
    }
}

export async function deleteOAuthClient(client_id: string) {
    if (!client_id) {
        throw new Error("client_id is required");
    }

    try {
        const session = await auth.api.getSession({ headers: await headers() });
        if (!session?.user?.id) {
            throw new Error("Not authenticated");
        }
        const role = session.user?.role as string | undefined;
        if (!(role === "admin" || role === "dev")) {
            throw new Error("Forbidden");
        }

        await db.delete(oauthApplicationTable).where(eq(oauthApplicationTable.clientId, client_id));
        return { ok: true } as unknown;
    } catch (err) {
        console.error("deleteOAuthClient failed:", err);
        throw err;
    }
}

export async function updateOAuthClient(client_id: string, update: Record<string, unknown>) {
    if (!client_id) {
        throw new Error("client_id is required");
    }

    try {
        const session = await auth.api.getSession({ headers: await headers() });
        if (!session?.user?.id) {
            throw new Error("Not authenticated");
        }
        const role = session.user?.role as string | undefined;
        if (!(role === "admin" || role === "dev")) {
            throw new Error("Forbidden");
        }

        const patch: any = {};
        if (update?.redirect_uris && Array.isArray(update.redirect_uris)) {
            patch.redirectUrls = JSON.stringify(update.redirect_uris);
        }
        if (Object.hasOwn(update, "name")) {
            patch.name = update.name as string;
        }
        if (Object.hasOwn(update, "enabled")) {
            patch.disabled = !(update.enabled as boolean);
        }

        if (Object.keys(patch).length > 0) {
            patch.updatedAt = new Date();
            await db.update(oauthApplicationTable).set(patch).where(eq(oauthApplicationTable.clientId, client_id));
        }

        const row = await db.select().from(oauthApplicationTable).where(eq(oauthApplicationTable.clientId, client_id)).limit(1);
        return (row?.[0] ?? null) as unknown;
    } catch (err) {
        console.error("updateOAuthClient failed:", err);
        throw err;
    }
}

function cryptoRandomId() {
    return randomBytes(12).toString("hex");
}
