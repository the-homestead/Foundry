import { SidebarGroup, SidebarGroupContent, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from "@foundry/ui/primitives/sidebar";
import type { LucideIcon } from "lucide-react";
import type { Locale } from "next-intl";
import type * as React from "react";
import LocaleSwitcher from "../locale-switcher";
import { ThemeSheet } from "../theme/theme-sheet";

export function NavSecondary({
    changeLocaleAction,
    locale,
    items,
    ...props
}: {
    items: {
        title: string;
        url: string;
        icon: LucideIcon;
    }[];
    changeLocaleAction: (locale: Locale) => Promise<void>;
    locale: Locale;
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
                    <LocaleSwitcher changeLocaleAction={changeLocaleAction} locale={locale} />
                </SidebarMenu>
            </SidebarGroupContent>
        </SidebarGroup>
    );
}
