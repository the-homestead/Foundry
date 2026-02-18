"use server";

import { db, eq } from "@foundry/database";
import { categories } from "@foundry/database/schemas/games/tables";
import type { Category } from "@foundry/database/schemas/games/types";
import { revalidatePath } from "next/cache";

interface CategoryWithSubcategories extends Category {
    subcategories?: CategoryWithSubcategories[];
}

interface CreateCategoryInput {
    gameId: string;
    name: string;
    slug: string;
    description?: string;
    icon?: string;
    parentId?: string | null;
}

interface UpdateCategoryInput extends CreateCategoryInput {
    id: string;
}

export async function createCategory(data: CreateCategoryInput) {
    try {
        const categoryId = crypto.randomUUID();

        await db.insert(categories).values({
            id: categoryId,
            game_id: data.gameId,
            parent_id: data.parentId || null,
            slug: data.slug,
            name: data.name,
            description: data.description || null,
            icon: data.icon || null,
        });

        revalidatePath(`/management/games/${data.gameId}`);
        revalidatePath("/management/games");

        return { success: true, categoryId };
    } catch (e: unknown) {
        console.error("Failed to create category", e);
        if (typeof e === "object" && e !== null && "code" in e && (e as Record<string, unknown>).code === "23505") {
            return { error: "Category slug already exists for this game" };
        }
        return { error: "Failed to create category" };
    }
}

export async function updateCategory(data: UpdateCategoryInput) {
    try {
        await db
            .update(categories)
            .set({
                game_id: data.gameId,
                parent_id: data.parentId || null,
                slug: data.slug,
                name: data.name,
                description: data.description || null,
                icon: data.icon || null,
            })
            .where(eq(categories.id, data.id));

        revalidatePath(`/management/games/${data.gameId}`);
        revalidatePath("/management/games");

        return { success: true };
    } catch (e: unknown) {
        console.error("Failed to update category", e);
        if (typeof e === "object" && e !== null && "code" in e && (e as Record<string, unknown>).code === "23505") {
            return { error: "Category slug already exists for this game" };
        }
        return { error: "Failed to update category" };
    }
}

export async function deleteCategory(categoryId: string, gameId: string) {
    try {
        // Check if category has subcategories
        const subcategories = await db.select().from(categories).where(eq(categories.parent_id, categoryId));

        if (subcategories.length > 0) {
            return { error: "Cannot delete category with subcategories. Delete subcategories first." };
        }

        await db.delete(categories).where(eq(categories.id, categoryId));

        revalidatePath(`/management/games/${gameId}`);
        revalidatePath("/management/games");

        return { success: true };
    } catch (e: unknown) {
        console.error("Failed to delete category", e);
        return { error: "Failed to delete category" };
    }
}

export async function getCategoriesForGame(gameId: string): Promise<CategoryWithSubcategories[]> {
    const allCategories = await db.select().from(categories).where(eq(categories.game_id, gameId));

    // Build a tree structure
    const categoryMap = new Map<string, CategoryWithSubcategories>();
    const rootCategories: CategoryWithSubcategories[] = [];

    // First pass: Create all category objects
    for (const category of allCategories) {
        categoryMap.set(category.id, { ...category, subcategories: [] });
    }

    // Second pass: Build the tree
    for (const category of allCategories) {
        const categoryWithSubs = categoryMap.get(category.id);
        if (!categoryWithSubs) {
            continue;
        }

        if (category.parent_id) {
            const parent = categoryMap.get(category.parent_id);
            if (parent) {
                parent.subcategories = parent.subcategories || [];
                parent.subcategories.push(categoryWithSubs);
            }
        } else {
            rootCategories.push(categoryWithSubs);
        }
    }

    return rootCategories;
}

export async function getAllCategoriesFlat(gameId: string): Promise<Category[]> {
    return await db.select().from(categories).where(eq(categories.game_id, gameId));
}
