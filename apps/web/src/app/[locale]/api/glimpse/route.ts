import { glimpse } from "@foundry/ui/components";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { url } = body;

        if (!url || typeof url !== "string") {
            return NextResponse.json({ error: "Invalid URL" }, { status: 400 });
        }

        // Validate URL format
        try {
            new URL(url);
        } catch {
            return NextResponse.json({ error: "Invalid URL format" }, { status: 400 });
        }

        // Fetch metadata using the server-side glimpse function
        const metadata = await glimpse(url);

        return NextResponse.json(metadata);
    } catch (error) {
        console.error("Error fetching glimpse metadata:", error);
        return NextResponse.json({ error: "Failed to fetch metadata", title: null, description: null, image: null }, { status: 500 });
    }
}
