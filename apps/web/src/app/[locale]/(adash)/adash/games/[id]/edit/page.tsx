import { db, eq } from "@foundry/database";
import { games } from "@foundry/database/schemas/games/tables";
import { Button } from "@foundry/ui/primitives/button";
import { GameEditForm } from "@foundry/web/components/admin/games/game-edit-form";
import { Link } from "@foundry/web/i18n/navigation";
import { ArrowLeft } from "lucide-react";
import { notFound } from "next/navigation";

export default async function EditGamePage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;

    const [game] = await db.select().from(games).where(eq(games.id, id)).limit(1);

    if (!game) {
        notFound();
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Link href={`/adash/games/${id}`}>
                    <Button size="icon" variant="ghost">
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                </Link>
                <div>
                    <h1 className="font-bold text-2xl tracking-tight">Edit Game</h1>
                    <p className="text-muted-foreground">Update {game.name} configuration</p>
                </div>
            </div>
            <GameEditForm game={game} />
        </div>
    );
}
