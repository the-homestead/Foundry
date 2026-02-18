"use client";

import { revalidateSessionsTag } from "@foundry/iam/actions/sessions";
import { authClient } from "@foundry/iam/lib/auth-client";
import { CheckBadgeIcon } from "@foundry/ui/components/icons/check-badge";
import { ComputerDesktopIcon } from "@foundry/ui/components/icons/computer-desktop";
import { DevicePhoneMobileIcon } from "@foundry/ui/components/icons/device-phone-mobile";
import { DeviceTabletIcon } from "@foundry/ui/components/icons/device-tablet";
import { InformationCircleIcon } from "@foundry/ui/components/icons/information-circle";
import { XMarkIcon } from "@foundry/ui/components/icons/x-mark";
import { CalendarDateRangeIcon, CalendarDaysIcon, WifiIcon } from "@foundry/ui/icons";
import { Alert, AlertDescription, AlertTitle } from "@foundry/ui/primitives/alert";
import { Button } from "@foundry/ui/primitives/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@foundry/ui/primitives/card";
import { Separator } from "@foundry/ui/primitives/separator";
import { MonitorCloud } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import type { StatusMessage } from "./types/types";

interface DeviceSession {
    id: string;
    token: string;
    userId: string;
    expiresAt: Date;
    createdAt: Date;
    updatedAt: Date;
    userAgent?: string | null;
    ipAddress?: string | null;
}

export interface SessionsTabProps {
    onMessage?: (message: StatusMessage | null) => void;
}

function getDeviceIcon(userAgent?: string | null) {
    if (!userAgent) {
        return <ComputerDesktopIcon className="h-5 w-5" />;
    }
    const ua = userAgent.toLowerCase();
    if (ua.includes("mobile") || ua.includes("android") || ua.includes("iphone")) {
        return <DevicePhoneMobileIcon className="h-5 w-5" />;
    }
    if (ua.includes("tablet") || ua.includes("ipad")) {
        return <DeviceTabletIcon className="h-5 w-5" />;
    }
    return <ComputerDesktopIcon className="h-5 w-5" />;
}

function getDeviceName(userAgent?: string | null) {
    if (!userAgent) {
        return "Unknown Device";
    }
    const ua = userAgent.toLowerCase();
    if (ua.includes("windows")) {
        return "Windows PC";
    }
    if (ua.includes("mac")) {
        return "Mac";
    }
    if (ua.includes("linux")) {
        return "Linux PC";
    }
    if (ua.includes("android")) {
        return "Android Device";
    }
    if (ua.includes("iphone")) {
        return "iPhone";
    }
    if (ua.includes("ipad")) {
        return "iPad";
    }
    return "Unknown Device";
}

function getBrowserName(userAgent?: string | null) {
    if (!userAgent) {
        return "Unknown Browser";
    }
    const ua = userAgent.toLowerCase();
    if (ua.includes("edg")) {
        return "Edge";
    }
    if (ua.includes("chrome")) {
        return "Chrome";
    }
    if (ua.includes("firefox")) {
        return "Firefox";
    }
    if (ua.includes("safari") && !ua.includes("chrome")) {
        return "Safari";
    }
    if (ua.includes("opera") || ua.includes("opr")) {
        return "Opera";
    }
    return "Unknown Browser";
}

export function SessionsTab({ onMessage }: SessionsTabProps) {
    const [sessions, setSessions] = useState<DeviceSession[]>([]);
    const [loading, setLoading] = useState(false);
    const [activeSessionToken, setActiveSessionToken] = useState<string | null>(null);

    const loadSessions = useCallback(async () => {
        setLoading(true);
        try {
            const result = await authClient.multiSession.listDeviceSessions();
            if (result?.error) {
                onMessage?.({ type: "error", message: result.error.message ?? "Failed to load sessions." });
                return;
            }
            // The data is an array of {session, user} objects
            const rawData = (result?.data ?? []) as Array<{ session: DeviceSession }>;
            const sessionData = rawData.map((item) => item.session);
            setSessions(sessionData);

            // Get current session
            const { data } = await authClient.getSession();
            setActiveSessionToken(data?.session?.token ?? null);
        } catch {
            onMessage?.({ type: "error", message: "Failed to load sessions." });
        } finally {
            setLoading(false);
        }
    }, [onMessage]);

    const handleSetActive = useCallback(
        async (sessionToken: string) => {
            try {
                const result = await authClient.multiSession.setActive({
                    sessionToken,
                });
                if (result?.error) {
                    onMessage?.({ type: "error", message: result.error.message ?? "Failed to switch session." });
                    return;
                }
                onMessage?.({ type: "success", message: "Session switched successfully." });
                setActiveSessionToken(sessionToken);
                await loadSessions();
                try {
                    await revalidateSessionsTag();
                } catch (err) {
                    console.error("revalidateSessionsTag failed:", err);
                }
            } catch {
                onMessage?.({ type: "error", message: "Failed to switch session." });
            }
        },
        [onMessage, loadSessions]
    );

    const handleRevoke = useCallback(
        async (sessionToken: string) => {
            try {
                const result = await authClient.multiSession.revoke({
                    sessionToken,
                });
                if (result?.error) {
                    onMessage?.({ type: "error", message: result.error.message ?? "Failed to revoke session." });
                    return;
                }
                onMessage?.({ type: "success", message: "Session revoked successfully." });
                await loadSessions();
                try {
                    await revalidateSessionsTag();
                } catch (err) {
                    console.error("revalidateSessionsTag failed:", err);
                }
            } catch {
                onMessage?.({ type: "error", message: "Failed to revoke session." });
            }
        },
        [onMessage, loadSessions]
    );

    useEffect(() => {
        loadSessions();
    }, [loadSessions]);

    return (
        <div className="space-y-6">
            <Alert>
                <InformationCircleIcon className="h-4 w-4" />
                <AlertTitle className="pl-6">About Multi-Session</AlertTitle>
                <AlertDescription>
                    Multi-session allows you to stay logged in to multiple accounts simultaneously. When you log in with a different account, it will appear here. This is useful
                    for switching between personal and work accounts without logging out.
                </AlertDescription>
            </Alert>

            <Card>
                <CardHeader>
                    <CardTitle>Active Sessions</CardTitle>
                    <CardDescription>Manage all active sessions across different accounts in this browser</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {loading && (
                        <div className="space-y-3">
                            {new Array(3).fill(0).map((_, i) => (
                                <div className="h-24 w-full animate-pulse rounded-lg bg-muted" key={`skeleton-${i}`} />
                            ))}
                        </div>
                    )}

                    {!loading && sessions.length === 0 && (
                        <div className="flex flex-col items-center justify-center gap-4 rounded-lg border border-dashed py-12 text-center">
                            <div className="rounded-full bg-muted p-3">
                                <ComputerDesktopIcon className="text-muted-foreground" size={64} />
                            </div>
                            <div className="space-y-2">
                                <p className="font-medium">No Additional Sessions</p>
                                <p className="max-w-md text-muted-foreground text-sm">
                                    You currently have only one active session. Log in with a different account to see multiple sessions here.
                                </p>
                            </div>
                        </div>
                    )}

                    {!loading && sessions.length > 0 && (
                        <div className="space-y-3">
                            {sessions.map((session, index) => {
                                const isActive = session.token === activeSessionToken;
                                return (
                                    <div key={session.token}>
                                        <div className="group relative flex items-start justify-between rounded-lg border p-4 transition-colors hover:bg-accent/50">
                                            <div className="flex items-start gap-4">
                                                <div className="mt-1 rounded-lg bg-primary/10 p-2 text-primary">{getDeviceIcon(session.userAgent)}</div>
                                                <div className="space-y-2">
                                                    <div className="flex items-center gap-2">
                                                        <p className="font-semibold">{getDeviceName(session.userAgent)}</p>
                                                        {isActive && (
                                                            <div className="flex items-center gap-1 rounded-full bg-green-500/10 px-2 py-0.5 font-medium text-green-600 text-xs dark:text-green-400">
                                                                <CheckBadgeIcon size={18} />
                                                                <span>Current Session</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="space-y-1 text-muted-foreground text-sm">
                                                        <p className="flex items-center gap-2">
                                                            <MonitorCloud className="h-4 w-4" />
                                                            <span className="font-medium">Browser:</span>
                                                            <span className="rounded bg-muted-foreground/10 px-3 py-1 font-mono text-xs">{getBrowserName(session.userAgent)}</span>
                                                        </p>
                                                        {session.ipAddress && (
                                                            <p className="flex items-center gap-2">
                                                                <WifiIcon size={16} />
                                                                <span className="font-medium">IP Address:</span>
                                                                <span className="rounded bg-muted-foreground/10 px-3 py-1 font-mono text-xs">{session.ipAddress}</span>
                                                            </p>
                                                        )}
                                                        <p className="flex items-center gap-2">
                                                            <CalendarDateRangeIcon size={16} />
                                                            <span className="font-medium">Started:</span>
                                                            <span className="rounded bg-muted-foreground/10 px-3 py-1 font-mono text-xs">
                                                                {new Date(session.createdAt).toLocaleDateString(undefined, {
                                                                    year: "numeric",
                                                                    month: "short",
                                                                    day: "numeric",
                                                                    hour: "2-digit",
                                                                    minute: "2-digit",
                                                                })}
                                                            </span>
                                                        </p>
                                                        <p className="flex items-center gap-2">
                                                            <CalendarDaysIcon size={16} />
                                                            <span className="font-medium">Last Active:</span>
                                                            <span className="rounded bg-muted-foreground/10 px-3 py-1 font-mono text-xs">
                                                                {new Date(session.updatedAt).toLocaleDateString(undefined, {
                                                                    year: "numeric",
                                                                    month: "short",
                                                                    day: "numeric",
                                                                    hour: "2-digit",
                                                                    minute: "2-digit",
                                                                })}
                                                            </span>
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                {!isActive && (
                                                    <Button onClick={() => handleSetActive(session.token)} size="sm" variant="outline">
                                                        Switch To
                                                    </Button>
                                                )}
                                                <Button
                                                    className="text-destructive hover:bg-destructive hover:text-destructive-foreground"
                                                    onClick={() => handleRevoke(session.token)}
                                                    size="icon"
                                                    title="Revoke session"
                                                    variant="ghost"
                                                >
                                                    <XMarkIcon className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </div>
                                        {index < sessions.length - 1 && <Separator className="my-3" />}
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
