"use client";

import { getIconList } from "@foundry/ui/icons";
import { cn } from "@foundry/ui/lib/utils";
import { Button } from "@foundry/ui/primitives/button";
import { Input } from "@foundry/ui/primitives/input";
import { Popover, PopoverContent, PopoverTrigger } from "@foundry/ui/primitives/popover";
import { useVirtualizer } from "@tanstack/react-virtual";
import { Check, ChevronsUpDown, icons, SearchIcon, X } from "lucide-react";
import type { ComponentType } from "react";
import { useMemo, useRef, useState } from "react";

interface LucideIcon {
    name: string;
    icon: ComponentType<{ size?: number; className?: string }>;
}

function getLucideIconsList(): LucideIcon[] {
    return Object.entries(icons)
        .filter(([name]) => name !== "createLucideIcon" && name !== "default")
        .map(([name, icon]) => ({
            name,
            icon: icon as ComponentType<{ size?: number; className?: string }>,
        }));
}

interface IconSelectorProps {
    value?: string;
    onValueChange: (value: string) => void;
    placeholder?: string;
    iconType?: "lucide" | "animated" | "both";
}

export function IconSelector({ value, onValueChange, placeholder = "Select an icon...", iconType = "both" }: IconSelectorProps) {
    const [open, setOpen] = useState(false);
    const [search, setSearch] = useState("");
    const parentRef = useRef<HTMLDivElement>(null);

    const animatedIcons = useMemo(() => getIconList(), []);
    const lucideIcons = useMemo(() => getLucideIconsList(), []);

    const allIcons = useMemo(() => {
        const icons: Array<{ name: string; type: "lucide" | "animated"; icon: ComponentType<{ size?: number; className?: string }> }> = [];

        if (iconType === "lucide" || iconType === "both") {
            icons.push(...lucideIcons.map((icon) => ({ ...icon, type: "lucide" as const })));
        }

        if (iconType === "animated" || iconType === "both") {
            icons.push(...animatedIcons.map((icon) => ({ name: icon.name, type: "animated" as const, icon: icon.icon as ComponentType<{ size?: number; className?: string }> })));
        }

        return icons;
    }, [iconType, lucideIcons, animatedIcons]);

    const filteredIcons = useMemo(() => {
        if (!search.trim()) {
            return allIcons;
        }
        const term = search.toLowerCase();
        return allIcons.filter((icon) => icon.name.toLowerCase().includes(term));
    }, [search, allIcons]);

    const selectedIcon = allIcons.find((icon) => icon.name === value);

    const rowVirtualizer = useVirtualizer({
        count: filteredIcons.length,
        getScrollElement: () => parentRef.current,
        estimateSize: () => 40,
        overscan: 5,
        enabled: open,
    });

    return (
        <Popover
            onOpenChange={(isOpen) => {
                setOpen(isOpen);
                if (isOpen) {
                    // Small delay to ensure the DOM is ready
                    setTimeout(() => {
                        rowVirtualizer.measure();
                    }, 0);
                }
            }}
            open={open}
        >
            <PopoverTrigger asChild>
                <Button aria-expanded={open} className="w-full justify-between" role="combobox" variant="outline">
                    {selectedIcon ? (
                        <div className="flex items-center gap-2">
                            <selectedIcon.icon className="h-4 w-4" />
                            <span className="capitalize">{selectedIcon.name.replace(/-/g, " ")}</span>
                            <span className="ml-auto text-muted-foreground text-xs">({selectedIcon.type})</span>
                        </div>
                    ) : (
                        placeholder
                    )}
                    <div className="ml-auto flex items-center gap-2">
                        {value ? (
                            <X
                                className="h-4 w-4 opacity-50 hover:opacity-100"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onValueChange("");
                                }}
                            />
                        ) : null}
                        <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50" />
                    </div>
                </Button>
            </PopoverTrigger>
            <PopoverContent align="start" className="w-[400px] p-0">
                <div className="flex flex-col">
                    {/* Search Input */}
                    <div className="flex items-center gap-2 border-b px-3 py-2">
                        <SearchIcon className="h-4 w-4 shrink-0 opacity-50" />
                        <Input className="h-8 border-0 p-0 focus-visible:ring-0" onChange={(e) => setSearch(e.target.value)} placeholder="Search icons..." value={search} />
                    </div>

                    {/* Virtualized List */}
                    {filteredIcons.length === 0 ? (
                        <div className="py-6 text-center text-sm">No icon found.</div>
                    ) : (
                        <div className="h-[300px] overflow-auto" ref={parentRef}>
                            <div
                                style={{
                                    height: `${rowVirtualizer.getTotalSize()}px`,
                                    width: "100%",
                                    position: "relative",
                                }}
                            >
                                {rowVirtualizer.getVirtualItems().map((virtualRow) => {
                                    const icon = filteredIcons[virtualRow.index];
                                    if (!icon) {
                                        return null;
                                    }
                                    const IconComponent = icon.icon;
                                    const isSelected = value === icon.name;

                                    return (
                                        <button
                                            className={cn(
                                                "absolute top-0 left-0 flex w-full cursor-pointer items-center gap-2 rounded-sm px-2 py-2 text-left text-sm outline-hidden transition-colors hover:bg-accent hover:text-accent-foreground",
                                                isSelected && "bg-accent text-accent-foreground"
                                            )}
                                            key={virtualRow.key}
                                            onClick={() => {
                                                onValueChange(icon.name === value ? "" : icon.name);
                                                setOpen(false);
                                            }}
                                            style={{
                                                height: `${virtualRow.size}px`,
                                                transform: `translateY(${virtualRow.start}px)`,
                                            }}
                                            type="button"
                                        >
                                            <Check className={cn("h-4 w-4 flex-shrink-0", isSelected ? "opacity-100" : "opacity-0")} />
                                            <IconComponent className="h-4 w-4 flex-shrink-0" />
                                            <span className="flex-1 truncate capitalize">{icon.name.replace(/-/g, " ")}</span>
                                            <span className="flex-shrink-0 text-muted-foreground text-xs">({icon.type})</span>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </div>
            </PopoverContent>
        </Popover>
    );
}
