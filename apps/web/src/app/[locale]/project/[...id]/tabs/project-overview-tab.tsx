import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@foundry/ui/primitives/card";
import MarkdownViewer from "@foundry/web/components/markdown/md-viewer";
import type { ProjectTabsProps } from "./project-tabs.types";

export interface ProjectOverviewTabProps {
    project: ProjectTabsProps["project"];
    gallery: ProjectTabsProps["gallery"];
    posts: ProjectTabsProps["posts"];
    files: ProjectTabsProps["files"];
    timelineEntries: ProjectTabsProps["timelineEntries"];
}

// biome-ignore lint/correctness/noUnusedFunctionParameters: <Def>
export function ProjectOverviewTab({ project, gallery, posts, files, timelineEntries }: ProjectOverviewTabProps) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Description</CardTitle>
                <CardDescription>Project details and overview.</CardDescription>
            </CardHeader>
            <CardContent className="prose center max-w-none justify-center space-y-6">
                {project.description?.content ? <MarkdownViewer content={project.description?.content} /> : <p>{project.summary}</p>}
            </CardContent>
        </Card>
    );
}
