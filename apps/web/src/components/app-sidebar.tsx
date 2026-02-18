/** biome-ignore-all lint/suspicious/noShadowRestrictedNames: IconName */
"use client";

import { NavUser } from "@foundry/ui/components";
import { CloudIcon } from "@foundry/ui/icons";
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from "@foundry/ui/primitives/sidebar";
import { useSession } from "@foundry/web/lib/auth-client";
import { BookOpen, Bot, Command, Frame, LifeBuoy, Map, PieChart, Send, Settings2 } from "lucide-react";
import type { Locale } from "next-intl";
import { useTranslations } from "next-intl";
import type React from "react";
import { useEffect } from "react";
import { NavMain } from "./nav/nav-main";
import { NavSecondary } from "./nav/nav-secondary";

export function AppSidebar({
    changeLocaleAction,
    locale,
    ...props
}: React.ComponentProps<typeof Sidebar> & { changeLocaleAction: (locale: Locale) => Promise<void>; locale: Locale }) {
    const t = useTranslations("Sidebar");
    const common = useTranslations("common");
    const { data, isPending, refetch } = useSession();

    // Ensure we try to refresh the session after a redirect-based login flow
    useEffect(() => {
        // Run once on mount. Best-effort refetch to pick up newly-set session cookie
        // (don't depend on unstable `refetch` identity to avoid repeated calls).
        try {
            // Only attempt a refetch if there is no user yet
            if (!data?.user) {
                refetch?.();
            }
        } catch (_err) {
            // ignore
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [data?.user, refetch]);
    const sessionUser = data?.user;
    const user = sessionUser
        ? {
              name: sessionUser.name ?? sessionUser.username ?? t("user.fallbackName"),
              email: sessionUser.email ?? "",
              avatar: sessionUser.image ?? "",
          }
        : {
              name: isPending ? common("states.loading") : t("user.guest"),
              email: "",
              avatar: "",
          };

    const navData = {
        navMain: [
            {
                title: t("nav.mods.title"),
                url: "#",
                icon: CloudIcon,
                isActive: true,
                items: [
                    { title: t("nav.mods.items.fabric"), url: "#" },
                    { title: t("nav.mods.items.neoforge"), url: "#" },
                    { title: t("nav.mods.items.forge"), url: "#" },
                    { title: t("nav.mods.items.babric"), url: "#" },
                ],
            },
            {
                title: t("nav.resourcePacks.title"),
                url: "#",
                icon: Bot,
                items: [
                    { title: t("nav.resourcePacks.items.addons"), url: "#" },
                    { title: t("nav.resourcePacks.items.combat"), url: "#" },
                    { title: t("nav.resourcePacks.items.cursed"), url: "#" },
                    { title: t("nav.resourcePacks.items.decoration"), url: "#" },
                    { title: t("nav.resourcePacks.items.entities"), url: "#" },
                    { title: t("nav.resourcePacks.items.equipment"), url: "#" },
                    { title: t("nav.resourcePacks.items.environment"), url: "#" },
                    { title: t("nav.resourcePacks.items.fonts"), url: "#" },
                    { title: t("nav.resourcePacks.items.gui"), url: "#" },
                    { title: t("nav.resourcePacks.items.highResolution"), url: "#" },
                    { title: t("nav.resourcePacks.items.huds"), url: "#" },
                    { title: t("nav.resourcePacks.items.items"), url: "#" },
                    { title: t("nav.resourcePacks.items.loadscreens"), url: "#" },
                    { title: t("nav.resourcePacks.items.localization"), url: "#" },
                    { title: t("nav.resourcePacks.items.modded"), url: "#" },
                    { title: t("nav.resourcePacks.items.models"), url: "#" },
                    { title: t("nav.resourcePacks.items.realistic"), url: "#" },
                    { title: t("nav.resourcePacks.items.simplistic"), url: "#" },
                    { title: t("nav.resourcePacks.items.themed"), url: "#" },
                    { title: t("nav.resourcePacks.items.tweaks"), url: "#" },
                    { title: t("nav.resourcePacks.items.utility"), url: "#" },
                    { title: t("nav.resourcePacks.items.vanillaEnhancements"), url: "#" },
                ],
            },
            {
                title: t("nav.shaders.title"),
                url: "#",
                icon: BookOpen,
                items: [
                    { title: t("nav.shaders.items.performance"), url: "#" },
                    { title: t("nav.shaders.items.realistic"), url: "#" },
                    { title: t("nav.shaders.items.cinematic"), url: "#" },
                    { title: t("nav.shaders.items.vanillaPlus"), url: "#" },
                    { title: t("nav.shaders.items.stylized"), url: "#" },
                    { title: t("nav.shaders.items.lightweight"), url: "#" },
                    { title: t("nav.shaders.items.weather"), url: "#" },
                    { title: t("nav.shaders.items.night"), url: "#" },
                    { title: t("nav.shaders.items.compatibility"), url: "#" },
                ],
            },
            {
                title: t("nav.dataPacks.title"),
                url: "#",
                icon: Settings2,
                items: [
                    { title: t("nav.dataPacks.items.gameplay"), url: "#" },
                    { title: t("nav.dataPacks.items.worldgen"), url: "#" },
                    { title: t("nav.dataPacks.items.structures"), url: "#" },
                    { title: t("nav.dataPacks.items.loot"), url: "#" },
                    { title: t("nav.dataPacks.items.advancements"), url: "#" },
                    { title: t("nav.dataPacks.items.crafting"), url: "#" },
                    { title: t("nav.dataPacks.items.mobs"), url: "#" },
                    { title: t("nav.dataPacks.items.bosses"), url: "#" },
                    { title: t("nav.dataPacks.items.survival"), url: "#" },
                    { title: t("nav.dataPacks.items.quality"), url: "#" },
                    { title: t("nav.dataPacks.items.technical"), url: "#" },
                    { title: t("nav.dataPacks.items.minigames"), url: "#" },
                ],
            },
        ],
        navSecondary: [
            {
                title: t("navSecondary.support"),
                url: "#",
                icon: LifeBuoy,
            },
            {
                title: t("navSecondary.feedback"),
                url: "#",
                icon: Send,
            },
        ],
        projects: [
            { name: t("projects.designEngineering"), url: "#", icon: Frame },
            { name: t("projects.sales"), url: "#", icon: PieChart },
            { name: t("projects.travel"), url: "#", icon: Map },
        ],
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
                                    <span className="truncate font-medium">{t("brand.title")}</span>
                                    <span className="truncate text-xs">{t("brand.subtitle")}</span>
                                </div>
                            </a>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>
            <SidebarContent>
                <NavMain items={navData.navMain} />
                {/* <NavProjects projects={navData.projects} /> */}
            </SidebarContent>
            <SidebarFooter>
                <NavSecondary changeLocaleAction={changeLocaleAction} items={navData.navSecondary} locale={locale} />
                <NavUser user={user} />
            </SidebarFooter>
        </Sidebar>
    );
}
