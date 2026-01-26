import { passkey } from "@better-auth/passkey";
import { db, schema } from "@foundry/database";
import { LAUNCHER_FREE, toApiKeyPermissions } from "@foundry/types/permissions/api-key";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { nextCookies } from "better-auth/next-js";
import { apiKey, haveIBeenPwned, lastLoginMethod, twoFactor, username } from "better-auth/plugins";
import { headers } from "next/headers";
import { SYSTEM_CONFIG } from "../constants";
import type { UserDbType } from "./auth-types";

const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
const appOrigin = new URL(appUrl).origin;
const rpID = new URL(appUrl).hostname;

// configure basic social providers from env (same as backend)
// biome-ignore lint/suspicious/noExplicitAny: <Def>
const socialProviders: Record<string, any> = {};
if (process.env.AUTH_GOOGLE_ID && process.env.AUTH_GOOGLE_SECRET) {
    socialProviders.google = {
        clientId: process.env.AUTH_GOOGLE_ID,
        clientSecret: process.env.AUTH_GOOGLE_SECRET,
        scope: ["openid", "email", "profile"],
    };
}
if (process.env.AUTH_GITHUB_ID && process.env.AUTH_GITHUB_SECRET) {
    socialProviders.github = {
        clientId: process.env.AUTH_GITHUB_ID,
        clientSecret: process.env.AUTH_GITHUB_SECRET,
        scope: ["user:email", "read:user"],
    };
}
if (process.env.AUTH_DISCORD_ID && process.env.AUTH_DISCORD_SECRET) {
    socialProviders.discord = {
        clientId: process.env.AUTH_DISCORD_ID,
        clientSecret: process.env.AUTH_DISCORD_SECRET,
        scope: ["identify", "email"],
    };
}

export const auth = betterAuth({
    appName: "Foundry",
    baseURL: process.env.NEXT_PUBLIC_APP_URL ?? appUrl,
    trustedOrigins: [appUrl],

    // database adapter (uses same drizzle setup)
    database: drizzleAdapter(db, {
        provider: "pg",
        schema,
    }),

    emailAndPassword: { enabled: true },

    advanced: {
        // make cookies usable cross-site
        crossSubDomainCookies: {
            enabled: true,
            domain: new URL(appUrl).hostname,
        },
        defaultCookieAttributes: {
            sameSite: "none",
            secure: true,
        },
    },

    oauth: {
        defaultCallbackUrl: SYSTEM_CONFIG.redirectAfterSignIn,
        errorCallbackUrl: "/auth/error",
        linkAccountsByEmail: true,
    },

    plugins: [
        apiKey({
            enableSessionForAPIKeys: true,
            enableMetadata: true,
            permissions: { defaultPermissions: toApiKeyPermissions(LAUNCHER_FREE) },
        }),
        haveIBeenPwned({ customPasswordCompromisedMessage: "Please choose a more secure password." }),
        lastLoginMethod({ storeInDatabase: true }),
        passkey({ origin: appOrigin, rpID, rpName: "Foundry" }),
        twoFactor({ issuer: "Foundry" }),
        username(),
        // must be last so Set-Cookie headers are surfaced through Next.js
        nextCookies(),
    ],

    secret: process.env.AUTH_SECRET,

    socialProviders,
});

export const getCurrentUser = async (): Promise<null | UserDbType> => {
    const session = await auth.api.getSession({
        headers: await headers(),
    });
    if (!session) {
        return null;
    }
    return session.user as UserDbType;
};

// export const getCurrentUserOrRedirect = async (forbiddenUrl = "/auth/sign-in", okUrl = "", ignoreForbidden = false): Promise<null | UserDbType> => {
//     const user = await getCurrentUser();

//     // if no user is found
//     if (!user) {
//         // redirect to forbidden url unless explicitly ignored
//         if (!ignoreForbidden) {
//             redirect(forbiddenUrl);
//         }
//         // if ignoring forbidden, return the null user immediately
//         // (don't proceed to okUrl check)
//         return user; // user is null here
//     }

//     // if user is found and an okUrl is provided, redirect there
//     if (okUrl) {
//         redirect(okUrl);
//     }

//     // if user is found and no okUrl is provided, return the user
//     return user; // user is UserDbType here
// };

export default auth;
