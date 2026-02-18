import { Avatar, AvatarFallback, AvatarImage } from "@foundry/ui/primitives/avatar";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@foundry/ui/primitives/dropdown-menu";
import type React from "react";
import { ChevronUpDownIcon } from "../icons/chevron-up-down";
export type UiLocale = string; // keep generic — apps can pass their Locale type

export interface SharedNavUserProps {
    user: { name?: string | null; email?: string | null; avatar?: string | null };
    /** optional sign-out handler (UI calls this when user chooses Logout) */
    onSignOut?: () => void;
    /** href to the account page (app can point to IAM) */
    accountHref?: string;
    billingHref?: string;
    notificationsHref?: string;
    /** optional render nodes for app-provided theme and locale controls */
    renderThemeControl?: React.ReactNode;
    renderLocaleControl?: React.ReactNode;
    /** optional links for unauthenticated state */
    signInHref?: string;
    signUpHref?: string;
    /** small/mobile layout hint */
    isMobile?: boolean;
}

const getInitials = (name?: string | null) => {
    const trimmed = String(name ?? "").trim();
    if (!trimmed) {
        return "?";
    }
    const parts = trimmed.split(/\s+/).slice(0, 2);
    return parts
        .map((p) => p[0])
        .join("")
        .toUpperCase();
};

export const NavUser = ({
    user,
    onSignOut,
    accountHref = "/account",
    billingHref,
    notificationsHref,
    renderThemeControl,
    renderLocaleControl,
    signInHref = "/auth/login",
    signUpHref = "/auth/register",
    isMobile = false,
}: SharedNavUserProps) => {
    const name = (user?.name ?? "").trim();
    const email = (user?.email ?? "").trim();
    const avatar = user?.avatar ?? undefined;
    const initials = getInitials(name || email || "");
    const isAuthenticated = Boolean(email || name);

    // derive billing/notifications links from accountHref when not provided
    const resolveWithTab = (base: string, tab: string) => (base.includes("?") ? `${base}&tab=${tab}` : `${base}?tab=${tab}`);
    const resolvedAccountHref = accountHref ?? "/account";
    const resolvedBillingHref = billingHref ?? resolveWithTab(resolvedAccountHref, "billing");
    const resolvedNotificationsHref = notificationsHref ?? resolveWithTab(resolvedAccountHref, "notifications");

    if (!isAuthenticated) {
        return (
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <button className="flex items-center gap-3 rounded-md px-3 py-2 hover:bg-muted">
                        <div className="grid h-8 w-8 place-items-center rounded-lg bg-muted/50">
                            <svg className="h-5 w-5 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <circle cx="12" cy="8" r="3" />
                                <path d="M6 20c0-3.3 2.7-6 6-6s6 2.7 6 6" />
                            </svg>
                        </div>
                        <div className="hidden text-left sm:block">
                            <div className="font-medium text-sm">Sign in</div>
                            <div className="text-muted-foreground text-xs">Access your account</div>
                        </div>
                        <div className="ml-auto">
                            <ChevronUpDownIcon className="h-4 w-4 text-muted-foreground" />
                        </div>
                    </button>
                </DropdownMenuTrigger>

                <DropdownMenuContent align="end" className="min-w-44 rounded-lg" side={isMobile ? "bottom" : "right"} sideOffset={6}>
                    {renderThemeControl || renderLocaleControl ? (
                        <DropdownMenuGroup>
                            <div className="flex items-center gap-2 px-3 py-2">
                                {renderThemeControl}
                                <div className="flex-1">{renderLocaleControl}</div>
                            </div>
                        </DropdownMenuGroup>
                    ) : null}

                    <DropdownMenuSeparator />

                    <DropdownMenuGroup>
                        <DropdownMenuItem asChild>
                            <a href={signInHref}>Sign in</a>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                            <a href={signUpHref}>Sign up</a>
                        </DropdownMenuItem>
                    </DropdownMenuGroup>
                </DropdownMenuContent>
            </DropdownMenu>
        );
    }

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-3 rounded-md px-3 py-2 hover:bg-muted">
                    <Avatar className="h-8 w-8 rounded-lg">
                        {avatar ? <AvatarImage alt={name || email} src={avatar} /> : <AvatarFallback className="rounded-lg">{initials}</AvatarFallback>}
                    </Avatar>
                    <div className="hidden text-left leading-tight md:grid">
                        <div className="truncate font-medium text-sm">{name || email}</div>
                        <div className="truncate text-muted-foreground text-xs">{email}</div>
                    </div>
                    <div className="ml-auto">
                        <ChevronUpDownIcon className="h-4 w-4 text-muted-foreground" />
                    </div>
                </button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end" className="min-w-44 rounded-lg" side={isMobile ? "bottom" : "right"} sideOffset={6}>
                <DropdownMenuLabel className="p-0 font-normal">
                    <div className="flex items-center gap-2 px-2 py-1.5">
                        <Avatar className="h-8 w-8 rounded-lg">
                            {avatar ? <AvatarImage alt={name || email} src={avatar} /> : <AvatarFallback className="rounded-lg">{initials}</AvatarFallback>}
                        </Avatar>
                        <div className="flex flex-col text-left">
                            <span className="truncate font-medium text-sm">{name || email}</span>
                            <span className="truncate text-muted-foreground text-xs">{email}</span>
                        </div>
                    </div>
                </DropdownMenuLabel>

                {renderThemeControl || renderLocaleControl ? (
                    <>
                        <DropdownMenuSeparator />
                        <DropdownMenuGroup>
                            <div className="flex items-center gap-2 px-3 py-2">
                                {renderThemeControl}
                                <div className="flex-1">{renderLocaleControl}</div>
                            </div>
                        </DropdownMenuGroup>
                    </>
                ) : null}

                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                    <DropdownMenuItem asChild>
                        <a href={resolvedAccountHref}>Account</a>
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                        <a href={resolvedBillingHref}>Billing</a>
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                        <a href={resolvedNotificationsHref}>Notifications</a>
                    </DropdownMenuItem>
                </DropdownMenuGroup>

                <DropdownMenuSeparator />

                <DropdownMenuItem
                    onSelect={(e) => {
                        e.preventDefault();
                        onSignOut?.();
                    }}
                >
                    Logout
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
};

export default NavUser;
