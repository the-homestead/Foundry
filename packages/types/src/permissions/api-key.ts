/* ============================
   Core Types
============================ */

export type Action = "read" | "create" | "update" | "delete" | "admin" | "download" | "upload" | "premium" | "*";

export type Scope = "global" | "org" | "project";

export interface ScopedPermission {
    actions: Action[];
    scope: Scope;
}

export type Permissions = Record<string, ScopedPermission[]>;

export type FlatPermission = `${string}:${Action}`;

export interface ApiKeyPermissions {
    [resource: string]: Action[];
}

/* ============================
   Resource Permission Map
============================ */

export const PERMISSION_DEFINITIONS: Permissions = {
    // Projects (mods/resources)
    projects: [
        { actions: ["read", "download"], scope: "global" },
        { actions: ["create", "update", "delete", "upload"], scope: "org" },
        { actions: ["admin"], scope: "project" },
    ],

    projectVersions: [
        { actions: ["read", "download"], scope: "global" },
        { actions: ["create", "update", "delete", "upload"], scope: "project" },
    ],

    files: [
        { actions: ["read", "download"], scope: "global" },
        { actions: ["upload", "delete"], scope: "project" },
    ],

    // Orgs & Teams
    organizations: [
        { actions: ["read"], scope: "global" },
        { actions: ["update", "admin"], scope: "org" },
    ],

    teams: [
        { actions: ["read"], scope: "org" },
        { actions: ["create", "update", "delete"], scope: "org" },
    ],

    teamMembers: [
        { actions: ["read"], scope: "org" },
        { actions: ["create", "delete"], scope: "org" },
    ],

    // Accounts & Auth
    users: [{ actions: ["read"], scope: "global" }],

    accounts: [
        { actions: ["read", "update"], scope: "org" },
        { actions: ["admin"], scope: "global" },
    ],

    apiKeys: [
        { actions: ["read", "create", "delete"], scope: "org" },
        { actions: ["admin"], scope: "global" },
    ],

    // Billing & Premium
    billing: [
        { actions: ["read"], scope: "org" },
        { actions: ["update", "admin"], scope: "org" },
    ],

    premium: [
        { actions: ["premium"], scope: "project" },
        { actions: ["premium"], scope: "org" },
    ],

    // Automation Clients
    cli: [{ actions: ["download"], scope: "global" }],

    launcher: [
        { actions: ["read", "download"], scope: "global" },
        { actions: ["premium"], scope: "project" },
    ],
};

/* ============================
   Permission Check
============================ */

const SCOPE_RANK: Record<Scope, number> = {
    global: 3,
    org: 2,
    project: 1,
};

export function hasPermission(
    perms: Permissions,
    resource: string,
    action: Action,
    requiredScope: Scope,
    scopeId?: string,
    context?: {
        projectId?: string;
        orgId?: string;
    }
): boolean {
    const resourcePerms = perms[resource];
    if (!resourcePerms) {
        return false;
    }

    return resourcePerms.some((entry) => {
        // Action match
        const actionMatches = entry.actions.includes("*") || entry.actions.includes(action);

        if (!actionMatches) {
            return false;
        }

        // Scope strength check (global > org > project)
        if (SCOPE_RANK[entry.scope] < SCOPE_RANK[requiredScope]) {
            return false;
        }

        // Scope ID validation (only when needed)
        if (requiredScope === "org") {
            return Boolean(context?.orgId && context.orgId === scopeId);
        }

        if (requiredScope === "project") {
            return Boolean(context?.projectId && context.projectId === scopeId);
        }

        // requiredScope === "global"
        return true;
    });
}

/* ============================
   Flatten Permissions
   (For tokens / storage / UI)
============================ */

export function flattenPermissions(perms: Permissions): FlatPermission[] {
    return Object.entries(perms).flatMap(([resource, entries]) => entries.flatMap((entry) => entry.actions.map((action) => `${resource}:${action}` as FlatPermission)));
}

/* ============================
   API Key Profiles
============================ */

// Public CLI (unauthenticated downloads)
export const CLI_PUBLIC_KEY: Permissions = {
    projects: [{ actions: ["read", "download"], scope: "global" }],
    projectVersions: [{ actions: ["read", "download"], scope: "global" }],
    files: [{ actions: ["read", "download"], scope: "global" }],
    cli: [{ actions: ["download"], scope: "global" }],
};

// Launcher (free tier)
export const LAUNCHER_FREE: Permissions = {
    projects: [{ actions: ["read", "download"], scope: "global" }],
    projectVersions: [{ actions: ["read", "download"], scope: "global" }],
    files: [{ actions: ["read", "download"], scope: "global" }],
    launcher: [{ actions: ["read", "download"], scope: "global" }],
};

// Launcher (premium tier)
export const LAUNCHER_PREMIUM: Permissions = {
    projects: [{ actions: ["read", "download"], scope: "global" }],
    projectVersions: [{ actions: ["read", "download"], scope: "global" }],
    files: [{ actions: ["read", "download"], scope: "global" }],
    launcher: [
        { actions: ["read", "download"], scope: "global" },
        { actions: ["premium"], scope: "project" },
    ],
    premium: [{ actions: ["premium"], scope: "project" }],
};

// Org CI / Automation Upload Key
export const ORG_CI_KEY: Permissions = {
    projects: [{ actions: ["read"], scope: "org" }],
    projectVersions: [{ actions: ["create", "upload"], scope: "project" }],
    files: [{ actions: ["upload"], scope: "project" }],
};

/* ============================
   Role Templates (Optional)
============================ */

export const ROLE_OWNER: Permissions = {
    projects: [{ actions: ["*"], scope: "org" }],
    projectVersions: [{ actions: ["*"], scope: "project" }],
    files: [{ actions: ["*"], scope: "project" }],
    teams: [{ actions: ["*"], scope: "org" }],
    teamMembers: [{ actions: ["*"], scope: "org" }],
    billing: [{ actions: ["*"], scope: "org" }],
    apiKeys: [{ actions: ["*"], scope: "org" }],
};

export const ROLE_MAINTAINER: Permissions = {
    projects: [{ actions: ["read", "update", "upload"], scope: "org" }],
    projectVersions: [{ actions: ["read", "create", "upload"], scope: "project" }],
    files: [{ actions: ["upload"], scope: "project" }],
};

export const ROLE_VIEWER: Permissions = {
    projects: [{ actions: ["read", "download"], scope: "global" }],
    projectVersions: [{ actions: ["read", "download"], scope: "global" }],
    files: [{ actions: ["read", "download"], scope: "global" }],
};

/* ============================
   Merge Helper
   (User roles + API key perms)
============================ */

export function mergePermissions(...sets: Permissions[]): Permissions {
    const out: Permissions = {};

    for (const perms of sets) {
        for (const [resource, entries] of Object.entries(perms)) {
            if (!out[resource]) {
                out[resource] = [];
            }
            out[resource].push(...entries);
        }
    }

    return out;
}

/* ============================
   Better Auth API Key Adapter
============================ */

export function toApiKeyPermissions(perms: Permissions): ApiKeyPermissions {
    const out: ApiKeyPermissions = {};

    for (const [resource, entries] of Object.entries(perms)) {
        const actions = new Set<Action>();
        for (const entry of entries) {
            for (const action of entry.actions) {
                actions.add(action);
            }
        }
        out[resource] = Array.from(actions);
    }

    return out;
}
