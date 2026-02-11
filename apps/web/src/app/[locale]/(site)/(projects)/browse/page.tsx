import { db, games } from "@foundry/database";
import { Badge } from "@foundry/ui/primitives/badge";
import { Card, CardContent } from "@foundry/ui/primitives/card";
import { Link } from "@foundry/web/i18n/navigation";
import { Box, Download, Package } from "lucide-react";
import Image from "next/image";

export default async function BrowsePage() {
    const allGames = await db.select().from(games);

    return (
        <div className="container mx-auto space-y-8 p-6">
            <div className="flex flex-col gap-4">
                <h1 className="font-bold text-4xl tracking-tight">Browse Games</h1>
                <p className="text-lg text-muted-foreground">Select a game to start browsing projects and mods.</p>
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {allGames.map((game) => {
                    // Type assertion for jsonb fields if needed, or rely on Drizzle's inference if configured
                    // Assuming structure based on our schema definition
                    const images = game.images as { cover: string; icon: string; background: string };
                    const stats = game.stats as { project_count: number; download_count: number; modpack_count: number };

                    return (
                        <Link className="group block h-full" href={`/browse/${game.slug}`} key={game.id}>
                            <Card className="h-full overflow-hidden transition-all duration-300 hover:border-primary/50 hover:shadow-lg">
                                <div className="relative h-48 w-full overflow-hidden bg-muted">
                                    {images.cover ? (
                                        <Image alt={game.name} className="object-cover transition-transform duration-500 group-hover:scale-105" fill src={images.cover} />
                                    ) : (
                                        <div className="flex h-full items-center justify-center bg-secondary">
                                            <Box className="h-16 w-16 text-muted-foreground/20" />
                                        </div>
                                    )}
                                    <div className="absolute top-4 left-4">
                                        {images.icon && (
                                            <div className="h-12 w-12 overflow-hidden rounded-lg border bg-background p-1 shadow-sm">
                                                <Image alt={game.name} className="h-full w-full object-contain" height={48} src={images.icon} width={48} />
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <CardContent className="p-6">
                                    <h2 className="mb-2 font-bold text-2xl transition-colors group-hover:text-primary">{game.name}</h2>
                                    <p className="mb-4 line-clamp-2 h-10 text-muted-foreground text-sm">{game.description}</p>

                                    <div className="mt-auto flex flex-wrap gap-2">
                                        <Badge className="gap-1.5 pl-1.5" variant="secondary">
                                            <Box className="h-3.5 w-3.5 text-muted-foreground" />
                                            <span>{stats.project_count || 0}</span>
                                        </Badge>
                                        <Badge className="gap-1.5 pl-1.5" variant="secondary">
                                            <Download className="h-3.5 w-3.5 text-muted-foreground" />
                                            <span>{stats.download_count || 0}</span>
                                        </Badge>
                                        <Badge className="gap-1.5 pl-1.5" variant="secondary">
                                            <Package className="h-3.5 w-3.5 text-muted-foreground" />
                                            <span>{stats.modpack_count || 0}</span>
                                        </Badge>
                                    </div>
                                </CardContent>
                            </Card>
                        </Link>
                    );
                })}

                {allGames.length === 0 && (
                    <div className="col-span-full py-20 text-center text-muted-foreground">
                        <Box className="mx-auto mb-4 h-12 w-12 opacity-20" />
                        <p>No games found.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
