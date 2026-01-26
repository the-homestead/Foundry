"use client";

import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@foundry/ui/primitives/select";
import { SidebarMenuButton, SidebarMenuItem } from "@foundry/ui/primitives/sidebar";
import { usePathname, useRouter } from "@foundry/web/i18n/navigation";
import { routing } from "@foundry/web/i18n/routing";
import { Globe } from "lucide-react";
import type { Locale } from "next-intl";
import { useState } from "react";

interface Props {
    changeLocaleAction: (locale: Locale) => Promise<void>;
    locale: Locale;
}

export default function LocaleSwitcher({ changeLocaleAction, locale }: Props) {
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

    return (
        <SidebarMenuItem>
            <Select defaultValue={locale} disabled={isChanging} onValueChange={handleChange}>
                <SidebarMenuButton asChild size="sm">
                    <SelectTrigger className="w-full text-left" size="sm">
                        <div className="flex items-center gap-2 truncate">
                            <Globe className="size-4" />
                            <SelectValue placeholder="Language" />
                        </div>
                    </SelectTrigger>
                </SidebarMenuButton>

                <SelectContent>
                    <SelectGroup>
                        <SelectLabel>Languages</SelectLabel>
                        {langs.map((lang) => (
                            <SelectItem key={lang} value={lang}>
                                {lang.toUpperCase()}
                            </SelectItem>
                        ))}
                    </SelectGroup>
                </SelectContent>
            </Select>
        </SidebarMenuItem>
    );
}
