import type { GameSelect, ProjectSelect } from "@foundry/database/projects/queries";
import { ProjectEditForm } from "./project-edit-form-client";

interface ProjectEditModeProps {
    project: ProjectSelect;
    game: GameSelect | null;
}

export function ProjectEditMode({ project, game }: ProjectEditModeProps) {
    return (
        <div className="container mx-auto max-w-5xl py-8">
            <div className="mb-6">
                <h1 className="font-bold text-3xl">Edit Project</h1>
                <p className="text-muted-foreground">Update your project details, upload images, and manage settings.</p>
            </div>

            <ProjectEditForm game={game} project={project} />
        </div>
    );
}
