import { type NextRequest, NextResponse } from "next/server";

const allowedOrigins = ["https://sentry.myhm.space", "https://homestead.systems", "http://localhost:3200", "http://localhost:3100"];

const corsOptions = {
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
};
// Proxy function to handle CORS for API routes
export function proxy(request: NextRequest) {
    // Check the origin from the request
    const origin = request.headers.get("origin") ?? "";
    const isAllowedOrigin = allowedOrigins.includes(origin);

    // Handle preflighted requests
    const isPreflight = request.method === "OPTIONS";

    if (isPreflight) {
        const preflightHeaders = {
            ...(isAllowedOrigin && { "Access-Control-Allow-Origin": origin }),
            ...corsOptions,
        };
        return NextResponse.json({}, { headers: preflightHeaders });
    }

    // Handle simple requests
    const response = NextResponse.next();

    if (isAllowedOrigin) {
        response.headers.set("Access-Control-Allow-Origin", origin);
    }

    for (const [key, value] of Object.entries(corsOptions)) {
        response.headers.set(key, value);
    }

    return response;
}

export const config = {
    matcher: "/api/:path*",
};
