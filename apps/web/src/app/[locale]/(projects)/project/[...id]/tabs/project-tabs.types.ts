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

export interface BlogComment {
    id: string;
    author: string;
    avatar?: string;
    content: string;
    date: string;
}

export interface ProjectFile {
    name: string;
    version: string;
    size: string;
    uploaded: string;
    downloads: string;
    channel: string;
    description?: string;
    uniqueDownloads?: string;
    lastDownloaded?: string;
    bannerURL?: string;
    dependencies?: {
        url: string;
        name: string;
        version: string;
        gameVersion?: string;
    }[];
    /** Optional per-file file tree (e.g., contents of a zip) */
    fileTree?: FileTreeNode[];
}

export interface OptionalDownloads {
    // If categories is undefined, show as a simple list
    categories?: {
        name: string;
        files: ProjectFile[];
    }[];
    // If no categories, use files
    files?: ProjectFile[];
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
    files?: ProjectFile[];
    mainDownload?: ProjectFile;
    optionalDownloads?: OptionalDownloads;
    gallery: { title: string; tone: string; aspect: number; image?: string }[];
    posts: {
        title: string;
        date: string;
        excerpt: string;
        comments: number;
        author: string;
        tags: string[];
        commentList?: BlogComment[];
    }[];
    ganttFeatures: GanttFeature[];
    ganttMarkers: GanttMarker[];
    kanbanColumns: { id: string; name: string }[];
    kanbanCards: { id: string; name: string; column: string }[];
    issueTemplates: { title: string; description: string }[];
    timelineEntries: { title: string; content: React.ReactNode }[];
    counts?: {
        files?: number;
        gallery?: number;
        posts?: number;
        issues?: number;
        activity?: number;
    };
}
