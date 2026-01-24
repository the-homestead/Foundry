import { NextResponse } from "next/server";

export async function POST(request: Request) {
    const body = await request.json().catch(() => ({}));
    const backend = process.env.NEXT_SERVER_APP_URL ?? "";
    if (!backend) {
        return NextResponse.json({ error: "Missing backend URL" }, { status: 500 });
    }

    const res = await fetch(`${backend}/api/auth/forgot`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
        credentials: "include",
    });

    const text = await res.text();
    return new NextResponse(text, { status: res.status, headers: { "Content-Type": res.headers.get("Content-Type") ?? "text/plain" } });
}
