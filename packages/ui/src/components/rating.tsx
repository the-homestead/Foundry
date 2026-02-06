"use client";

import { StarIcon } from "@foundry/ui/icons";
import { cn } from "@foundry/ui/lib/utils";
import React from "react";

interface RatingStarProps {
    fill: number;
    size: number;
    className?: string;
    filledClassName?: string;
    outlineClassName?: string;
}

const RatingStar = ({ fill, size, className, filledClassName, outlineClassName }: RatingStarProps) => {
    const fillPercentage = `${Math.round(fill * 100)}%`;

    return (
        <span className={cn("relative inline-flex", className)} style={{ height: size, width: size }}>
            <StarIcon className={cn("text-muted-foreground transition-colors", outlineClassName)} size={size} />
            <span className="absolute inset-0 overflow-hidden" style={{ pointerEvents: "none", width: fillPercentage }}>
                <StarIcon className={cn("text-amber-400", filledClassName)} filled size={size} />
            </span>
        </span>
    );
};

export interface RatingProps {
    value?: number;
    defaultValue?: number;
    max?: number;
    size?: number;
    readOnly?: boolean;
    onChange?: (value: number) => void;
    className?: string;
    starClassName?: string;
    filledClassName?: string;
    label?: string;
    showValue?: boolean;
}

export const Rating = ({
    value,
    defaultValue = 0,
    max = 5,
    size = 18,
    readOnly = true,
    onChange,
    className,
    starClassName,
    filledClassName,
    label = "Rating",
    showValue = false,
}: RatingProps) => {
    const [internalValue, setInternalValue] = React.useState(defaultValue);
    const [hoverValue, setHoverValue] = React.useState<number | null>(null);

    const isControlled = typeof value === "number";
    const maxStars = Math.max(1, max);
    const currentValue = isControlled ? value : internalValue;
    const clampedValue = Math.min(Math.max(currentValue, 0), maxStars);
    const displayValue = hoverValue ?? clampedValue;
    const selectedValue = Math.min(maxStars, Math.max(0, Math.round(clampedValue)));
    const interactive = !readOnly;

    const handleSelect = React.useCallback(
        (nextValue: number) => {
            if (readOnly) {
                return;
            }
            if (!isControlled) {
                setInternalValue(nextValue);
            }
            onChange?.(nextValue);
        },
        [isControlled, onChange, readOnly]
    );

    const handleKeyDown = React.useCallback(
        (event: React.KeyboardEvent<HTMLButtonElement>) => {
            if (!interactive) {
                return;
            }

            if (event.key === "ArrowRight" || event.key === "ArrowUp") {
                event.preventDefault();
                handleSelect(Math.min(maxStars, Math.max(1, selectedValue + 1)));
            }

            if (event.key === "ArrowLeft" || event.key === "ArrowDown") {
                event.preventDefault();
                handleSelect(Math.max(1, selectedValue - 1));
            }
        },
        [handleSelect, interactive, maxStars, selectedValue]
    );

    if (!interactive) {
        return (
            <div aria-label={label} className={cn("inline-flex items-center gap-1", className)} role="img">
                {Array.from({ length: maxStars }, (_, index) => {
                    const starValue = index + 1;
                    const fill = Math.min(Math.max(displayValue - index, 0), 1);

                    return <RatingStar className={starClassName} fill={fill} filledClassName={filledClassName} key={starValue} outlineClassName={starClassName} size={size} />;
                })}
                {showValue ? <span className="text-muted-foreground text-xs">{displayValue.toFixed(1)}</span> : null}
            </div>
        );
    }

    return (
        <fieldset aria-label={label} className={cn("inline-flex items-center gap-1 border-0 p-0", className)}>
            {Array.from({ length: maxStars }, (_, index) => {
                const starValue = index + 1;
                const fill = Math.min(Math.max(displayValue - index, 0), 1);
                const isSelected = starValue === Math.max(1, selectedValue);

                return (
                    <button
                        aria-label={`${label}: ${starValue} of ${maxStars}`}
                        aria-pressed={isSelected}
                        className="rounded-sm p-1 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        key={starValue}
                        onClick={() => handleSelect(starValue)}
                        onFocus={() => setHoverValue(starValue)}
                        onKeyDown={handleKeyDown}
                        onMouseEnter={() => setHoverValue(starValue)}
                        onMouseLeave={() => setHoverValue(null)}
                        tabIndex={isSelected ? 0 : -1}
                        type="button"
                    >
                        <RatingStar className={starClassName} fill={fill} filledClassName={filledClassName} outlineClassName={starClassName} size={size} />
                    </button>
                );
            })}
            {showValue ? <span className="text-muted-foreground text-xs">{displayValue.toFixed(1)}</span> : null}
        </fieldset>
    );
};
