import { type NextRequest, NextResponse } from "next/server";

const AUTH_URL = process.env.NEXT_PUBLIC_AUTH_URL ?? "https://auth.homestead.systems";

async function proxy(request: NextRequest) {
    // Forward the incoming request path (including locale segment) to the
    // configured AUTH_URL. Keeping the original pathname preserves locale
    // awareness on the IAM server (e.g. `/en/api/auth/...`).
    const incoming = new URL(request.url);
    const pathWithLocale = incoming.pathname + incoming.search;

    // Primary target is the configured AUTH_URL.
    const base = AUTH_URL.replace(/\/$/, "");
    const target = `${base}${pathWithLocale}`;

    const headers = new Headers();
    // Forward most headers (including cookie) to the IAM server
    for (const [key, value] of request.headers) {
        // let the target set its own host
        if (key.toLowerCase() === "host") {
            continue;
        }
        headers.set(key, value as string);
    }

    let res = await fetch(target, {
        method: request.method,
        headers,
        // forward body for non-GET/HEAD
        body: request.method === "GET" || request.method === "HEAD" ? undefined : request.body,
        // include credentials so IAM can process cookies
        credentials: "include",
    });

    // Development convenience: if the configured AUTH_URL is unreachable
    // (404) and we're running locally, try the IAM dev server on
    // localhost:5004. This avoids requiring a hosts file entry for
    // auth.homestead.systems during local development.
    if (!res.ok && process.env.NODE_ENV === "development") {
        try {
            const devBase = "http://localhost:5004";
            const devTarget = `${devBase}${pathWithLocale}`;
            console.warn(`[proxy] primary target ${target} returned ${res.status}; trying ${devTarget}`);
            // re-run the request against local IAM dev server
            res = await fetch(devTarget, {
                method: request.method,
                headers,
                body: request.method === "GET" || request.method === "HEAD" ? undefined : request.body,
                credentials: "include",
            });
        } catch (_err) {
            // ignore and continue returning original response
        }
    }

    const responseBody = await res.arrayBuffer();
    const nextRes = new NextResponse(responseBody, { status: res.status });

    // Copy response headers (preserve Set-Cookie)
    res.headers.forEach((value, key) => {
        // NextResponse supports multiple Set-Cookie via append
        if (key.toLowerCase() === "set-cookie") {
            nextRes.headers.append(key, value);
        } else {
            nextRes.headers.set(key, value);
        }
    });

    return nextRes;
}

export const GET = proxy;
export const POST = proxy;
export const PUT = proxy;
export const DELETE = proxy;
export const OPTIONS = proxy;
