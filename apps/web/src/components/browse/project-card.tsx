"use client";

import type { projects } from "@foundry/database/schemas/projects/tables";
import { Badge } from "@foundry/ui/primitives/badge";
import { Card } from "@foundry/ui/primitives/card";
import { Link } from "@foundry/web/i18n/navigation";
import { Calendar, Download } from "lucide-react";
import Image from "next/image";

// Define a type that handles the jsonb fields properly
type Project = typeof projects.$inferSelect & {
    metadata:
        | {
              short_description: string;
              author?: string;
          }
        | Record<string, unknown>;
    categories: string[];
    sub_categories: string[];
};

interface ProjectCardProps {
    project: Project;
    downloads?: number;
    updatedAt?: Date;
}

export function ProjectCard({ project, downloads, updatedAt }: ProjectCardProps) {
    const defaultIcon = "https://images.placeholders.dev/?width=100&height=100&text=?&bgColor=%23333&textColor=%23888"; // Fallback icon

    // Format numbers compactly (e.g., 1.2k)
    const formatNumber = (num: number) => {
        return new Intl.NumberFormat("en-US", {
            notation: "compact",
            maximumFractionDigits: 1,
        }).format(num);
    };

    // Cast metadata safely
    const metadata = project.metadata as { short_description?: string; author?: string };

    return (
        <Link className="group block h-full" href={`/project/${project.slug}`}>
            <Card className="flex h-full flex-col overflow-hidden transition-all hover:border-primary/50 hover:shadow-md">
                <div className="flex flex-1 gap-4 p-4">
                    {/* Icon */}
                    <div className="flex-shrink-0">
                        <div className="relative h-16 w-16 overflow-hidden rounded-md border bg-muted">
                            <Image alt={project.name} className="object-cover" fill src={project.icon_url || defaultIcon} />
                        </div>
                    </div>

                    {/* Content */}
                    <div className="flex min-w-0 flex-1 flex-col justify-between space-y-2">
                        <div>
                            <div className="flex items-start justify-between gap-2">
                                <h3 className="line-clamp-1 font-semibold text-lg transition-colors hover:text-primary">{project.name}</h3>
                                {/* Determine badge logic later, e.g. "New", "Featured" */}
                                {Date.now() - new Date(project.created_at).getTime() < 1000 * 60 * 60 * 24 * 7 && (
                                    <Badge className="h-5 px-1.5 text-[10px] uppercase" variant="default">
                                        New
                                    </Badge>
                                )}
                            </div>
                            <div className="flex items-center gap-2 text-muted-foreground text-xs">
                                <span className="font-medium text-foreground">{metadata.author || "Unknown"}</span>
                                <span>•</span>
                                <span className="line-clamp-1">{project.type}</span>
                            </div>
                        </div>

                        <p className="line-clamp-2 text-muted-foreground text-sm">{metadata.short_description || project.description}</p>
                    </div>
                </div>

                <div className="border-t bg-muted/30 px-4 py-3 text-muted-foreground text-xs">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-1">
                                <Download className="h-3.5 w-3.5" />
                                <span>{formatNumber(downloads || 0)}</span>
                            </div>
                            <div className="flex items-center gap-1">
                                <Calendar className="h-3.5 w-3.5" />
                                <span>{new Date(updatedAt || project.updated_at).toLocaleDateString()}</span>
                            </div>
                        </div>
                        {/* Categories Placeholder - could limit to 1-2 tags */}
                        <div className="flex gap-1">
                            {/* (project.categories as string[])?.slice(0, 1).map(cat => (
                                 <Badge key={cat} variant="secondary" className="h-5 px-1.5 text-[10px] font-normal">{cat}</Badge>
                             )) */}
                        </div>
                    </div>
                </div>
            </Card>
        </Link>
    );
}
