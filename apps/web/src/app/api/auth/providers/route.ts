import { NextResponse } from "next/server";

export function GET() {
    const providers: string[] = [];
    if (process.env.AUTH_GOOGLE_ID && process.env.AUTH_GOOGLE_SECRET) {
        providers.push("google");
    }
    if (process.env.AUTH_GITHUB_ID && process.env.AUTH_GITHUB_SECRET) {
        providers.push("github");
    }
    if (process.env.AUTH_DISCORD_ID && process.env.AUTH_DISCORD_SECRET) {
        providers.push("discord");
    }
    return NextResponse.json({ providers });
}
