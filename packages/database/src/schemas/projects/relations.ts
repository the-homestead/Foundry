import { relations } from "drizzle-orm";
import { games } from "../games/tables";
import { projects } from "./tables";

export const projectsRelations = relations(projects, ({ one }) => ({
    game: one(games, {
        fields: [projects.game_id],
        references: [games.id],
    }),
}));
