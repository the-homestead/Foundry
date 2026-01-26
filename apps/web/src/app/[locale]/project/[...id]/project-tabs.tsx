"use client";

/* eslint-disable tailwindcss/classnames-order */

import { Badge } from "@foundry/ui/primitives/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@foundry/ui/primitives/select";
import { Separator } from "@foundry/ui/primitives/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@foundry/ui/primitives/tabs";
import { useEffect, useRef, useState } from "react";
import { ProjectActivityTab } from "./tabs/project-activity-tab";
import { ProjectBlogTab } from "./tabs/project-blog-tab";
import { ProjectFilesTab } from "./tabs/project-files-tab";
import { ProjectGalleryTab } from "./tabs/project-gallery-tab";
import { ProjectIssuesTab } from "./tabs/project-issues-tab";
import { ProjectOverviewTab } from "./tabs/project-overview-tab";
import type { OptionalDownloads, ProjectFile, ProjectTabsProps } from "./tabs/project-tabs.types";

export function ProjectTabs({
    project,
    files,
    gallery,
    posts,
    ganttFeatures,
    ganttMarkers,
    kanbanColumns,
    kanbanCards,
    issueTemplates,
    timelineEntries,
    counts,
}: ProjectTabsProps) {
    const [value, setValue] = useState<string>("overview");
    const listRef = useRef<HTMLDivElement | null>(null);
    const indicatorRef = useRef<HTMLDivElement | null>(null);

    // update underline position whenever active trigger or layout changes
    // biome-ignore lint/correctness/useExhaustiveDependencies: <Def>
    useEffect(() => {
        const update = () => {
            const root = listRef.current;
            if (!root) {
                return;
            }
            const active = root.querySelector<HTMLElement>("[data-state=active]");
            const indicator = indicatorRef.current;
            if (!(active && indicator)) {
                return;
            }

            const rect = active.getBoundingClientRect();
            const parentRect = root.getBoundingClientRect();
            const left = rect.left - parentRect.left + root.scrollLeft;
            const width = rect.width;

            indicator.style.transform = `translateX(${left}px)`;
            indicator.style.width = `${width}px`;
        };

        update();
        // ensure indicator recalculates after all resources finish loading
        window.addEventListener("load", update);
        window.addEventListener("resize", update);

        // observe attribute changes (Radix toggles data-state) on triggers
        const root = listRef.current;
        let mo: MutationObserver | null = null;
        if (root) {
            mo = new MutationObserver(update);
            mo.observe(root, { subtree: true, attributes: true, attributeFilter: ["data-state"] });
        }

        // ensure indicator updates when value changes (keyboard shortcuts)
        return () => {
            window.removeEventListener("load", update);
            window.removeEventListener("resize", update);
            if (mo) {
                mo.disconnect();
            }
        };
    }, [value]);
    /* eslint-disable-next-line react-hooks/exhaustive-deps */

    // keyboard shortcuts 1..6
    useEffect(() => {
        const onKey = (e: KeyboardEvent) => {
            if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
                return;
            }
            const key = e.key;
            const mapping: Record<string, string> = {
                "1": "overview",
                "2": "files",
                "3": "gallery",
                "4": "blog",
                "5": "issues",
                "6": "activity",
            };
            if (mapping[key]) {
                setValue(mapping[key]);
            }
        };

        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, []);

    return (
        <Tabs className="space-y-4" onValueChange={setValue} value={value}>
            <div className="relative w-full rounded-lg bg-muted p-1" ref={listRef}>
                {/* Mobile: compact select */}
                <div className="sm:hidden">
                    <Select aria-label="Select tab" onValueChange={(v) => setValue(v)} value={value}>
                        <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select tab" />
                        </SelectTrigger>
                        <SelectContent>
                            {[
                                { value: "overview", label: "Description" },
                                { value: "files", label: "Files", count: counts?.files ?? files?.length ?? 0 },
                                { value: "gallery", label: "Gallery", count: counts?.gallery ?? gallery.length },
                                { value: "blog", label: "Blog", count: counts?.posts ?? posts.length },
                                { value: "issues", label: "Issues", count: counts?.issues ?? issueTemplates.length },
                                { value: "activity", label: "Activity", count: counts?.activity ?? ganttFeatures.length },
                            ].map((tab) => (
                                <SelectItem key={tab.value} value={tab.value}>
                                    <span className="flex w-full items-center justify-between">
                                        <span>{tab.label}</span>
                                        {typeof tab.count === "number" ? <span className="ml-2 text-muted-foreground text-xs">{tab.count}</span> : null}
                                    </span>
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                {/* Desktop / tablet: full tab list */}
                <TabsList className="hidden h-9 w-full flex-wrap items-stretch gap-2 overflow-hidden text-muted-foreground sm:flex">
                    {[
                        { value: "overview", label: "Description" },
                        { value: "files", label: "Files", count: counts?.files ?? files?.length ?? 0 },
                        { value: "gallery", label: "Gallery", count: counts?.gallery ?? gallery.length },
                        { value: "blog", label: "Blog", count: counts?.posts ?? posts.length },
                        { value: "issues", label: "Issues", count: counts?.issues ?? issueTemplates.length },
                        { value: "activity", label: "Activity", count: counts?.activity ?? ganttFeatures.length },
                    ].map((tab, i, arr) => (
                        <div className="flex items-stretch" key={tab.value}>
                            <TabsTrigger
                                className="items-center justify-center gap-2 rounded-md px-3 py-1 text-sm data-[state=active]:bg-accent data-[state=active]:font-semibold data-[state=active]:text-accent-foreground data-[state=active]:shadow-sm data-[state=active]:ring-1 data-[state=active]:ring-accent/30"
                                value={tab.value}
                            >
                                <span className="flex items-center gap-2">
                                    <span>{tab.label}</span>
                                    {typeof tab.count === "number" ? <Badge variant="outline">{tab.count}</Badge> : null}
                                </span>
                            </TabsTrigger>
                            {i < arr.length - 1 ? <Separator className="mx-1 h-5" orientation="vertical" /> : null}
                        </div>
                    ))}
                </TabsList>
                {/* animated underline (only on sm+) */}
                <div className="absolute bottom-0 left-0 hidden h-0.5 bg-accent transition-[transform,width] duration-200 sm:block" ref={indicatorRef} />
            </div>
            <TabsContent className="space-y-4" value="overview">
                <ProjectOverviewTab files={files} gallery={gallery} posts={posts} project={project} timelineEntries={timelineEntries} />
            </TabsContent>
            <TabsContent value="files">
                {(() => {
                    const filesList = files ?? [];
                    const mainDownload: ProjectFile | undefined = filesList.find((f: ProjectFile) => f.channel?.toLowerCase() === "main") ?? filesList[0];
                    const optionalList: ProjectFile[] = filesList.filter((f: ProjectFile) => f !== mainDownload);
                    const channels: string[] = Array.from(new Set(optionalList.map((f) => f.channel).filter(Boolean) as string[]));
                    const optionalDownloads: OptionalDownloads =
                        channels.length > 1
                            ? ({ categories: channels.map((name) => ({ name, files: optionalList.filter((f) => f.channel === name) })) } as OptionalDownloads)
                            : ({ files: optionalList } as OptionalDownloads);

                    return <ProjectFilesTab mainDownload={mainDownload ?? ({} as ProjectFile)} optionalDownloads={optionalDownloads} />;
                })()}
            </TabsContent>
            <TabsContent value="gallery">
                <ProjectGalleryTab gallery={gallery} />
            </TabsContent>
            <TabsContent value="blog">
                <ProjectBlogTab posts={posts} />
            </TabsContent>
            <TabsContent value="issues">
                <ProjectIssuesTab
                    ganttFeatures={ganttFeatures}
                    ganttMarkers={ganttMarkers}
                    issueTemplates={issueTemplates}
                    kanbanCards={kanbanCards}
                    kanbanColumns={kanbanColumns}
                />
            </TabsContent>
            <TabsContent value="activity">
                <ProjectActivityTab timelineEntries={timelineEntries} />
            </TabsContent>
        </Tabs>
    );
}
