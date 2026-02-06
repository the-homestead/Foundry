"use client";

import { GlobeAmericasIcon } from "@foundry/ui/icons";
import { cn } from "@foundry/ui/lib/utils";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@foundry/ui/primitives/select";
import { SidebarMenuItem } from "@foundry/ui/primitives/sidebar";
import { usePathname, useRouter } from "@foundry/web/i18n/navigation";
import { routing } from "@foundry/web/i18n/routing";
import type { Locale } from "next-intl";
import { useTranslations } from "next-intl";
import { useState } from "react";

interface Props {
    changeLocaleAction: (locale: Locale) => Promise<void>;
    locale: Locale;
    variant?: "navbar" | "sidebar";
    triggerClassName?: string;
}

export default function LocaleSwitcher({ changeLocaleAction, locale, variant = "sidebar", triggerClassName }: Props) {
    const t = useTranslations("LocaleSwitcher");
    const langs = ["en", "de", "es", "fr", "it", "ja", "ko", "pt", "ru", "zh"];
    const pathname = usePathname();
    const router = useRouter();
    const [isChanging, setIsChanging] = useState(false);

    const handleChange = async (value: string) => {
        const nextLocale = value as Locale;
        if (isChanging) {
            return;
        }
        setIsChanging(true);
        // Call the server action to persist the locale (cookie)
        try {
            await changeLocaleAction(nextLocale);
        } catch {
            // If persisting fails, stop and keep current locale
            setIsChanging(false);
            return;
        }

        // Use the i18n-aware router to navigate to the same pathname with a new locale.
        // next-intl's createNavigation supports passing a locale option to push/replace.
        try {
            // prefer replace to avoid creating history entries when switching locales
            // log for debugging when users report mismatches
            console.debug("locale-switch", { pathname, nextLocale });
            await router.replace(pathname as never, { locale: nextLocale } as never);
        } catch (e) {
            // fallback: manually build a normalized path and replace
            console.error("locale switch router.replace failed, falling back to manual path", e);
            const currentPath = typeof window !== "undefined" ? window.location.pathname : pathname;
            const segments = currentPath.split("/").filter(Boolean);
            while (segments.length > 0 && routing.locales.includes(segments[0] as Locale)) {
                segments.shift();
            }

            const defaultLocale = routing.defaultLocale;
            if (!(routing.localePrefix === "as-needed" && nextLocale === defaultLocale)) {
                segments.unshift(nextLocale);
            }

            const newPath = `/${segments.join("/")}${window.location.search ?? ""}${window.location.hash ?? ""}`;
            await router.replace(newPath as unknown as never);
        } finally {
            setIsChanging(false);
        }
    };

    const triggerBaseClassName = variant === "navbar" ? "text-left" : "min-w-[140px] text-left";

    const content = (
        <Select defaultValue={locale} disabled={isChanging} onValueChange={handleChange}>
            <SelectTrigger className={cn(triggerBaseClassName, triggerClassName)} size="sm">
                <div className="flex items-center gap-2 truncate">
                    <GlobeAmericasIcon className="size-4" />
                    <SelectValue placeholder={t("placeholder")} />
                </div>
            </SelectTrigger>

            <SelectContent>
                <SelectGroup>
                    <SelectLabel>{t("label")}</SelectLabel>
                    {langs.map((lang) => (
                        <SelectItem key={lang} value={lang}>
                            {lang.toUpperCase()}
                        </SelectItem>
                    ))}
                </SelectGroup>
            </SelectContent>
        </Select>
    );

    return variant === "navbar" ? <div className="flex items-center">{content}</div> : <SidebarMenuItem>{content}</SidebarMenuItem>;
}
