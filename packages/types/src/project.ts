// Project blog/news post
export interface ProjectPost {
    id: string;
    project_id: string;
    title: string;
    date: string; // ISO 8601
    excerpt: string;
    content: string;
    comments: number;
}

// Project issue template
export interface ProjectIssueTemplate {
    id: string;
    project_id: string;
    title: string;
    description: string;
}

// Project activity/timeline entry
export interface ProjectActivityEntry {
    id: string;
    project_id: string;
    title: string;
    content: string;
    created_at: string; // ISO 8601
}

// Project additional link
export interface ProjectLink {
    id: string;
    project_id: string;
    label: string;
    url: string;
}

// Project creator/contributor
export interface ProjectCreator {
    id: string;
    project_id: string;
    name: string;
    role: string;
    avatar_url?: string;
}

import type { Game } from "./games/game";
import type { MinecraftVersion } from "./games/minecraft";

export interface Project {
    /**
     * A unique identifier for the project.
     * UUID v4 format.
     */
    id: string;
    /**
     * A URL-friendly unique identifier for the project.
     * Regex: `^[\w!@$()`.+,"\-']{3,64}$`
     */
    slug: string;
    // The human-readable name of the project.
    name: string;
    // The metadata associated with the project.
    metadata: ProjectMetadata;
    // The categories associated with the project. Each category is represented as a string identifier.
    categories: string[];
    // The sub categories associated with the project. Each category is represented as a string identifier.
    sub_categories: string[];
    // A brief description of the project.
    description: string;
    // The license under which the project is released.
    license?: string;
    // The version of the project. Stored as a string to accommodate various versioning schemes.
    version: string;

    // An array of links in key, value format related to the project (e.g., homepage, repository, documentation, donation, discord).
    links: Record<string, string>;
    status: typeof ProjectStatus;
    type: typeof ProjectType;
    body: string;
    icon_url?: string;
    banner_url?: string;
    color?: string;
    created_at: string;
    updated_at: string;
    owner: ProjectOwner;
}
// Project File (downloadable, release, etc.)
export interface ProjectFile {
    id: string;
    project_id: string;
    name: string;
    version: string;
    size: string;
    uploaded: string; // ISO 8601
    downloads: number;
    unique_downloads?: number;
    channel: string;
    last_downloaded?: string; // ISO 8601
    banner_url?: string;
    dependencies?: ProjectFileDependency[];
}

export interface ProjectFileDependency {
    url: string;
    name: string;
    version: string;
    gameVersion?: string;
}

// File tree node for archive browsing
export interface FileTreeNode {
    id: string;
    name: string;
    children?: FileTreeNode[];
}

// Gantt chart feature/task
export interface GanttFeature {
    id: string;
    name: string;
    startAt: string; // ISO 8601
    endAt: string; // ISO 8601
    status: { id: string; name: string; color: string };
    lane: string;
    metadata?: Record<string, unknown>;
}

export interface GanttMarker {
    id: string;
    label: string;
    date: string; // ISO 8601
}

// Kanban board
export interface KanbanColumn {
    id: string;
    name: string;
}

export interface KanbanCard {
    id: string;
    name: string;
    column: string;
}

// Gallery image
export interface ProjectGalleryImage {
    title: string;
    tone: string;
    aspect: number;
    image?: string;
}
export interface KanbanCard {
    id: string;
    name: string;
    column: string;
}

// Gallery image
export interface ProjectGalleryImage {
    title: string;
    tone: string;
    aspect: number;
    image?: string;
}

export interface ProjectMetadata {
    client_side: boolean;
    server_side: boolean;
    client_server_side: boolean;
    monetization_status: typeof ProjectMonetizationStatus;
    moderation: ProjectModeration;
    // Statistics related to the project.
    stats: ProjectStats;
}

export const ProjectStatus = {
    Unapproved: 0, // Default status for new projects
    Approved: 1, // Indicates the project has been reviewed and approved
    Rejected: 2, // Indicates the project has been reviewed and rejected
    Archived: 3, // Indicates the project is no longer active but kept for record-keeping
    Draft: 4, // Indicates the project is in draft state and not yet submitted for review
    Processing: 5, // Indicates the project is being processed (e.g., during submission or update)
    Scheduled: 6, // Indicates the project is scheduled for future publication or action
    Private: 7, // Indicates the project is private and not publicly accessible
    Unlisted: 8, // Indicates the project is unlisted but can be accessed via direct link
    Published: 9, // Indicates the project is published and publicly accessible
};

export const ProjectType = {
    Plugin: "plugin", // A plugin for a specific platform
    Mod: "mod", // A modification for a game
    ResourcePack: "resource_pack", // A resource pack for a game
    Shader: "shader", // A shader pack for a game
    Save: "save", // A map/save for a game
    DataPack: "data_pack", // A data pack for a game
    Tool: "tool", // A tool or utility for development or management
    Library: "library", // A library for use in other projects
    Game: "game", // A standalone game
    Customization: "customization", // A customization option (e.g., skin, texture)
    Other: "other", // Any other type not covered above
};

export interface ProjectStats {
    downloads: number; // Total number of downloads
    unique_downloads: number; // Total number of unique downloads
    views: number; // Total number of views
    hearts: number; // Total number of times favorited/hearted
}

export interface ProjectOwner {
    id: string; // Unique identifier for the owner (e.g., UUID)
    organization_id?: string; // Optional organization identifier if the owner is part of an organization
    team_id?: string; // Optional team identifier if the owner is part of a team from a organization
    type: "user" | "organization" | "team"; // Type of owner
}

export const ProjectMonetizationStatus = {
    None: 0, // No monetization
    Monetized: 1, // Project is monetized
    Demonetized: 2, // Project was monetized but is no longer
    ForceDemonetized: 3, // Project is forcibly demonetized by the platform
};

export interface ProjectModeration {
    is_flagged: boolean; // Indicates if the project has been flagged for review
    flagged_reason?: string; // Reason for flagging, if applicable
    moderator_notes?: string; // Notes from moderators regarding the project
    banner?: {
        status: boolean; // Indicates if a banner is active
        message: string; // Message to be displayed in the banner
        color?: string; // Optional color for the banner (e.g., hex code)
        created_at: string; // ISO 8601 date string when the banner was created
        updated_at: string; // ISO 8601 date string when the banner was last updated
        time_till_removal?: string; // Optional ISO 8601 date string indicating when the banner will be removed
    };
}

export interface ProjectGameAssociation {
    MinecraftVersions?: MinecraftVersion[]; // List of Minecraft versions associated with the project
    game?: Game;
}
