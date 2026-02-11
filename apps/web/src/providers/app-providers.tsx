import { SidebarProvider } from "@foundry/ui/primitives/sidebar";
import { Toaster } from "@foundry/ui/primitives/sonner";
import { CustomThemeProvider } from "@foundry/web/providers/theme-provider";
import { NextIntlClientProvider } from "next-intl";
import { ThemeProvider } from "next-themes";
import type React from "react";

export function RootProviders({ children }: { children: React.ReactNode }) {
    return (
        <NextIntlClientProvider>
            <ThemeProvider attribute="class" defaultTheme="system" disableTransitionOnChange enableSystem>
                <CustomThemeProvider>
                    <SidebarProvider>{children}</SidebarProvider>
                    <Toaster />
                </CustomThemeProvider>
            </ThemeProvider>
        </NextIntlClientProvider>
    );
}
