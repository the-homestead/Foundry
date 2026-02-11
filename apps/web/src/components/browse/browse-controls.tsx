"use client";

import { cn } from "@foundry/ui/lib/utils";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@foundry/ui/primitives/select";
import { Slider } from "@foundry/ui/primitives/slider";
import { useState } from "react";

export interface BrowseControlsProps {
    totalProjects: number;
    className?: string;
}

export function BrowseControls({ totalProjects, className }: BrowseControlsProps) {
    // These would typically be controlled by parent or URL params
    const [gridSpacing, setGridSpacing] = useState([4]); // Initial gap: 4 (1rem)
    const [itemsPerPage, setItemsPerPage] = useState("20");
    const [sortOption, setSortOption] = useState("downloads");

    return (
        <div className={cn("flex flex-col gap-4 rounded-lg border bg-card p-4 shadow-sm", className)}>
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                {/* Left Side: Stats & View Toggles (Future) */}
                <div className="flex items-center gap-4 text-muted-foreground text-sm">
                    <span className="font-semibold text-foreground">{totalProjects}</span> Projects Found
                </div>

                {/* Right Side: Controls */}
                <div className="flex flex-wrap items-center gap-4">
                    {/* Grid Spacing Slider */}
                    <div className="flex w-32 flex-col gap-1.5">
                        <span className="font-medium text-muted-foreground text-xs">Spacing</span>
                        <Slider className="w-full" max={10} min={0} onValueChange={setGridSpacing} step={1} value={gridSpacing} />
                    </div>

                    <div className="hidden h-8 w-px bg-border sm:block" />

                    {/* Items Per Page */}
                    <div className="flex items-center gap-2">
                        <span className="font-medium text-muted-foreground text-xs">Count</span>
                        <Select onValueChange={setItemsPerPage} value={itemsPerPage}>
                            <SelectTrigger className="h-8 w-[70px]">
                                <SelectValue placeholder="20" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="20">20</SelectItem>
                                <SelectItem value="40">40</SelectItem>
                                <SelectItem value="60">60</SelectItem>
                                <SelectItem value="80">80</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Sort Options */}
                    <div className="flex items-center gap-2">
                        <span className="font-medium text-muted-foreground text-xs">Sort</span>
                        <Select onValueChange={setSortOption} value={sortOption}>
                            <SelectTrigger className="h-8 w-[170px]">
                                <SelectValue placeholder="Sort By" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="downloads">Total Downloads</SelectItem>
                                <SelectItem value="unique_downloads">Unique Downloads</SelectItem>
                                <SelectItem value="name">Name</SelectItem>
                                <SelectItem value="created">Date Added</SelectItem>
                                <SelectItem value="updated">Last Updated</SelectItem>
                                <SelectItem value="likes">Total Likes</SelectItem>
                                <SelectItem value="size">File Size</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>
            </div>
        </div>
    );
}
