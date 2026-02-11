"use client";

import type { Category } from "@foundry/database";
import { getIconList } from "@foundry/ui/icons";
import { Button } from "@foundry/ui/primitives/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@foundry/ui/primitives/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@foundry/ui/primitives/dialog";
import { Input } from "@foundry/ui/primitives/input";
import { Label } from "@foundry/ui/primitives/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@foundry/ui/primitives/select";
import { Textarea } from "@foundry/ui/primitives/textarea";
import { createCategory, updateCategory } from "@foundry/web/actions/categories";
import { IconSelector } from "@foundry/web/components/ui/icon-selector";
import { useRouter } from "@foundry/web/i18n/navigation";
import { icons, Loader2, Plus } from "lucide-react";
import type { ComponentType, ReactNode } from "react";
import { useMemo, useState } from "react";
import { toast } from "sonner";

interface CategoryFormProps {
    gameId: string;
    gameName: string;
    category?: Category;
    parentId?: string;
    allCategories?: Category[];
    onSuccess?: () => void;
    showCard?: boolean;
    onCancel?: () => void;
}

interface CategoryFormDialogProps extends CategoryFormProps {
    trigger?: ReactNode;
}

// Helper component to render icon preview
function IconPreview({ iconName }: { iconName?: string }) {
    const animatedIcons = useMemo(() => getIconList(), []);

    if (!iconName) {
        return null;
    }

    // Try Lucide icons first
    const lucideIcon = icons[iconName as keyof typeof icons] as
        | ComponentType<{
              size?: number;
              className?: string;
          }>
        | undefined;

    if (lucideIcon) {
        const LucideIcon = lucideIcon;
        return (
            <div className="flex h-16 w-16 items-center justify-center rounded-lg border bg-muted">
                <LucideIcon className="h-8 w-8 text-muted-foreground" />
            </div>
        );
    }

    // Try animated icons
    const animatedIcon = animatedIcons.find((icon) => icon.name === iconName);
    if (animatedIcon) {
        const AnimatedIcon = animatedIcon.icon as ComponentType<{
            className?: string;
        }>;
        return (
            <div className="flex h-16 w-16 items-center justify-center rounded-lg border bg-muted">
                <AnimatedIcon className="h-8 w-8 text-muted-foreground" />
            </div>
        );
    }

    return null;
}

export function CategoryForm({ gameId, gameName, category, parentId, allCategories = [], onSuccess, showCard = true, onCancel }: CategoryFormProps) {
    const router = useRouter();
    const [submitting, setSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        name: category?.name || "",
        slug: category?.slug || "",
        description: category?.description || "",
        icon: category?.icon || "",
        parentId: parentId || category?.parent_id || "",
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);

        const data = {
            gameId,
            name: formData.name,
            slug: formData.slug,
            description: formData.description || undefined,
            icon: formData.icon || undefined,
            parentId: formData.parentId || null,
        };

        const result = category ? await updateCategory({ ...data, id: category.id }) : await createCategory(data);

        if (result.error) {
            toast.error(result.error);
            setSubmitting(false);
        } else {
            toast.success(category ? "Category updated successfully" : "Category created successfully");
            if (onSuccess) {
                onSuccess();
            } else {
                router.push(`/adash/games/${gameId}`);
            }
        }
    };

    const handleCancel = () => {
        if (onCancel) {
            onCancel();
        } else {
            router.back();
        }
    };

    const handleNameChange = (value: string) => {
        setFormData((prev) => ({ ...prev, name: value }));
        // Auto-generate slug if creating new category and slug is empty
        if (category || formData.slug) {
            return;
        }
        const slug = value
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/^-|-$/g, "");
        setFormData((prev) => ({ ...prev, slug }));
    };

    // Filter out current category and its descendants from parent options
    const availableParents = allCategories.filter((cat) => {
        if (category && cat.id === category.id) {
            return false;
        }
        // TODO: Also filter out descendants
        return true;
    });

    const getTitle = () => {
        if (category) {
            return "Edit Category";
        }
        if (parentId) {
            return "Create Subcategory";
        }
        return "Create Category";
    };

    const formContent = (
        <>
            <div className="space-y-2">
                <Label htmlFor="name">Name *</Label>
                <Input id="name" onChange={(e) => handleNameChange(e.target.value)} placeholder="e.g., Technology, Magic, Adventure" required value={formData.name} />
            </div>

            <div className="space-y-2">
                <Label htmlFor="slug">Slug *</Label>
                <Input
                    id="slug"
                    onChange={(e) => setFormData((prev) => ({ ...prev, slug: e.target.value }))}
                    placeholder="e.g., technology, magic, adventure"
                    required
                    value={formData.slug}
                />
                <p className="text-muted-foreground text-xs">Used in URLs and must be unique within this game.</p>
            </div>

            <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                    id="description"
                    onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                    placeholder="Describe what this category is for..."
                    rows={3}
                    value={formData.description}
                />
            </div>

            <div className="space-y-2">
                <Label htmlFor="icon">Icon</Label>
                <div className="flex items-center gap-4">
                    <IconPreview iconName={formData.icon} />
                    <div className="flex-1">
                        <IconSelector onValueChange={(value) => setFormData((prev) => ({ ...prev, icon: value }))} placeholder="Select an icon..." value={formData.icon} />
                    </div>
                </div>
                <p className="text-muted-foreground text-xs">Choose from Lucide or animated HeroIcons.</p>
            </div>

            {!parentId && availableParents.length > 0 ? (
                <div className="space-y-2">
                    <Label htmlFor="parentId">Parent Category (Optional)</Label>
                    <Select onValueChange={(value) => setFormData((prev) => ({ ...prev, parentId: value === "none" ? "" : value }))} value={formData.parentId || "none"}>
                        <SelectTrigger>
                            <SelectValue placeholder="None - Top level category" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="none">None - Top level category</SelectItem>
                            {availableParents.map((cat) => (
                                <SelectItem key={cat.id} value={cat.id}>
                                    {cat.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            ) : null}

            <div className="flex items-center justify-end gap-4 border-t pt-4">
                <Button onClick={handleCancel} type="button" variant="ghost">
                    Cancel
                </Button>
                <Button disabled={submitting} type="submit">
                    {submitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                    {category ? "Update" : "Create"} Category
                </Button>
            </div>
        </>
    );

    return (
        <form onSubmit={handleSubmit}>
            {showCard ? (
                <Card>
                    <CardHeader>
                        <CardTitle>{getTitle()}</CardTitle>
                        <CardDescription>{category ? `Update the category for ${gameName}` : `Add a new ${parentId ? "sub" : ""}category for ${gameName}`}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">{formContent}</CardContent>
                </Card>
            ) : (
                <div className="space-y-4">{formContent}</div>
            )}
        </form>
    );
}

export function CategoryFormDialog({ trigger, ...props }: CategoryFormDialogProps) {
    const [open, setOpen] = useState(false);

    const handleSuccess = () => {
        setOpen(false);
        if (props.onSuccess) {
            props.onSuccess();
        }
    };

    const handleCancel = () => {
        setOpen(false);
    };

    const getTitle = () => {
        if (props.category) {
            return "Edit Category";
        }
        if (props.parentId) {
            return "Create Subcategory";
        }
        return "Create Category";
    };

    const getDescription = () => {
        if (props.category) {
            return `Update the category for ${props.gameName}`;
        }
        if (props.parentId) {
            return `Add a new subcategory for ${props.gameName}`;
        }
        return `Add a new category for ${props.gameName}`;
    };

    return (
        <Dialog onOpenChange={setOpen} open={open}>
            <DialogTrigger asChild>
                {trigger || (
                    <Button size="sm">
                        <Plus className="mr-2 h-4 w-4" />
                        Add Category
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>{getTitle()}</DialogTitle>
                    <DialogDescription>{getDescription()}</DialogDescription>
                </DialogHeader>
                <CategoryForm {...props} onCancel={handleCancel} onSuccess={handleSuccess} showCard={false} />
            </DialogContent>
        </Dialog>
    );
}
