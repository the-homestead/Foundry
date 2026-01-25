"use client";

import { cn } from "@foundry/ui/lib/utils";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@foundry/ui/primitives/hover-card";
import Image from "next/image";
import type { ComponentProps } from "react";

export type GlimpseProps = ComponentProps<typeof HoverCard>;

export const Glimpse = (props: GlimpseProps) => {
    return <HoverCard {...props} />;
};

export type GlimpseContentProps = ComponentProps<typeof HoverCardContent>;

export const GlimpseContent = (props: GlimpseContentProps) => <HoverCardContent {...props} />;

export type GlimpseTriggerProps = ComponentProps<typeof HoverCardTrigger>;

export const GlimpseTrigger = (props: GlimpseTriggerProps) => <HoverCardTrigger {...props} />;

export type GlimpseTitleProps = ComponentProps<"p">;

export const GlimpseTitle = ({ className, ...props }: GlimpseTitleProps) => {
    return <p className={cn("truncate font-semibold text-sm", className)} {...props} />;
};

export type GlimpseDescriptionProps = ComponentProps<"p">;

export const GlimpseDescription = ({ className, ...props }: GlimpseDescriptionProps) => {
    return <p className={cn("line-clamp-2 text-muted-foreground text-sm", className)} {...props} />;
};

export type GlimpseImageProps = Omit<ComponentProps<typeof Image>, "ref"> & {
    src: string;
    alt?: string;
    className?: string;
};

export const GlimpseImage = ({ src, alt = "", className, ...props }: GlimpseImageProps) => {
    const isIcon = src.endsWith(".ico") || src.includes("favicon") || src.includes("duckduckgo.com");
    const isSvg = src.endsWith(".svg");

    // For icons and SVGs, use a fixed-size, centered container with background
    if (isIcon || isSvg) {
        return (
            <div className={cn("mx-auto mb-4 flex h-10 w-10 items-center justify-center rounded-md border bg-muted", className)} style={{ minWidth: 40, minHeight: 40 }}>
                {isSvg ? (
                    <Image alt={alt} height={32} src={src} style={{ maxWidth: 32, maxHeight: 32, display: "block" }} unoptimized width={32} />
                ) : (
                    <Image alt={alt} height={32} src={src} style={{ maxWidth: 32, maxHeight: 32, display: "block" }} unoptimized={isIcon} width={32} />
                )}
            </div>
        );
    }

    // Default for regular images
    const defaultWidth = 320;
    const defaultHeight = 168; // 320 * (63/120)
    return (
        <Image
            alt={alt}
            className={cn("mb-4 aspect-120/63 w-full rounded-md border object-contain", className)}
            height={typeof props.height === "number" ? props.height : defaultHeight}
            sizes="100vw"
            src={src}
            width={typeof props.width === "number" ? props.width : defaultWidth}
            {...props}
        />
    );
};
