"use client";

import { cn } from "@foundry/ui/lib/utils";
import * as SwitchPrimitive from "@radix-ui/react-switch";
import type * as React from "react";

function Switch({ className, ...props }: React.ComponentProps<typeof SwitchPrimitive.Root>) {
    return (
        <SwitchPrimitive.Root
            className={cn(
                "peer group relative inline-flex h-[1.15rem] w-8 shrink-0 items-center rounded-full border border-transparent shadow-xs outline-none transition-colors duration-200 focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=unchecked]:bg-input dark:data-[state=unchecked]:bg-input/80",
                className
            )}
            data-slot="switch"
            {...props}
        >
            {/* SVG track with stroke-draw animation to match checkbox  style */}
            <svg
                className="absolute inset-0 z-0 w-full h-full pointer-events-none"
                viewBox="0 0 64 32"
                preserveAspectRatio="none"
                aria-hidden
                focusable="false"
            >
                <rect
                    x="4"
                    y="6"
                    width="56"
                    height="20"
                    rx="999"
                    ry="999"
                    className={cn(
                        "fill-none stroke-border stroke-2 opacity-60",
                        "transition-[stroke-dasharray,stroke-dashoffset,stroke] duration-300 ease-out",
                        "[stroke-dasharray:135_9999999] [stroke-dashoffset:0]",
                        "group-data-[state=checked]:[stroke-dasharray:48_9999999]",
                        "group-data-[state=checked]:[stroke-dashoffset:-170]",
                        "group-data-[state=checked]:stroke-primary"
                    )}
                />

                {/* subtle checkmark that is stroke-drawn when toggled */}
                <path
                    d="M22 16 L30 24 L46 10"
                    className={cn(
                        "fill-none stroke-2 stroke-linecap-round stroke-linejoin-round",
                        "opacity-0 transition-all duration-350 ease-out",
                        "[stroke-dasharray:50_9999999] [stroke-dashoffset:50]",
                        "group-data-[state=checked]:opacity-100",
                        "group-data-[state=checked]:[stroke-dashoffset:0]",
                        "group-data-[state=checked]:stroke-primary"
                    )}
                />
            </svg>

            <SwitchPrimitive.Thumb
                className={cn(
                    "pointer-events-none relative z-10 block size-4 rounded-full bg-background ring-0 transform-gpu transition-transform duration-300 ease-out",
                    "data-[state=checked]:translate-x-[calc(100%-2px)] data-[state=checked]:scale-105 data-[state=unchecked]:translate-x-0 data-[state=unchecked]:scale-100",
                    "dark:data-[state=checked]:bg-primary-foreground dark:data-[state=unchecked]:bg-foreground"
                )}
                data-slot="switch-thumb"
            />
        </SwitchPrimitive.Root>
    );
}

export { Switch };
