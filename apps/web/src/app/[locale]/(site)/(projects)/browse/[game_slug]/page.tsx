import { db, eq, games } from "@foundry/database";
import { BrowseControls } from "@foundry/web/components/browse/browse-controls";
import { BrowseSidebar } from "@foundry/web/components/browse/browse-sidebar";
import { ProjectCard } from "@foundry/web/components/browse/project-card";
import { CreateProjectDialog } from "@foundry/web/components/projects/create-project-dialog";
import { Box } from "lucide-react";
import { notFound } from "next/navigation";

interface PageProps {
    params: Promise<{
        game_slug: string;
        locale: string;
    }>;
}

export default async function GameBrowsePage({ params }: PageProps) {
    const { game_slug } = await params;

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

    // Parse capabilities
    const capabilities = game.capabilities as { versions: string[]; modloaders: string[] };

    return (
        <div className="flex min-h-[calc(100vh-4rem)] border-t border-b">
            {/* Sidebar Area */}
            <aside className="sticky top-0 hidden h-[calc(100vh-4rem)] w-80 border-r bg-muted/10 md:block">
                <div className="h-full overflow-y-auto">
                    <BrowseSidebar categories={game.categories} gameName={game.name} modLoaders={capabilities.modloaders || []} versions={capabilities.versions || []} />
                </div>
            </aside>

            {/* Main Content Area */}
            <main className="flex-1 space-y-6 p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="font-bold text-3xl tracking-tight">Browse Projects</h1>
                        <p className="text-muted-foreground">
                            Browse and filter {(game.stats as { project_count?: number })?.project_count || 0} projects for {game.name}
                        </p>
                    </div>
                    <CreateProjectDialog categories={game.categories} gameId={game.id} gameName={game.name} />
                </div>

                <BrowseControls totalProjects={(game.stats as { project_count?: number })?.project_count || 0} />

                <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {/* Real Project Grid would map here. Using a placeholder card loop for UI dev. */}
                    {game.projects && game.projects.length > 0 ? (
                        game.projects.map((project) => {
                            // Transform database project to match ProjectCard's expected type
                            const transformedProject = {
                                ...project,
                                metadata: (project.metadata || {}) as Record<string, unknown>,
                                categories: (project.categories || []) as unknown as string[],
                                sub_categories: (project.sub_categories || []) as unknown as string[],
                            };

                            return (
                                <ProjectCard
                                    downloads={0}
                                    key={project.id}
                                    project={transformedProject}
                                    /* Join with project_files stats later */
                                />
                            );
                        })
                    ) : (
                        <div className="col-span-full flex h-64 flex-col items-center justify-center rounded-lg border-2 border-dashed text-muted-foreground">
                            <Box className="mb-4 h-12 w-12 opacity-20" />
                            <p>No projects found matching your criteria.</p>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
