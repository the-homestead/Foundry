import { db, eq } from "@foundry/database";
import { games } from "@foundry/database/schemas/games/tables";
// ...existing imports
import { Button } from "@foundry/ui/primitives/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@foundry/ui/primitives/card";
import { getAllCategoriesFlat, getCategoriesForGame } from "@foundry/web/actions/categories";
import { CategoriesList } from "@foundry/web/components/admin/games/categories-list";
import { CategoryFormDialog } from "@foundry/web/components/admin/games/category-form";
import { GameCapabilitiesInline } from "@foundry/web/components/admin/games/game-capabilities-inline";
import { GameFieldEditable } from "@foundry/web/components/admin/games/game-field-editable";
import { Link } from "@foundry/web/i18n/navigation";
import { ArrowLeft, FolderTree } from "lucide-react";
import Image from "next/image";
import { notFound } from "next/navigation";

export default async function GameDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;

    const [game] = await db.select().from(games).where(eq(games.id, id)).limit(1);

    if (!game) {
        notFound();
    }

    const images = game.images as { icon: string; cover: string; background: string };
    const stats = game.stats as { project_count: number; download_count: number; modpack_count: number };
    const capabilities = game.capabilities as { versions: string[]; modloaders: string[] };

    const categories = await getCategoriesForGame(id);
    const allCategories = await getAllCategoriesFlat(id);

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Link href="/management/games">
                    <Button size="icon" variant="ghost">
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                </Link>
                <div className="flex-1">
                    <h1 className="font-bold text-2xl tracking-tight">{game.name}</h1>
                    <p className="text-muted-foreground">Game configuration and categories</p>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                <div className="space-y-6 md:col-span-2">
                    <Card>
                        <CardHeader>
                            <CardTitle>Game Information</CardTitle>
                            <CardDescription>Basic details about this game.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <GameFieldEditable
                                    capabilities={capabilities}
                                    field="name"
                                    gameId={id}
                                    images={images}
                                    label="Name"
                                    originalDescription={game.description || ""}
                                    originalName={game.name}
                                    originalSlug={game.slug}
                                    value={game.name}
                                />
                            </div>
                            <div>
                                <GameFieldEditable
                                    capabilities={capabilities}
                                    field="slug"
                                    gameId={id}
                                    images={images}
                                    label="Slug"
                                    originalDescription={game.description || ""}
                                    originalName={game.name}
                                    originalSlug={game.slug}
                                    value={game.slug}
                                />
                            </div>
                            <div>
                                <GameFieldEditable
                                    capabilities={capabilities}
                                    field="description"
                                    gameId={id}
                                    images={images}
                                    label="Description"
                                    originalDescription={game.description || ""}
                                    originalName={game.name}
                                    originalSlug={game.slug}
                                    value={game.description}
                                />
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Capabilities</CardTitle>
                            <CardDescription>Supported versions and modloaders.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <GameCapabilitiesInline
                                description={game.description}
                                gameId={id}
                                images={images}
                                modloaders={capabilities.modloaders}
                                name={game.name}
                                slug={game.slug}
                                versions={capabilities.versions}
                            />
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0">
                            <div>
                                <CardTitle className="flex items-center gap-2">
                                    <FolderTree className="h-5 w-5" />
                                    Categories
                                </CardTitle>
                                <CardDescription>Organize projects by category and subcategory.</CardDescription>
                            </div>
                            <CategoryFormDialog allCategories={allCategories} gameId={id} gameName={game.name} />
                        </CardHeader>
                        <CardContent>
                            {/* Small, stable preview to avoid layout shift — full editor is in the drawer */}
                            <CategoriesList allCategories={allCategories} categories={categories} gameId={id} gameName={game.name} />
                        </CardContent>
                    </Card>
                </div>

                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Assets</CardTitle>
                            <CardDescription>Visual identity.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <div className="mb-2 text-muted-foreground text-sm">Icon</div>
                                <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-lg border bg-muted">
                                    {images.icon ? (
                                        <Image alt={`${game.name} icon`} className="h-full w-full object-cover" height={64} src={images.icon} width={64} />
                                    ) : (
                                        <span className="text-muted-foreground text-xs">No icon</span>
                                    )}
                                </div>
                            </div>
                            <div>
                                <div className="mb-2 text-muted-foreground text-sm">Cover</div>
                                <div className="relative flex aspect-square w-full items-center justify-center overflow-hidden rounded-lg border bg-muted">
                                    {images.cover ? (
                                        <Image alt={`${game.name} cover`} className="h-full w-full object-cover" fill src={images.cover} />
                                    ) : (
                                        <span className="text-muted-foreground text-xs">No cover</span>
                                    )}
                                </div>
                            </div>
                            <div>
                                <div className="mb-2 text-muted-foreground text-sm">Background</div>
                                <div className="relative flex aspect-video w-full items-center justify-center overflow-hidden rounded-lg border bg-muted">
                                    {images.background ? (
                                        <Image alt={`${game.name} background`} className="h-full w-full object-cover" fill src={images.background} />
                                    ) : (
                                        <span className="text-muted-foreground text-xs">No background</span>
                                    )}
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Statistics</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            <div className="flex items-center justify-between">
                                <span className="text-muted-foreground text-sm">Projects</span>
                                <span className="font-medium">{stats.project_count}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-muted-foreground text-sm">Downloads</span>
                                <span className="font-medium">{stats.download_count.toLocaleString()}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-muted-foreground text-sm">Modpacks</span>
                                <span className="font-medium">{stats.modpack_count}</span>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
