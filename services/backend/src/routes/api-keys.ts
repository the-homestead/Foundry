import { auth } from "@foundry/backend/lib/auth.js";
import { createRouter } from "@foundry/backend/lib/create-app.js";
import { CLI_PUBLIC_KEY, LAUNCHER_FREE, LAUNCHER_PREMIUM, ORG_CI_KEY, toApiKeyPermissions } from "@foundry/types/permissions/api-key";

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
    try {
        const sessionResult = await auth.api.getSession({
            headers: c.req.raw.headers,
        });

        if (!sessionResult?.user) {
            return c.json({ error: "unauthorized" }, 401);
        }

        const body = await c.req.json().catch(() => ({}));
        const bodyRecord = typeof body === "object" && body !== null ? (body as Record<string, unknown>) : {};
        const name = typeof bodyRecord.name === "string" ? bodyRecord.name.trim() : undefined;
        const prefix = typeof bodyRecord.prefix === "string" ? bodyRecord.prefix.trim() : undefined;
        const profileId: ProfileId = isProfileId(bodyRecord.profileId) ? bodyRecord.profileId : "launcher-free";
        const expiresIn = parseExpiresIn(bodyRecord.expiresIn);

        const permissions = toApiKeyPermissions(PROFILE_MAP[profileId]);
        const metadata = { profile: profileId };

        const result = await auth.api.createApiKey({
            body: {
                name: name || undefined,
                prefix: prefix || undefined,
                expiresIn,
                userId: sessionResult.user.id,
                permissions,
                metadata,
            },
        });

        return c.json(result);
    } catch (error) {
        const message = error instanceof Error ? error.message : "Failed to create API key.";
        return c.json({ error: message }, 400);
    }
});

export default router;
