import { db, eq } from "@foundry/database";
import { field_options, games, sidebar_fields } from "@foundry/database/schemas";
import type { FieldOption, SidebarConfig, SidebarField } from "@foundry/types";
import { NextResponse } from "next/server";

export async function GET(request: Request, { params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;

    // optional limit for options preview
    const url = new URL(request.url);
    const previewLimit = Number(url.searchParams.get("limit") ?? "50") || 50;

    const gameRows = await db.select().from(games).where(eq(games.slug, slug));
    const game = gameRows[0];
    if (!game) {
        return NextResponse.json({ error: "Game not found" }, { status: 404 });
    }

    const fields = await db.select().from(sidebar_fields).where(eq(sidebar_fields.game_id, game.id)).orderBy(sidebar_fields.sort_order);

    const normalized: SidebarField[] = await Promise.all(
        fields.map(async (f) => {
            let optionsPreview: Pick<FieldOption, "id" | "label" | "value">[] | null = null;
            if (Array.isArray(f.options_preview)) {
                optionsPreview = f.options_preview as Pick<FieldOption, "id" | "label" | "value">[];
            } else {
                const opts = await db.select().from(field_options).where(eq(field_options.field_id, f.id)).orderBy(field_options.sort_order).limit(previewLimit);
                optionsPreview = opts.map((o) => ({ id: o.id, value: o.value, label: o.label }));
            }

            return {
                id: f.id,
                key: f.key,
                label: f.label,
                type: f.type as SidebarField["type"],
                optionsSource: f.options_source ?? null,
                optionsPreview,
                virtualized: f.virtualized,
                uiHint: (f.ui_hint as Record<string, unknown>) ?? null,
                sortOrder: f.sort_order,
                visible: f.visible,
            } as SidebarField;
        })
    );

    const sidebarConfig: SidebarConfig = {
        gameId: game.id,
        gameSlug: game.slug,
        fields: normalized,
    };

    return NextResponse.json(sidebarConfig, {
        headers: {
            "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
        },
    });
}
