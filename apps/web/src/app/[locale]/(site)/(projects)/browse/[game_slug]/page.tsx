import { db, eq, games } from "@foundry/database";
import { notFound } from "next/navigation";

interface PageProps {
    params: Promise<{
        game_slug: string;
        locale: string;
    }>;
}

export default async function GameBrowsePage({ params, searchParams }: PageProps & { searchParams?: { [key: string]: string | string[] | undefined } }) {
    const { game_slug, locale } = await params;

    const game = await db.query.games.findFirst({
        where: eq(games.slug, game_slug),
        with: {
            categories: true,
            projects: true, // Fetch projects for now, pagination to be added
        },
    });

    if (!game) {
        notFound();
    }

    // (capabilities are available on the game object if needed)

    // apply filters from URL search params (categories, q)
    // `searchParams` can be a Promise in some Next.js runtimes — resolve it first
    const resolvedSearchParams = (await Promise.resolve(searchParams)) as ({ [key: string]: string | string[] | undefined } & Record<string, unknown>) | undefined;

    const selectedCategoriesParam = resolvedSearchParams?.categories;
    let selectedCategorySlugs: string[] = [];
    if (Array.isArray(selectedCategoriesParam)) {
        selectedCategorySlugs = selectedCategoriesParam.flatMap((s) => s.split(",")).filter(Boolean);
    } else if (typeof selectedCategoriesParam === "string") {
        selectedCategorySlugs = selectedCategoriesParam.split(",").filter(Boolean);
    }

    // convert URL slugs -> category IDs for comparing against project.categories (which store IDs)
    const slugToId = new Map((game.categories || []).map((c: { id: string; slug: string }) => [c.slug, c.id]));
    // support either slugs or legacy UUID ids in the URL
    const idSet = new Set((game.categories || []).map((c: { id: string }) => c.id));
    const selectedCategories = selectedCategorySlugs.map((t) => slugToId.get(t) ?? (idSet.has(t) ? t : undefined)).filter(Boolean) as string[];

    const q = typeof resolvedSearchParams?.q === "string" ? resolvedSearchParams.q.trim().toLowerCase() : "";

    const allProjects = game.projects ?? [];
    const filteredProjects = allProjects.filter((project) => {
        // categories filter (OR semantics)
        if (selectedCategories.length > 0) {
            const projCats = (project.categories || []) as string[];
            if (!selectedCategories.some((c) => projCats.includes(c))) {
                return false;
            }
        }

        // simple text search against name/slug/description
        if (q) {
            const hay = `${project.name} ${project.slug} ${project.description || ""}`.toLowerCase();
            if (!hay.includes(q)) {
                return false;
            }
        }

        return true;
    });

    return (
        <div className="w-full p-6">
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-[300px_1fr]">
                <div className="w-full">
                    <main className="flex-1 space-y-6 p-6" />
                </div>
            </div>
        </div>
    );
}
