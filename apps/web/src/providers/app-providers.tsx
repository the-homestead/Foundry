import { CustomThemeProvider } from "@foundry/ui/components/providers/theme-provider";
import { SidebarProvider } from "@foundry/ui/primitives/sidebar";
import { Toaster } from "@foundry/ui/primitives/sonner";
// next-intl client provider is mounted at the server layout with messages
import { ThemeProvider } from "next-themes";
import type React from "react";
import { ClientProviders } from "./client-providers";

export function RootProviders({ children }: { children: React.ReactNode }) {
    return (
        <ThemeProvider attribute="class" defaultTheme="system" disableTransitionOnChange enableSystem>
            <ClientProviders>
                <CustomThemeProvider>
                    <SidebarProvider>{children}</SidebarProvider>
                    <Toaster />
                </CustomThemeProvider>
            </ClientProviders>
        </ThemeProvider>
    );
}
