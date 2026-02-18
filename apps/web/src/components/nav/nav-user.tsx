"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@foundry/ui/primitives/avatar";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@foundry/ui/primitives/dropdown-menu";
import { SidebarMenu, SidebarMenuButton, SidebarMenuItem, useSidebar } from "@foundry/ui/primitives/sidebar";
import { ThemeSheet } from "@foundry/web/components/theme/theme-sheet";
import { signOut } from "@foundry/web/lib/auth-client";
import { BadgeCheck, Bell, ChevronsUpDown, CreditCard, LogOut, Sparkles, User, UserPlus } from "lucide-react";
import Link from "next/link";
import type { Locale } from "next-intl";
import { useTranslations } from "next-intl";
import LocaleSwitcher from "../locale-switcher";

const getInitials = (name: string, fallback: string) => {
    const trimmed = name.trim();
    if (!trimmed) {
        return fallback;
    }
    // biome-ignore lint/performance/useTopLevelRegex: <d>
    const parts = trimmed.split(/\s+/);
    const initials = parts
        .slice(0, 2)
        .map((part) => part[0])
        .join("");
    return initials.toUpperCase();
};

export function NavUser({
    user,
    locale,
    changeLocaleAction,
}: {
    user: {
        name?: string | null;
        email?: string | null;
        avatar?: string | null;
    };
    locale?: Locale | null;
    changeLocaleAction?: (locale: Locale) => Promise<void>;
}) {
    const { isMobile } = useSidebar();
    const t = useTranslations("UserMenu");
    const common = useTranslations("common");
    const name = user.name?.trim() || t("guest");
    const email = user.email?.trim() || "";
    const avatar = user.avatar ?? "";
    const fallback = getInitials(name, t("initialsFallback"));

    const isAuthenticated = email && name !== t("guest") && name !== common("states.loading");

    if (!isAuthenticated) {
        return (
            <SidebarMenu>
                <SidebarMenuItem>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <SidebarMenuButton className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground" size="lg">
                                <User className="h-8 w-8 rounded-lg" />
                                <div className="grid flex-1 text-left text-sm leading-tight">
                                    <span className="truncate font-medium">{t("signIn")}</span>
                                    <span className="truncate text-xs">{t("accessAccount")}</span>
                                </div>
                                <ChevronsUpDown className="ml-auto size-4" />
                            </SidebarMenuButton>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent
                            align="end"
                            className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
                            side={isMobile ? "bottom" : "right"}
                            sideOffset={4}
                        >
                            <DropdownMenuGroup>
                                <div className="flex items-center gap-2 px-3 py-2">
                                    <ThemeSheet triggerClassName="h-8 w-8" />
                                    <div className="flex-1">
                                        {changeLocaleAction ? (
                                            <LocaleSwitcher
                                                changeLocaleAction={changeLocaleAction}
                                                locale={(locale ?? "en") as Locale}
                                                triggerClassName="h-8 w-full min-w-0"
                                                variant="navbar"
                                            />
                                        ) : null}
                                    </div>
                                </div>
                            </DropdownMenuGroup>
                            <DropdownMenuSeparator />
                            <DropdownMenuGroup>
                                <DropdownMenuItem asChild>
                                    <Link href="/auth/login">
                                        <User />
                                        {t("signIn")}
                                    </Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem asChild>
                                    <Link href="/auth/register">
                                        <UserPlus />
                                        {t("signUp")}
                                    </Link>
                                </DropdownMenuItem>
                            </DropdownMenuGroup>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </SidebarMenuItem>
            </SidebarMenu>
        );
    }

    return (
        <SidebarMenu>
            <SidebarMenuItem>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <SidebarMenuButton className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground" size="lg">
                            <Avatar className="h-8 w-8 rounded-lg">
                                <AvatarImage alt={name} src={avatar} />
                                <AvatarFallback className="rounded-lg">{fallback}</AvatarFallback>
                            </Avatar>
                            <div className="grid flex-1 text-left text-sm leading-tight">
                                <span className="truncate font-medium">{name}</span>
                                <span className="truncate text-xs">{email}</span>
                            </div>
                            <ChevronsUpDown className="ml-auto size-4" />
                        </SidebarMenuButton>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg" side={isMobile ? "bottom" : "right"} sideOffset={4}>
                        <DropdownMenuLabel className="p-0 font-normal">
                            <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                                <Avatar className="h-8 w-8 rounded-lg">
                                    <AvatarImage alt={name} src={avatar} />
                                    <AvatarFallback className="rounded-lg">{fallback}</AvatarFallback>
                                </Avatar>
                                <div className="grid flex-1 text-left text-sm leading-tight">
                                    <span className="truncate font-medium">{name}</span>
                                    <span className="truncate text-xs">{email}</span>
                                </div>
                            </div>
                        </DropdownMenuLabel>

                        <DropdownMenuSeparator />

                        <DropdownMenuGroup>
                            <div className="flex items-center gap-2 px-3 py-2">
                                <ThemeSheet triggerClassName="h-8 w-8" />
                                <div className="flex-1">
                                    {changeLocaleAction ? (
                                        <LocaleSwitcher
                                            changeLocaleAction={changeLocaleAction}
                                            locale={(locale ?? "en") as Locale}
                                            triggerClassName="h-8 w-full min-w-0"
                                            variant="navbar"
                                        />
                                    ) : null}
                                </div>
                            </div>
                        </DropdownMenuGroup>

                        <DropdownMenuSeparator />

                        <DropdownMenuGroup>
                            <DropdownMenuItem>
                                <Sparkles />
                                {t("upgrade")}
                            </DropdownMenuItem>
                        </DropdownMenuGroup>

                        <DropdownMenuSeparator />

                        <DropdownMenuGroup>
                            <DropdownMenuItem asChild>
                                <Link href="/account">
                                    <BadgeCheck />
                                    {t("account")}
                                </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                                <CreditCard />
                                {t("billing")}
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                                <Bell />
                                {t("notifications")}
                            </DropdownMenuItem>
                        </DropdownMenuGroup>

                        <DropdownMenuSeparator />

                        <DropdownMenuItem
                            onSelect={(event) => {
                                event.preventDefault();
                                signOut();
                            }}
                        >
                            <LogOut />
                            {t("logout")}
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </SidebarMenuItem>
        </SidebarMenu>
    );
}
