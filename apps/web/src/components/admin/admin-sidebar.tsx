"use client";

import { ShieldExclamationIcon } from "@foundry/ui/icons";
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupLabel,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarRail,
} from "@foundry/ui/primitives/sidebar";
import { NavUser } from "@foundry/web/components/admin/nav-user";
import { Link, usePathname } from "@foundry/web/i18n/navigation";
import { Gamepad2, LayoutDashboard, Users } from "lucide-react";
import type * as React from "react";

export function AdminSidebar({ user, ...props }: React.ComponentProps<typeof Sidebar> & { user: { name: string; email: string; image?: string | null } }) {
    const pathname = usePathname("admin");

    // Handle potential null image by defaulting to undefined
    const safeUser = {
        ...user,
        image: user.image ?? undefined,
    };

    return (
        <Sidebar collapsible="icon" variant="inset" {...props}>
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton asChild size="lg">
                            <Link href="/adash">
                                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                                    <ShieldExclamationIcon className="size-4" />
                                </div>
                                <div className="grid flex-1 text-left text-sm leading-tight">
                                    <span className="truncate font-semibold">Foundry Admin</span>
                                    <span className="truncate text-xs">Management Console</span>
                                </div>
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>
            <SidebarContent>
                <SidebarGroup>
                    <SidebarGroupLabel>Platform</SidebarGroupLabel>
                    <SidebarMenu>
                        <SidebarMenuItem>
                            <SidebarMenuButton asChild isActive={pathname === "/adash"}>
                                <Link href="/adash">
                                    <LayoutDashboard />
                                    <span>Dashboard</span>
                                </Link>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                        <SidebarMenuItem>
                            <SidebarMenuButton asChild isActive={pathname?.startsWith("/adash/users")}>
                                <Link href="/adash/users">
                                    <Users />
                                    <span>Users & Auth</span>
                                </Link>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                        <SidebarMenuItem>
                            <SidebarMenuButton asChild isActive={pathname?.startsWith("/adash/games")}>
                                <Link href="/adash/games">
                                    <Gamepad2 />
                                    <span>Games</span>
                                </Link>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    </SidebarMenu>
                </SidebarGroup>
            </SidebarContent>
            <SidebarFooter>
                <NavUser user={safeUser} />
            </SidebarFooter>
            <SidebarRail />
        </Sidebar>
    );
}
