"use client";

import { AccountNavigation } from "@foundry/iam/components/account/account-navigation";
import { ACCOUNT_TABS } from "@foundry/iam/components/account/types/constants";
import type { AccountTab } from "@foundry/iam/components/account/types/types";
import { signOut, useSession } from "@foundry/iam/lib/auth-client";
import { ArrowRightEndOnRectangleIcon } from "@foundry/ui/components/icons/arrow-right-end-on-rectangle";
import { Button } from "@foundry/ui/primitives/button";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { useMemo } from "react";

export default function AccountLayout({ children }: { children: React.ReactNode }) {
    const t = useTranslations("AccountPage");
    const c = useTranslations("common");
    const { data } = useSession();
    const pathname = usePathname();
    const router = useRouter();
    const searchParams = useSearchParams();

    const activeTab = useMemo<AccountTab>(() => {
        const tab = searchParams.get("tab") as AccountTab | null;
        return tab && ACCOUNT_TABS.includes(tab) ? tab : "profile";
    }, [searchParams]);

    const user = data?.user as { name?: string | null; email?: string | null; image?: string | null } | undefined;
    const avatarFallback = (user?.name || user?.email || "U").slice(0, 2).toUpperCase();

    const twoFactorEnabled = Boolean((data?.user as { twoFactorEnabled?: boolean | null } | undefined)?.twoFactorEnabled);

    const handleTabChange = (value: AccountTab) => {
        const nextTab = ACCOUNT_TABS.includes(value) ? value : "profile";
        if (nextTab === activeTab) {
            return;
        }
        const params = new URLSearchParams(searchParams.toString());
        params.set("tab", nextTab);
        // navigate to the same route but with updated search params
        // then force a refresh so the server-rendered page picks up the new
        // searchParams immediately (ensures server child updates).
        router.push(`${pathname}?${params.toString()}` as never);
        try {
            router.refresh();
        } catch (err) {
            // router.refresh may not be available in older runtimes — ignore safely
            // (navigation should still work)
            // eslint-disable-next-line no-console
            console.debug("router.refresh unavailable or failed:", err);
        }
    };

    return (
        <div className="container mx-auto max-w-400 px-4 py-8 md:px-6 lg:px-8">
            <div className="sticky top-0 z-10 mb-6 flex flex-wrap items-center justify-between gap-4 bg-background/95 pb-4 backdrop-blur supports-backdrop-filter:bg-background/60 lg:mb-8">
                <div className="space-y-1">
                    <h1 className="font-bold text-2xl tracking-tight md:text-3xl">{t("heading")}</h1>
                    <p className="text-muted-foreground text-sm md:text-base">{t("description")}</p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                    <Button onClick={() => signOut()} size="default" type="button" variant="outline">
                        <ArrowRightEndOnRectangleIcon className="mr-2 h-4 w-4" />
                        <span className="hidden sm:inline">{c("buttons.signOut")}</span>
                        <span className="sm:hidden">Sign Out</span>
                    </Button>
                </div>
            </div>

            <AccountNavigation
                activeTab={activeTab}
                avatarFallback={avatarFallback}
                avatarUrl={user?.image ?? null}
                onTabChange={handleTabChange}
                twoFactorEnabled={twoFactorEnabled}
                userEmail={user?.email ?? null}
                userName={user?.name ?? null}
            >
                {/*
                  Key the children by activeTab so React will remount the
                  server-rendered child when the query param changes. This
                  ensures clicking the sidebar (or visiting ?tab=...) updates
                  the main content reliably.
                */}
                <div key={activeTab}>{children}</div>
            </AccountNavigation>
        </div>
    );
}
