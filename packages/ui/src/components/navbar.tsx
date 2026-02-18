"use client";
import { cn } from "@foundry/ui/lib/utils";
import { AnimatePresence, motion, useMotionValueEvent, useScroll } from "motion/react";
import Image from "next/image";
import React, { useRef, useState } from "react";
import { Bars4Icon, XCircleIcon } from "./icons";

interface NavbarProps {
    children: React.ReactNode;
    className?: string;
}

interface NavBodyProps {
    children: React.ReactNode;
    className?: string;
    visible?: boolean;
}

interface NavItemsProps {
    items: {
        name: string;
        link: string;
    }[];
    className?: string;
    onItemClick?: () => void;
}

interface MobileNavProps {
    children: React.ReactNode;
    className?: string;
    visible?: boolean;
}

interface MobileNavHeaderProps {
    children: React.ReactNode;
    className?: string;
}

interface MobileNavMenuProps {
    children: React.ReactNode;
    className?: string;
    isOpen: boolean;
    onClose: () => void;
}

export const Navbar = ({ children, className }: NavbarProps) => {
    const ref = useRef<HTMLDivElement>(null);
    const { scrollY } = useScroll({
        target: ref,
        offset: ["start start", "end start"],
    });
    const [visible, setVisible] = useState<boolean>(false);

    useMotionValueEvent(scrollY, "change", (latest) => {
        if (latest > 100) {
            setVisible(true);
        } else {
            setVisible(false);
        }
    });

    return (
        <motion.div
            className={cn("sticky inset-x-0 top-1 z-40 w-full", className)}
            // IMPORTANT: Change this to class of `fixed` if you want the navbar to be fixed
            ref={ref}
        >
            {React.Children.map(children, (child) => (React.isValidElement(child) ? React.cloneElement(child as React.ReactElement<{ visible?: boolean }>, { visible }) : child))}
        </motion.div>
    );
};

export const NavBody = ({ children, className, visible }: NavBodyProps) => {
    return (
        <motion.div
            animate={{
                backdropFilter: visible ? "blur(10px)" : "none",
                boxShadow: visible
                    ? "0 0 24px rgba(34, 42, 53, 0.06), 0 1px 1px rgba(0, 0, 0, 0.05), 0 0 0 1px rgba(34, 42, 53, 0.04), 0 0 4px rgba(34, 42, 53, 0.08), 0 16px 68px rgba(47, 48, 55, 0.05), 0 1px 0 rgba(255, 255, 255, 0.1) inset"
                    : "none",
                width: visible ? "40%" : "100%",
                y: visible ? 20 : 0,
            }}
            className={cn(
                "group/nav relative z-60 mx-auto hidden w-full max-w-7xl self-start rounded-full bg-transparent px-4 py-2 dark:bg-transparent",
                // switch to a 3-column grid at large sizes to prevent center overlap
                "lg:grid lg:grid-cols-[auto_1fr_auto] lg:items-center",
                visible && "bg-sidebar dark:bg-sidebar",
                className
            )}
            data-visible={visible ? "true" : "false"}
            style={{
                minWidth: "800px",
            }}
            transition={{
                type: "spring",
                stiffness: 200,
                damping: 50,
            }}
        >
            {children}
        </motion.div>
    );
};

export const NavItems = ({ items, className, onItemClick }: NavItemsProps) => {
    const [hovered, setHovered] = useState<number | null>(null);

    return (
        <motion.div
            className={cn(
                "hidden min-w-0 flex-1 flex-row items-center justify-center space-x-2 font-medium text-foreground text-sm transition duration-200 hover:text-muted-foreground lg:flex lg:space-x-2 lg:justify-self-center",
                className
            )}
            onMouseLeave={() => setHovered(null)}
        >
            {items.map((item, idx) => (
                <a
                    className="relative px-4 py-2 text-muted-foreground transition-colors duration-200 hover:text-foreground"
                    href={item.link}
                    key={item.link}
                    onClick={onItemClick}
                    onMouseEnter={() => setHovered(idx)}
                >
                    {hovered === idx && <motion.div className="absolute inset-0 h-full w-full rounded-full bg-ring/20" layoutId="hovered" />}
                    <span className={cn("relative z-20", hovered === idx ? "text-foreground" : "text-muted-foreground")}>{item.name}</span>
                </a>
            ))}
        </motion.div>
    );
};

export const MobileNav = ({ children, className, visible }: MobileNavProps) => {
    return (
        <motion.div
            animate={{
                backdropFilter: visible ? "blur(10px)" : "none",
                boxShadow: visible
                    ? "0 0 24px rgba(34, 42, 53, 0.06), 0 1px 1px rgba(0, 0, 0, 0.05), 0 0 0 1px rgba(34, 42, 53, 0.04), 0 0 4px rgba(34, 42, 53, 0.08), 0 16px 68px rgba(47, 48, 55, 0.05), 0 1px 0 rgba(255, 255, 255, 0.1) inset"
                    : "none",
                width: visible ? "90%" : "100%",
                paddingRight: visible ? "12px" : "0px",
                paddingLeft: visible ? "12px" : "0px",
                borderRadius: visible ? "4px" : "2rem",
                y: visible ? 20 : 0,
            }}
            className={cn(
                "relative z-50 mx-auto flex w-full max-w-[calc(100vw-2rem)] flex-col items-center justify-between bg-transparent px-0 py-2 lg:hidden",
                visible && "bg-sidebar dark:bg-sidebar",
                className
            )}
            transition={{
                type: "spring",
                stiffness: 200,
                damping: 50,
            }}
        >
            {children}
        </motion.div>
    );
};

export const MobileNavHeader = ({ children, className }: MobileNavHeaderProps) => {
    return <div className={cn("flex w-full flex-row items-center justify-between", className)}>{children}</div>;
};

// biome-ignore lint/correctness/noUnusedFunctionParameters: <Def>
export const MobileNavMenu = ({ children, className, isOpen, onClose }: MobileNavMenuProps) => {
    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    animate={{ opacity: 1 }}
                    className={cn(
                        "absolute inset-x-0 top-16 z-50 flex w-full flex-col items-start justify-start gap-4 rounded-lg bg-sidebar px-4 py-8 shadow-[0_0_24px_rgba(34,42,53,0.06),0_1px_1px_rgba(0,0,0,0.05),0_0_0_1px_rgba(34,42,53,0.04),0_0_4px_rgba(34,42,53,0.08),0_16px_68px_rgba(47,48,55,0.05),0_1px_0_rgba(255,255,255,0.1)_inset] dark:bg-sidebar",
                        className
                    )}
                    exit={{ opacity: 0 }}
                    initial={{ opacity: 0 }}
                >
                    {children}
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export const MobileNavToggle = ({ isOpen, onClick }: { isOpen: boolean; onClick: () => void }) => {
    return isOpen ? (
        <XCircleIcon className="text-foreground dark:text-foreground" onClick={onClick} />
    ) : (
        <Bars4Icon className="text-foreground dark:text-foreground" onClick={onClick} />
    );
};

export const NavbarLogo = ({
    url,
    title,
    children,
    size = "md",
}: {
    url: string;
    title?: string;
    children?: React.ReactNode;
    /** small|medium|large visual presets — keeps API stable while allowing bigger logos */
    size?: "sm" | "md" | "lg";
}) => {
    const SIZES = {
        sm: { w: 48, h: 28 },
        md: { w: 64, h: 42 },
        lg: { w: 180, h: 56 },
    } as const;

    const s = SIZES[size as keyof typeof SIZES];
    const { w, h } = s ?? SIZES.md;

    return (
        <div className="flex items-center">
            <a className="relative z-20 mr-4 flex items-center space-x-2 px-2 py-1 font-normal text-foreground text-sm" href="/">
                {/*
                  next/image uses the width/height props to determine rendered size —
                  previously this was fixed at 64x42 which is why your 1137x333 image looked small.
                  Use the `size` prop (sm|md|lg) to pick a larger display size, or pass a new preset.
                */}
                <Image alt="logo" className="object-contain" height={h} src={url} width={w} />
                {title && <span className="font-medium text-foreground dark:text-foreground">{title}</span>}
            </a>
            {children}
        </div>
    );
};

export const NavbarButton = ({
    href,
    as: Tag = "a",
    children,
    className,
    variant = "primary",
    ...props
}: {
    href?: string;
    as?: React.ElementType;
    children: React.ReactNode;
    className?: string;
    variant?: "primary" | "secondary" | "dark" | "gradient";
} & (React.ComponentPropsWithoutRef<"a"> | React.ComponentPropsWithoutRef<"button">)) => {
    const baseStyles =
        "px-4 py-2 rounded-md bg-foreground button foreground-white text-black text-sm font-bold relative cursor-pointer hover:-translate-y-0.5 transition duration-200 inline-block text-center";

    const variantStyles = {
        primary:
            "shadow-[0_0_24px_rgba(34,_42,_53,_0.06),_0_1px_1px_rgba(0,_0,_0,_0.05),_0_0_0_1px_rgba(34,_42,_53,_0.04),_0_0_4px_rgba(34,_42,_53,_0.08),_0_16px_68px_rgba(47,_48,_55,_0.05),_0_1px_0_rgba(255,_255,_255,_0.1)_inset]",
        secondary: "bg-transparent shadow-none dark:text-foreground",
        dark: "bg-black text-foreground shadow-[0_0_24px_rgba(34,_42,_53,_0.06),_0_1px_1px_rgba(0,_0,_0,_0.05),_0_0_0_1px_rgba(34,_42,_53,_0.04),_0_0_4px_rgba(34,_42,_53,_0.08),_0_16px_68px_rgba(47,_48,_55,_0.05),_0_1px_0_rgba(255,_255,_255,_0.1)_inset]",
        gradient: "bg-gradient-to-b from-blue-500 to-blue-700 text-foreground shadow-[0px_2px_0px_0px_rgba(255,255,255,0.3)_inset]",
    };

    return (
        <Tag className={cn(baseStyles, variantStyles[variant], className)} href={href || undefined} {...props}>
            {children}
        </Tag>
    );
};
