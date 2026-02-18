"use client";

import type { Category } from "@foundry/database";
import { TreeExpander, TreeLabel, TreeNode, TreeNodeContent, TreeNodeTrigger, TreeProvider, TreeView, TreeIcon as UiTreeIcon } from "@foundry/ui/components";
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
import { Badge } from "@foundry/ui/primitives/badge";
import { Button } from "@foundry/ui/primitives/button";
import { deleteCategory } from "@foundry/web/actions/categories";
import { CategoryFormDialog } from "@foundry/web/components/admin/games/category-form";
// navigation
import { Edit, FolderIcon, icons, Plus, Trash2 } from "lucide-react";
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
function CategoryIcon({ iconName, className = "h-4 w-4" }: { iconName?: string | null; className?: string }) {
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

function CategoryTreeNode({
    category,
    allCategories,
    gameId,
    gameName,
    onDelete,
    isLast = false,
}: {
    category: CategoryWithSubcategories;
    allCategories: Category[];
    gameId: string;
    gameName: string;
    onDelete: (c: CategoryWithSubcategories) => void;
    isLast?: boolean;
}) {
    const subcats = category.subcategories ?? [];
    const hasChildren = subcats.length > 0;

    return (
        <TreeNode isLast={isLast} key={category.id} nodeId={category.id}>
            <TreeNodeTrigger className="px-2 py-1 text-sm">
                <TreeExpander hasChildren={hasChildren} />
                <UiTreeIcon hasChildren={hasChildren} icon={<CategoryIcon iconName={category.icon} />} />
                <TreeLabel>
                    <div className="flex items-center gap-2">
                        <span className="truncate font-medium">{category.name}</span>
                        <span className="font-mono text-muted-foreground text-xs">({category.slug})</span>
                    </div>
                    {category.description ? <div className="mt-1 truncate text-muted-foreground text-xs">{category.description}</div> : null}
                </TreeLabel>

                <div className="ml-2 flex items-center gap-1">
                    {hasChildren ? (
                        <Badge className="text-xs" variant="secondary">
                            {subcats.length}
                        </Badge>
                    ) : null}

                    <CategoryFormDialog
                        allCategories={allCategories}
                        gameId={gameId}
                        gameName={gameName}
                        parentId={category.id}
                        trigger={
                            <Button aria-label="Add subcategory" onClick={(e) => e.stopPropagation()} size="icon" variant="ghost">
                                <Plus className="h-4 w-4" />
                            </Button>
                        }
                    />

                    <CategoryFormDialog
                        allCategories={allCategories}
                        category={category}
                        gameId={gameId}
                        gameName={gameName}
                        trigger={
                            <Button aria-label="Edit category" onClick={(e) => e.stopPropagation()} size="icon" variant="ghost">
                                <Edit className="h-4 w-4" />
                            </Button>
                        }
                    />

                    <Button
                        aria-label="Delete category"
                        onClick={(e) => {
                            e.stopPropagation();
                            onDelete(category);
                        }}
                        size="icon"
                        variant="ghost"
                    >
                        <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                </div>
            </TreeNodeTrigger>

            {hasChildren && (
                <TreeNodeContent className="ml-2" hasChildren>
                    {subcats.map((sub, i) => (
                        <CategoryTreeNode
                            allCategories={allCategories}
                            category={sub}
                            gameId={gameId}
                            gameName={gameName}
                            isLast={i === subcats.length - 1}
                            key={sub.id}
                            onDelete={onDelete}
                        />
                    ))}
                </TreeNodeContent>
            )}
        </TreeNode>
    );
}

export function CategoriesList({ categories, allCategories = [], gameId, gameName, level = 0 }: CategoriesListProps) {
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [categoryToDelete, setCategoryToDelete] = useState<{ id: string; name: string } | null>(null);
    const [deleting, setDeleting] = useState(false);
    // top-level no-expanded state needed for stable inline list

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
            <div className="flex flex-col items-center justify-center rounded-md border border-dashed p-6 text-center text-sm">
                <FolderIcon className="mb-3 h-10 w-10 text-muted-foreground opacity-50" />
                <h3 className="mb-1 font-semibold">No categories yet</h3>
                <p className="mb-3 text-muted-foreground text-xs">Get started by creating your first category.</p>
                <CategoryFormDialog allCategories={allCategories} gameId={gameId} gameName={gameName} />
            </div>
        );
    }
    // render tree
    return (
        <>
            <TreeProvider animateExpand className={level === 0 ? "rounded-md border p-1 text-sm" : "ml-2 text-sm"} indent={14} selectable={false} showIcons showLines>
                <TreeView>
                    {categories.map((c, i) => (
                        <CategoryTreeNode
                            allCategories={allCategories}
                            category={c}
                            gameId={gameId}
                            gameName={gameName}
                            isLast={i === categories.length - 1}
                            key={c.id}
                            onDelete={handleDeleteClick}
                        />
                    ))}
                </TreeView>
            </TreeProvider>

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
