import { passkey } from "@better-auth/passkey";
import { SYSTEM_CONFIG } from "@foundry/configs";
import { db, schema } from "@foundry/database";
import { LAUNCHER_FREE, toApiKeyPermissions } from "@foundry/types/permissions/api-key";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { apiKey, haveIBeenPwned, lastLoginMethod, twoFactor, username } from "better-auth/plugins";

interface GitHubProfile {
    [key: string]: unknown;
    email?: string;
    name?: string;
}

interface GoogleProfile {
    [key: string]: unknown;
    email?: string;
    family_name?: string;
    given_name?: string;
}

interface DiscordProfile {
    [key: string]: unknown;
    email?: string;
    global_name?: string;
    username?: string;
}

interface SocialProviderConfig {
    [key: string]: unknown;
    clientId: string;
    clientSecret: string;
    mapProfileToUser: (profile: GitHubProfile | GoogleProfile | DiscordProfile) => Record<string, unknown>;
    redirectURI?: string;
    scope: string[];
}

const hasGithubCredentials = process.env.AUTH_GITHUB_ID && process.env.AUTH_GITHUB_SECRET && process.env.AUTH_GITHUB_ID.length > 0 && process.env.AUTH_GITHUB_SECRET.length > 0;

const hasGoogleCredentials = process.env.AUTH_GOOGLE_ID && process.env.AUTH_GOOGLE_SECRET && process.env.AUTH_GOOGLE_ID.length > 0 && process.env.AUTH_GOOGLE_SECRET.length > 0;

const hasDiscordCredentials =
    process.env.AUTH_DISCORD_ID && process.env.AUTH_DISCORD_SECRET && process.env.AUTH_DISCORD_ID.length > 0 && process.env.AUTH_DISCORD_SECRET.length > 0;

const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? process.env.NEXT_SERVER_APP_URL ?? "http://localhost:3000";
const appOrigin = new URL(appUrl).origin;
const rpID = new URL(appUrl).hostname;

// Build social providers configuration
const socialProviders: Record<string, SocialProviderConfig> = {};

if (hasGithubCredentials) {
    socialProviders.github = {
        clientId: process.env.AUTH_GITHUB_ID ?? "",
        clientSecret: process.env.AUTH_GITHUB_SECRET ?? "",
        mapProfileToUser: (profile: GitHubProfile) => {
            let firstName = "";
            let lastName = "";
            if (profile.name) {
                const nameParts = profile.name.split(" ");
                firstName = nameParts[0] || "Error";
                lastName = nameParts.length > 1 ? nameParts.slice(1).join(" ") : "";
            }
            return {
                age: null,
                firstName,
                lastName,
            };
        },
        scope: ["user:email", "read:user"],
    };
}

if (hasGoogleCredentials) {
    socialProviders.google = {
        clientId: process.env.AUTH_GOOGLE_ID ?? "",
        clientSecret: process.env.AUTH_GOOGLE_SECRET ?? "",
        mapProfileToUser: (profile: GoogleProfile) => {
            return {
                age: null,
                firstName: profile.given_name ?? "",
                lastName: profile.family_name ?? "",
            };
        },
        scope: ["openid", "email", "profile"],
    };
}

if (hasDiscordCredentials) {
    socialProviders.discord = {
        clientId: process.env.AUTH_DISCORD_ID ?? "",
        clientSecret: process.env.AUTH_DISCORD_SECRET ?? "",
        mapProfileToUser: (profile: DiscordProfile) => {
            const displayName = profile.global_name ?? profile.username ?? "";
            const [firstName, ...rest] = displayName.split(" ");
            return {
                age: null,
                firstName: firstName ?? "",
                lastName: rest.join(" "),
            };
        },
        scope: ["identify", "email"],
    };
}

export const auth: ReturnType<typeof betterAuth> = betterAuth({
    appName: "Foundry",
    account: {
        accountLinking: {
            allowDifferentEmails: false,
            enabled: true,
            trustedProviders: Object.keys(socialProviders),
        },
    },

    advanced: {
        crossSubDomainCookies: {
            enabled: true,
        },
    },

    baseURL: process.env.NEXT_PUBLIC_APP_URL ?? process.env.NEXT_SERVER_APP_URL,

    database: drizzleAdapter(db, {
        provider: "pg",
        schema,
    }),

    emailAndPassword: {
        enabled: true,
    },

    experimental: { joins: true },
    // Configure OAuth behavior
    oauth: {
        // Default redirect URL after successful login
        defaultCallbackUrl: SYSTEM_CONFIG.redirectAfterSignIn,
        // URL to redirect to on error
        errorCallbackUrl: "/auth/error",
        // Whether to link accounts with the same email
        linkAccountsByEmail: true,
    },

    plugins: [
        apiKey({
            enableSessionForAPIKeys: true,
            enableMetadata: true,
            permissions: {
                defaultPermissions: toApiKeyPermissions(LAUNCHER_FREE),
            },
        }),
        haveIBeenPwned({
            customPasswordCompromisedMessage: "Please choose a more secure password.",
        }),
        lastLoginMethod({
            storeInDatabase: true,
        }),
        passkey({
            origin: appOrigin,
            rpID,
            rpName: "Foundry",
        }),
        twoFactor({
            issuer: "Foundry",
        }),
        username(),
    ],

    secret: process.env.AUTH_SECRET,

    socialProviders,

    user: {
        additionalFields: {
            age: {
                input: true,
                required: false,
                type: "number",
            },
            firstName: {
                input: true,
                required: false,
                type: "string",
            },
            lastName: {
                input: true,
                required: false,
                type: "string",
            },
        },
    },
});
