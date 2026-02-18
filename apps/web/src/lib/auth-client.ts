"use client";
import { passkeyClient } from "@better-auth/passkey/client";
import { SYSTEM_CONFIG } from "@foundry/configs";
import {
    adminClient,
    apiKeyClient,
    inferAdditionalFields,
    lastLoginMethodClient,
    multiSessionClient,
    organizationClient,
    twoFactorClient,
    usernameClient,
} from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import type auth from "../../../iam/src/lib/auth";
import { ac, adminRole, devRole, userRole } from "./permissions";

// reuse a single regex instance at module scope to avoid recreating it on every call
const TRAILING_SLASH_RE = /\/$/;

const publicAppUrl = process.env.NEXT_PUBLIC_APP_URL ?? "";
const publicAuthUrl = process.env.NEXT_PUBLIC_AUTH_URL ?? "https://auth.homestead.systems";
const defaultCallbackUrl = `${publicAppUrl}${SYSTEM_CONFIG.redirectAfterSignIn}`;

// Create and export the auth client
// Auth requests should go to the IAM domain, not the web domain.
export const authClient = createAuthClient({
    baseURL: publicAuthUrl,
    fetchOptions: {
        credentials: "include",
    },
    plugins: [
        apiKeyClient(),
        lastLoginMethodClient(),
        passkeyClient(),
        usernameClient(),
        multiSessionClient(),
        twoFactorClient({
            onTwoFactorRedirect: () => {
                // Redirect to the two-factor page
                window.location.href = "/auth/two-factor";
            },
        }),
        adminClient({
            ac,
            // roles here must be also defined in `./permissions` if lost see https://www.better-auth.com/docs/plugins/admin#custom-permissions
            roles: {
                user: userRole,
                admin: adminRole,
                dev: devRole,
            },
        }),
        organizationClient({}),
        // infer additional fields from the auth type for type safety and autocompletion in the app
        inferAdditionalFields<typeof auth>(),
    ],
});

// Auth methods
export const { signIn, signOut, signUp, useSession } = authClient;

/**
 * Start provider OAuth flow via the frontend proxy so the browser talks
 * same-origin (`/api/auth/...`) and receives Set-Cookie headers forwarded
 * from the IAM service.
 */
export function signInWithProvider(provider: string) {
    // Redirect directly to the IAM domain so the OAuth flow and callback
    // URLs are consistent with the auth server's configuration.
    const publicAuthUrl = process.env.NEXT_PUBLIC_AUTH_URL ?? "https://auth.homestead.systems";
    // preserve the current locale in the redirect so IAM's localized routes
    // (next-intl) receive the correct locale segment (e.g. /en/api/auth/...)
    const segments = window.location.pathname.split("/").filter(Boolean);
    const locale = segments.length ? segments[0] : "";
    const base = publicAuthUrl.replace(/\/$/, "");
    const target = `${base}${locale ? `/${locale}` : ""}/api/auth/oauth/${provider}?callbackURL=${encodeURIComponent(defaultCallbackUrl)}`;
    window.location.href = target.replace(TRAILING_SLASH_RE, "");
}

// Helper to initiate SSO sign-in flows. Keeps web code simple and centralizes callbackURL logic.
export function signInWithSSO(opts: { providerId?: string; domain?: string; callbackURL?: string; loginHint?: string } = {}) {
    const callback = opts.callbackURL ?? defaultCallbackUrl;
    const body: Record<string, string> = {
        callbackURL: callback,
    };
    if (opts.providerId) {
        body.providerId = opts.providerId;
    }
    if (opts.domain) {
        body.domain = opts.domain;
    }
    if (opts.loginHint) {
        body.loginHint = opts.loginHint;
    }

    // `sso` is provided by the better-auth client at runtime; cast to `any`
    // to satisfy TypeScript where the plugin-augmented type isn't inferred.
    return (authClient.signIn as any).sso({
        ...(body as Record<string, unknown>),
        fetchOptions: {
            credentials: "include",
        },
    });
}

export function signUpWithProvider(provider: string) {
    // many providers use the same endpoint for sign-in/sign-up, redirect to the same path
    signInWithProvider(provider);
}

// Two-factor methods
export const twoFactor = authClient.twoFactor;

// Hook to get current user data and loading state
// !! Returns only raw (static) data, use getCurrentUserOrRedirect for data from db
export const useCurrentUser = () => {
    const { data, isPending } = useSession();
    return {
        isPending,
        session: data?.session,
        user: data?.user,
    };
};

// Hook similar to getCurrentUserOrRedirect for client-side use
// !! Returns only raw (static) data, use getCurrentUserOrRedirect for data from db
export const useCurrentUserOrRedirect = (forbiddenUrl = "/auth/sign-in", okUrl = "", ignoreForbidden = false) => {
    const { data, isPending } = useSession();
    const router = useRouter();

    useEffect(() => {
        // only perform redirects after loading is complete and router is ready
        if (!isPending && router) {
            // if no user is found
            if (!data?.user) {
                // redirect to forbidden url unless explicitly ignored
                if (!ignoreForbidden) {
                    router.push(forbiddenUrl as never);
                }
                // if ignoreforbidden is true, we do nothing and let the hook return the null user
            } else if (okUrl) {
                // if user is found and an okurl is provided, redirect there
                router.push(okUrl as never);
            }
        }
        // depend on loading state, user data, router instance, and redirect urls
    }, [isPending, data?.user, router, forbiddenUrl, okUrl, ignoreForbidden]);

    return {
        isPending,
        session: data?.session,
        user: data?.user,
    };
};

// !! currently not used in the app
/**
 * returns the raw session object from better-auth client.
 * this is a direct wrapper around authclient.getsession and returns the same shape.
 *
 * use this when you require advanced session access patterns, e.g.:
 * - you need to fetch the session manually (e.g., with swr, react query, or custom logic).
 * - you need to access the session data directly without using the usesession hook.
 * - you want more control than the usesession hook provides.
 *
 * @example
 * const { data, error } = await useRawSession();
 */
// export const useRawSession = authClient.getSession;
