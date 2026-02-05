"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@foundry/ui/primitives/card";
import { Badge } from "@foundry/ui/primitives/badge";
import { Input } from "@foundry/ui/primitives/input";
import { Label } from "@foundry/ui/primitives/label";
import { ScrollArea } from "@foundry/ui/primitives/scroll-area";
import { Separator } from "@foundry/ui/primitives/separator";
import { getIconList } from "@foundry/ui/icons";
import type { ComponentType } from "react";
import { useMemo, useState } from "react";
import { SectionHeader } from "./section-header";

type IconGroup = Record<string, ReturnType<typeof getIconList>>;

function groupIcons(icons: ReturnType<typeof getIconList>): IconGroup {
    return icons.reduce<IconGroup>((acc, icon) => {
        const category = (icon.keywords?.[0] ?? "general").replace(/-/g, " ");
        const bucket = acc[category] ?? [];
        bucket.push(icon);
        acc[category] = bucket;
        return acc;
    }, {});
}

export function IconsTab() {
    const [iconQuery, setIconQuery] = useState("");

    const icons = useMemo(() => getIconList(), []);
    const filteredIcons = useMemo(() => {
        if (!iconQuery.trim()) {
            return icons;
        }

        const term = iconQuery.toLowerCase();
        return icons.filter((icon) => icon.name.toLowerCase().includes(term) || icon.keywords.some((keyword) => keyword.toLowerCase().includes(term)));
    }, [iconQuery, icons]);

    const groupedIcons = useMemo(() => groupIcons(filteredIcons), [filteredIcons]);

    return (
        <>
            <SectionHeader description="Search, filter, and browse icon groups." title="Icon Library" tooltip="Uses the icon manifest to power quick search." />
            <Card>
                <CardHeader className="items-center space-y-3 text-center">
                    <CardTitle className="text-base">Icon Library</CardTitle>
                    <CardDescription>Search and browse every animated icon exposed by @foundry/ui.</CardDescription>
                    <div className="flex flex-wrap items-center gap-3">
                        <div className="w-full md:max-w-sm">
                            <Label className="sr-only" htmlFor="icon-search">
                                Search icons
                            </Label>
                            <Input
                                className="w-full"
                                id="icon-search"
                                onChange={(event) => setIconQuery(event.target.value)}
                                placeholder="Search by name or keyword"
                                value={iconQuery}
                            />
                        </div>
                        <Badge variant="secondary">Showing {filteredIcons.length}</Badge>
                    </div>
                </CardHeader>
                <CardContent>
                    <ScrollArea className="h-[70vh] pr-4">
                        <div className="space-y-8">
                            {Object.entries(groupedIcons)
                                .sort(([a], [b]) => a.localeCompare(b))
                                .map(([category, iconsInGroup]) => (
                                    <div className="space-y-3" key={category}>
                                        <div className="flex items-center gap-2">
                                            <h3 className="font-medium text-sm capitalize">{category}</h3>
                                            <Separator className="flex-1" />
                                            <Badge variant="outline">{iconsInGroup.length}</Badge>
                                        </div>
                                        <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
                                            {iconsInGroup.map((icon) => {
                                                const IconComponent = icon.icon as ComponentType<{ size?: number }>;
                                                return (
                                                    <Card className="border-dashed" key={icon.name}>
                                                        <CardContent className="flex items-center justify-between gap-3 py-4">
                                                            <div className="flex flex-col gap-1">
                                                                <span className="font-medium text-sm capitalize">{icon.name.replace(/-/g, " ")}</span>
                                                                <div className="flex flex-wrap gap-1">
                                                                    {icon.keywords.slice(0, 2).map((keyword) => (
                                                                        <Badge className="text-[11px] capitalize" key={keyword} variant="outline">
                                                                            {keyword.replace(/-/g, " ")}
                                                                        </Badge>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-muted text-primary">
                                                                <IconComponent size={32} />
                                                            </div>
                                                        </CardContent>
                                                    </Card>
                                                );
                                            })}
                                        </div>
                                    </div>
                                ))}
                        </div>
                    </ScrollArea>
                </CardContent>
            </Card>
        </>
    );
}
