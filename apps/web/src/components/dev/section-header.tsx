"use client";

import { Label } from "@foundry/ui/primitives/label";
import { Separator } from "@foundry/ui/primitives/separator";
import { Tooltip, TooltipContent, TooltipTrigger } from "@foundry/ui/primitives/tooltip";

interface SectionHeaderProps {
    title: string;
    description?: string;
    tooltip?: string;
}

export function SectionHeader({ title, description, tooltip }: SectionHeaderProps) {
    const label = <Label className="px-3 text-center font-medium text-muted-foreground text-sm uppercase tracking-wide">{title}</Label>;

    return (
        <div className="space-y-2">
            <div className="flex items-center gap-3">
                <Separator className="flex-1" />
                {tooltip ? (
                    <Tooltip>
                        <TooltipTrigger asChild>{label}</TooltipTrigger>
                        <TooltipContent>{tooltip}</TooltipContent>
                    </Tooltip>
                ) : (
                    label
                )}
                <Separator className="flex-1" />
            </div>
            {description ? <p className="text-center text-muted-foreground text-sm">{description}</p> : null}
        </div>
    );
}
