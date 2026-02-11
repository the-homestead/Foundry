"use client";

import type { GameSelect, ProjectSelect } from "@foundry/database/projects/queries";
import { Button } from "@foundry/ui/primitives/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@foundry/ui/primitives/card";
import { Input } from "@foundry/ui/primitives/input";
import { Label } from "@foundry/ui/primitives/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@foundry/ui/primitives/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@foundry/ui/primitives/tabs";
import { Textarea } from "@foundry/ui/primitives/textarea";
import { Image as ImageIcon, Save, Upload } from "lucide-react";
import Image from "next/image";
import { useState, useTransition } from "react";
import { updateProject } from "./actions";

interface ProjectEditFormProps {
    project: ProjectSelect;
    game: GameSelect | null;
}

export function ProjectEditForm({ project, game }: ProjectEditFormProps) {
    const [isPending, startTransition] = useTransition();
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    const [formData, setFormData] = useState({
        name: project.name,
        slug: project.slug,
        description: project.description,
        body: project.body || "",
        version: project.version,
        type: project.type,
        license: project.license || "",
        icon_url: project.icon_url || "",
        banner_url: project.banner_url || "",
        color: project.color || "#000000",
        categories: (project.categories as string[]) || [],
        links: (project.links as Record<string, string>) || {},
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setSuccess(false);

        startTransition(async () => {
            const result = await updateProject(project.id, formData);

            if (result && !result.success) {
                setError(result.error || "An error occurred");
            } else {
                setSuccess(true);
                setTimeout(() => setSuccess(false), 3000);
            }
        });
    };

    return (
        <form onSubmit={handleSubmit}>
            <Tabs className="space-y-4" defaultValue="basic">
                <TabsList>
                    <TabsTrigger value="basic">Basic Info</TabsTrigger>
                    <TabsTrigger value="media">Media</TabsTrigger>
                    <TabsTrigger value="description">Description</TabsTrigger>
                    <TabsTrigger value="links">Links</TabsTrigger>
                    <TabsTrigger value="advanced">Advanced</TabsTrigger>
                </TabsList>

                {/* Basic Info Tab */}
                <TabsContent value="basic">
                    <Card>
                        <CardHeader>
                            <CardTitle>Basic Information</CardTitle>
                            <CardDescription>Update your project's name, version, and basic details.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {error && <div className="rounded-md bg-red-50 p-3 text-red-900 text-sm dark:bg-red-950 dark:text-red-100">{error}</div>}
                            {success && (
                                <div className="rounded-md bg-green-50 p-3 text-green-900 text-sm dark:bg-green-950 dark:text-green-100">Project updated successfully!</div>
                            )}

                            <div className="space-y-2">
                                <Label htmlFor="name">Project Name *</Label>
                                <Input disabled={isPending} id="name" onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))} required value={formData.name} />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="slug">URL Slug *</Label>
                                <Input disabled={isPending} id="slug" onChange={(e) => setFormData((prev) => ({ ...prev, slug: e.target.value }))} required value={formData.slug} />
                                <p className="text-muted-foreground text-xs">Changing the slug will change your project's URL</p>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="version">Version *</Label>
                                <Input
                                    disabled={isPending}
                                    id="version"
                                    onChange={(e) => setFormData((prev) => ({ ...prev, version: e.target.value }))}
                                    placeholder="1.0.0"
                                    required
                                    value={formData.version}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="game">Game</Label>
                                <Input disabled id="game" value={game?.name || "Unknown"} />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="type">Project Type *</Label>
                                <Select disabled={isPending} onValueChange={(value) => setFormData((prev) => ({ ...prev, type: value }))} value={formData.type}>
                                    <SelectTrigger id="type">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="mod">Mod</SelectItem>
                                        <SelectItem value="plugin">Plugin</SelectItem>
                                        <SelectItem value="resource-pack">Resource Pack</SelectItem>
                                        <SelectItem value="shader">Shader</SelectItem>
                                        <SelectItem value="modpack">Modpack</SelectItem>
                                        <SelectItem value="data-pack">Data Pack</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="description">Short Description</Label>
                                <Textarea
                                    disabled={isPending}
                                    id="description"
                                    onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                                    placeholder="A brief description of your project..."
                                    rows={3}
                                    value={formData.description}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="license">License</Label>
                                <Input
                                    disabled={isPending}
                                    id="license"
                                    onChange={(e) => setFormData((prev) => ({ ...prev, license: e.target.value }))}
                                    placeholder="MIT, GPL-3.0, etc."
                                    value={formData.license}
                                />
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Media Tab */}
                <TabsContent value="media">
                    <Card>
                        <CardHeader>
                            <CardTitle>Project Media</CardTitle>
                            <CardDescription>Upload an icon, banner, and choose your project's color theme.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {/* Icon Upload */}
                            <div className="space-y-2">
                                <Label>Project Icon</Label>
                                <div className="flex items-center gap-4">
                                    {formData.icon_url ? (
                                        <div className="relative size-24 overflow-hidden rounded-lg border">
                                            <Image alt="Project icon" className="object-cover" fill src={formData.icon_url} />
                                        </div>
                                    ) : (
                                        <div className="flex size-24 items-center justify-center rounded-lg border bg-muted">
                                            <ImageIcon className="size-8 text-muted-foreground" />
                                        </div>
                                    )}
                                    <div className="flex-1 space-y-2">
                                        <Input
                                            disabled={isPending}
                                            onChange={(e) => setFormData((prev) => ({ ...prev, icon_url: e.target.value }))}
                                            placeholder="Icon URL"
                                            value={formData.icon_url}
                                        />
                                        <Button disabled size="sm" type="button" variant="outline">
                                            <Upload className="mr-2 size-4" />
                                            Upload Icon (Coming Soon)
                                        </Button>
                                    </div>
                                </div>
                                <p className="text-muted-foreground text-xs">Recommended: 256x256px PNG or JPG</p>
                            </div>

                            {/* Banner Upload */}
                            <div className="space-y-2">
                                <Label>Project Banner</Label>
                                {formData.banner_url ? (
                                    <div className="relative aspect-[21/9] w-full overflow-hidden rounded-lg border">
                                        <Image alt="Project banner" className="object-cover" fill src={formData.banner_url} />
                                    </div>
                                ) : (
                                    <div className="flex aspect-[21/9] w-full items-center justify-center rounded-lg border bg-muted">
                                        <ImageIcon className="size-12 text-muted-foreground" />
                                    </div>
                                )}
                                <Input
                                    disabled={isPending}
                                    onChange={(e) => setFormData((prev) => ({ ...prev, banner_url: e.target.value }))}
                                    placeholder="Banner URL"
                                    value={formData.banner_url}
                                />
                                <Button disabled size="sm" type="button" variant="outline">
                                    <Upload className="mr-2 size-4" />
                                    Upload Banner (Coming Soon)
                                </Button>
                                <p className="text-muted-foreground text-xs">Recommended: 1920x823px PNG or JPG</p>
                            </div>

                            {/* Color Picker */}
                            <div className="space-y-2">
                                <Label htmlFor="color">Theme Color</Label>
                                <div className="flex items-center gap-4">
                                    <Input
                                        className="h-12 w-24"
                                        disabled={isPending}
                                        id="color"
                                        onChange={(e) => setFormData((prev) => ({ ...prev, color: e.target.value }))}
                                        type="color"
                                        value={formData.color}
                                    />
                                    <Input
                                        disabled={isPending}
                                        onChange={(e) => setFormData((prev) => ({ ...prev, color: e.target.value }))}
                                        placeholder="#000000"
                                        value={formData.color}
                                    />
                                </div>
                                <p className="text-muted-foreground text-xs">This color will be used as an accent throughout your project page</p>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Description Tab */}
                <TabsContent value="description">
                    <Card>
                        <CardHeader>
                            <CardTitle>Full Description</CardTitle>
                            <CardDescription>Write a detailed description of your project using Markdown.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Textarea
                                className="font-mono text-sm"
                                disabled={isPending}
                                onChange={(e) => setFormData((prev) => ({ ...prev, body: e.target.value }))}
                                placeholder="# My Awesome Project&#10;&#10;Describe your project in detail..."
                                rows={20}
                                value={formData.body}
                            />
                            <p className="mt-2 text-muted-foreground text-xs">Supports Markdown formatting</p>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Links Tab */}
                <TabsContent value="links">
                    <Card>
                        <CardHeader>
                            <CardTitle>External Links</CardTitle>
                            <CardDescription>Add links to your project's homepage, source code, documentation, etc.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {["homepage", "source", "documentation", "issues", "discord", "donation"].map((linkType) => (
                                <div className="space-y-2" key={linkType}>
                                    <Label className="capitalize" htmlFor={linkType}>
                                        {linkType}
                                    </Label>
                                    <Input
                                        disabled={isPending}
                                        id={linkType}
                                        onChange={(e) =>
                                            setFormData((prev) => ({
                                                ...prev,
                                                links: { ...prev.links, [linkType]: e.target.value },
                                            }))
                                        }
                                        placeholder="https://..."
                                        type="url"
                                        value={formData.links[linkType] || ""}
                                    />
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Advanced Tab */}
                <TabsContent value="advanced">
                    <Card>
                        <CardHeader>
                            <CardTitle>Advanced Settings</CardTitle>
                            <CardDescription>Advanced project configuration and metadata.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="rounded-md border border-yellow-500 bg-yellow-50 p-4 dark:bg-yellow-950/20">
                                <h4 className="mb-2 font-semibold text-yellow-900 dark:text-yellow-100">Project Status: Unapproved</h4>
                                <p className="text-sm text-yellow-800 dark:text-yellow-200">
                                    Your project is currently unapproved and not publicly visible. Complete all required information and submit your project for moderation
                                    approval.
                                </p>
                            </div>

                            <div className="space-y-2">
                                <Label>Categories</Label>
                                <p className="text-muted-foreground text-sm">Selected: {formData.categories.length > 0 ? formData.categories.join(", ") : "None"}</p>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>

            {/* Save Button */}
            <div className="mt-6 flex justify-end gap-4">
                <Button disabled={isPending} type="button" variant="outline">
                    Cancel
                </Button>
                <Button disabled={isPending} type="submit">
                    <Save className="mr-2 size-4" />
                    {isPending ? "Saving..." : "Save Changes"}
                </Button>
            </div>
        </form>
    );
}
