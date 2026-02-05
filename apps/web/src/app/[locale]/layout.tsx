/** biome-ignore-all lint/security/noDangerouslySetInnerHtml: <Theme> */
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "@foundry/ui/global.css";
import "@foundry/ui/shadcn.css";
import "@foundry/ui/catppuccin.css";
import { FooterSection } from "@foundry/ui/components";
import { Separator } from "@foundry/ui/primitives/separator";
import { SidebarInset, SidebarProvider } from "@foundry/ui/primitives/sidebar";
import { Toaster } from "@foundry/ui/primitives/sonner";
import { routing } from "@foundry/web/i18n/routing";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import { hasLocale, type Locale, NextIntlClientProvider } from "next-intl";
import { AppSidebar } from "../../components/app-sidebar";
import { ThemeProvider } from "../../providers/next-theme-provider";
import { CustomThemeProvider } from "../../providers/theme-provider";

const geistSans = Geist({
    variable: "--font-geist-sans",
    subsets: ["latin"],
});

const geistMono = Geist_Mono({
    variable: "--font-geist-mono",
    subsets: ["latin"],
});

interface Props {
    children: React.ReactNode;
    params: Promise<{ locale: string }>;
}

export const metadata: Metadata = {
    metadataBase: new URL("https://foundry.homestead.systems/"),
    title: {
        default: "Foundry",
        template: "%s • Foundry",
    },

    description: "Foundry is a modern, global mod repository for every game. Upload, version, and discover mods for Minecraft, Hytale, Skyrim SE, Fallout 4, and beyond.",

    applicationName: "Foundry",
    generator: "Next.js",
    referrer: "origin-when-cross-origin",

    keywords: [
        "Foundry",
        "mods",
        "mod repository",
        "Minecraft mods",
        "Hytale mods",
        "Skyrim mods",
        "Fallout 4 mods",
        "game mods",
        "mod hosting",
        "mod distribution",
        "modding platform",
    ],

    authors: [{ name: "Homestead Systems" }],
    creator: "Homestead Systems",
    publisher: "Homestead Systems",

    formatDetection: {
        email: false,
        address: false,
        telephone: false,
    },

    /* ---------------- Icons ---------------- */

    icons: {
        icon: [
            { url: "/favicon.svg", type: "image/svg+xml" },
            { url: "/favicon-96x96.png", sizes: "96x96", type: "image/png" },
            { url: "/favicon.ico", type: "image/x-icon" },
        ],
        apple: [
            {
                url: "/apple-touch-icon.png",
                sizes: "180x180",
                type: "image/png",
            },
        ],
        shortcut: "/favicon.ico",
    },

    /* ---------------- PWA ---------------- */

    manifest: "/site.webmanifest",

    /* ---------------- Open Graph ---------------- */

    openGraph: {
        type: "website",
        siteName: "Foundry",
        title: "Foundry — A Global Home for Mods",
        description: "Upload, version, and discover mods for Minecraft, Hytale, Skyrim SE, Fallout 4, and beyond. Foundry is the next-gen mod repository.",
        url: "https://foundry.homestead.systems", // change when live
        images: [
            {
                url: "/foundry.png", // add this (1200x630)
                width: 1024,
                height: 1024,
                alt: "Foundry — A Global Home for Mods",
            },
        ],
    },

    /* ---------------- Twitter ---------------- */

    twitter: {
        card: "summary_large_image",
        title: "Foundry — A Global Home for Mods",
        description: "The modern mod repository for every game. Starting with Minecraft, Hytale, Skyrim SE, and Fallout 4.",
        images: ["/foundry.png"],
        creator: "@ItzDabbzz", // optional
    },
};

export default async function RootLayout({ children, params }: Props) {
    const { locale } = await params;
    if (!hasLocale(routing.locales, locale)) {
        notFound();
    }

    // NOTE: removed server -> client session exposure for security reasons.
    // Session fetching should remain server-only and not be serialized to the client.

    async function changeLocaleAction(locale: Locale) {
        "use server";
        const store = await cookies();
        store.set("locale", locale);
    }
    return (
        <html lang="en" suppressHydrationWarning>
            <body className={`${geistSans.variable} ${geistMono.variable} antialiased`} suppressHydrationWarning>
                {/* Inline script to synchronously apply persisted theme before React paints to avoid flash */}
                <style
                    // eslint-disable-next-line react/no-danger
                    dangerouslySetInnerHTML={{ __html: ".theme-loading * { transition: none !important; }" }}
                />
                <script
                    // eslint-disable-next-line react/no-danger
                    dangerouslySetInnerHTML={{
                        __html: `(() => {
    try {
        // add a loading marker to temporarily disable transitions
        document.documentElement.classList.add('theme-loading');
        const raw = localStorage.getItem('ui-theme');
        if (!raw) {
            document.documentElement.classList.remove('theme-loading');
            return;
        }
        const parsed = JSON.parse(raw);
        if (!parsed) {
            document.documentElement.classList.remove('theme-loading');
            return;
        }
        const theme = parsed.theme;
        const color = parsed.color;

        // Handle standard light/dark/system
        if (theme === 'dark') {
            document.documentElement.classList.add('dark');
        } else if (theme === 'light') {
            document.documentElement.classList.remove('dark');
        } else if (theme === 'system') {
            try {
                const isDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
                if (isDark) document.documentElement.classList.add('dark'); else document.documentElement.classList.remove('dark');
            } catch (e) { /* ignore */ }
        }

        // Apply Catppuccin-style themes (base + accent)
        if (theme && ['latte','mocha','frappe','macchiato'].includes(theme)) {
            // base class like 'latte-base'
            document.body.classList.add(theme + '-base');
            // accent class like 'mocha-flamingo' (skip 'base' accent since it has no class)
            if (color && color !== 'base') {
                document.body.classList.add(theme + '-' + color);
            }
        }

        // remove loading marker once classes applied
        document.documentElement.classList.remove('theme-loading');
    } catch (e) {
        // ensure we remove loading marker on error
        try { document.documentElement.classList.remove('theme-loading'); } catch {}
    }
})();`,
                    }}
                />
                <NextIntlClientProvider>
                    <ThemeProvider attribute="class" defaultTheme="system" disableTransitionOnChange enableSystem>
                        <CustomThemeProvider>
                            <SidebarProvider>
                                <AppSidebar changeLocaleAction={changeLocaleAction} locale={locale} />
                                <SidebarInset>
                                    {children}
                                    <Separator />
                                    <FooterSection />
                                    <Toaster />
                                </SidebarInset>
                            </SidebarProvider>
                        </CustomThemeProvider>
                    </ThemeProvider>
                </NextIntlClientProvider>
            </body>
        </html>
    );
}
