"use client";
import {
    GanttFeatureList,
    GanttFeatureRow,
    GanttHeader,
    GanttMarker,
    GanttProvider,
    GanttTimeline,
    KanbanBoard,
    KanbanCard,
    KanbanCards,
    KanbanHeader,
    KanbanProvider,
} from "@foundry/ui/components";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@foundry/ui/primitives/card";
import { useState } from "react";

export interface GanttFeature {
    id: string;
    name: string;
    startAt: Date;
    endAt: Date;
    status: { id: string; name: string; color: string };
    lane: string;
}
// GanttMarker type is already defined elsewhere, remove duplicate.

export interface KanbanColumn {
    id: string;
    name: string;
    [key: string]: unknown;
}

export interface KanbanCardType {
    id: string;
    name: string;
    column: string;
    [key: string]: unknown;
}
export interface IssueTemplate {
    title: string;
    description: string;
}
export interface KanbanGanttClientProps {
    ganttFeatures: GanttFeature[];
    ganttMarkers: { id: string; label: string; date: Date }[];
    kanbanColumns: KanbanColumn[];
    kanbanCards: KanbanCardType[];
    issueTemplates: IssueTemplate[];
}

export function KanbanGanttClient({ ganttFeatures, ganttMarkers, kanbanColumns, kanbanCards, issueTemplates }: KanbanGanttClientProps) {
    const [kanbanData, setKanbanData] = useState(kanbanCards);
    return (
        <div className="grid gap-4 lg:grid-cols-3">
            <Card className="col-span-2">
                <CardHeader>
                    <CardTitle>Gantt Overview</CardTitle>
                    <CardDescription>Track issue progress and milestones.</CardDescription>
                </CardHeader>
                <CardContent>
                    <GanttProvider>
                        <GanttTimeline>
                            <GanttHeader />
                            {ganttMarkers.map((marker) => (
                                <GanttMarker key={marker.id} {...marker} />
                            ))}
                            <GanttFeatureList>
                                <GanttFeatureRow features={ganttFeatures} />
                            </GanttFeatureList>
                        </GanttTimeline>
                    </GanttProvider>
                </CardContent>
            </Card>
            <Card>
                <CardHeader>
                    <CardTitle>Kanban Board</CardTitle>
                    <CardDescription>Drag issues between columns.</CardDescription>
                </CardHeader>
                <CardContent>
                    <KanbanProvider columns={kanbanColumns} data={kanbanData} onDataChange={setKanbanData}>
                        {(column) => (
                            <KanbanBoard id={column.id} key={column.id}>
                                <KanbanHeader>{column.name}</KanbanHeader>
                                <KanbanCards id={column.id}>{(item) => <KanbanCard column={column.id} id={item.id} key={item.id} name={item.name} />}</KanbanCards>
                            </KanbanBoard>
                        )}
                    </KanbanProvider>
                </CardContent>
            </Card>
            <Card>
                <CardHeader>
                    <CardTitle>Templates</CardTitle>
                    <CardDescription>Pre-fills fields and optional GitHub mapping.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                    {issueTemplates.map((template) => (
                        <div className="rounded-lg border bg-muted/40 p-4" key={template.title}>
                            <div className="flex items-center justify-between">
                                <span className="font-medium">{template.title}</span>
                                <button className="btn btn-outline btn-sm" type="button">
                                    Start
                                </button>
                            </div>
                            <p className="text-muted-foreground text-sm">{template.description}</p>
                        </div>
                    ))}
                    <button className="btn btn-secondary w-full" type="button">
                        Manage templates
                    </button>
                </CardContent>
            </Card>
        </div>
    );
}
