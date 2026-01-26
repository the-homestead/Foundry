/** biome-ignore-all lint/suspicious/noShadowRestrictedNames: IconName */
"use client";

import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from "@foundry/ui/primitives/sidebar";
import { useSession } from "@foundry/web/lib/auth-client";
import { BookOpen, Bot, Command, Frame, LifeBuoy, Map, PieChart, Send, Settings2, SquareTerminal } from "lucide-react";
import type { Locale } from "next-intl";
import type React from "react";
import { useEffect } from "react";
import { NavMain } from "./nav/nav-main";
import { NavProjects } from "./nav/nav-projects";
import { NavSecondary } from "./nav/nav-secondary";
import { NavUser } from "./nav/nav-user";

const dataMock = {
    user: {
        name: "shadcn",
        email: "m@example.com",
        avatar: "/avatars/shadcn.jpg",
    },
    navMain: [
        {
            title: "Playground",
            url: "#",
            icon: SquareTerminal,
            isActive: true,
            items: [
                {
                    title: "History",
                    url: "#",
                },
                {
                    title: "Starred",
                    url: "#",
                },
                {
                    title: "Settings",
                    url: "#",
                },
            ],
        },
        {
            title: "Models",
            url: "#",
            icon: Bot,
            items: [
                {
                    title: "Genesis",
                    url: "#",
                },
                {
                    title: "Explorer",
                    url: "#",
                },
                {
                    title: "Quantum",
                    url: "#",
                },
            ],
        },
        {
            title: "Documentation",
            url: "#",
            icon: BookOpen,
            items: [
                {
                    title: "Introduction",
                    url: "#",
                },
                {
                    title: "Get Started",
                    url: "#",
                },
                {
                    title: "Tutorials",
                    url: "#",
                },
                {
                    title: "Changelog",
                    url: "#",
                },
            ],
        },
        {
            title: "Settings",
            url: "#",
            icon: Settings2,
            items: [
                {
                    title: "General",
                    url: "#",
                },
                {
                    title: "Team",
                    url: "#",
                },
                {
                    title: "Billing",
                    url: "#",
                },
                {
                    title: "Limits",
                    url: "#",
                },
            ],
        },
    ],
    navSecondary: [
        {
            title: "Support",
            url: "#",
            icon: LifeBuoy,
        },
        {
            title: "Feedback",
            url: "#",
            icon: Send,
        },
    ],
    projects: [
        {
            name: "Design Engineering",
            url: "#",
            icon: Frame,
        },
        {
            name: "Sales & Marketing",
            url: "#",
            icon: PieChart,
        },
        {
            name: "Travel",
            url: "#",
            icon: Map,
        },
    ],
};

export function AppSidebar({
    changeLocaleAction,
    locale,
    ...props
}: React.ComponentProps<typeof Sidebar> & { changeLocaleAction: (locale: Locale) => Promise<void>; locale: Locale }) {
    const { data, isPending, refetch } = useSession();

    // Ensure we try to refresh the session after a redirect-based login flow
    useEffect(() => {
        if (!(isPending || data?.user)) {
            // best-effort refetch to pick up newly-set session cookie
            try {
                refetch?.();
            } catch (_err) {
                // ignore
            }
        }
        // run once on mount
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [data?.user, isPending, refetch]);
    const sessionUser = data?.user;
    const user = sessionUser
        ? {
              name: sessionUser.name ?? sessionUser.username ?? "User",
              email: sessionUser.email ?? "",
              avatar: sessionUser.image ?? "",
          }
        : {
              name: isPending ? "Loading..." : "Guest",
              email: "",
              avatar: "",
          };

    return (
        <Sidebar variant="inset" {...props}>
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton asChild size="lg">
                            <a href="/">
                                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                                    <Command className="size-4" />
                                </div>
                                <div className="grid flex-1 text-left text-sm leading-tight">
                                    <span className="truncate font-medium">Foundry</span>
                                    <span className="truncate text-xs">Homestead Systems</span>
                                </div>
                            </a>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>
            <SidebarContent>
                <NavMain items={dataMock.navMain} />
                <NavProjects projects={dataMock.projects} />
                <NavSecondary changeLocaleAction={changeLocaleAction} className="mt-auto" items={dataMock.navSecondary} locale={locale} />
            </SidebarContent>
            <SidebarFooter>
                <NavUser user={user} />
            </SidebarFooter>
        </Sidebar>
    );
}
