import { KanbanGanttClient } from "../kanban-gantt-client";
import type { ProjectTabsProps } from "./project-tabs.types";

export interface ProjectIssuesTabProps {
    ganttFeatures: ProjectTabsProps["ganttFeatures"];
    ganttMarkers: ProjectTabsProps["ganttMarkers"];
    issueTemplates: ProjectTabsProps["issueTemplates"];
    kanbanCards: ProjectTabsProps["kanbanCards"];
    kanbanColumns: ProjectTabsProps["kanbanColumns"];
}

export function ProjectIssuesTab({ ganttFeatures, ganttMarkers, issueTemplates, kanbanCards, kanbanColumns }: ProjectIssuesTabProps) {
    return <KanbanGanttClient ganttFeatures={ganttFeatures} ganttMarkers={ganttMarkers} issueTemplates={issueTemplates} kanbanCards={kanbanCards} kanbanColumns={kanbanColumns} />;
}
