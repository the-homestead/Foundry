"use client";
import { NavUser } from "@foundry/ui/components";
import { MobileNav, MobileNavHeader, MobileNavMenu, MobileNavToggle, NavBody, Navbar, NavbarButton, NavbarLogo, NavItems } from "@foundry/ui/components/navbar";
import { Avatar, AvatarFallback, AvatarImage } from "@foundry/ui/primitives/avatar";
import { ThemeSheet } from "@foundry/web/components/theme/theme-sheet";
import { signOut } from "@foundry/web/lib/auth-client";
import type { Locale } from "next-intl";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { useSession } from "../lib/auth-client";
import LocaleSwitcher from "./locale-switcher";

export function AppNavbar({ children, changeLocaleAction, locale }: { children: React.ReactNode; changeLocaleAction: (locale: Locale) => Promise<void>; locale: Locale }) {
    const t = useTranslations("Navigation");
    const common = useTranslations("common");
    const navItems = [
        {
            name: t("items.browse"),
            link: "/browse",
        },
        {
            name: t("items.community"),
            link: "https://forum.homestead.systems/",
        },
        {
            name: t("items.support"),
            link: "/support",
        },
    ];

    if (process.env.NODE_ENV === "development") {
        navItems.push({
            name: t("items.testing"),
            link: "/dev",
        });
    }

    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const { data, isPending } = useSession();
    const isLoading = isPending;

    let _desktopUserButton: React.ReactNode;
    if (isLoading) {
        _desktopUserButton = (
            <NavbarButton as="button" disabled type="button" variant="secondary">
                {common("states.loading")}
            </NavbarButton>
        );
    } else if (data?.user) {
        const name = String(data.user.name ?? data.user.username ?? "");
        const initials = name
            .split(" ")
            .map((n: string) => n[0])
            .join("")
            .toUpperCase()
            .slice(0, 2);

        _desktopUserButton = (
            <NavbarButton className="flex items-center gap-2" href="/account" variant="primary">
                <Avatar className="h-6 w-6">
                    <AvatarImage alt={name} src={data.user.image ?? undefined} />
                    <AvatarFallback className="text-[10px]">{initials}</AvatarFallback>
                </Avatar>
                <span>{name}</span>
            </NavbarButton>
        );
    } else {
        _desktopUserButton = (
            <NavbarButton href="/auth/login" variant="secondary">
                {t("actions.login")}
            </NavbarButton>
        );
    }

    let mobileUserButton: React.ReactNode;
    if (isLoading) {
        mobileUserButton = (
            <NavbarButton as="button" className="w-full" disabled type="button" variant="secondary">
                {common("states.loading")}
            </NavbarButton>
        );
    } else if (data?.user) {
        const name = String(data.user.name ?? data.user.username ?? "");
        const initials = name
            .split(" ")
            .map((n: string) => n[0])
            .join("")
            .toUpperCase()
            .slice(0, 2);

        mobileUserButton = (
            <NavbarButton className="flex w-full items-center justify-center gap-2" onClick={() => setIsMobileMenuOpen(false)} variant="primary">
                <Avatar className="h-6 w-6">
                    <AvatarImage alt={name} src={data.user.image ?? undefined} />
                    <AvatarFallback className="text-[10px]">{initials}</AvatarFallback>
                </Avatar>
                <span>{t("actions.welcome", { name })}</span>
            </NavbarButton>
        );
    } else {
        mobileUserButton = (
            <NavbarButton className="w-full" onClick={() => setIsMobileMenuOpen(false)} variant="secondary">
                {t("actions.login")}
            </NavbarButton>
        );
    }

    return (
        <div className="relative w-full">
            <Navbar>
                {/* Desktop Navigation */}
                <NavBody>
                    <NavbarLogo size="lg" url="/logo.png" />
                    <NavItems items={navItems} />
                    <div className="ml-auto flex items-center gap-3 justify-self-end">
                        <NavUser
                            accountHref={`${process.env.NEXT_PUBLIC_AUTH_URL ?? "https://auth.homestead.systems"}/account`}
                            onSignOut={() => signOut()}
                            renderLocaleControl={<LocaleSwitcher changeLocaleAction={changeLocaleAction} locale={locale} variant="navbar" />}
                            renderThemeControl={<ThemeSheet />}
                            user={{ name: data?.user?.name ?? data?.user?.username ?? null, email: data?.user?.email ?? null, avatar: data?.user?.image ?? null }}
                        />
                    </div>
                </NavBody>

                {/* Mobile Navigation */}
                <MobileNav>
                    <MobileNavHeader>
                        <NavbarLogo size="lg" title={t("brand.title")} url="/foundry.png" />
                        <MobileNavToggle isOpen={isMobileMenuOpen} onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} />
                    </MobileNavHeader>

                    <MobileNavMenu isOpen={isMobileMenuOpen} onClose={() => setIsMobileMenuOpen(false)}>
                        {navItems.map((item) => (
                            <a className="relative text-text dark:text-text" href={item.link} key={item.link} onClick={() => setIsMobileMenuOpen(false)}>
                                <span className="block">{item.name}</span>
                            </a>
                        ))}
                        <div className="flex w-full items-center gap-3">
                            <ThemeSheet />
                            <LocaleSwitcher changeLocaleAction={changeLocaleAction} locale={locale} variant="navbar" />
                        </div>
                        <div className="flex w-full flex-col gap-4">{mobileUserButton}</div>
                    </MobileNavMenu>
                </MobileNav>
            </Navbar>
            {children}

            {/* Navbar */}
        </div>
    );
}
