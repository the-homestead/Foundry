import { SYSTEM_CONFIG } from "@foundry/configs";
import { db } from "@foundry/database";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { twoFactor } from "better-auth/plugins";

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

interface SocialProviderConfig {
    [key: string]: unknown;
    clientId: string;
    clientSecret: string;
    mapProfileToUser: (profile: GitHubProfile | GoogleProfile) => Record<string, unknown>;
    redirectURI?: string;
    scope: string[];
}

const hasGithubCredentials = process.env.AUTH_GITHUB_ID && process.env.AUTH_GITHUB_SECRET && process.env.AUTH_GITHUB_ID.length > 0 && process.env.AUTH_GITHUB_SECRET.length > 0;

const hasGoogleCredentials = process.env.AUTH_GOOGLE_ID && process.env.AUTH_GOOGLE_SECRET && process.env.AUTH_GOOGLE_ID.length > 0 && process.env.AUTH_GOOGLE_SECRET.length > 0;

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

export const auth = betterAuth({
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

    baseURL: process.env.NEXT_SERVER_APP_URL,

    database: drizzleAdapter(db, {
        provider: "pg",
        schema: {},
    }),

    emailAndPassword: {
        enabled: true,
    },

    // Configure OAuth behavior
    oauth: {
        // Default redirect URL after successful login
        defaultCallbackUrl: SYSTEM_CONFIG.redirectAfterSignIn,
        // URL to redirect to on error
        errorCallbackUrl: "/auth/error",
        // Whether to link accounts with the same email
        linkAccountsByEmail: true,
    },

    plugins: [twoFactor()],

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
