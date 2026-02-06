import type { NextRequest } from "next/server";
import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";

const nextIntlMiddleware = createMiddleware(routing);

// const allowedOrigins = ["https://sentry.myhm.space", "https://homestead.systems", "https://foundry.homestead.systems", "http://localhost:3200", "http://localhost:3100"];

// const corsOptions = {
//     "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
//     "Access-Control-Allow-Headers": "Content-Type, Authorization",
// };

export default function middleware(request: NextRequest) {
    // const path = request.nextUrl.pathname;

    // Handle API / trpc CORS first
    // if (path.startsWith("/api") || path.startsWith("/trpc")) {
    //     const origin = request.headers.get("origin") ?? "";
    //     const isAllowedOrigin = allowedOrigins.includes(origin);
    //     const isPreflight = request.method === "OPTIONS";

    //     if (isPreflight) {
    //         const headers = {
    //             ...(isAllowedOrigin && { "Access-Control-Allow-Origin": origin }),
    //             ...corsOptions,
    //         };
    //         return NextResponse.json({}, { headers });
    //     }

    //     const res = NextResponse.next();
    //     if (isAllowedOrigin) {
    //         res.headers.set("Access-Control-Allow-Origin", origin);
    //     }
    //     for (const [k, v] of Object.entries(corsOptions)) {
    //         res.headers.set(k, v);
    //     }
    //     return res;
    // }

    // Non-API: delegate to next-intl
    return nextIntlMiddleware(request);
}

export const config = {
    matcher: [
        "/api/:path*",
        // next-intl matcher (everything except api|trpc|_next|_vercel|static files)
        "/((?!api|trpc|_next|_vercel|.*\\..*).*)",
    ],
};
