import { SidebarGroup, SidebarGroupContent, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from "@foundry/ui/primitives/sidebar";
import type { LucideIcon } from "lucide-react";
import type * as React from "react";
import { ThemeSheet } from "../theme/theme-sheet";

export function NavSecondary({
    items,
    ...props
}: {
    items: {
        title: string;
        url: string;
        icon: LucideIcon;
    }[];
} & React.ComponentPropsWithoutRef<typeof SidebarGroup>) {
    return (
        <SidebarGroup {...props}>
            <SidebarGroupContent>
                <SidebarMenu>
                    {items.map((item) => (
                        <SidebarMenuItem key={item.title}>
                            <SidebarMenuButton asChild size="sm">
                                <a href={item.url}>
                                    <item.icon />
                                    <span>{item.title}</span>
                                </a>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    ))}
                    <ThemeSheet />
                </SidebarMenu>
            </SidebarGroupContent>
        </SidebarGroup>
    );
}
