"use client";

import { Button } from "@foundry/ui/primitives/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@foundry/ui/primitives/tooltip";

interface FieldHintProps {
    label: string;
    text: string;
}

export function FieldHint({ label, text }: FieldHintProps) {
    return (
        <Tooltip>
            <TooltipTrigger asChild>
                <Button aria-label={label} className="rounded-full text-[10px]" size="icon-sm" type="button" variant="ghost">
                    ?
                </Button>
            </TooltipTrigger>
            <TooltipContent side="top">{text}</TooltipContent>
        </Tooltip>
    );
}
