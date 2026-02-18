"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@foundry/ui/primitives/card";
import { useMemo } from "react";
import type { ApiKeyEntry } from "./types/types";

interface ApiKeysStatsProps {
    apiKeys: ApiKeyEntry[];
}

export function ApiKeysStats({ apiKeys }: ApiKeysStatsProps) {
    const stats = useMemo(() => {
        const now = Date.now();
        const activeKeys = apiKeys.filter((key) => {
            if (key.enabled === false) {
                return false;
            }
            if (key.expiresAt) {
                const expiryDate = typeof key.expiresAt === "string" ? new Date(key.expiresAt) : key.expiresAt;
                if (expiryDate.getTime() < now) {
                    return false;
                }
            }
            return true;
        });

        const totalUsage = apiKeys.reduce((sum, key) => sum + (key.usageCount ?? 0), 0);

        const recentlyUsed = apiKeys.filter((key) => {
            if (!key.lastUsedAt) {
                return false;
            }
            const lastUsed = typeof key.lastUsedAt === "string" ? new Date(key.lastUsedAt) : key.lastUsedAt;
            const dayAgo = now - 24 * 60 * 60 * 1000;
            return lastUsed.getTime() > dayAgo;
        });

        const withRateLimits = apiKeys.filter((key) => {
            const metadata = key.metadata;
            return metadata?.rateLimit?.requestsPerMinute || metadata?.rateLimit?.requestsPerHour || metadata?.rateLimit?.requestsPerDay;
        });

        const withRestrictions = apiKeys.filter((key) => {
            const metadata = key.metadata;
            return (metadata?.ipWhitelist && metadata.ipWhitelist.length > 0) || (metadata?.ipBlacklist && metadata.ipBlacklist.length > 0);
        });

        return {
            total: apiKeys.length,
            active: activeKeys.length,
            totalUsage,
            recentlyUsed: recentlyUsed.length,
            withRateLimits: withRateLimits.length,
            withRestrictions: withRestrictions.length,
        };
    }, [apiKeys]);

    if (apiKeys.length === 0) {
        return null;
    }

    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="font-medium text-sm">Total Keys</CardTitle>
                    <svg
                        aria-label="Key icon"
                        className="h-4 w-4 text-muted-foreground"
                        fill="none"
                        role="img"
                        stroke="currentColor"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                    >
                        <title>Key</title>
                        <path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4" />
                    </svg>
                </CardHeader>
                <CardContent>
                    <div className="font-bold text-2xl">{stats.total}</div>
                    <p className="text-muted-foreground text-xs">
                        {stats.active} active, {stats.total - stats.active} inactive
                    </p>
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="font-medium text-sm">Total Usage</CardTitle>
                    <svg
                        aria-label="Activity icon"
                        className="h-4 w-4 text-muted-foreground"
                        fill="none"
                        role="img"
                        stroke="currentColor"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                    >
                        <title>Activity</title>
                        <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
                    </svg>
                </CardHeader>
                <CardContent>
                    <div className="font-bold text-2xl">{stats.totalUsage.toLocaleString()}</div>
                    <p className="text-muted-foreground text-xs">{stats.recentlyUsed} used in last 24h</p>
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="font-medium text-sm">Security</CardTitle>
                    <svg
                        aria-label="Shield icon"
                        className="h-4 w-4 text-muted-foreground"
                        fill="none"
                        role="img"
                        stroke="currentColor"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                    >
                        <title>Shield</title>
                        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                    </svg>
                </CardHeader>
                <CardContent>
                    <div className="font-bold text-2xl">{stats.withRestrictions + stats.withRateLimits}</div>
                    <p className="text-muted-foreground text-xs">
                        {stats.withRateLimits} rate limited, {stats.withRestrictions} IP restricted
                    </p>
                </CardContent>
            </Card>
        </div>
    );
}
