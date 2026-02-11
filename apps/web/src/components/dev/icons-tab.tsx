"use client";

import { getIconList } from "@foundry/ui/icons";
import { Badge } from "@foundry/ui/primitives/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@foundry/ui/primitives/card";
import { Input } from "@foundry/ui/primitives/input";
import { Label } from "@foundry/ui/primitives/label";
import { ScrollArea } from "@foundry/ui/primitives/scroll-area";
import { Separator } from "@foundry/ui/primitives/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@foundry/ui/primitives/tabs";
import { icons } from "lucide-react";
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

interface LucideIcon {
    name: string;
    icon: ComponentType<{ size?: number }>;
}

export function getLucideIconsList(): LucideIcon[] {
    return Object.entries(icons)
        .filter(([name]) => {
            // Filter out utility exports
            return name !== "createLucideIcon" && name !== "default";
        })
        .map(([name, icon]) => ({
            name,
            icon: icon as ComponentType<{ size?: number }>,
        }));
}

export function IconsTab() {
    const [iconQuery, setIconQuery] = useState("");
    const [activeTab, setActiveTab] = useState("animated");

    const animatedIcons = useMemo(() => getIconList(), []);
    const lucideIcons = useMemo(() => getLucideIconsList(), []);

    const filteredAnimatedIcons = useMemo(() => {
        if (!iconQuery.trim()) {
            return animatedIcons;
        }

        const term = iconQuery.toLowerCase();
        return animatedIcons.filter((icon) => icon.name.toLowerCase().includes(term) || icon.keywords.some((keyword) => keyword.toLowerCase().includes(term)));
    }, [iconQuery, animatedIcons]);

    const filteredLucideIcons = useMemo(() => {
        if (!iconQuery.trim()) {
            return lucideIcons;
        }

        const term = iconQuery.toLowerCase();
        return lucideIcons.filter((icon) => icon.name.toLowerCase().includes(term));
    }, [iconQuery, lucideIcons]);

    const groupedAnimatedIcons = useMemo(() => groupIcons(filteredAnimatedIcons), [filteredAnimatedIcons]);

    return (
        <>
            <SectionHeader description="Search, filter, and browse icon groups." title="Icon Library" tooltip="Animated HeroIcons and static Lucide icons." />
            <Card>
                <CardHeader className="items-center space-y-3 text-center">
                    <CardTitle className="text-base">Icon Library</CardTitle>
                    <CardDescription>Browse animated HeroIcons and static Lucide icons from @foundry/ui.</CardDescription>
                    <div className="flex flex-wrap items-center justify-center gap-3">
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
                        <Badge variant="secondary">{activeTab === "animated" ? `${filteredAnimatedIcons.length} Animated` : `${filteredLucideIcons.length} Lucide`}</Badge>
                    </div>
                </CardHeader>
                <CardContent>
                    <Tabs onValueChange={setActiveTab} value={activeTab}>
                        <TabsList className="mb-4 grid w-full grid-cols-2">
                            <TabsTrigger value="animated">
                                Animated HeroIcons
                                <Badge className="ml-2" variant="outline">
                                    {animatedIcons.length}
                                </Badge>
                            </TabsTrigger>
                            <TabsTrigger value="lucide">
                                Lucide Icons
                                <Badge className="ml-2" variant="outline">
                                    {lucideIcons.length}
                                </Badge>
                            </TabsTrigger>
                        </TabsList>

                        <TabsContent value="animated">
                            <ScrollArea className="h-[70vh] pr-4">
                                <div className="space-y-8">
                                    {Object.entries(groupedAnimatedIcons)
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
                                                                            <Badge className="text-[11px]" variant="secondary">
                                                                                Animated
                                                                            </Badge>
                                                                            {icon.keywords.slice(0, 1).map((keyword) => (
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
                        </TabsContent>

                        <TabsContent value="lucide">
                            <ScrollArea className="h-[70vh] pr-4">
                                <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
                                    {filteredLucideIcons.map((icon) => {
                                        const IconComponent = icon.icon;
                                        return (
                                            <Card className="border-dashed" key={icon.name}>
                                                <CardContent className="flex items-center justify-between gap-3 py-4">
                                                    <div className="flex flex-col gap-1">
                                                        <span className="font-medium text-sm">{icon.name}</span>
                                                        <Badge className="text-[11px]" variant="outline">
                                                            Lucide
                                                        </Badge>
                                                    </div>
                                                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-muted text-primary">
                                                        <IconComponent size={32} />
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        );
                                    })}
                                </div>
                            </ScrollArea>
                        </TabsContent>
                    </Tabs>
                </CardContent>
            </Card>
        </>
    );
}
