"use client";

import { useTheme } from "next-themes";
import { Toaster as Sonner, type ToasterProps } from "sonner";

// icons (only from packages/ui/src/components/icons)
import { CheckBadgeIcon } from "../components/icons/check-badge";
import { InformationCircleIcon } from "../components/icons/information-circle";
import { ExclamationCircleIcon } from "../components/icons/exclamation-circle";
import { XCircleIcon } from "../components/icons/x-circle";
import { ArrowPathIcon } from "../components/icons/arrow-path";
import { BugAntIcon } from "../components/icons/bug-ant";
import { EllipsisHorizontalCircleIcon } from "../components/icons/ellipsis-horizontal-circle";

/**
 * Enhanced Toaster wrapper for the project —
 * - uses only icons from packages/ui/src/components/icons
 * - provides richer colors, subtle animations, a duration progress bar and action-friendly styling
 * - keeps Sonner API intact; call toast.*, or pass { className: 'debug' } to get debug-style toasts
 */
const Toaster = ({ ...props }: ToasterProps) => {
    const { theme = "system" } = useTheme();

    return (
        <Sonner
            // keep a stable host class so our CSS can target Sonner internals
            className="toaster group"
            // richer, project-specific icon set (only from our icons folder)
            icons={{
                success: <CheckBadgeIcon className="h-5 w-5" />,
                info: <InformationCircleIcon className="h-5 w-5" />,
                warning: <ExclamationCircleIcon className="h-5 w-5" />,
                error: <XCircleIcon className="h-5 w-5" />,
                loading: <ArrowPathIcon className="h-5 w-5 animate-spin" />,
                // (leave `default` to Sonner's fallback)
            }}
            // enable Sonner's richColors so variant accents are visible
            richColors
            // custom CSS variables (keeps theme-aware colors)
            style={
                {
                    "--normal-bg": "var(--popover)",
                    "--normal-text": "var(--popover-foreground)",
                    "--normal-border": "var(--border)",
                    "--border-radius": "var(--radius)",
                } as React.CSSProperties
            }
            theme={theme as ToasterProps["theme"]}
            {...props}
        />
    );
};

export { Toaster };
