/** biome-ignore-all lint/security/noDangerouslySetInnerHtml: <explanation> */
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "@foundry/ui/global.css";
import "@foundry/ui/shadcn.css";
import "@foundry/ui/catppuccin.css";
import { CustomThemeProvider } from "@foundry/ui/components/providers/theme-provider";
import { cookies } from "next/headers";
import { hasLocale, type Locale, NextIntlClientProvider } from "next-intl";
import { ThemeProvider } from "next-themes";
import { Toaster } from "sonner";
import { AppNavbar } from "../components/app-navbar";
import { routing } from "../i18n/routing";

const geistSans = Geist({
    variable: "--font-geist-sans",
    subsets: ["latin"],
});

const geistMono = Geist_Mono({
    variable: "--font-geist-mono",
    subsets: ["latin"],
});

export const metadata: Metadata = {
    metadataBase: new URL("https://auth.homestead.systems/"),
    title: {
        default: "Authentication for Homestead Systems",
        template: "%s • Homestead Systems",
    },

    description: "Authenticate your Homestead Systems account to access Foundry and our other products.",

    applicationName: "Homestead Systems",
    generator: "Next.js",
    referrer: "origin-when-cross-origin",

    keywords: ["Homestead Systems", "iam", "authentication", "account", "login", "signin", "oauth", "sso"],

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
        siteName: "Homestead Systems - Auth",
        title: "Authentication for Homestead Systems",
        description: "Authenticate your Homestead Systems account to access Foundry and our other products.",
        url: "https://auth.homestead.systems", // change when live
        images: [
            {
                url: "/foundry.png", // add this (1200x630)
                width: 1024,
                height: 1024,
                alt: "Authentication for Homestead Systems",
            },
        ],
    },

    /* ---------------- Twitter ---------------- */

    twitter: {
        card: "summary_large_image",
        title: "Authentication for Homestead Systems",
        description: "Authenticate your Homestead Systems account to access Foundry and our other products.",
        images: ["/foundry.png"],
        creator: "@ItzDabbzz", // optional
    },
};

interface Props {
    children: React.ReactNode;
    params: Promise<{ locale: string }>;
}

export default async function RootLayout({ children, params }: Props) {
    const { locale } = await params;
    if (!hasLocale(routing.locales, locale)) {
        // notFound();
    }

    async function changeLocaleAction(locale: Locale) {
        "use server";
        const store = await cookies();
        store.set("locale", locale);
    }
    return (
        <html lang={locale} suppressHydrationWarning>
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
                <ThemeProvider attribute="class" defaultTheme="system" disableTransitionOnChange enableSystem>
                    <CustomThemeProvider>
                        <NextIntlClientProvider>
                            <AppNavbar changeLocaleAction={changeLocaleAction} locale={locale as Locale}>
                                {children}
                                <Toaster />
                            </AppNavbar>
                        </NextIntlClientProvider>
                    </CustomThemeProvider>
                </ThemeProvider>
            </body>
        </html>
    );
}
