"use client";

import { BellIcon } from "@foundry/ui/components/icons/bell";
import { CreditCardIcon } from "@foundry/ui/components/icons/credit-card";
import { KeyIcon } from "@foundry/ui/components/icons/key";
import { LockClosedIcon } from "@foundry/ui/components/icons/lock-closed";
import { ShieldCheckIcon } from "@foundry/ui/components/icons/shield-check";
import { UserCircleIcon } from "@foundry/ui/components/icons/user-circle";
import { XMarkIcon } from "@foundry/ui/components/icons/x-mark";
import { cn } from "@foundry/ui/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@foundry/ui/primitives/avatar";
import { Badge } from "@foundry/ui/primitives/badge";
import { Button } from "@foundry/ui/primitives/button";
import { ScrollArea } from "@foundry/ui/primitives/scroll-area";
import { Separator } from "@foundry/ui/primitives/separator";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@foundry/ui/primitives/sheet";
import { type ReactNode, useState } from "react";
import type { AccountTab } from "./types/types";

interface AccountNavigationProps {
    activeTab: AccountTab;
    onTabChange: (tab: AccountTab) => void;
    avatarUrl: string | null;
    avatarFallback: string;
    userName: string | null;
    userEmail: string | null;
    twoFactorEnabled: boolean;
    children?: ReactNode;
}

const TAB_CONFIG: Record<
    AccountTab,
    {
        icon: React.ComponentType<{ className?: string }>;
        label: string;
        description: string;
        badge?: string;
    }
> = {
    profile: {
        icon: UserCircleIcon,
        label: "Profile",
        description: "Manage your public profile",
    },
    security: {
        icon: ShieldCheckIcon,
        label: "Security",
        description: "Password & authentication",
        badge: "2FA",
    },
    apiKeys: {
        icon: KeyIcon,
        label: "API Keys",
        description: "Manage access tokens",
    },
    sessions: {
        icon: LockClosedIcon,
        label: "Sessions",
        description: "Active devices & logins",
    },
    billing: {
        icon: CreditCardIcon,
        label: "Billing",
        description: "Plans & payment methods",
    },
    notifications: {
        icon: BellIcon,
        label: "Notifications",
        description: "Email & push preferences",
    },
    contentBlocking: {
        icon: XMarkIcon,
        label: "Content Blocking",
        description: "Filters & restrictions",
    },
};

function NavigationItem({ tab, active, onClick, twoFactorEnabled }: { tab: AccountTab; active: boolean; onClick: () => void; twoFactorEnabled: boolean }) {
    const config = TAB_CONFIG[tab];
    const Icon = config.icon;
    const showBadge = tab === "security" && twoFactorEnabled;

    return (
        <button
            className={cn(
                "group relative flex w-full items-start gap-3 rounded-lg px-3 py-2.5 text-left transition-all duration-200",
                "hover:bg-accent/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                active && "bg-accent text-accent-foreground shadow-sm"
            )}
            onClick={onClick}
            type="button"
        >
            <Icon className={cn("mt-0.5 h-5 w-5 shrink-0 transition-colors", active ? "text-primary" : "text-muted-foreground group-hover:text-foreground")} />
            <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                <div className="flex items-center gap-2">
                    <span className={cn("font-medium text-sm leading-none", active && "text-accent-foreground")}>{config.label}</span>
                    {showBadge && (
                        <Badge className="h-5 px-1.5 text-xs" variant="secondary">
                            {config.badge}
                        </Badge>
                    )}
                </div>
                <span className="text-muted-foreground text-xs leading-tight">{config.description}</span>
            </div>
            {active && <div className="absolute top-0 right-0 h-full w-1 rounded-l-full bg-primary" />}
        </button>
    );
}

export function AccountNavigation({ activeTab, onTabChange, avatarUrl, avatarFallback, userName, userEmail, twoFactorEnabled, children }: AccountNavigationProps) {
    const [mobileOpen, setMobileOpen] = useState(false);

    const navigationContent = (
        <>
            <div className="flex items-center gap-3 px-3 py-4">
                <Avatar className="h-12 w-12 ring-2 ring-border">
                    <AvatarImage alt={userName ?? "User"} src={avatarUrl ?? undefined} />
                    <AvatarFallback className="font-semibold text-sm">{avatarFallback}</AvatarFallback>
                </Avatar>
                <div className="flex min-w-0 flex-1 flex-col">
                    <p className="truncate font-semibold text-sm leading-none">{userName ?? "User"}</p>
                    <p className="truncate text-muted-foreground text-xs">{userEmail}</p>
                </div>
            </div>

            <Separator className="mb-2" />

            <nav className="flex flex-col gap-1 px-2">
                {Object.entries(TAB_CONFIG).map(([key]) => (
                    <NavigationItem
                        active={activeTab === key}
                        key={key}
                        onClick={() => {
                            onTabChange(key as AccountTab);
                            setMobileOpen(false);
                        }}
                        tab={key as AccountTab}
                        twoFactorEnabled={twoFactorEnabled}
                    />
                ))}
            </nav>
        </>
    );

    return (
        <>
            {/* Mobile Navigation */}
            <div className="lg:hidden">
                <Sheet onOpenChange={setMobileOpen} open={mobileOpen}>
                    <SheetTrigger asChild>
                        <Button className="w-full" size="lg" variant="outline">
                            <div className="flex items-center gap-2">
                                {(() => {
                                    const Icon = TAB_CONFIG[activeTab].icon;
                                    return <Icon className="h-4 w-4" />;
                                })()}
                                <span>{TAB_CONFIG[activeTab].label}</span>
                            </div>
                        </Button>
                    </SheetTrigger>
                    <SheetContent className="w-[280px] p-0" side="left">
                        <SheetHeader className="px-6 pt-6 text-left">
                            <SheetTitle>Account Settings</SheetTitle>
                        </SheetHeader>
                        <ScrollArea className="h-[calc(100vh-5rem)]">{navigationContent}</ScrollArea>
                    </SheetContent>
                </Sheet>
                {children && <div className="mt-6">{children}</div>}
            </div>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex lg:gap-8">
                <aside className="sticky top-8 h-fit w-[280px] shrink-0">
                    <div className="overflow-hidden rounded-lg border bg-card shadow-sm">
                        <ScrollArea className="h-[calc(100vh-6rem)]">{navigationContent}</ScrollArea>
                    </div>
                </aside>
                <div className="min-w-0 flex-1">{children}</div>
            </div>
        </>
    );
}
