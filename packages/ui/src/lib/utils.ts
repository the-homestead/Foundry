import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

import type { CSSProperties } from "react";

export interface IconProps {
    size?: number;
    className?: string;
    style?: CSSProperties;
}
