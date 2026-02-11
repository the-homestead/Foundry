import { auth } from "@foundry/backend/lib/auth.js";
import { createRouter } from "@foundry/backend/lib/create-app.js";
import { db, eq } from "@foundry/database";
import { apikeyTable } from "@foundry/database/schemas/users/tables";
import { CLI_PUBLIC_KEY, LAUNCHER_FREE, LAUNCHER_PREMIUM, ORG_CI_KEY, toApiKeyPermissions } from "@foundry/types/permissions/api-key";
import { APIError } from "../lib/errors.js";
import { createApiKeyService } from "../lib/services/api-keys.js";

const router = createRouter();

const PROFILE_MAP = {
    "cli-public": CLI_PUBLIC_KEY,
    "launcher-free": LAUNCHER_FREE,
    "launcher-premium": LAUNCHER_PREMIUM,
    "org-ci": ORG_CI_KEY,
} as const;

type ProfileId = keyof typeof PROFILE_MAP;

const isProfileId = (value: unknown): value is ProfileId => {
    return typeof value === "string" && value in PROFILE_MAP;
};

const parseExpiresIn = (value: unknown) => {
    if (value === null || value === undefined || value === "") {
        return undefined;
    }
    const parsed = typeof value === "number" ? value : Number(value);
    if (!Number.isFinite(parsed) || parsed <= 0) {
        return undefined;
    }
    return Math.floor(parsed);
};

router.post("/", async (c) => {
    const sessionResult = await auth.api.getSession({
        headers: c.req.raw.headers,
    });

    if (!sessionResult?.user) {
        throw new APIError("UNAUTHORIZED", "Authentication required", "client", 401);
    }

    const body = await c.req.json().catch(() => ({}));
    const bodyRecord = typeof body === "object" && body !== null ? (body as Record<string, unknown>) : {};
    const name = typeof bodyRecord.name === "string" ? bodyRecord.name.trim() : undefined;
    const prefix = typeof bodyRecord.prefix === "string" ? bodyRecord.prefix.trim() : undefined;
    const profileId: ProfileId = isProfileId(bodyRecord.profileId) ? bodyRecord.profileId : "launcher-free";
    const expiresIn = parseExpiresIn(bodyRecord.expiresIn);

    const permissions = toApiKeyPermissions(PROFILE_MAP[profileId]);
    const metadata = { profile: profileId };

    const result = await createApiKeyService(sessionResult.user.id, name, prefix, expiresIn, permissions, metadata);

    return c.json(result);
});

// Update IP restrictions for an API key
router.patch("/:keyId/ip-restrictions", async (c) => {
    const sessionResult = await auth.api.getSession({
        headers: c.req.raw.headers,
    });

    if (!sessionResult?.user) {
        throw new APIError("UNAUTHORIZED", "Authentication required", "client", 401);
    }

    const { keyId } = c.req.param();
    const body = await c.req.json().catch(() => ({}));
    const bodyRecord = typeof body === "object" && body !== null ? (body as Record<string, unknown>) : {};

    const whitelist = Array.isArray(bodyRecord.whitelist) ? bodyRecord.whitelist.filter((ip): ip is string => typeof ip === "string") : [];
    const blacklist = Array.isArray(bodyRecord.blacklist) ? bodyRecord.blacklist.filter((ip): ip is string => typeof ip === "string") : [];

    // Verify the key belongs to the user
    const [existingKey] = await db.select().from(apikeyTable).where(eq(apikeyTable.id, keyId)).limit(1);

    if (!existingKey || existingKey.userId !== sessionResult.user.id) {
        throw new APIError("NOT_FOUND", "API key not found", "client", 404);
    }

    // Update the key
    await db.update(apikeyTable).set({ ipWhitelist: whitelist, ipBlacklist: blacklist }).where(eq(apikeyTable.id, keyId));

    return c.json({ success: true, message: "IP restrictions updated" });
});

// Update rate limits for an API key
router.patch("/:keyId/rate-limits", async (c) => {
    const sessionResult = await auth.api.getSession({
        headers: c.req.raw.headers,
    });

    if (!sessionResult?.user) {
        throw new APIError("UNAUTHORIZED", "Authentication required", "client", 401);
    }

    const { keyId } = c.req.param();
    const body = await c.req.json().catch(() => ({}));
    const bodyRecord = typeof body === "object" && body !== null ? (body as Record<string, unknown>) : {};

    const perMinute = typeof bodyRecord.requestsPerMinute === "number" ? bodyRecord.requestsPerMinute : null;
    const perHour = typeof bodyRecord.requestsPerHour === "number" ? bodyRecord.requestsPerHour : null;
    const perDay = typeof bodyRecord.requestsPerDay === "number" ? bodyRecord.requestsPerDay : null;

    // Verify the key belongs to the user
    const [existingKey] = await db.select().from(apikeyTable).where(eq(apikeyTable.id, keyId)).limit(1);

    if (!existingKey || existingKey.userId !== sessionResult.user.id) {
        throw new APIError("NOT_FOUND", "API key not found", "client", 404);
    }

    // Update the key
    await db
        .update(apikeyTable)
        .set({
            rateLimitPerMinute: perMinute,
            rateLimitPerHour: perHour,
            rateLimitPerDay: perDay,
        })
        .where(eq(apikeyTable.id, keyId));

    return c.json({ success: true, message: "Rate limits updated" });
});

// Update scopes for an API key
router.patch("/:keyId/scopes", async (c) => {
    const sessionResult = await auth.api.getSession({
        headers: c.req.raw.headers,
    });

    if (!sessionResult?.user) {
        throw new APIError("UNAUTHORIZED", "Authentication required", "client", 401);
    }

    const { keyId } = c.req.param();
    const body = await c.req.json().catch(() => ({}));
    const bodyRecord = typeof body === "object" && body !== null ? (body as Record<string, unknown>) : {};

    const scopes = Array.isArray(bodyRecord.scopes) ? bodyRecord.scopes.filter((scope): scope is string => typeof scope === "string") : [];

    // Verify the key belongs to the user
    const [existingKey] = await db.select().from(apikeyTable).where(eq(apikeyTable.id, keyId)).limit(1);

    if (!existingKey || existingKey.userId !== sessionResult.user.id) {
        throw new APIError("NOT_FOUND", "API key not found", "client", 404);
    }

    // Update the key
    await db.update(apikeyTable).set({ scopes }).where(eq(apikeyTable.id, keyId));

    return c.json({ success: true, message: "Scopes updated" });
});

// Get analytics for an API key
router.get("/:keyId/analytics", async (c) => {
    const sessionResult = await auth.api.getSession({
        headers: c.req.raw.headers,
    });

    if (!sessionResult?.user) {
        throw new APIError("UNAUTHORIZED", "Authentication required", "client", 401);
    }

    const { keyId } = c.req.param();

    // Verify the key belongs to the user and get its data
    const [key] = await db.select().from(apikeyTable).where(eq(apikeyTable.id, keyId)).limit(1);

    if (!key || key.userId !== sessionResult.user.id) {
        throw new APIError("NOT_FOUND", "API key not found", "client", 404);
    }

    // Return basic analytics (we can expand this later with more detailed tracking)
    return c.json({
        keyId: key.id,
        name: key.name,
        usageCount: key.usageCount ?? 0,
        lastUsedAt: key.lastUsedAt,
        createdAt: key.createdAt,
        enabled: key.enabled,
        rateLimits: {
            perMinute: key.rateLimitPerMinute,
            perHour: key.rateLimitPerHour,
            perDay: key.rateLimitPerDay,
        },
        restrictions: {
            ipWhitelist: key.ipWhitelist ?? [],
            ipBlacklist: key.ipBlacklist ?? [],
        },
        scopes: key.scopes ?? [],
    });
});

export default router;
