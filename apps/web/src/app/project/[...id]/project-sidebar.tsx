import { AspectRatio } from "@foundry/ui/primitives/aspect-ratio";
import { Avatar, AvatarFallback, AvatarImage } from "@foundry/ui/primitives/avatar";
import { Badge } from "@foundry/ui/primitives/badge";
import { Button } from "@foundry/ui/primitives/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@foundry/ui/primitives/card";
import { Separator } from "@foundry/ui/primitives/separator";
import Link from "next/link";

export interface ProjectSidebarProps {
    project: {
        compatibility: {
            status: string;
            notes: string;
            matrix: { label: string; value: number }[];
        };
    };
    links: { label: string; href: string }[];
    creators: { name: string; role: string; avatar: string }[];
}

export function ProjectSidebar({ project, links, creators }: ProjectSidebarProps) {
    return (
        <aside className="space-y-4">
            <Card>
                <CardHeader>
                    <CardTitle>Compatibility</CardTitle>
                    <CardDescription>Top-level support signals for this project.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                    <div className="flex items-center justify-between">
                        <span className="text-muted-foreground text-sm">Status</span>
                        <Badge>{project.compatibility.status}</Badge>
                    </div>
                    <p className="text-muted-foreground text-sm">{project.compatibility.notes}</p>
                    <Separator />
                    <div className="space-y-3">
                        {project.compatibility.matrix.map((item) => (
                            <div className="space-y-2" key={item.label}>
                                <div className="flex items-center justify-between text-sm">
                                    <span>{item.label}</span>
                                    <span className="text-muted-foreground">{Math.round(item.value * 100)}%</span>
                                </div>
                                {/* Progress bar should be imported from primitives */}
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
            <Card>
                <CardHeader>
                    <CardTitle>Links</CardTitle>
                    <CardDescription>Fully customizable by the project owner.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                    {links.map((link) => (
                        <Button asChild className="w-full justify-start" key={link.label} variant="ghost">
                            <Link href={link.href}>{link.label}</Link>
                        </Button>
                    ))}
                </CardContent>
            </Card>
            <Card>
                <CardHeader>
                    <CardTitle>Creators</CardTitle>
                    <CardDescription>Show co-maintainers or teams.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                    {creators.map((creator) => (
                        <div className="flex items-center gap-3" key={creator.name}>
                            <Avatar>
                                <AvatarImage alt={creator.name} src={creator.avatar} />
                                <AvatarFallback>{creator.name.slice(0, 2)}</AvatarFallback>
                            </Avatar>
                            <div>
                                <div className="font-medium leading-tight">{creator.name}</div>
                                <p className="text-muted-foreground text-sm">{creator.role}</p>
                            </div>
                        </div>
                    ))}
                </CardContent>
            </Card>
            <Card className="overflow-hidden">
                <CardHeader>
                    <CardTitle>Ad spot</CardTitle>
                    <CardDescription>Reserved inventory for project pages.</CardDescription>
                </CardHeader>
                <CardContent>
                    <AspectRatio ratio={16 / 9}>
                        <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-ctp-mauve-500/80 via-ctp-blue-500/70 to-ctp-teal-400/70 text-white">
                            <div className="text-center">
                                <div className="font-semibold text-lg">Promoted placement</div>
                                <p className="text-sm opacity-80">1600x900 mock creative</p>
                            </div>
                        </div>
                    </AspectRatio>
                </CardContent>
            </Card>
        </aside>
    );
}
