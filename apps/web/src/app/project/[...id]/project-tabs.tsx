import { Tabs, TabsContent, TabsList, TabsTrigger } from "@foundry/ui/primitives/tabs";
import { ProjectActivityTab } from "./tabs/project-activity-tab";
import { ProjectBlogTab } from "./tabs/project-blog-tab";
import { ProjectFilesTab } from "./tabs/project-files-tab";
import { ProjectGalleryTab } from "./tabs/project-gallery-tab";
import { ProjectIssuesTab } from "./tabs/project-issues-tab";
import { ProjectOverviewTab } from "./tabs/project-overview-tab";
import type { ProjectTabsProps } from "./tabs/project-tabs.types";

export function ProjectTabs({
    project,
    files,
    fileTree,
    gallery,
    posts,
    ganttFeatures,
    ganttMarkers,
    kanbanColumns,
    kanbanCards,
    issueTemplates,
    timelineEntries,
}: ProjectTabsProps) {
    return (
        <Tabs className="space-y-4" defaultValue="overview">
            <TabsList className="flex w-full flex-wrap justify-start gap-2 bg-muted p-1">
                <TabsTrigger value="overview">Description</TabsTrigger>
                <TabsTrigger value="files">Files</TabsTrigger>
                <TabsTrigger value="gallery">Gallery</TabsTrigger>
                <TabsTrigger value="blog">Blog</TabsTrigger>
                <TabsTrigger value="issues">Issues</TabsTrigger>
                <TabsTrigger value="activity">Activity</TabsTrigger>
            </TabsList>
            <TabsContent className="space-y-4" value="overview">
                <ProjectOverviewTab files={files} gallery={gallery} posts={posts} project={project} timelineEntries={timelineEntries} />
            </TabsContent>
            <TabsContent value="files">
                <ProjectFilesTab files={files} fileTree={fileTree} />
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
