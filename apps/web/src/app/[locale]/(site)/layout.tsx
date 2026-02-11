/** biome-ignore-all lint/security/noDangerouslySetInnerHtml: <Theme> */
import type { Metadata } from "next";
import "@foundry/ui/global.css";
import "@foundry/ui/shadcn.css";
import "@foundry/ui/catppuccin.css";
import { FooterSection } from "@foundry/ui/components";
import { AppNavbar } from "@foundry/web/components/app-navbar";
import { routing } from "@foundry/web/i18n/routing";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import { hasLocale, type Locale } from "next-intl";

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
    async function changeLocaleAction(locale: Locale) {
        "use server";
        const store = await cookies();
        store.set("locale", locale);
    }
    return (
        <AppNavbar changeLocaleAction={changeLocaleAction} locale={locale as Locale}>
            {children}
            <FooterSection />
        </AppNavbar>
    );
}
