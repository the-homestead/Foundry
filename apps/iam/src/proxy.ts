import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

const DEFAULT_WEB = "https://foundry.homestead.systems";
const DEFAULT_AUTH = "https://auth.homestead.systems";

function normalizeOrigin(value?: string | null) {
    if (!value) {
        return null;
    }
    try {
        return new URL(value).origin;
    } catch (_e) {
        return null;
    }
}

const trusted = new Set([
    normalizeOrigin(process.env.NEXT_PUBLIC_APP_URL) ?? DEFAULT_AUTH,
    normalizeOrigin(process.env.BETTER_AUTH_URL) ?? DEFAULT_AUTH,
    normalizeOrigin(process.env.NEXT_PUBLIC_WEB_APP_URL) ?? DEFAULT_WEB,
]);

export function proxy(req: NextRequest) {
    const origin = req.headers.get("origin");
    const allowed = origin && trusted.has(origin);

    // handle preflight
    if (req.method === "OPTIONS") {
        const res = new NextResponse(null, { status: 204 });
        if (allowed && origin) {
            res.headers.set("Access-Control-Allow-Origin", origin);
            res.headers.set("Access-Control-Allow-Credentials", "true");
            res.headers.set("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
            res.headers.set("Access-Control-Allow-Headers", "Content-Type,Authorization");
            res.headers.set("Access-Control-Max-Age", "86400");
        }
        return res;
    }

    const response = NextResponse.next();
    if (allowed && origin) {
        response.headers.set("Access-Control-Allow-Origin", origin);
        response.headers.set("Access-Control-Allow-Credentials", "true");
    }
    return response;
}

export const config = {
    matcher: "/api/auth/:path*",
};
