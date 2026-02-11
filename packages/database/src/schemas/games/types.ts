import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";
import { categories, games } from "./tables";

export const selectGameSchema = createSelectSchema(games);
export const insertGameSchema = createInsertSchema(games, {
    images: z.object({
        cover: z.string(),
        icon: z.string(),
        background: z.string(),
    }),
    capabilities: z.object({
        versions: z.array(z.string()),
        modloaders: z.array(z.string()),
    }),
    stats: z.object({
        project_count: z.number(),
        download_count: z.number(),
        modpack_count: z.number(),
    }),
});

export const selectCategorySchema = createSelectSchema(categories);
export const insertCategorySchema = createInsertSchema(categories, {
    parent_id: z.string().uuid().nullable().optional(),
    description: z.string().nullable().optional(),
    icon: z.string().nullable().optional(),
});

// Type definitions
export type Game = z.infer<typeof selectGameSchema>;
export type NewGame = z.infer<typeof insertGameSchema>;
export type Category = z.infer<typeof selectCategorySchema>;
export type NewCategory = z.infer<typeof insertCategorySchema>;

// Extended type for working with category hierarchies
export interface CategoryWithSubcategories extends Category {
    subcategories?: CategoryWithSubcategories[];
}

// Zod schema for category with subcategories (for validation)
export const categoryWithSubcategoriesSchema: z.ZodType<CategoryWithSubcategories> = selectCategorySchema.extend({
    subcategories: z.lazy(() => z.array(categoryWithSubcategoriesSchema)).optional(),
});
