"use client";

import type { Category } from "@foundry/database";
import { getIconList } from "@foundry/ui/icons";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@foundry/ui/primitives/alert-dialog";
import { Button } from "@foundry/ui/primitives/button";
import { deleteCategory } from "@foundry/web/actions/categories";
import { CategoryFormDialog } from "@foundry/web/components/admin/games/category-form";
import { Link } from "@foundry/web/i18n/navigation";
import { ChevronRight, Edit, FolderIcon, icons, Trash2 } from "lucide-react";
import type { ComponentType } from "react";
import { useMemo, useState } from "react";
import { toast } from "sonner";

interface CategoryWithSubcategories extends Category {
    subcategories?: CategoryWithSubcategories[];
}

interface CategoriesListProps {
    categories: CategoryWithSubcategories[];
    allCategories?: Category[];
    gameId: string;
    gameName: string;
    level?: number;
}

// Helper component to render icons dynamically
function CategoryIcon({ iconName, className = "h-5 w-5" }: { iconName?: string | null; className?: string }) {
    const animatedIcons = useMemo(() => getIconList(), []);

    if (!iconName) {
        return <FolderIcon className={className} />;
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
        return <LucideIcon className={className} />;
    }

    // Try animated icons
    const animatedIcon = animatedIcons.find((icon) => icon.name === iconName);
    if (animatedIcon) {
        const AnimatedIcon = animatedIcon.icon as ComponentType<{
            className?: string;
        }>;
        return <AnimatedIcon className={className} />;
    }

    // Fallback to folder icon
    return <FolderIcon className={className} />;
}

export function CategoriesList({ categories, allCategories = [], gameId, gameName, level = 0 }: CategoriesListProps) {
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [categoryToDelete, setCategoryToDelete] = useState<{ id: string; name: string } | null>(null);
    const [deleting, setDeleting] = useState(false);

    const handleDeleteClick = (category: CategoryWithSubcategories) => {
        if (category.subcategories && category.subcategories.length > 0) {
            toast.error("Cannot delete category with subcategories. Delete subcategories first.");
            return;
        }
        setCategoryToDelete({ id: category.id, name: category.name });
        setDeleteDialogOpen(true);
    };

    const handleDeleteConfirm = async () => {
        if (!categoryToDelete) {
            return;
        }

        setDeleting(true);
        const result = await deleteCategory(categoryToDelete.id, gameId);

        if (result.error) {
            toast.error(result.error);
        } else {
            toast.success(`Category "${categoryToDelete.name}" deleted successfully`);
            setDeleteDialogOpen(false);
            setCategoryToDelete(null);
        }
        setDeleting(false);
    };

    if (categories.length === 0 && level === 0) {
        return (
            <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center">
                <FolderIcon className="mb-4 h-12 w-12 text-muted-foreground opacity-50" />
                <h3 className="mb-2 font-semibold">No categories yet</h3>
                <p className="mb-4 text-muted-foreground text-sm">Get started by creating your first category.</p>
                <CategoryFormDialog allCategories={allCategories} gameId={gameId} gameName={gameName} />
            </div>
        );
    }

    return (
        <>
            <div className={level === 0 ? "space-y-2" : "mt-2 ml-6 space-y-2 border-border border-l-2 pl-4"}>
                {categories.map((category) => (
                    <div className="space-y-2" key={category.id}>
                        <div className="group flex items-center justify-between rounded-lg border p-3 hover:bg-muted/50">
                            <div className="flex items-center gap-3">
                                <CategoryIcon className="h-5 w-5 text-muted-foreground" iconName={category.icon} />
                                <div className="flex-1">
                                    <div className="flex items-center gap-2">
                                        <span className="font-medium">{category.name}</span>
                                        <span className="font-mono text-muted-foreground text-xs">({category.slug})</span>
                                    </div>
                                    {category.description ? <p className="text-muted-foreground text-sm">{category.description}</p> : null}
                                </div>
                            </div>
                            <div className="flex items-center gap-1">
                                <CategoryFormDialog
                                    allCategories={allCategories}
                                    gameId={gameId}
                                    gameName={gameName}
                                    parentId={category.id}
                                    trigger={
                                        <Button size="sm" variant="ghost">
                                            <ChevronRight className="mr-1 h-3 w-3" />
                                            Add Sub
                                        </Button>
                                    }
                                />
                                <Link href={`/adash/games/${gameId}/categories/${category.id}/edit`}>
                                    <Button size="sm" variant="ghost">
                                        <Edit className="h-3 w-3" />
                                    </Button>
                                </Link>
                                <Button onClick={() => handleDeleteClick(category)} size="sm" variant="ghost">
                                    <Trash2 className="h-3 w-3 text-destructive" />
                                </Button>
                            </div>
                        </div>
                        {category.subcategories && category.subcategories.length > 0 ? (
                            <CategoriesList allCategories={allCategories} categories={category.subcategories} gameId={gameId} gameName={gameName} level={level + 1} />
                        ) : null}
                    </div>
                ))}
            </div>

            <AlertDialog onOpenChange={setDeleteDialogOpen} open={deleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete Category</AlertDialogTitle>
                        <AlertDialogDescription>Are you sure you want to delete "{categoryToDelete?.name}"? This action cannot be undone.</AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
                        <AlertDialogAction disabled={deleting} onClick={handleDeleteConfirm}>
                            {deleting ? "Deleting..." : "Delete"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}
