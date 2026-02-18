import { db, eq, sql } from "@foundry/database";
import { field_options, games, sidebar_fields } from "@foundry/database/schemas";
import type { FieldOption } from "@foundry/types";
import { NextResponse } from "next/server";

export async function GET(request: Request, { params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    const url = new URL(request.url);
    const fieldId = url.searchParams.get("fieldId");
    const fieldKey = url.searchParams.get("fieldKey");
    const limit = Math.min(Number(url.searchParams.get("limit") ?? "50") || 50, 200);
    const offset = Number(url.searchParams.get("offset") ?? "0") || 0;
    const q = url.searchParams.get("q")?.trim() ?? "";

    if (!(fieldId || fieldKey)) {
        return NextResponse.json({ error: "fieldId or fieldKey is required" }, { status: 400 });
    }
    const gameRows = await db.select().from(games).where(eq(games.slug, slug));
    const game = gameRows[0];
    if (!game) {
        return NextResponse.json({ error: "Game not found" }, { status: 404 });
    }

    let realFieldId = fieldId;
    if (!realFieldId && fieldKey) {
        // fetch all fields for the game and find by key (fields are small)
        const fList = await db.select().from(sidebar_fields).where(eq(sidebar_fields.game_id, game.id)).orderBy(sidebar_fields.sort_order);
        const found = fList.find((x) => x.key === fieldKey);
        if (!found) {
            return NextResponse.json({ error: "Field not found" }, { status: 404 });
        }
        realFieldId = found.id;
    }

    // If a search query is provided, filter by label ILIKE %q% for server-side typeahead
    type OptRow = { id: string; label: string; value: string };
    let opts: OptRow[];

    if (q.length > 0) {
        // Use a raw SQL expression for case-insensitive ILIKE to avoid typing friction
        opts = await db
            .select()
            .from(field_options)
            .where(sql`${field_options.field_id} = ${String(realFieldId)} AND ${field_options.label} ilike ${`%${q}%`}`)
            .orderBy(field_options.sort_order)
            .limit(limit)
            .offset(offset);
    } else {
        opts = await db
            .select()
            .from(field_options)
            .where(eq(field_options.field_id, String(realFieldId)))
            .orderBy(field_options.sort_order)
            .limit(limit)
            .offset(offset);
    }

    const mapped: Pick<FieldOption, "id" | "label" | "value">[] = opts.map((o: OptRow) => ({ id: o.id, label: o.label, value: o.value }));
    const hasMore = mapped.length === limit;

    return NextResponse.json({ items: mapped, limit, offset, hasMore }, { headers: { "Cache-Control": "public, s-maxage=30, stale-while-revalidate=60" } });
}
