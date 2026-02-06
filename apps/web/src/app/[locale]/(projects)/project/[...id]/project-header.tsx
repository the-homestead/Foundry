"use client";

import { Rating } from "@foundry/ui/components";
import { useMemo, useState } from "react";
/* eslint-disable tailwindcss/classnames-order */

import { Avatar, AvatarFallback, AvatarImage } from "@foundry/ui/primitives/avatar";
import { Stat } from "@foundry/ui/primitives/stat";

export interface ProjectHeaderProps {
    project: {
        title: string;
        game: string;
        summary: string;
        version: string;
        updated: string;
        downloads: string;
        views: string;
        rating: string;
        gameImageUrl?: string | null;
    };
    gameImageUrl?: string | null;
}
export function ProjectHeader({ project }: ProjectHeaderProps) {
    const initials = project.game
        .split(" ")
        .filter(Boolean)
        .map((s) => s[0])
        .slice(0, 2)
        .join("")
        .toUpperCase();

    const parsedRating = useMemo(() => Number.parseFloat(project.rating), [project.rating]);
    const initialRating = Number.isFinite(parsedRating) ? parsedRating : 0;
    const [tempRating, setTempRating] = useState(initialRating);

    return (
        <section aria-labelledby="project-title" className="rounded-xl border bg-card p-6 shadow-sm" suppressHydrationWarning>
            <div className="flex flex-col gap-6">
                <div className="flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-center">
                    <div className="flex items-start gap-4">
                        <Avatar>
                            {project.gameImageUrl ? (
                                // eslint-disable-next-line jsx-a11y/alt-text
                                <AvatarImage src={project.gameImageUrl} />
                            ) : (
                                <AvatarFallback>{initials}</AvatarFallback>
                            )}
                        </Avatar>
                        <div>
                            <div className="flex items-center gap-3">
                                {/* eslint-disable-next-line */}
                                <h1 className="font-extrabold text-3xl leading-tight tracking-tight" id="project-title">
                                    {project.title}
                                </h1>
                            </div>
                            {/* eslint-disable-next-line */}
                            <p className="mt-2 text-muted-foreground text-sm">{project.summary}</p>
                        </div>
                    </div>

                    <div className="hidden sm:flex sm:flex-shrink-0 sm:items-center">
                        <div className="text-muted-foreground text-xs">Updated: {project.updated}</div>
                    </div>
                </div>

                <div className="flex w-full flex-wrap content-center justify-center gap-3 text-sm">
                    <Stat label="Game" value={project.game} />
                    <Stat label="Version" value={project.version} />
                    <Stat animateNumber label="Downloads" value={project.downloads} />
                    <Stat animateNumber label="Views" value={project.views} />
                    <Rating defaultValue={initialRating} label="Rating" onChange={setTempRating} readOnly={false} value={tempRating} />
                </div>
                {/* On small screens, show the updated timestamp under the stats */}
                <div className="mt-2 text-center text-muted-foreground text-xs sm:hidden">Updated: {project.updated}</div>
            </div>
        </section>
    );
}
