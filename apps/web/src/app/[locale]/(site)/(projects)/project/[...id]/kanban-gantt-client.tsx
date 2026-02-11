"use client";
import {
    GanttCreateMarkerTrigger,
    GanttFeatureList,
    GanttFeatureListGroup,
    GanttFeatureRow,
    GanttHeader,
    GanttMarker,
    GanttProvider,
    GanttSidebar,
    GanttSidebarGroup,
    GanttSidebarItem,
    GanttTimeline,
    GanttToday,
    KanbanBoard,
    KanbanCard,
    KanbanCards,
    KanbanHeader,
    KanbanProvider,
} from "@foundry/ui/components";
// Badge removed — avoid showing explicit 'Mock' label in dev environment
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@foundry/ui/primitives/card";
import { useMemo, useState } from "react";

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
    // If the page is a mock (empty arrays passed in), generate sample data so the demo looks full
    function makeDateOffset(days: number) {
        const d = new Date();
        d.setDate(d.getDate() + days);
        return d;
    }

    const generateMockFeatures = () => {
        const groups = ["Backend", "UI", "Docs", "Integrations"];
        const lanes = ["alpha", "beta", "gamma", "delta", "epsilon"];
        const statuses = [
            { id: "s1", name: "Planned", color: "#F59E0B" },
            { id: "s2", name: "In Progress", color: "#10B981" },
            { id: "s3", name: "Blocked", color: "#EF4444" },
            { id: "s4", name: "Complete", color: "#60A5FA" },
        ];

        const out: GanttFeature[] = [];
        for (let g = 0; g < groups.length; g++) {
            const groupName = groups[g];
            for (let i = 0; i < lanes.length; i++) {
                const lane = lanes[i];
                // Create 3 features per lane, vary length and occasional long-running work
                for (let j = 0; j < 3; j++) {
                    const base = (i + j) * 3 + g * 6 + 1;
                    const start = makeDateOffset(base);
                    // Make some tasks longer
                    const length = j === 1 ? 10 : 3 + j * 2;
                    const end = makeDateOffset(base + length);

                    const item: Record<string, unknown> = {
                        id: `${groupName}-${lane}-${j}`,
                        name: `${groupName} Task ${i * 3 + j + 1}`,
                        startAt: start,
                        endAt: end,
                        status: statuses[(i + j) % statuses.length],
                        lane,
                        // metadata helps grouping and display in mock
                        metadata: {
                            group: { name: groupName },
                            guest: { name: `User ${i + 1}`, image: `https://i.pravatar.cc/40?u=${groupName}-${lane}-${j}` },
                            description: `This is a mock description for ${groupName} Task ${i * 3 + j + 1}.`,
                        },
                    };

                    out.push(item as unknown as GanttFeature);
                }
            }
        }

        return out;
    };

    const generateMockMarkers = () => [
        { id: "m1", label: "Planning", date: makeDateOffset(3) },
        { id: "m2", label: "Sprint Start", date: makeDateOffset(8) },
        { id: "m3", label: "Release Candidate", date: makeDateOffset(16) },
        { id: "m4", label: "Release", date: makeDateOffset(28) },
        { id: "m5", label: "Postmortem", date: makeDateOffset(40) },
    ];

    const initialKanban = kanbanCards.length
        ? kanbanCards
        : [
              { id: "c1", name: "Write specs", column: "todo" },
              { id: "c2", name: "Implement API", column: "in-progress" },
              { id: "c3", name: "Write docs", column: "done" },
              { id: "c4", name: "Add tests", column: "in-progress" },
              { id: "c5", name: "Release prep", column: "review" },
              { id: "c6", name: "Retrospective", column: "done" },
          ];

    const initialColumns = kanbanColumns.length
        ? kanbanColumns
        : [
              { id: "todo", name: "To do" },
              { id: "in-progress", name: "In progress" },
              { id: "review", name: "Review" },
              { id: "done", name: "Done" },
          ];

    const [kanbanData, setKanbanData] = useState(initialKanban);
    const [compact, setCompact] = useState(false);
    const [fitCounter, setFitCounter] = useState(0);

    // Local copy of gantt features so we can update positions locally on drag
    const [features, setFeatures] = useState((ganttFeatures.length ? ganttFeatures : generateMockFeatures()).map((f) => ({ ...f })));
    const fitFeaturesMemo = useMemo(() => {
        // reference fitCounter so clicking the button will change the memo identity
        const _ = fitCounter;
        return features;
    }, [features, fitCounter]);
    const markers = ganttMarkers.length ? ganttMarkers : generateMockMarkers();

    // Group features by group name (if provided via metadata.group.name) and then by lane
    const groups: Record<string, Record<string, typeof features>> = {};
    for (const f of features) {
        const groupName = (f as { metadata?: { group?: { name?: string } } }).metadata?.group?.name ?? "Issues";
        if (!groups[groupName]) {
            groups[groupName] = {};
        }
        const groupEntry = groups[groupName];
        if (!groupEntry[f.lane]) {
            groupEntry[f.lane] = [] as typeof features;
        }
        const laneEntry = groupEntry[f.lane] as typeof features;
        laneEntry.push(f);
    }

    function handleMove(id: string, startAt: Date, endAt: Date | null) {
        setFeatures((cur) => cur.map((f) => (f.id === id ? { ...f, startAt, endAt: endAt ?? f.endAt } : f)));
    }

    return (
        <div className="grid gap-4 lg:grid-cols-1">
            <Card className="col-span-2">
                <CardHeader>
                    <div className="flex items-center gap-2">
                        <CardTitle>Gantt Overview</CardTitle>
                        <div className="ml-auto flex items-center gap-2">
                            <button className={compact ? "btn btn-primary btn-sm" : "btn btn-outline btn-sm"} onClick={() => setCompact((c) => !c)} type="button">
                                {compact ? "Compact" : "Compact: Off"}
                            </button>
                            <button className="btn btn-outline btn-sm" onClick={() => setFitCounter((c) => c + 1)} type="button">
                                Fit timeline
                            </button>
                        </div>
                    </div>
                    <CardDescription>Track issue progress and milestones.</CardDescription>
                </CardHeader>
                <CardContent className="min-h-[720px]">
                    <GanttProvider compact={compact} fitFeatures={fitFeaturesMemo} headerHeight={96} range="monthly" rowHeight={72}>
                        <GanttSidebar>
                            {Object.entries(groups).map(([groupName, lanes]) => (
                                <GanttSidebarGroup key={groupName} name={groupName}>
                                    {Object.entries(lanes).map(([laneId, laneFeatures]) => {
                                        // Representative feature to show in sidebar
                                        const startAt = new Date(Math.min(...laneFeatures.map((r) => r.startAt.getTime())));
                                        const endAt = new Date(Math.max(...laneFeatures.map((r) => r.endAt.getTime())));
                                        if (laneFeatures.length === 0) {
                                            return null;
                                        }
                                        const representative = laneFeatures[0] as (typeof features)[number];
                                        return (
                                            <GanttSidebarItem
                                                feature={{ id: laneId, name: representative.name, startAt, endAt, status: representative.status }}
                                                key={laneId}
                                                onSelectItem={() => {
                                                    // TODO: Implement lane selection handler
                                                }}
                                            />
                                        );
                                    })}
                                </GanttSidebarGroup>
                            ))}
                        </GanttSidebar>
                        <GanttTimeline>
                            <GanttHeader />
                            <GanttFeatureList>
                                {Object.entries(groups).map(([groupName, lanes]) => (
                                    <GanttFeatureListGroup key={groupName} name={groupName}>
                                        {Object.entries(lanes).map(([laneId, laneFeatures]) => (
                                            <div key={laneId}>
                                                <GanttFeatureRow features={laneFeatures} onMove={handleMove}>
                                                    {(feature) => <div className="flex w-full items-center gap-2">{feature.name}</div>}
                                                </GanttFeatureRow>
                                            </div>
                                        ))}
                                    </GanttFeatureListGroup>
                                ))}
                            </GanttFeatureList>
                            {markers.map((marker) => (
                                <GanttMarker key={marker.id} {...marker} />
                            ))}
                            <GanttToday />
                            <GanttCreateMarkerTrigger
                                onCreateMarker={(_date) => {
                                    // TODO: Implement marker creation handler
                                }}
                            />
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
                    <KanbanProvider columns={initialColumns} data={kanbanData} onDataChange={setKanbanData}>
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
