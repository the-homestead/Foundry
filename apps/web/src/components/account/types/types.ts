import type { CLI_PUBLIC_KEY } from "@foundry/types/permissions/api-key";
import type { FormAsyncValidateOrFn, FormValidateOrFn, ReactFormExtendedApi } from "@tanstack/react-form";
import type * as z from "zod";

import type { ACCOUNT_TABS } from "../constants";
import type { accountSchema } from "./schema";

export interface FieldErrorMap {
    [key: string]: string[];
}

export interface ApiKeyEntry {
    id: string;
    name?: string | null;
    prefix?: string | null;
    start?: string | null;
    createdAt?: string | Date | null;
    expiresAt?: string | Date | null;
    enabled?: boolean | null;
    remaining?: number | null;
    rateLimitEnabled?: boolean | null;
    metadata?: {
        profile?: string | null;
    } | null;
}

export interface ApiKeyProfile {
    id: string;
    label: string;
    description: string;
    permissions: typeof CLI_PUBLIC_KEY;
}

export type AccountTab = (typeof ACCOUNT_TABS)[number];

export interface StatusMessage {
    type: "success" | "error";
    message: string;
}

export interface AccountDefaults {
    fullName: string;
    username: string;
    email: string;
    firstName?: string;
    lastName?: string;
    age?: string;
    currentPassword?: string;
    newPassword?: string;
    confirmPassword?: string;
}

export type AccountForm = ReactFormExtendedApi<
    z.infer<typeof accountSchema>,
    FormValidateOrFn<z.infer<typeof accountSchema>> | undefined,
    FormValidateOrFn<z.infer<typeof accountSchema>> | undefined,
    FormAsyncValidateOrFn<z.infer<typeof accountSchema>> | undefined,
    FormValidateOrFn<z.infer<typeof accountSchema>> | undefined,
    FormAsyncValidateOrFn<z.infer<typeof accountSchema>> | undefined,
    FormValidateOrFn<z.infer<typeof accountSchema>> | undefined,
    FormAsyncValidateOrFn<z.infer<typeof accountSchema>> | undefined,
    FormValidateOrFn<z.infer<typeof accountSchema>> | undefined,
    FormAsyncValidateOrFn<z.infer<typeof accountSchema>> | undefined,
    FormAsyncValidateOrFn<z.infer<typeof accountSchema>> | undefined,
    unknown
>;
