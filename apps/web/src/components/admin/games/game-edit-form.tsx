"use client";

import type { Game } from "@foundry/database";
import { Button } from "@foundry/ui/primitives/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@foundry/ui/primitives/card";
import { Input } from "@foundry/ui/primitives/input";
import { Label } from "@foundry/ui/primitives/label";
import { Textarea } from "@foundry/ui/primitives/textarea";
import { uploadGameAssets } from "@foundry/web/actions/game-assets";
import { updateGame, updateGameImages } from "@foundry/web/actions/games";
import { TagsInput } from "@foundry/web/components/ui/tags-input";
import { useRouter } from "@foundry/web/i18n/navigation";
import { gameFormSchema } from "@foundry/web/lib/schemas/games";
import { useForm } from "@tanstack/react-form";
import { ImageIcon, Loader2 } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { toast } from "sonner";

interface GameEditFormProps {
    game: Game;
    /**
     * Optional callback used when the form is embedded inline (prevents automatic navigation).
     * Called after a successful update so the parent can refresh state/UI.
     */
    onSuccess?: () => void;
    /** Optional cancel handler when used inline. */
    onCancel?: () => void;
}

export function GameEditForm({ game, onSuccess, onCancel }: GameEditFormProps) {
    const router = useRouter();
    const [uploading, setUploading] = useState(false);

    const images = game.images as { icon: string; cover: string; background: string };
    const capabilities = game.capabilities as { versions: string[]; modloaders: string[] };

    const form = useForm({
        defaultValues: {
            name: game.name,
            slug: game.slug,
            description: game.description,
            images: {
                cover: images.cover || "",
                icon: images.icon || "",
                background: images.background || "",
            },
            capabilities: {
                versions: capabilities.versions.join(", "),
                modloaders: capabilities.modloaders.join(", "),
            },
        },
        onSubmit: async ({ value }) => {
            const result = await updateGame(game.id, value);
            if (result?.error) {
                toast.error(typeof result.error === "string" ? result.error : "Validation failed");
            } else {
                toast.success("Game updated successfully");
                // If caller provided an onSuccess handler (inline mode), call it instead of navigating.
                if (typeof onSuccess === "function") {
                    onSuccess();
                } else {
                    router.push(`/management/games/${game.id}`);
                }
            }
        },
    });

    const handleImageUpload = async (type: "icon" | "cover" | "background", file: File) => {
        setUploading(true);
        const formData = new FormData();
        formData.append(type, file);

        try {
            const results = await uploadGameAssets(formData, game.id);
            if (results[type]) {
                const currentImages = form.getFieldValue("images");
                form.setFieldValue("images", { ...currentImages, [type]: results[type] });
                await updateGameImages(game.id, results);
                toast.success(`${type} uploaded successfully`);
            }
        } catch (error) {
            console.error(error);
            toast.error(`Failed to upload ${type}`);
        } finally {
            setUploading(false);
        }
    };

    return (
        <form
            className="space-y-6"
            onSubmit={(e) => {
                e.preventDefault();
                e.stopPropagation();
                form.handleSubmit();
            }}
        >
            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                <div className="space-y-6 md:col-span-2">
                    <Card>
                        <CardHeader>
                            <CardTitle>Game Information</CardTitle>
                            <CardDescription>Basic details about the game entry.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <form.Field
                                name="name"
                                validators={{
                                    onChange: ({ value }) => {
                                        const res = gameFormSchema.shape.name.safeParse(value);
                                        return res.success ? undefined : res.error.issues[0]?.message;
                                    },
                                }}
                            >
                                {(field) => (
                                    <div className="space-y-2">
                                        <Label htmlFor="name">Name</Label>
                                        <Input id="name" name="name" onBlur={field.handleBlur} onChange={(e) => field.handleChange(e.target.value)} value={field.state.value} />
                                        {field.state.meta.errors ? <p className="text-destructive text-sm">{field.state.meta.errors.join(", ")}</p> : null}
                                    </div>
                                )}
                            </form.Field>

                            <form.Field
                                name="slug"
                                validators={{
                                    onChange: ({ value }) => {
                                        const res = gameFormSchema.shape.slug.safeParse(value);
                                        return res.success ? undefined : res.error.issues[0]?.message;
                                    },
                                }}
                            >
                                {(field) => (
                                    <div className="space-y-2">
                                        <Label htmlFor="slug">Slug</Label>
                                        <Input id="slug" name="slug" onBlur={field.handleBlur} onChange={(e) => field.handleChange(e.target.value)} value={field.state.value} />
                                        <p className="text-muted-foreground text-xs">Used in URLs: /browse/{field.state.value || "..."}</p>
                                        {field.state.meta.errors ? <p className="text-destructive text-sm">{field.state.meta.errors.join(", ")}</p> : null}
                                    </div>
                                )}
                            </form.Field>

                            <form.Field
                                name="description"
                                validators={{
                                    onChange: ({ value }) => {
                                        const res = gameFormSchema.shape.description.safeParse(value);
                                        return res.success ? undefined : res.error.issues[0]?.message;
                                    },
                                }}
                            >
                                {(field) => (
                                    <div className="space-y-2">
                                        <Label htmlFor="description">Description</Label>
                                        <Textarea
                                            className="min-h-[120px]"
                                            id="description"
                                            name="description"
                                            onBlur={field.handleBlur}
                                            onChange={(e) => field.handleChange(e.target.value)}
                                            value={field.state.value}
                                        />
                                        {field.state.meta.errors ? <p className="text-destructive text-sm">{field.state.meta.errors.join(", ")}</p> : null}
                                    </div>
                                )}
                            </form.Field>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Capabilities & Filtering</CardTitle>
                            <CardDescription>Define how users can filter projects for this game.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <form.Field
                                name="capabilities.versions"
                                validators={{
                                    onChange: ({ value }) => {
                                        const res = gameFormSchema.shape.capabilities.shape.versions.safeParse(value);
                                        return res.success ? undefined : res.error.issues[0]?.message;
                                    },
                                }}
                            >
                                {(field) => (
                                    <div className="space-y-2">
                                        <Label htmlFor="versions">Game Versions</Label>
                                        <TagsInput
                                            onChange={(val) => field.handleChange(val)}
                                            placeholder="Type version and press Enter... (e.g. 1.20.1)"
                                            value={field.state.value}
                                        />
                                        <p className="text-muted-foreground text-xs">List all major versions supported.</p>
                                        {field.state.meta.errors ? <p className="text-destructive text-sm">{field.state.meta.errors.join(", ")}</p> : null}
                                    </div>
                                )}
                            </form.Field>

                            <form.Field
                                name="capabilities.modloaders"
                                validators={{
                                    onChange: ({ value }) => {
                                        const res = gameFormSchema.shape.capabilities.shape.modloaders.safeParse(value);
                                        return res.success ? undefined : res.error.issues[0]?.message;
                                    },
                                }}
                            >
                                {(field) => (
                                    <div className="space-y-2">
                                        <Label htmlFor="modloaders">Mod Loaders</Label>
                                        <TagsInput onChange={(val) => field.handleChange(val)} placeholder="Type name and press Enter... (e.g. Fabric)" value={field.state.value} />
                                        <p className="text-muted-foreground text-xs">List supported loaders or project types.</p>
                                        {field.state.meta.errors ? <p className="text-destructive text-sm">{field.state.meta.errors.join(", ")}</p> : null}
                                    </div>
                                )}
                            </form.Field>
                        </CardContent>
                    </Card>
                </div>

                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Assets</CardTitle>
                            <CardDescription>Visual identity for the store.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {/* Icon Preview & Input */}
                            <form.Field
                                name="images.icon"
                                validators={{
                                    onChange: ({ value }) => {
                                        const res = gameFormSchema.shape.images.shape.icon.safeParse(value);
                                        return res.success ? undefined : res.error.issues[0]?.message;
                                    },
                                }}
                            >
                                {(field) => (
                                    <div className="space-y-3">
                                        <Label htmlFor="icon">Icon</Label>
                                        <div className="flex items-center gap-4">
                                            <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-lg border bg-muted">
                                                {field.state.value ? (
                                                    <Image alt="Icon preview" className="h-full w-full object-cover" height={64} src={field.state.value} unoptimized width={64} />
                                                ) : (
                                                    <ImageIcon className="h-8 w-8 text-muted-foreground opacity-50" />
                                                )}
                                            </div>
                                            <div className="flex-1 space-y-2">
                                                <Input
                                                    disabled={uploading}
                                                    id="icon"
                                                    name="icon"
                                                    onBlur={field.handleBlur}
                                                    onChange={(e) => field.handleChange(e.target.value)}
                                                    placeholder="https://..."
                                                    value={field.state.value}
                                                />
                                                <Input
                                                    accept="image/*"
                                                    disabled={uploading}
                                                    onChange={(e) => {
                                                        const file = e.target.files?.[0];
                                                        if (file) {
                                                            handleImageUpload("icon", file);
                                                        }
                                                    }}
                                                    type="file"
                                                />
                                            </div>
                                        </div>
                                        {field.state.meta.errors ? <p className="text-destructive text-sm">{field.state.meta.errors.join(", ")}</p> : null}
                                    </div>
                                )}
                            </form.Field>

                            {/* Cover Preview & Input */}
                            <form.Field
                                name="images.cover"
                                validators={{
                                    onChange: ({ value }) => {
                                        const res = gameFormSchema.shape.images.shape.cover.safeParse(value);
                                        return res.success ? undefined : res.error.issues[0]?.message;
                                    },
                                }}
                            >
                                {(field) => (
                                    <div className="space-y-3">
                                        <Label htmlFor="cover">Cover Art (Square)</Label>
                                        <div className="relative flex aspect-square w-full items-center justify-center overflow-hidden rounded-lg border bg-muted">
                                            {field.state.value ? (
                                                <Image alt="Cover preview" className="h-full w-full object-cover" fill src={field.state.value} unoptimized />
                                            ) : (
                                                <div className="flex flex-col items-center gap-2 text-muted-foreground opacity-50">
                                                    <ImageIcon className="h-12 w-12" />
                                                    <span className="text-xs">Box Art</span>
                                                </div>
                                            )}
                                        </div>
                                        <Input
                                            disabled={uploading}
                                            id="cover"
                                            name="cover"
                                            onBlur={field.handleBlur}
                                            onChange={(e) => field.handleChange(e.target.value)}
                                            placeholder="https://..."
                                            value={field.state.value}
                                        />
                                        <Input
                                            accept="image/*"
                                            disabled={uploading}
                                            onChange={(e) => {
                                                const file = e.target.files?.[0];
                                                if (file) {
                                                    handleImageUpload("cover", file);
                                                }
                                            }}
                                            type="file"
                                        />
                                        {field.state.meta.errors ? <p className="text-destructive text-sm">{field.state.meta.errors.join(", ")}</p> : null}
                                    </div>
                                )}
                            </form.Field>

                            {/* Background Preview & Input */}
                            <form.Field
                                name="images.background"
                                validators={{
                                    onChange: ({ value }) => {
                                        const res = gameFormSchema.shape.images.shape.background.safeParse(value);
                                        return res.success ? undefined : res.error.issues[0]?.message;
                                    },
                                }}
                            >
                                {(field) => (
                                    <div className="space-y-3">
                                        <Label htmlFor="background">Header Background (Wide)</Label>
                                        <div className="relative flex aspect-video w-full items-center justify-center overflow-hidden rounded-lg border bg-muted">
                                            {field.state.value ? (
                                                <Image alt="Background preview" className="h-full w-full object-cover" fill src={field.state.value} unoptimized />
                                            ) : (
                                                <div className="flex flex-col items-center gap-2 text-muted-foreground opacity-50">
                                                    <ImageIcon className="h-12 w-12" />
                                                    <span className="text-xs">Banner</span>
                                                </div>
                                            )}
                                        </div>
                                        <Input
                                            disabled={uploading}
                                            id="background"
                                            name="background"
                                            onBlur={field.handleBlur}
                                            onChange={(e) => field.handleChange(e.target.value)}
                                            placeholder="https://..."
                                            value={field.state.value}
                                        />
                                        <Input
                                            accept="image/*"
                                            disabled={uploading}
                                            onChange={(e) => {
                                                const file = e.target.files?.[0];
                                                if (file) {
                                                    handleImageUpload("background", file);
                                                }
                                            }}
                                            type="file"
                                        />
                                        {field.state.meta.errors ? <p className="text-destructive text-sm">{field.state.meta.errors.join(", ")}</p> : null}
                                    </div>
                                )}
                            </form.Field>
                        </CardContent>
                    </Card>
                </div>
            </div>

            <div className="flex items-center justify-end gap-4 border-t pt-6">
                <Button
                    onClick={() => {
                        if (typeof onCancel === "function") {
                            return onCancel();
                        }
                        return router.back();
                    }}
                    type="button"
                    variant="ghost"
                >
                    Cancel
                </Button>
                <form.Subscribe selector={(state) => [state.canSubmit, state.isSubmitting]}>
                    {([canSubmit, isSubmitting]) => (
                        <Button disabled={!canSubmit || isSubmitting || uploading} type="submit">
                            {isSubmitting || uploading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                            Update Game
                        </Button>
                    )}
                </form.Subscribe>
            </div>
        </form>
    );
}
