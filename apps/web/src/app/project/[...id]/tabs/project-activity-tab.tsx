import { Timeline } from "@foundry/ui/components";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@foundry/ui/primitives/card";
import type { ProjectTabsProps } from "./project-tabs.types";

export interface ProjectActivityTabProps {
    timelineEntries: ProjectTabsProps["timelineEntries"];
}

export function ProjectActivityTab({ timelineEntries }: ProjectActivityTabProps) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Activity Timeline</CardTitle>
                <CardDescription>Version history, page edits, uploads, and engagement.</CardDescription>
            </CardHeader>
            <CardContent>
                <Timeline data={timelineEntries} />
            </CardContent>
        </Card>
    );
}
