"use client";

import { Button } from "@foundry/ui/primitives/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@foundry/ui/primitives/dialog";
import { Input } from "@foundry/ui/primitives/input";
import { Label } from "@foundry/ui/primitives/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@foundry/ui/primitives/select";
import { Textarea } from "@foundry/ui/primitives/textarea";
import { createProject, generateSlug } from "@foundry/web/app/[locale]/(site)/(projects)/browse/[game_slug]/actions";
import { Plus } from "lucide-react";
import { useState, useTransition } from "react";

interface CreateProjectDialogProps {
    gameId: string;
    gameName: string;
    categories?: Array<{ id: string; name: string }>;
}

export function CreateProjectDialog({ gameId, gameName, categories = [] }: CreateProjectDialogProps) {
    const [open, setOpen] = useState(false);
    const [isPending, startTransition] = useTransition();
    const [error, setError] = useState<string | null>(null);

    const [formData, setFormData] = useState({
        name: "",
        slug: "",
        description: "",
        type: "mod",
        categories: [] as string[],
    });

    const handleNameChange = async (name: string) => {
        setFormData((prev) => ({ ...prev, name }));

        // Auto-generate slug from name
        if (name) {
            const slug = await generateSlug(name);
            setFormData((prev) => ({ ...prev, slug }));
        }
    };

    const handleSubmit = () => {
        startTransition(async () => {
            setError(null);

            const result = await createProject({
                ...formData,
                gameId,
            });

            if (result && !result.success) {
                setError(result.error);
            } else {
                // Dialog will close and redirect will happen automatically
                setOpen(false);
                setFormData({
                    name: "",
                    slug: "",
                    description: "",
                    type: "mod",
                    categories: [],
                });
            }
        });
    };

    const toggleCategory = (categoryId: string) => {
        setFormData((prev) => ({
            ...prev,
            categories: prev.categories.includes(categoryId) ? prev.categories.filter((id) => id !== categoryId) : [...prev.categories, categoryId],
        }));
    };

    return (
        <Dialog onOpenChange={setOpen} open={open}>
            <DialogTrigger asChild>
                <Button>
                    <Plus className="mr-2 size-4" />
                    Create Project
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle>Create New Project</DialogTitle>
                    <DialogDescription>Create a new project for {gameName}. Fill in the details below to get started.</DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    {error && <div className="rounded-md bg-red-50 p-3 text-red-900 text-sm dark:bg-red-950 dark:text-red-100">{error}</div>}

                    <div className="space-y-2">
                        <Label htmlFor="name">Project Name *</Label>
                        <Input disabled={isPending} id="name" onChange={(e) => handleNameChange(e.target.value)} placeholder="My Awesome Mod" value={formData.name} />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="slug">URL Slug *</Label>
                        <Input
                            disabled={isPending}
                            id="slug"
                            onChange={(e) => setFormData((prev) => ({ ...prev, slug: e.target.value }))}
                            placeholder="my-awesome-mod"
                            value={formData.slug}
                        />
                        <p className="text-muted-foreground text-xs">This will be used in the project URL</p>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="description">Description</Label>
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
                        <Label htmlFor="type">Project Type</Label>
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

                    {categories.length > 0 && (
                        <div className="space-y-2">
                            <Label>Categories</Label>
                            <div className="flex flex-wrap gap-2">
                                {categories.map((category) => (
                                    <Button
                                        disabled={isPending}
                                        key={category.id}
                                        onClick={() => toggleCategory(category.id)}
                                        size="sm"
                                        type="button"
                                        variant={formData.categories.includes(category.id) ? "default" : "outline"}
                                    >
                                        {category.name}
                                    </Button>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                <DialogFooter>
                    <Button disabled={isPending} onClick={() => setOpen(false)} variant="outline">
                        Cancel
                    </Button>
                    <Button disabled={isPending || !formData.name || !formData.slug} onClick={handleSubmit}>
                        {isPending ? "Creating..." : "Create Project"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
