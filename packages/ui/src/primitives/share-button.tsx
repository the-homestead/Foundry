/** biome-ignore-all lint/performance/noNamespaceImport: <React> */
"use client";

import { cn } from "@foundry/ui/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";
import { Facebook, Github, Share2, X } from "lucide-react";
import { AnimatePresence, type HTMLMotionProps, motion } from "motion/react";
import * as React from "react";

const buttonVariants = cva(
    "relative inline-flex shrink-0 cursor-pointer items-center justify-center gap-2 overflow-hidden whitespace-nowrap rounded-lg font-medium text-sm outline-none transition-all focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 [&_svg:not([class*='size-'])]:size-4 [&_svg]:pointer-events-none [&_svg]:shrink-0",
    {
        variants: {
            size: {
                default: "h-10 min-w-28 px-4 py-2",
                sm: "h-9 min-w-24 gap-1.5 rounded-md px-3",
                md: "h-10 min-w-28 px-4 py-2",
                lg: "h-11 min-w-32 px-8",
            },
            icon: {
                suffix: "pl-4",
                prefix: "pr-4",
            },
        },
        defaultVariants: {
            size: "default",
        },
    }
);

const iconSizeMap = {
    sm: 16,
    md: 20,
    lg: 28,
    default: 16,
};

type ShareButtonProps = HTMLMotionProps<"button"> & {
    children: React.ReactNode;
    className?: string;
    onIconClick?: (platform: "github" | "x" | "facebook") => void;
} & VariantProps<typeof buttonVariants>;

function ShareButton({ children, className, size, icon, onIconClick, ...props }: ShareButtonProps) {
    const [hovered, setHovered] = React.useState(false);
    return (
        <motion.button
            className={cn("bg-primary text-primary-foreground hover:bg-primary/90", buttonVariants({ size, className, icon }))}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            {...props}
        >
            <AnimatePresence initial={false} mode="wait">
                {hovered ? (
                    <motion.div
                        animate={{ opacity: 1, y: 0 }}
                        className="absolute top-0 right-0 bottom-0 left-0 flex items-center justify-center gap-2"
                        exit={{ opacity: 0, y: 24 }}
                        initial={{ opacity: 0, y: 24 }}
                        key="icons"
                        transition={{ duration: 0.3 }}
                    >
                        <ShareIconGroup onIconClick={onIconClick} size={size} />
                    </motion.div>
                ) : (
                    <motion.div
                        animate={{ opacity: 1, y: 0 }}
                        className="absolute top-0 right-0 bottom-0 left-0 flex items-center justify-center gap-2"
                        exit={{ opacity: 0, y: -24 }}
                        initial={{ opacity: 1, y: 0 }}
                        key="content"
                        transition={{ duration: 0.3 }}
                    >
                        {icon === "prefix" && <Share2 className="size-4" size={iconSizeMap[size as keyof typeof iconSizeMap]} />}
                        {children}
                        {icon === "suffix" && <Share2 className="size-4" size={iconSizeMap[size as keyof typeof iconSizeMap]} />}
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.button>
    );
}

const shareIconGroupVariants = cva("flex items-center justify-center gap-3", {
    variants: {
        size: {
            default: "text-[16px]",
            sm: "text-[16px]",
            md: "text-[20px]",
            lg: "text-[28px]",
        },
    },
    defaultVariants: {
        size: "default",
    },
});

type ShareIconGroupProps = HTMLMotionProps<"div"> & {
    className?: string;
    onIconClick?: (platform: "github" | "x" | "facebook", event: React.MouseEvent<HTMLDivElement>) => void;
} & VariantProps<typeof shareIconGroupVariants>;

function ShareIconGroup({ size = "default", className, onIconClick }: ShareIconGroupProps) {
    const iconSize = iconSizeMap[size as keyof typeof iconSizeMap];

    const handleIconClick = React.useCallback(
        (platform: "github" | "x" | "facebook", event: React.MouseEvent<HTMLDivElement>) => {
            onIconClick?.(platform, event);
        },
        [onIconClick]
    );

    return (
        <motion.div className={cn(shareIconGroupVariants({ size }), "group", className)}>
            <motion.div
                animate={{ opacity: 1, y: 0 }}
                className="box-border cursor-pointer rounded-lg py-3 group-hover:opacity-100"
                initial={{ opacity: 0, y: 24 }}
                onClick={(event) => handleIconClick("github", event)}
                transition={{ delay: 0, duration: 0.5, type: "spring", bounce: 0.4 }}
                whileHover={{
                    y: -8,
                    transition: { duration: 0.2, ease: "easeOut" },
                }}
            >
                <Github size={iconSize} />
            </motion.div>
            <motion.div
                animate={{ opacity: 1, y: 0 }}
                className="box-border cursor-pointer rounded-lg py-3 group-hover:opacity-100"
                initial={{ opacity: 0, y: 24 }}
                onClick={(event) => handleIconClick("x", event)}
                transition={{ delay: 0.1, duration: 0.5, type: "spring", bounce: 0.4 }}
                whileHover={{
                    y: -8,
                    transition: { duration: 0.2, ease: "easeOut" },
                }}
            >
                <X size={iconSize} />
            </motion.div>
            <motion.div
                animate={{ opacity: 1, y: 0 }}
                className="box-border cursor-pointer rounded-lg py-3 group-hover:opacity-100"
                initial={{ opacity: 0, y: 24 }}
                onClick={(event) => handleIconClick("facebook", event)}
                transition={{ delay: 0.2, duration: 0.5, type: "spring", bounce: 0.4 }}
                whileHover={{
                    y: -8,
                    transition: { duration: 0.2, ease: "easeOut" },
                }}
            >
                <Facebook size={iconSize} />
            </motion.div>
        </motion.div>
    );
}

export { ShareButton, type ShareButtonProps };
