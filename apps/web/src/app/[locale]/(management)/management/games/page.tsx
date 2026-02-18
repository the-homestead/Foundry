import { db, games } from "@foundry/database";
import { Badge } from "@foundry/ui/primitives/badge";
import { Button } from "@foundry/ui/primitives/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@foundry/ui/primitives/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@foundry/ui/primitives/table";
import { Link } from "@foundry/web/i18n/navigation";
import { Edit, Gamepad2, Plus } from "lucide-react";
import Image from "next/image";

export default async function AdminGamesPage() {
    const allGames = await db.select().from(games);

    return (
        <div className="space-y-8 p-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="font-bold text-3xl tracking-tight">Games Management</h1>
                    <p className="text-muted-foreground">Manage supported games and their configurations.</p>
                </div>
                <Link href="/management/games/new">
                    <Button>
                        <Plus className="mr-2 h-4 w-4" />
                        Add Game
                    </Button>
                </Link>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Games List</CardTitle>
                    <CardDescription>Configuration for all games available on the platform.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-[80px]">Icon</TableHead>
                                <TableHead>Name</TableHead>
                                <TableHead>Slug</TableHead>
                                <TableHead>Projects</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {allGames.map((game) => {
                                const images = game.images as { icon: string };
                                const stats = game.stats as { project_count: number };

                                return (
                                    <TableRow key={game.id}>
                                        <TableCell>
                                            <div className="relative h-10 w-10">
                                                {images.icon ? (
                                                    <Image alt={game.name} className="rounded-md object-cover" fill src={images.icon} />
                                                ) : (
                                                    <Gamepad2 className="h-10 w-10 text-muted-foreground/50" />
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell className="font-medium">{game.name}</TableCell>
                                        <TableCell className="font-mono text-xs">{game.slug}</TableCell>
                                        <TableCell>
                                            <Badge variant="secondary">{stats.project_count || 0}</Badge>
                                        </TableCell>
                                        <TableCell>
                                            <Badge className="border-green-500/20 bg-green-500/10 text-green-500 hover:bg-green-500/20" variant="outline">
                                                Active
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <Link href={`/management/games/${game.id}`}>
                                                <Button size="icon" variant="ghost">
                                                    <Edit className="h-4 w-4" />
                                                    <span className="sr-only">View Details</span>
                                                </Button>
                                            </Link>
                                        </TableCell>
                                    </TableRow>
                                );
                            })}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
