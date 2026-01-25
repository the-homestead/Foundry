export interface FileTreeNode {
    id: string;
    name: string;
    children?: FileTreeNode[];
}

export interface GanttFeature {
    id: string;
    name: string;
    startAt: Date;
    endAt: Date;
    status: { id: string; name: string; color: string };
    lane: string;
}

export interface GanttMarker {
    id: string;
    label: string;
    date: Date;
}

export interface ProjectTabsProps {
    project: {
        title: string;
        game: string;
        summary: string;
        version: string;
        updated: string;
        downloads: string;
        views: string;
        rating: string;
        description?: { content: string };
    };
    files: {
        name: string;
        version: string;
        size: string;
        uploaded: string;
        downloads: string;
        channel: string;
    }[];
    fileTree: FileTreeNode[];
    gallery: { title: string; tone: string; aspect: number }[];
    posts: { title: string; date: string; excerpt: string; comments: number }[];
    ganttFeatures: GanttFeature[];
    ganttMarkers: GanttMarker[];
    kanbanColumns: { id: string; name: string }[];
    kanbanCards: { id: string; name: string; column: string }[];
    issueTemplates: { title: string; description: string }[];
    timelineEntries: { title: string; content: React.ReactNode }[];
}
