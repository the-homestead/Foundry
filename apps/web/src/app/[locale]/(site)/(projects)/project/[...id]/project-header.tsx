"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@foundry/ui/primitives/avatar";
import { Button } from "@foundry/ui/primitives/button";
import { Input } from "@foundry/ui/primitives/input";
import { Stat } from "@foundry/ui/primitives/stat";
import { Textarea } from "@foundry/ui/primitives/textarea";
import { Edit2, Save, X } from "lucide-react";
import { useState } from "react";
import { updateProjectDescription, updateProjectTitle } from "./actions";
import { ProjectLikes } from "./project-likes";

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
        projectSlug?: string;
        isOwner?: boolean;
    };
}

export function ProjectHeader({ project }: ProjectHeaderProps) {
    const [editingTitle, setEditingTitle] = useState(false);
    const [editingDescription, setEditingDescription] = useState(false);
    const [titleValue, setTitleValue] = useState(project.title);
    const [descriptionValue, setDescriptionValue] = useState(project.summary);
    const [saving, setSaving] = useState(false);

    const initials = project.game
        .split(" ")
        .filter(Boolean)
        .map((s) => s[0])
        .slice(0, 2)
        .join("")
        .toUpperCase();

    const handleTitleSave = async () => {
        if (!project.projectSlug || saving) {
            return;
        }

        setSaving(true);
        const result = await updateProjectTitle(project.projectSlug, titleValue);

        if (result.success) {
            setEditingTitle(false);
        } else {
            // Show error
            console.error(result.error);
            // Reset to original value
            setTitleValue(project.title);
        }

        setSaving(false);
    };

    const handleDescriptionSave = async () => {
        if (!project.projectSlug || saving) {
            return;
        }

        setSaving(true);
        const result = await updateProjectDescription(project.projectSlug, descriptionValue);

        if (result.success) {
            setEditingDescription(false);
        } else {
            // Show error
            console.error(result.error);
            // Reset to original value
            setDescriptionValue(project.summary);
        }

        setSaving(false);
    };

    const handleTitleCancel = () => {
        setTitleValue(project.title);
        setEditingTitle(false);
    };

    const handleDescriptionCancel = () => {
        setDescriptionValue(project.summary);
        setEditingDescription(false);
    };

    return (
        <section aria-labelledby="project-title" className="rounded-xl border bg-card p-6 shadow-sm" suppressHydrationWarning>
            <div className="flex flex-col gap-6">
                <div className="flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-center">
                    <div className="flex w-full items-start gap-4">
                        <Avatar>{project.gameImageUrl ? <AvatarImage alt={project.game} src={project.gameImageUrl} /> : <AvatarFallback>{initials}</AvatarFallback>}</Avatar>
                        <div className="flex-1">
                            {/* Title - Editable for owners */}
                            {editingTitle ? (
                                <div className="flex items-center gap-2">
                                    <Input className="font-extrabold text-3xl leading-tight tracking-tight" onChange={(e) => setTitleValue(e.target.value)} value={titleValue} />
                                    <Button disabled={saving} onClick={handleTitleSave} size="sm" variant="default">
                                        <Save className="h-4 w-4" />
                                    </Button>
                                    <Button disabled={saving} onClick={handleTitleCancel} size="sm" variant="outline">
                                        <X className="h-4 w-4" />
                                    </Button>
                                </div>
                            ) : (
                                <div className="flex items-center gap-2">
                                    {project.isOwner ? (
                                        <button className="cursor-pointer text-left" onClick={() => setEditingTitle(true)} type="button">
                                            <h1 className="cursor-text font-extrabold text-3xl leading-tight tracking-tight" id="project-title">
                                                {project.title}
                                            </h1>
                                        </button>
                                    ) : (
                                        <h1 className="font-extrabold text-3xl leading-tight tracking-tight" id="project-title">
                                            {project.title}
                                        </h1>
                                    )}
                                    {project.isOwner && (
                                        <Button aria-label="Edit project title" onClick={() => setEditingTitle(true)} size="sm" variant="ghost">
                                            <Edit2 className="h-4 w-4" />
                                        </Button>
                                    )}
                                </div>
                            )}

                            {/* Description - Editable for owners */}
                            {editingDescription ? (
                                <div className="mt-2 flex items-start gap-2">
                                    <Textarea className="text-muted-foreground text-sm" onChange={(e) => setDescriptionValue(e.target.value)} rows={3} value={descriptionValue} />
                                    <div className="flex flex-col gap-2">
                                        <Button aria-label="Save description" disabled={saving} onClick={handleDescriptionSave} size="sm" variant="default">
                                            <Save className="h-4 w-4" />
                                        </Button>
                                        <Button aria-label="Cancel editing" disabled={saving} onClick={handleDescriptionCancel} size="sm" variant="outline">
                                            <X className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            ) : (
                                <div className="mt-2 flex items-start gap-2">
                                    {project.isOwner ? (
                                        <button className="flex-1 cursor-pointer text-left" onClick={() => setEditingDescription(true)} type="button">
                                            <p className="cursor-text text-muted-foreground text-sm">{project.summary}</p>
                                        </button>
                                    ) : (
                                        <p className="text-muted-foreground text-sm">{project.summary}</p>
                                    )}
                                    {project.isOwner && (
                                        <Button aria-label="Edit project description" onClick={() => setEditingDescription(true)} size="sm" variant="ghost">
                                            <Edit2 className="h-3 w-3" />
                                        </Button>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="hidden sm:flex sm:flex-shrink-0 sm:flex-col sm:items-end sm:gap-2">
                        <div className="text-muted-foreground text-xs">Updated: {project.updated}</div>
                        {project.projectSlug && <ProjectLikes projectSlug={project.projectSlug} />}
                    </div>
                </div>

                <div className="flex w-full flex-wrap content-center justify-center gap-3 text-sm">
                    <Stat label="Game" value={project.game} />
                    <Stat label="Version" value={project.version} />
                    <Stat animateNumber label="Downloads" value={project.downloads} />
                    <Stat animateNumber label="Views" value={project.views} />
                </div>

                {/* On small screens, show the updated timestamp and likes under the stats */}
                <div className="mt-2 flex flex-col items-center gap-2 text-center text-muted-foreground text-xs sm:hidden">
                    <div>Updated: {project.updated}</div>
                    {project.projectSlug && <ProjectLikes projectSlug={project.projectSlug} />}
                </div>
            </div>
        </section>
    );
}
