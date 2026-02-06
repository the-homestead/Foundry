"use client";

import { getIconList } from "@foundry/ui/icons";
import { Badge } from "@foundry/ui/primitives/badge";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList } from "@foundry/ui/primitives/breadcrumb";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@foundry/ui/primitives/tabs";
import { IconsTab } from "@foundry/web/components/dev/icons-tab";
import { KiboTab } from "@foundry/web/components/dev/kibo-tab";
import { MarkdownTab } from "@foundry/web/components/dev/markdown-tab";
import { PrimitivesTab, primitiveGroups } from "@foundry/web/components/dev/primitives-tab";
import { TestingTab } from "@foundry/web/components/dev/testing";
import { useEffect, useMemo } from "react";

export default function DevShowcasePage() {
    const icons = useMemo(() => getIconList(), []);

    useEffect(() => {
        requestAnimationFrame(() => {
            window.scrollTo({ top: 0, left: 0, behavior: "auto" });
        });
    }, []);

    return (
        <>
            <header className="flex h-16 shrink-0 items-center gap-2">
                <div className="flex items-center gap-2 px-4">
                    <Breadcrumb>
                        <BreadcrumbList>
                            <BreadcrumbItem className="hidden md:block">
                                <BreadcrumbLink href="#">UI Development</BreadcrumbLink>
                            </BreadcrumbItem>
                        </BreadcrumbList>
                    </Breadcrumb>
                </div>
            </header>

            <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
                <Tabs className="flex flex-1 flex-col gap-4" defaultValue="primitives">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                        <TabsList className="bg-muted">
                            <TabsTrigger value="primitives">Primitives</TabsTrigger>
                            <TabsTrigger value="kibo">Kibo UI</TabsTrigger>
                            <TabsTrigger value="icons">Icons</TabsTrigger>
                            <TabsTrigger value="markdown">Markdown</TabsTrigger>
                            <TabsTrigger value="testing">Testing</TabsTrigger>
                        </TabsList>
                        <div className="flex items-center gap-2 text-muted-foreground text-sm">
                            <Badge variant="outline">Primitives: {primitiveGroups.reduce((sum, group) => sum + group.items.length, 0)}</Badge>
                            <Badge variant="outline">Kibo UI: 6</Badge>
                            <Badge variant="outline">Icons: {icons.length}</Badge>
                        </div>
                    </div>

                    <TabsContent className="space-y-6" value="primitives">
                        <PrimitivesTab />
                    </TabsContent>

                    <TabsContent className="space-y-6" value="kibo">
                        <KiboTab />
                    </TabsContent>

                    <TabsContent className="space-y-4" value="icons">
                        <IconsTab />
                    </TabsContent>

                    <TabsContent className="space-y-6" value="markdown">
                        <MarkdownTab />
                    </TabsContent>

                    <TabsContent className="space-y-6" value="testing">
                        <TestingTab />
                    </TabsContent>
                </Tabs>
            </div>
        </>
    );
}
