import { NextResponse } from "next/server";

export async function POST(request: Request) {
    const body = await request.json().catch(() => ({}));
    // call local auth endpoint
    const res = await fetch("/api/auth/reset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
        credentials: "include",
    });

    const text = await res.text();
    return new NextResponse(text, { status: res.status, headers: { "Content-Type": res.headers.get("Content-Type") ?? "text/plain" } });
}
