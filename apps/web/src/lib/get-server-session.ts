import { headers as nextHeaders } from "next/headers";
import { routing } from "../i18n/routing";

const AUTH_URL = process.env.NEXT_PUBLIC_AUTH_URL ?? "https://auth.homestead.systems";

/**
 * Fetch the current session from the central IAM server using incoming request cookies.
 * Returns null if no valid session is present.
 */
export async function getServerSession(headers?: Headers): Promise<unknown | null> {
    const h = headers ?? (await nextHeaders());
    const cookie = h.get("cookie");
    if (!cookie) {
        return null;
    }

    // Try the same-origin, locale-prefixed proxy first so server-side
    // calls route through `web` and benefit from locale routing & header forwarding.
    const locale = (h.get("x-locale") ?? routing.defaultLocale ?? "en").toString();
    const localePrefix = locale ? `/${locale}` : "";

    // Prefer the same-origin proxy but call the Better‑Auth `get-session`
    // endpoint using an absolute URL (server-side fetch does not accept
    // relative URLs). Build the origin from request headers when possible
    // so this works correctly in dev and production without relying on
    // hard-coded env values.
    try {
        const hostHeader = (h.get("x-forwarded-host") ?? h.get("host"))?.toString();
        const protoHeader = (h.get("x-forwarded-proto") ?? (process.env.NODE_ENV === "development" ? "http" : "https"))?.toString();

        let proxyUrl: string | null = null;
        if (hostHeader) {
            proxyUrl = `${protoHeader}://${hostHeader.replace(/\/$/, "")}${localePrefix}/api/auth/get-session`;
        } else if (process.env.NEXT_PUBLIC_APP_URL) {
            const appUrl = process.env.NEXT_PUBLIC_APP_URL.replace(/\/$/, "");
            proxyUrl = `${appUrl}${localePrefix}/api/auth/get-session`;
        }

        if (proxyUrl) {
            if (process.env.NODE_ENV === "development") {
                console.debug("getServerSession: probing same-origin proxy", proxyUrl);
            }
            const localRes = await fetch(proxyUrl, {
                method: "GET",
                headers: { cookie },
                cache: "no-store",
                credentials: "include",
            });

            if (localRes.ok) {
                return await localRes.json();
            }
            if (process.env.NODE_ENV === "development") {
                console.warn("getServerSession: same-origin proxy returned status", localRes.status);
            }
        } else if (process.env.NODE_ENV === "development") {
            console.warn("getServerSession: no host/app URL available to call same-origin proxy");
        }
    } catch (err) {
        if (process.env.NODE_ENV === "development") {
            console.warn("getServerSession: proxy fetch failed", err);
        }
        // fall through to direct AUTH_URL
    }

    // Fallback: call the configured AUTH_URL directly (production / alternate setups).
    // IMPORTANT: the IAM Next.js server is locale-aware (next-intl) so include
    // the locale segment when calling the auth host (e.g. /en/api/auth/get-session).
    try {
        const base = AUTH_URL.replace(/\/$/, "");
        const target = `${base}${locale ? `/${locale}` : ""}/api/auth/get-session`;

        const res = await fetch(target, {
            method: "GET",
            headers: { cookie },
            cache: "no-store",
            credentials: "include",
        });

        if (!res.ok) {
            if (process.env.NODE_ENV === "development") {
                console.warn("getServerSession: direct auth host returned status", res.status);
            }
            return null;
        }
        return await res.json();
    } catch (_e) {
        return null;
    }
}

export default getServerSession;

/**
 * Call an authenticated Better Auth API endpoint on the central IAM server.
 * - `path` must start with `/api/auth` (we don't validate further).
 * - `body` (if provided) is JSON-stringified and Content-Type is set.
 */
export async function callAuthApi(path: string, opts?: { method?: string; body?: unknown; headers?: Headers }): Promise<unknown | null> {
    const h = opts?.headers ?? (await nextHeaders());
    const cookie = h.get("cookie");
    if (!cookie) {
        return null;
    }

    // Ensure calls to the auth host include the current locale so requests
    // like `/api/auth/...` map to the localized Next.js routes (e.g. `/en/api/auth/...`).
    const locale = (h.get("x-locale") ?? routing.defaultLocale ?? "").toString();
    const base = AUTH_URL.replace(/\/$/, "");
    const target = `${base}${locale ? `/${locale}` : ""}${path}`;

    const res = await fetch(target, {
        method: opts?.method ?? "POST",
        headers: {
            cookie,
            "content-type": "application/json",
        },
        body: opts?.body ? JSON.stringify(opts.body) : undefined,
        cache: "no-store",
        credentials: "include",
    });

    if (!res.ok) {
        return null;
    }

    try {
        return await res.json();
    } catch (_e) {
        return null;
    }
}
