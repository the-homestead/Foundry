import {
    type GameSelect,
    getProjectActivity,
    getProjectBySlug,
    getProjectCreators,
    getProjectFiles,
    getProjectGallery,
    getProjectGantt,
    getProjectGanttMarkers,
    getProjectIssueTemplates,
    getProjectKanbanCards,
    getProjectKanbanColumns,
    getProjectLinks,
    getProjectPosts,
    getProjectStats,
    type ProjectCreatorSelect,
    type ProjectFileSelect,
    type ProjectGallerySelect,
    type ProjectGanttMarkerSelect,
    type ProjectGanttSelect,
    type ProjectLinkSelect,
    type ProjectPostSelect,
    type ProjectSelect,
    type ProjectStats,
} from "@foundry/database";
import { auth } from "@foundry/web/lib/auth";
import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { ProjectHeader } from "./project-header";
import { ProjectSidebar } from "./project-sidebar";
import { ProjectTabs } from "./project-tabs";

interface ProjectPageProps {
    params: Promise<{ id: string[] }>;
}

// Transform database types to UI types
function transformProjectForHeader(project: ProjectSelect, game: GameSelect | null, stats: ProjectStats, isOwner: boolean) {
    const gameImages = game?.images as { icon?: string } | null;
    return {
        title: project.name,
        game: game?.name ?? "Unknown Game",
        summary: project.description,
        version: project.version,
        updated: new Date(project.updated_at).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }),
        downloads: stats.totalDownloads.toLocaleString(),
        views: "0", // TODO: Add views tracking to project_stats table
        rating: "0", // TODO: Add ratings system
        gameImageUrl: gameImages?.icon ?? null,
        projectSlug: project.slug,
        isOwner,
    };
}

function transformProjectForTabs(project: ProjectSelect, game: GameSelect | null) {
    return {
        title: project.name,
        game: game?.name ?? "Unknown Game",
        summary: project.description,
        version: project.version,
        updated: new Date(project.updated_at).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }),
        downloads: "0",
        views: "0",
        rating: "0",
        description: { content: project.body },
    };
}

function transformProjectForSidebar(_project: ProjectSelect) {
    return {
        compatibility: {
            status: "Unknown", // TODO: Add to project metadata or separate table
            notes: "Compatibility information not available",
            matrix: [],
        },
    };
}

function transformFiles(files: ProjectFileSelect[]) {
    return files.map((file) => ({
        name: file.name,
        version: file.version,
        size: file.size,
        uploaded: new Date(file.uploaded).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }),
        downloads: file.downloads.toString(),
        uniqueDownloads: file.unique_downloads?.toString(),
        channel: file.channel,
        lastDownloaded: file.last_downloaded ? new Date(file.last_downloaded).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : undefined,
        bannerURL: file.banner_url ?? undefined,
        dependencies: Array.isArray(file.dependencies) ? (file.dependencies as Array<{ url: string; name: string; version: string; gameVersion?: string }>) : undefined,
    }));
}

function transformGallery(gallery: ProjectGallerySelect[]) {
    return gallery.map((item) => ({
        title: item.title,
        tone: item.tone,
        // Convert aspect ratio from integer back to decimal (stored as aspect * 100)
        aspect: item.aspect / 100,
        image: item.image ?? undefined,
    }));
}

function transformGantt(gantt: ProjectGanttSelect[]) {
    return gantt.map((item) => ({
        id: item.id,
        name: item.name,
        startAt: new Date(item.start_at),
        endAt: new Date(item.end_at),
        status: (item.status as { id: string; name: string; color: string }) ?? { id: "unknown", name: "Unknown", color: "#gray" },
        lane: item.lane,
    }));
}

function transformGanttMarkers(markers: ProjectGanttMarkerSelect[]) {
    return markers.map((marker) => ({
        id: marker.id,
        label: marker.label,
        date: new Date(marker.date),
    }));
}

function transformPosts(posts: ProjectPostSelect[]) {
    return posts.map((post) => ({
        title: post.title,
        date: new Date(post.date).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }),
        excerpt: post.excerpt,
        content: post.content,
        comments: post.comments,
        author: "Author", // TODO: Join with users table using author_id or add to posts table
        tags: [], // TODO: Add tags to posts table
        commentList: [],
    }));
}

function transformCreators(creators: ProjectCreatorSelect[]) {
    return creators.map((creator) => ({
        name: creator.name,
        role: creator.role,
        avatar: creator.avatar_url ?? "",
    }));
}

function transformLinks(links: ProjectLinkSelect[]) {
    return links.map((link) => ({
        label: link.label,
        href: link.url,
    }));
}

async function getProjectData(slugOrId: string) {
    // Get project with game data
    const result = await getProjectBySlug(slugOrId);

    if (!result) {
        return null;
    }

    const { project, game } = result;

    // Fetch all related data in parallel
    const [files, ganttFeatures, ganttMarkers, kanbanColumns, kanbanCards, gallery, posts, issueTemplates, activity, links, creators, stats] = await Promise.all([
        getProjectFiles(project.id),
        getProjectGantt(project.id),
        getProjectGanttMarkers(project.id),
        getProjectKanbanColumns(project.id),
        getProjectKanbanCards(project.id),
        getProjectGallery(project.id),
        getProjectPosts(project.id),
        getProjectIssueTemplates(project.id),
        getProjectActivity(project.id),
        getProjectLinks(project.id),
        getProjectCreators(project.id),
        getProjectStats(project.id),
    ]);

    return {
        project,
        game,
        stats,
        files,
        ganttFeatures,
        ganttMarkers,
        kanbanColumns,
        kanbanCards,
        gallery,
        posts,
        issueTemplates,
        activity,
        links,
        creators,
    };
}

export default async function ProjectPage({ params }: ProjectPageProps) {
    const { id } = await params;
    const slug = id?.[0]; // First segment is the project slug

    if (!slug) {
        notFound();
    }

    const data = await getProjectData(slug);

    if (!data) {
        notFound();
    }

    const { project, game, stats, files, ganttFeatures, ganttMarkers, kanbanColumns, kanbanCards, gallery, posts, issueTemplates, activity, links, creators } = data;

    // Check if current user is the owner
    const session = await auth.api.getSession({ headers: await headers() });
    const isOwner = session?.user?.id === project.owner_id;

    // Transform database types to UI types
    const transformedProject = {
        header: transformProjectForHeader(project, game, stats, isOwner),
        tabs: transformProjectForTabs(project, game),
        sidebar: transformProjectForSidebar(project),
    };

    const transformedFiles = transformFiles(files);
    const transformedGallery = transformGallery(gallery);
    const transformedGantt = transformGantt(ganttFeatures);
    const transformedGanttMarkers = transformGanttMarkers(ganttMarkers);
    const transformedPosts = transformPosts(posts);
    const transformedCreators = transformCreators(creators);
    const transformedLinks = transformLinks(links);

    // Transform activity entries into timeline format for the UI
    const timelineEntries = activity.map((item) => ({
        title: item.title,
        content: item.content,
    }));

    return (
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
            {/* Unapproved Banner */}

            <div className="m-24 grid grid-cols-1 gap-6 xl:grid-cols-[1.1fr_360px]">
                <div className="space-y-4">
                    <ProjectHeader project={transformedProject.header} />
                    <ProjectTabs
                        canEdit={isOwner}
                        counts={{
                            files: transformedFiles.length,
                            gallery: transformedGallery.length,
                            posts: transformedPosts.length,
                            issues: issueTemplates.length,
                            activity: activity.length,
                        }}
                        files={transformedFiles}
                        gallery={transformedGallery}
                        ganttFeatures={transformedGantt}
                        ganttMarkers={transformedGanttMarkers}
                        issueTemplates={issueTemplates}
                        kanbanCards={kanbanCards}
                        kanbanColumns={kanbanColumns}
                        posts={transformedPosts}
                        project={transformedProject.tabs}
                        projectSlug={project.slug}
                        timelineEntries={timelineEntries}
                    />
                </div>
                <ProjectSidebar creators={transformedCreators} links={transformedLinks} project={transformedProject.sidebar} status={project.status} />
            </div>
        </div>
    );
}
