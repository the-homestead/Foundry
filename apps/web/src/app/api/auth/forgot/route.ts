import { NextResponse } from "next/server";

const STRIP_API_AUTH_RE = /\/api\/auth\/?$/i;
const TRAILING_SLASH_RE = /\/$/;

export async function POST(request: Request) {
    const body = await request.json().catch(() => ({}));
    const backendRaw = process.env.NEXT_PUBLIC_SERVER_APP_URL ?? "";
    if (!backendRaw) {
        return NextResponse.json({ error: "Missing backend URL" }, { status: 500 });
    }

    const backend = backendRaw.replace(STRIP_API_AUTH_RE, "").replace(TRAILING_SLASH_RE, "");

    const res = await fetch(`${backend}/api/auth/forgot`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
        credentials: "include",
    });

    const text = await res.text();
    return new NextResponse(text, { status: res.status, headers: { "Content-Type": res.headers.get("Content-Type") ?? "text/plain" } });
}
