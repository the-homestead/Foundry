"use client";

import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";
import { cn } from "@foundry/ui/lib/utils";

const checkboxVariants = cva(
    "group inline-flex items-center gap-2 cursor-pointer select-none",
    {
        variants: {
            variant: {
                default:
                    "[--checkbox-checked:theme(colors.primary.DEFAULT)] [--checkbox-unchecked:theme(colors.border)]",
                destructive:
                    "[--checkbox-checked:theme(colors.destructive.DEFAULT)] [--checkbox-unchecked:theme(colors.border)]",
                success:
                    "[--checkbox-checked:#22c55e] [--checkbox-unchecked:theme(colors.border)]",
            },
            size: {
                sm: "[--checkbox-size:1rem]",
                default: "[--checkbox-size:1.5rem]",
                lg: "[--checkbox-size:2rem]",
            },
        },
        defaultVariants: {
            variant: "default",
            size: "default",
        },
    },
);

interface CheckboxProps
    extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "size" | "checked">,
        VariantProps<typeof checkboxVariants> {
    label?: string;
    /**
     * Radix-compatible event used across the codebase — accept and map to the native input onChange.
     */
    onCheckedChange?: (checked: boolean | "indeterminate") => void;
    /**
     * Allow `checked` to be the tri-state value (`true | false | "indeterminate"`) used by callers.
     */
    checked?: boolean | "indeterminate";
}

function Checkbox({ className, variant, size, label, id, checked, onCheckedChange, onChange, ...props }: CheckboxProps) {
    const generatedId = React.useId();
    const inputId = id || generatedId;
    const inputRef = React.useRef<HTMLInputElement | null>(null);

    const isControlled = checked !== undefined;
    const inputChecked = isControlled ? (checked === "indeterminate" ? false : Boolean(checked)) : undefined;

    React.useEffect(() => {
        if (inputRef.current) {
            inputRef.current.indeterminate = checked === "indeterminate";
        }
    }, [checked]);

    function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
        onChange?.(e);
        onCheckedChange?.(e.target.checked);
    }

    return (
        <label htmlFor={inputId} className={cn(checkboxVariants({ variant, size, className }))}>
            <input
                ref={inputRef}
                id={inputId}
                type="checkbox"
                className="peer sr-only"
                {...(isControlled ? { checked: inputChecked } : {})}
                onChange={handleChange}
                {...props}
            />
            <svg
                className="overflow-visible"
                viewBox="0 0 64 64"
                style={{ height: "var(--checkbox-size)", width: "var(--checkbox-size)" }}
                aria-hidden
            >
                <path
                    d="M 0 16 V 56 A 8 8 90 0 0 8 64 H 56 A 8 8 90 0 0 64 56 V 8 A 8 8 90 0 0 56 0 H 8 A 8 8 90 0 0 0 8 V 16 L 32 48 L 64 16 V 8 A 8 8 90 0 0 56 0 H 8 A 8 8 90 0 0 0 8 V 56 A 8 8 90 0 0 8 64 H 56 A 8 8 90 0 0 64 56 V 16"
                    className={cn(
                        "fill-none stroke-6 stroke-linecap-round stroke-linejoin-round",
                        "transition-all duration-500 ease-out",
                        "[stroke-dasharray:241_9999999] [stroke-dashoffset:0]",
                        "stroke-(--checkbox-unchecked)",
                        "group-has-checked:stroke-(--checkbox-checked)",
                        "group-has-checked:[stroke-dasharray:70.5096664428711_9999999]",
                        "group-has-checked:[stroke-dashoffset:-262.2723388671875]",
                    )}
                />
            </svg>
            {label && <span className="text-sm text-foreground">{label}</span>}
        </label>
    );
}

export { Checkbox };
