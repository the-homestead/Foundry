import { db, eq } from "@foundry/database";
import { games } from "@foundry/database/schemas/games/tables";
import { Button } from "@foundry/ui/primitives/button";
import { getAllCategoriesFlat } from "@foundry/web/actions/categories";
import { CategoryForm } from "@foundry/web/components/admin/games/category-form";
import { Link } from "@foundry/web/i18n/navigation";
import { ArrowLeft } from "lucide-react";
import { notFound } from "next/navigation";

export default async function NewCategoryPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;

    const [game] = await db.select().from(games).where(eq(games.id, id)).limit(1);

    if (!game) {
        notFound();
    }

    const allCategories = await getAllCategoriesFlat(id);

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Link href={`/management/games/${id}`}>
                    <Button size="icon" variant="ghost">
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                </Link>
                <div>
                    <h1 className="font-bold text-2xl tracking-tight">Create Category</h1>
                    <p className="text-muted-foreground">Add a new category for {game.name}</p>
                </div>
            </div>

            <CategoryForm allCategories={allCategories} gameId={id} gameName={game.name} />
        </div>
    );
}
