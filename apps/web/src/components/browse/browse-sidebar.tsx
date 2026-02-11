"use client";

import { getIconList } from "@foundry/ui/icons";
import { Button } from "@foundry/ui/primitives/button";
import { Checkbox } from "@foundry/ui/primitives/checkbox";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@foundry/ui/primitives/collapsible";
import { Input } from "@foundry/ui/primitives/input";
import { Label } from "@foundry/ui/primitives/label";
import { ScrollArea } from "@foundry/ui/primitives/scroll-area";
import { Separator } from "@foundry/ui/primitives/separator";
import { ChevronDown, ChevronRight, FolderIcon, icons, Search } from "lucide-react";
import type { ComponentType } from "react";
// biome-ignore lint/performance/noNamespaceImport: <React>
import * as React from "react";

// Helper component to render category icons
function CategoryIcon({ iconName, className = "h-4 w-4" }: { iconName?: string | null; className?: string }) {
    const animatedIcons = React.useMemo(() => getIconList(), []);

    if (!iconName) {
        return <FolderIcon className={className} />;
    }

    // Try Lucide icons first
    const lucideIcon = icons[iconName as keyof typeof icons] as
        | ComponentType<{
              size?: number;
              className?: string;
          }>
        | undefined;

    if (lucideIcon) {
        const LucideIcon = lucideIcon;
        return <LucideIcon className={className} />;
    }

    // Try animated icons
    const animatedIcon = animatedIcons.find((icon) => icon.name === iconName);
    if (animatedIcon) {
        const AnimatedIcon = animatedIcon.icon as ComponentType<{
            className?: string;
        }>;
        return <AnimatedIcon className={className} />;
    }

    // Fallback to folder icon
    return <FolderIcon className={className} />;
}

interface SidebarSectionProps {
    title: string;
    children: React.ReactNode;
    defaultOpen?: boolean;
}

function SidebarSection({ title, children, defaultOpen = true }: SidebarSectionProps) {
    const [isOpen, setIsOpen] = React.useState(defaultOpen);

    return (
        <Collapsible className="w-full space-y-2" onOpenChange={setIsOpen} open={isOpen}>
            <div className="flex items-center justify-between">
                <h4 className="font-semibold text-sm">{title}</h4>
                <CollapsibleTrigger asChild>
                    <Button className="h-8 w-8 p-0" size="sm" variant="ghost">
                        {isOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                        <span className="sr-only">Toggle {title}</span>
                    </Button>
                </CollapsibleTrigger>
            </div>
            <CollapsibleContent className="space-y-4">{children}</CollapsibleContent>
            <Separator className="my-4" />
        </Collapsible>
    );
}

export interface BrowseSidebarProps {
    gameName: string;
    categories: { id: string; name: string; slug: string; icon?: string | null }[];
    versions: string[];
    modLoaders: string[];
}

export function BrowseSidebar({ gameName, categories, versions, modLoaders }: BrowseSidebarProps) {
    // TODO: Connect to URL search params for filtering

    return (
        <div className="space-y-4 py-4">
            <div className="px-3 py-2">
                <h2 className="mb-2 px-4 font-semibold text-lg tracking-tight">{gameName}</h2>
                <div className="space-y-1">
                    <div className="relative px-4">
                        <Search className="absolute top-2.5 left-6 h-4 w-4 text-muted-foreground" />
                        <Input className="pl-8" placeholder="Search projects..." />
                    </div>
                </div>
            </div>

            <div className="px-3">
                {/* Categories */}
                {/* Categories */}
                <SidebarSection title="Categories">
                    <ScrollArea className="h-[200px] px-1">
                        <div className="space-y-2">
                            {categories.map((category) => (
                                <div className="flex items-center space-x-2" key={category.id}>
                                    <Checkbox id={`cat-${category.id}`} />
                                    <CategoryIcon className="h-4 w-4 text-muted-foreground" iconName={category.icon} />
                                    <Label className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70" htmlFor={`cat-${category.id}`}>
                                        {category.name}
                                    </Label>
                                </div>
                            ))}
                            {categories.length === 0 && <p className="text-muted-foreground text-sm">No categories found.</p>}
                        </div>
                    </ScrollArea>
                </SidebarSection>

                {/* Game Versions */}
                {versions.length > 0 && (
                    <SidebarSection title="Game Version">
                        <ScrollArea className="h-[150px] px-1">
                            <div className="space-y-2">
                                {versions.map((version) => (
                                    <div className="flex items-center space-x-2" key={version}>
                                        <Checkbox id={`ver-${version}`} />
                                        <Label htmlFor={`ver-${version}`}>{version}</Label>
                                    </div>
                                ))}
                            </div>
                        </ScrollArea>
                    </SidebarSection>
                )}

                {/* Mod Loaders */}
                {modLoaders.length > 0 && (
                    <SidebarSection title="Mod Loader">
                        <div className="space-y-2">
                            {modLoaders.map((loader) => (
                                <div className="flex items-center space-x-2" key={loader}>
                                    <Checkbox id={`loader-${loader}`} />
                                    <Label htmlFor={`loader-${loader}`}>{loader}</Label>
                                </div>
                            ))}
                        </div>
                    </SidebarSection>
                )}

                {/* Other Filters Placeholder */}
                <SidebarSection defaultOpen={false} title="Filters">
                    <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                            <Checkbox id="featured" />
                            <Label htmlFor="featured">Featured</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                            <Checkbox id="updated" />
                            <Label htmlFor="updated">Recently Updated</Label>
                        </div>
                    </div>
                </SidebarSection>
            </div>
        </div>
    );
}
