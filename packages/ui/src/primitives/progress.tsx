"use client";

import { cn } from "@foundry/ui/lib/utils";
import * as ProgressPrimitive from "@radix-ui/react-progress";
import type * as React from "react";

type ProgressVariant = "default" | "success" | "warning" | "danger";

interface ProgressProps extends React.ComponentProps<typeof ProgressPrimitive.Root> {
    variant?: ProgressVariant;
}

function getIndicatorClass(variant: ProgressVariant | undefined) {
    switch (variant) {
        case "success":
            return "h-full w-full flex-1 bg-emerald-500 transition-all";
        case "warning":
            return "h-full w-full flex-1 bg-amber-500 transition-all";
        case "danger":
            return "h-full w-full flex-1 bg-destructive transition-all";
        default:
            return "h-full w-full flex-1 bg-primary transition-all";
    }
}

function Progress({ className, value, variant = "default", ...props }: ProgressProps) {
    return (
        <ProgressPrimitive.Root className={cn("relative h-2 w-full overflow-hidden rounded-full bg-primary/20", className)} data-slot="progress" {...props}>
            <ProgressPrimitive.Indicator
                className={getIndicatorClass(variant)}
                data-slot="progress-indicator"
                style={{ transform: `translateX(-${100 - (value || 0)}%)` }}
            />
        </ProgressPrimitive.Root>
    );
}

export { Progress };
