import type * as z from "zod";
import { API_KEY_PROFILES } from "./constants";
import type { FieldErrorMap } from "./types";

export const buildErrorMap = (issues: z.ZodIssue[]): FieldErrorMap => {
    const map: FieldErrorMap = {};
    for (const issue of issues) {
        const key = issue.path.length ? issue.path.join(".") : "form";
        map[key] = map[key] ?? [];
        map[key].push(issue.message);
    }
    return map;
};

export const parseAge = (value?: string) => {
    if (!value) {
        return undefined;
    }
    const parsed = Number(value);
    return Number.isNaN(parsed) ? undefined : parsed;
};

export const parseDate = (value?: string | Date | null) => {
    if (!value) {
        return null;
    }
    const date = typeof value === "string" ? new Date(value) : value;
    return Number.isNaN(date.getTime()) ? null : date;
};

export const formatDate = (value?: string | Date | null) => {
    const date = parseDate(value);
    if (!date) {
        return "—";
    }
    return new Intl.DateTimeFormat("en-US", {
        month: "short",
        day: "2-digit",
        year: "numeric",
    }).format(date);
};

export const toSecondsFromDays = (days: string) => {
    if (!days) {
        return undefined;
    }
    const parsed = Number(days);
    if (!Number.isFinite(parsed) || parsed <= 0) {
        return undefined;
    }
    return Math.floor(parsed * 24 * 60 * 60);
};

export const getProfileLabel = (profileId?: string | null) => {
    if (!profileId) {
        return "Custom";
    }
    return API_KEY_PROFILES.find((profile) => profile.id === profileId)?.label ?? "Custom";
};
