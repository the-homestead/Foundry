import { CLI_PUBLIC_KEY, LAUNCHER_FREE, LAUNCHER_PREMIUM, ORG_CI_KEY } from "@foundry/types/permissions/api-key";

export const API_KEY_PROFILES = [
    {
        id: "cli-public",
        label: "CLI public",
        description: "Read-only downloads for CLI usage.",
        permissions: CLI_PUBLIC_KEY,
    },
    {
        id: "launcher-free",
        label: "Launcher (free)",
        description: "Read-only launcher access for free tier.",
        permissions: LAUNCHER_FREE,
    },
    {
        id: "launcher-premium",
        label: "Launcher (premium)",
        description: "Launcher access with premium entitlements.",
        permissions: LAUNCHER_PREMIUM,
    },
    {
        id: "org-ci",
        label: "Org CI",
        description: "Automation uploads scoped to org projects.",
        permissions: ORG_CI_KEY,
    },
];

export const ACCOUNT_TABS = ["profile", "security", "api-keys"] as const;

export const TAB_LABELS: Record<(typeof ACCOUNT_TABS)[number], string> = {
    profile: "Profile",
    security: "Security",
    "api-keys": "API keys",
};
