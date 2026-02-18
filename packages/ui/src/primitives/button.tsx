"use client";

import { cn } from "@foundry/ui/lib/utils";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import type * as React from "react";

const buttonVariants = cva(
    "inline-flex shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-md font-medium text-sm outline-none transition-all cursor-pointer focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 data-[loading]:pointer-events-none data-[loading]:cursor-not-allowed data-[loading]:opacity-50 aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 [&_svg:not([class*='size-'])]:size-4 [&_svg]:pointer-events-none [&_svg]:shrink-0",
    {
        variants: {
            variant: {
                default: "bg-primary text-primary-foreground hover:bg-primary/90",
                destructive: "bg-destructive text-white hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:bg-destructive/60 dark:focus-visible:ring-destructive/40",
                outline: "border bg-background shadow-xs hover:bg-accent hover:text-accent-foreground dark:border-input dark:bg-input/30 dark:hover:bg-input/50",
                secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
                ghost: "hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent/50",
                link: "text-primary underline-offset-4 hover:underline",
            },
            size: {
                default: "h-9 px-4 py-2 has-[>svg]:px-3",
                sm: "h-8 gap-1.5 rounded-md px-3 has-[>svg]:px-2.5",
                lg: "h-10 rounded-md px-6 has-[>svg]:px-4",
                icon: "size-9",
                "icon-sm": "size-8",
                "icon-lg": "size-10",
            },
        },
        defaultVariants: {
            variant: "default",
            size: "default",
        },
    }
);

function Button({
    className,
    variant = "default",
    size = "default",
    asChild = false,
    isLoading = false,
    focusableWhenDisabled = false,
    disabled,
    onClick,
    ...props
}: React.ComponentProps<"button"> &
    VariantProps<typeof buttonVariants> & {
        asChild?: boolean;
        /** show a loading state and make the button inert */
        isLoading?: boolean;
        /** when true + isLoading preserves focus (does not apply native disabled attr) */
        focusableWhenDisabled?: boolean;
    }) {
    const Comp = asChild ? Slot : "button";

    // When loading we want to prevent interaction but optionally keep the
    // element focusable for keyboard users. If focusableWhenDisabled is
    // true we don't set the native `disabled` attribute (browsers remove
    // focus for disabled elements) — instead we mark the element as
    // aria-disabled and prevent clicks in the click handler below.
    const isActuallyDisabled = Boolean(disabled || (isLoading && !focusableWhenDisabled));
    const ariaDisabled = Boolean(disabled || isLoading);

    const handleClick: React.MouseEventHandler<any> | undefined = (e) => {
        if (isLoading || disabled) {
            // swallow clicks while loading/disabled so consumers don't need
            // to check again inside handlers
            e.preventDefault();
            e.stopPropagation();
            return;
        }

        return onClick?.(e as any);
    };

    return (
        <Comp
            className={cn(buttonVariants({ variant, size, className }))}
            data-size={size}
            data-slot="button"
            data-variant={variant}
            data-loading={isLoading ? true : undefined}
            aria-disabled={ariaDisabled || undefined}
            aria-busy={isLoading ? true : undefined}
            disabled={isActuallyDisabled || undefined}
            onClick={handleClick}
            {...props}
        />
    );
}

export { Button, buttonVariants };
