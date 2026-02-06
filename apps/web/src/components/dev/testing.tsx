"use client";

import { Button } from "@foundry/ui/primitives/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@foundry/ui/primitives/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@foundry/ui/primitives/table";
import { useNetworkState, useRenderInfo } from "@uidotdev/usehooks";
import { useState } from "react";

export function TestingTab() {
    const network = useNetworkState();
    const renderInfo = useRenderInfo("TestingTab") ?? {};
    const [renderCount, setRenderCount] = useState(0);
    const formatValue = (value: unknown) => {
        if (value === undefined || value === null) {
            return "Unavailable";
        }

        if (typeof value === "boolean") {
            return value ? "Yes" : "No";
        }

        return String(value);
    };

    const networkRows = [
        { label: "online", value: network.online },
        { label: "downlink", value: network.downlink },
        { label: "downlinkMax", value: network.downlinkMax },
        { label: "effectiveType", value: network.effectiveType },
        { label: "rtt", value: network.rtt },
        { label: "saveData", value: network.saveData },
        { label: "type", value: network.type },
    ] as const;

    const hasNetworkInfo = networkRows.some((row) => row.value !== undefined && row.value !== null);
    const renderInfoRows = Object.entries(renderInfo as Record<string, unknown>).map(([key, value]) => ({
        key,
        value,
    }));

    return (
        <>
            <Card>
                <CardHeader>
                    <CardTitle>Description</CardTitle>
                    <CardDescription>Project details and overview.</CardDescription>
                </CardHeader>
                <CardContent className="prose center max-w-none justify-center space-y-6">
                    <section>
                        <h1>useNetworkState</h1>
                        {hasNetworkInfo ? null : (
                            <p className="text-muted-foreground text-sm">
                                Network details are unavailable. This browser may not support the Network Information API, or it may be blocked by privacy settings.
                            </p>
                        )}
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Type</TableHead>
                                    <TableHead>Value</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {networkRows.map((row) => {
                                    return (
                                        <TableRow className={row.label} key={row.label}>
                                            <TableCell>{row.label}</TableCell>
                                            <TableCell>{formatValue(row.value)}</TableCell>
                                        </TableRow>
                                    );
                                })}
                            </TableBody>
                        </Table>
                    </section>
                </CardContent>
            </Card>
            <Card>
                <CardHeader>
                    <CardTitle>Render info</CardTitle>
                    <CardDescription>Track render counts and timings from the client.</CardDescription>
                </CardHeader>
                <CardContent className="prose center max-w-none justify-center space-y-6">
                    <section>
                        <h1>useRenderInfo</h1>
                        <Button onClick={() => setRenderCount((count) => count + 1)} type="button" variant="secondary">
                            Re-render ({renderCount})
                        </Button>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Metric</TableHead>
                                    <TableHead>Value</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {renderInfoRows.map((row) => {
                                    return (
                                        <TableRow key={row.key}>
                                            <TableCell>{row.key}</TableCell>
                                            <TableCell>{formatValue(row.value)}</TableCell>
                                        </TableRow>
                                    );
                                })}
                            </TableBody>
                        </Table>
                    </section>
                </CardContent>
            </Card>
        </>
    );
}
