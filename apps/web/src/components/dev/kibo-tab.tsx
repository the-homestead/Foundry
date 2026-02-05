"use client";

import type { DragEndEvent } from "@dnd-kit/core";
import {
    ColorPicker,
    ColorPickerAlpha,
    ColorPickerEyeDropper,
    ColorPickerFormat,
    ColorPickerHue,
    ColorPickerOutput,
    ColorPickerSelection,
    type GanttFeature,
    GanttFeatureList,
    GanttFeatureListGroup,
    GanttFeatureRow,
    GanttHeader,
    GanttMarker,
    type GanttMarkerProps,
    GanttProvider,
    GanttSidebar,
    GanttSidebarGroup,
    GanttSidebarItem,
    type GanttStatus,
    GanttTimeline,
    GanttToday,
    KanbanBoard,
    KanbanCard,
    KanbanCards,
    KanbanHeader,
    KanbanProvider,
    ListGroup,
    ListHeader,
    ListItem,
    ListItems,
    ListProvider,
    QRCode,
    TreeExpander,
    TreeIcon,
    TreeLabel,
    TreeNode,
    TreeNodeContent,
    TreeNodeTrigger,
    TreeProvider,
    TreeView,
} from "@foundry/ui/components";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@foundry/ui/primitives/card";
import { useCallback, useState } from "react";
import { SectionHeader } from "./section-header";

const createDateFromOffset = (days: number) => {
    const date = new Date();
    date.setDate(date.getDate() + days);
    return date;
};

const kanbanColumns = [
    { id: "backlog", name: "Backlog" },
    { id: "in-progress", name: "In progress" },
    { id: "done", name: "Done" },
];

const initialKanbanData = [
    { id: "kanban-1", name: "Define tokens", column: "backlog" },
    { id: "kanban-2", name: "Wire layouts", column: "backlog" },
    { id: "kanban-3", name: "Build components", column: "in-progress" },
    { id: "kanban-4", name: "Ship docs", column: "done" },
];

const listGroups = [
    { id: "queued", name: "Queued", color: "hsl(var(--chart-2))" },
    { id: "review", name: "Review", color: "hsl(var(--chart-3))" },
    { id: "approved", name: "Approved", color: "hsl(var(--chart-4))" },
];

const initialListItems = [
    { id: "list-1", name: "Design token audit", status: "queued" },
    { id: "list-2", name: "Interaction QA", status: "queued" },
    { id: "list-3", name: "Accessibility sweep", status: "review" },
    { id: "list-4", name: "Release checklist", status: "approved" },
];

const ganttStatuses = [
    { id: "planning", name: "Planning", color: "hsl(var(--chart-1))" },
    { id: "build", name: "Build", color: "hsl(var(--chart-2))" },
    { id: "review", name: "Review", color: "hsl(var(--chart-3))" },
] as const satisfies readonly GanttStatus[];

const [planningStatus, buildStatus, reviewStatus] = ganttStatuses;

const createGanttFeatures = (): GanttFeature[] => [
    {
        id: "gantt-1",
        name: "Design system refresh",
        startAt: createDateFromOffset(-20),
        endAt: createDateFromOffset(-6),
        status: planningStatus,
        lane: "Product",
    },
    {
        id: "gantt-2",
        name: "Component production",
        startAt: createDateFromOffset(-10),
        endAt: createDateFromOffset(8),
        status: buildStatus,
        lane: "Product",
    },
    {
        id: "gantt-3",
        name: "Stakeholder review",
        startAt: createDateFromOffset(4),
        endAt: createDateFromOffset(18),
        status: reviewStatus,
        lane: "GTM",
    },
];

const createGanttMarkers = (): GanttMarkerProps[] => [
    { id: "marker-1", label: "Kickoff", date: createDateFromOffset(-14) },
    { id: "marker-2", label: "Launch", date: createDateFromOffset(14) },
];

export function KiboTab() {
    const [kanbanData, setKanbanData] = useState(initialKanbanData);
    const [listItems, setListItems] = useState(initialListItems);
    const [selectedTreeNodes, setSelectedTreeNodes] = useState<string[]>(["workspace"]);
    const [ganttFeatures, setGanttFeatures] = useState<GanttFeature[]>(() => createGanttFeatures());
    const [ganttMarkers, setGanttMarkers] = useState<GanttMarkerProps[]>(() => createGanttMarkers());

    const handleListDragEnd = useCallback((event: DragEndEvent) => {
        const overId = event.over?.id?.toString();
        const activeId = event.active.id?.toString();

        if (!(overId && activeId)) {
            return;
        }

        setListItems((items) => {
            const activeItem = items.find((item) => item.id === activeId);

            if (!activeItem || activeItem.status === overId) {
                return items;
            }

            return items.map((item) => (item.id === activeId ? { ...item, status: overId } : item));
        });
    }, []);

    const handleGanttMove = useCallback((id: string, startAt: Date, endAt: Date | null) => {
        setGanttFeatures((features) => features.map((feature) => (feature.id === id ? { ...feature, startAt, endAt: endAt ?? feature.endAt ?? startAt } : feature)));
    }, []);

    const handleRemoveMarker = useCallback((id: string) => {
        setGanttMarkers((markers) => markers.filter((marker) => marker.id !== id));
    }, []);

    return (
        <>
            <SectionHeader
                description="Kibo UI showcases for advanced layout and data interactions."
                title="Kibo UI"
                tooltip="Includes kanban, lists, trees, color picking, QR, and Gantt."
            />

            <div className="grid gap-6 lg:grid-cols-2">
                <Card>
                    <CardHeader className="items-center text-center">
                        <CardTitle className="text-base">Kanban Board</CardTitle>
                        <CardDescription>Drag tasks between columns.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <KanbanProvider className="min-h-[240px]" columns={kanbanColumns} data={kanbanData} onDataChange={setKanbanData}>
                            {(column) => (
                                <KanbanBoard className="min-w-[220px]" id={column.id} key={column.id}>
                                    <KanbanHeader className="border-border/50 border-b">{column.name}</KanbanHeader>
                                    <KanbanCards id={column.id}>
                                        {(item) => (
                                            <KanbanCard column={item.column} id={item.id} key={item.id} name={item.name}>
                                                <p className="font-medium text-sm">{item.name}</p>
                                            </KanbanCard>
                                        )}
                                    </KanbanCards>
                                </KanbanBoard>
                            )}
                        </KanbanProvider>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="items-center text-center">
                        <CardTitle className="text-base">List Board</CardTitle>
                        <CardDescription>Drag items across status groups.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ListProvider className="space-y-3" onDragEnd={handleListDragEnd}>
                            {listGroups.map((group) => (
                                <ListGroup className="rounded-md border" id={group.id} key={group.id}>
                                    <ListHeader color={group.color} name={group.name} />
                                    <ListItems>
                                        {listItems
                                            .filter((item) => item.status === group.id)
                                            .map((item, index) => (
                                                <ListItem id={item.id} index={index} key={item.id} name={item.name} parent={group.id} />
                                            ))}
                                    </ListItems>
                                </ListGroup>
                            ))}
                        </ListProvider>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
                <Card>
                    <CardHeader className="items-center text-center">
                        <CardTitle className="text-base">Tree View</CardTitle>
                        <CardDescription>Expandable hierarchy with selectable nodes.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <TreeProvider onSelectionChange={setSelectedTreeNodes} selectedIds={selectedTreeNodes} showLines={false}>
                            <TreeView className="rounded-md border">
                                <TreeNode level={0} nodeId="workspace">
                                    <TreeNodeTrigger>
                                        <TreeExpander hasChildren />
                                        <TreeIcon hasChildren />
                                        <TreeLabel>Foundry</TreeLabel>
                                    </TreeNodeTrigger>
                                    <TreeNodeContent className="ml-4" hasChildren>
                                        <TreeNode level={1} nodeId="apps">
                                            <TreeNodeTrigger>
                                                <TreeExpander hasChildren />
                                                <TreeIcon hasChildren />
                                                <TreeLabel>apps</TreeLabel>
                                            </TreeNodeTrigger>
                                            <TreeNodeContent className="ml-4" hasChildren>
                                                <TreeNode level={2} nodeId="web">
                                                    <TreeNodeTrigger>
                                                        <TreeExpander />
                                                        <TreeIcon />
                                                        <TreeLabel>web</TreeLabel>
                                                    </TreeNodeTrigger>
                                                </TreeNode>
                                                <TreeNode isLast level={2} nodeId="desktop">
                                                    <TreeNodeTrigger>
                                                        <TreeExpander />
                                                        <TreeIcon />
                                                        <TreeLabel>desktop</TreeLabel>
                                                    </TreeNodeTrigger>
                                                </TreeNode>
                                            </TreeNodeContent>
                                        </TreeNode>
                                        <TreeNode isLast level={1} nodeId="packages">
                                            <TreeNodeTrigger>
                                                <TreeExpander hasChildren />
                                                <TreeIcon hasChildren />
                                                <TreeLabel>packages</TreeLabel>
                                            </TreeNodeTrigger>
                                            <TreeNodeContent className="ml-4" hasChildren>
                                                <TreeNode level={2} nodeId="ui">
                                                    <TreeNodeTrigger>
                                                        <TreeExpander />
                                                        <TreeIcon />
                                                        <TreeLabel>ui</TreeLabel>
                                                    </TreeNodeTrigger>
                                                </TreeNode>
                                                <TreeNode isLast level={2} nodeId="database">
                                                    <TreeNodeTrigger>
                                                        <TreeExpander />
                                                        <TreeIcon />
                                                        <TreeLabel>database</TreeLabel>
                                                    </TreeNodeTrigger>
                                                </TreeNode>
                                            </TreeNodeContent>
                                        </TreeNode>
                                    </TreeNodeContent>
                                </TreeNode>
                            </TreeView>
                        </TreeProvider>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="items-center text-center">
                        <CardTitle className="text-base">Color Picker</CardTitle>
                        <CardDescription>Pick a tone and copy formats.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ColorPicker defaultValue="#7c3aed">
                            <div className="grid gap-3 sm:grid-cols-[1.1fr_0.9fr]">
                                <ColorPickerSelection className="h-32 rounded-md" />
                                <div className="space-y-3">
                                    <ColorPickerHue />
                                    <ColorPickerAlpha />
                                    <div className="flex items-center gap-2">
                                        <ColorPickerEyeDropper />
                                        <ColorPickerOutput />
                                    </div>
                                    <ColorPickerFormat />
                                </div>
                            </div>
                        </ColorPicker>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
                <Card>
                    <CardHeader className="items-center text-center">
                        <CardTitle className="text-base">QR Code</CardTitle>
                        <CardDescription>Share a quick link with scannable output.</CardDescription>
                    </CardHeader>
                    <CardContent className="flex items-center justify-center">
                        <div className="h-40 w-40 rounded-md border bg-background p-2">
                            <QRCode className="h-full w-full" data="https://foundry.app/dev" />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="items-center text-center">
                        <CardTitle className="text-base">Gantt Overview</CardTitle>
                        <CardDescription>Plan timelines with lanes and milestones.</CardDescription>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="h-[360px]">
                            <GanttProvider range="monthly">
                                <GanttSidebar>
                                    <GanttSidebarGroup name="Product">
                                        {ganttFeatures
                                            .filter((feature) => feature.lane === "Product")
                                            .map((feature) => (
                                                <GanttSidebarItem feature={feature} key={feature.id} />
                                            ))}
                                    </GanttSidebarGroup>
                                    <GanttSidebarGroup name="GTM">
                                        {ganttFeatures
                                            .filter((feature) => feature.lane === "GTM")
                                            .map((feature) => (
                                                <GanttSidebarItem feature={feature} key={feature.id} />
                                            ))}
                                    </GanttSidebarGroup>
                                </GanttSidebar>

                                <GanttTimeline>
                                    <GanttHeader />
                                    <GanttToday />
                                    {ganttMarkers.map((marker) => (
                                        <GanttMarker className="bg-primary" key={marker.id} onRemove={handleRemoveMarker} {...marker} />
                                    ))}
                                    <GanttFeatureList>
                                        <GanttFeatureListGroup>
                                            <GanttFeatureRow features={ganttFeatures.filter((feature) => feature.lane === "Product")} onMove={handleGanttMove} />
                                        </GanttFeatureListGroup>
                                        <GanttFeatureListGroup>
                                            <GanttFeatureRow features={ganttFeatures.filter((feature) => feature.lane === "GTM")} onMove={handleGanttMove} />
                                        </GanttFeatureListGroup>
                                    </GanttFeatureList>
                                </GanttTimeline>
                            </GanttProvider>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </>
    );
}
