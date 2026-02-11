import { relations } from "drizzle-orm";
import { projects } from "../projects/tables";
import { categories, games } from "./tables";

export const gamesRelations = relations(games, ({ many }) => ({
    categories: many(categories),
    projects: many(projects),
}));

export const categoriesRelations = relations(categories, ({ one, many }) => ({
    game: one(games, {
        fields: [categories.game_id],
        references: [games.id],
    }),
    parent: one(categories, {
        fields: [categories.parent_id],
        references: [categories.id],
        relationName: "subcategories",
    }),
    subcategories: many(categories, {
        relationName: "subcategories",
    }),
}));
