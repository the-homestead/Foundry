import { db, eq } from "@foundry/database";
import { field_options, games, projects } from "@foundry/database/schemas";
import { NextResponse } from "next/server";

export async function GET(req: Request, { params }: { params: { slug: string } }) {
    const { slug } = params;
    const url = new URL(req.url);
    const fieldKey = url.searchParams.get("fieldKey");
    const fieldId = url.searchParams.get("fieldId");

    if (!(fieldKey && fieldId)) {
        return NextResponse.json({ error: "fieldKey and fieldId query parameters are required" }, { status: 400 });
    }

    // lookup game id
    const gameRows = await db.select().from(games).where(eq(games.slug, slug));
    const game = gameRows[0];
    if (!game) {
        return NextResponse.json({ error: "game not found" }, { status: 404 });
    }

    // Load field options
    const options = await db.select().from(field_options).where(eq(field_options.field_id, fieldId)).orderBy(field_options.sort_order);

    // Load projects metadata for this game and compute counts in JS (covers single-value metadata fields)
    const projRows = await db.select({ id: projects.id, metadata: projects.metadata }).from(projects).where(eq(projects.game_id, game.id));

    const counts = new Map<string, number>();
    for (const opt of options) {
        counts.set(opt.value, 0);
    }

    for (const p of projRows) {
        try {
            const meta = p.metadata as Record<string, unknown> | null;
            if (!meta) {
                continue;
            }
            const val = meta[fieldKey];
            if (typeof val === "string") {
                counts.set(val, (counts.get(val) ?? 0) + 1);
            }
        } catch {
            // ignore malformed metadata
        }
    }

    const items = options.map((o) => ({ id: o.id, label: o.label, value: o.value, count: counts.get(o.value) ?? 0 }));

    return NextResponse.json({ items });
}
