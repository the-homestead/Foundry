import { ThemeSheet } from "@foundry/ui/components/theme/theme-sheet.js";
import { SidebarMenu, SidebarMenuButton, SidebarMenuItem } from "@foundry/ui/primitives/sidebar";
import type { LucideIcon } from "lucide-react";
import type { Locale } from "next-intl";
import type * as React from "react";
import LocaleSwitcher from "../locale-switcher";

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
} & React.ComponentPropsWithoutRef<typeof SidebarMenu>) {
    return (
        <SidebarMenu {...props}>
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
            <SidebarMenuItem className="px-2">
                <div className="flex w-full items-center gap-[5px]">
                    <ThemeSheet triggerClassName="h-8 w-8" />
                    <div className="flex min-w-0 flex-1">
                        <LocaleSwitcher changeLocaleAction={changeLocaleAction} locale={locale} triggerClassName="h-8 w-full min-w-0" variant="navbar" />
                    </div>
                </div>
            </SidebarMenuItem>
        </SidebarMenu>
    );
}
