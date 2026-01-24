"use client";

import { CLI_PUBLIC_KEY, LAUNCHER_FREE, LAUNCHER_PREMIUM, ORG_CI_KEY } from "@foundry/types/permissions/api-key";
import { QRCode } from "@foundry/ui/components";
import { Avatar, AvatarFallback, AvatarImage } from "@foundry/ui/primitives/avatar";
import { Badge } from "@foundry/ui/primitives/badge";
import { Button } from "@foundry/ui/primitives/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@foundry/ui/primitives/card";
import { Checkbox } from "@foundry/ui/primitives/checkbox";
import { Field, FieldContent, FieldDescription, FieldGroup, FieldLabel, FieldLegend, FieldSet } from "@foundry/ui/primitives/field";
import { Input } from "@foundry/ui/primitives/input";
import { InputGroup, InputGroupAddon, InputGroupInput, InputGroupText } from "@foundry/ui/primitives/input-group";
import { Label } from "@foundry/ui/primitives/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@foundry/ui/primitives/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@foundry/ui/primitives/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@foundry/ui/primitives/tabs";
import { Tooltip, TooltipContent, TooltipTrigger } from "@foundry/ui/primitives/tooltip";
import { authClient, signOut, useSession } from "@foundry/web/lib/auth-client";
import type { FormAsyncValidateOrFn, FormValidateOrFn, ReactFormExtendedApi } from "@tanstack/react-form";
import { useForm } from "@tanstack/react-form";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
// biome-ignore lint/performance/noNamespaceImport: <Def>
import * as z from "zod";

interface FieldErrorMap {
    [key: string]: string[];
}

interface ApiKeyEntry {
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

interface ApiKeyProfile {
    id: string;
    label: string;
    description: string;
    permissions: typeof CLI_PUBLIC_KEY;
}

const API_KEY_PROFILES: ApiKeyProfile[] = [
    {
        id: "cli-public",
        label: "CLI public",
        description: "Read-only downloads for CLI usage.",
        permissions: CLI_PUBLIC_KEY,
    },
    {
        id: "launcher-free",
        label: "Launcher (free)",
        description: "Read-only launcher access for free tier.",
        permissions: LAUNCHER_FREE,
    },
    {
        id: "launcher-premium",
        label: "Launcher (premium)",
        description: "Launcher access with premium entitlements.",
        permissions: LAUNCHER_PREMIUM,
    },
    {
        id: "org-ci",
        label: "Org CI",
        description: "Automation uploads scoped to org projects.",
        permissions: ORG_CI_KEY,
    },
];

const ACCOUNT_TABS = ["profile", "security", "api-keys"] as const;

type AccountTab = (typeof ACCOUNT_TABS)[number];

interface StatusMessage {
    type: "success" | "error";
    message: string;
}

interface AccountDefaults {
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

interface FieldHintProps {
    label: string;
    text: string;
}

function FieldHint({ label, text }: FieldHintProps) {
    return (
        <Tooltip>
            <TooltipTrigger asChild>
                <Button aria-label={label} className="rounded-full text-[10px]" size="icon-sm" type="button" variant="ghost">
                    ?
                </Button>
            </TooltipTrigger>
            <TooltipContent side="top">{text}</TooltipContent>
        </Tooltip>
    );
}

const TAB_LABELS: Record<AccountTab, string> = {
    profile: "Profile",
    security: "Security",
    "api-keys": "API keys",
};

const getProfileLabel = (profileId?: string | null) => {
    if (!profileId) {
        return "Custom";
    }
    return API_KEY_PROFILES.find((profile) => profile.id === profileId)?.label ?? "Custom";
};

const accountSchema = z
    .object({
        fullName: z.string().min(2, "Enter your full name"),
        username: z.string().min(3, "Username must be at least 3 characters").max(20),
        email: z.string().email("Enter a valid email"),
        firstName: z.string().optional(),
        lastName: z.string().optional(),
        age: z
            .string()
            .optional()
            .refine((value) => (value ? !Number.isNaN(Number(value)) : true), {
                message: "Enter a valid age",
            }),
        currentPassword: z.string().optional(),
        newPassword: z.string().optional(),
        confirmPassword: z.string().optional(),
    })
    .refine(
        (data) => {
            const hasPasswordChange = Boolean(data.currentPassword || data.newPassword || data.confirmPassword);
            if (!hasPasswordChange) {
                return true;
            }
            const hasAllFields = Boolean(data.currentPassword && data.newPassword && data.confirmPassword);
            if (!hasAllFields) {
                return false;
            }
            return data.newPassword === data.confirmPassword;
        },
        {
            message: "Passwords must match and include the current password",
            path: ["confirmPassword"],
        }
    );

const buildErrorMap = (issues: z.ZodIssue[]): FieldErrorMap => {
    const map: FieldErrorMap = {};
    for (const issue of issues) {
        const key = issue.path.length ? issue.path.join(".") : "form";
        map[key] = map[key] ?? [];
        map[key].push(issue.message);
    }
    return map;
};

const parseAge = (value?: string) => {
    if (!value) {
        return undefined;
    }
    const parsed = Number(value);
    return Number.isNaN(parsed) ? undefined : parsed;
};

const parseDate = (value?: string | Date | null) => {
    if (!value) {
        return null;
    }
    const date = typeof value === "string" ? new Date(value) : value;
    return Number.isNaN(date.getTime()) ? null : date;
};

const formatDate = (value?: string | Date | null) => {
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

const toSecondsFromDays = (days: string) => {
    if (!days) {
        return undefined;
    }
    const parsed = Number(days);
    if (!Number.isFinite(parsed) || parsed <= 0) {
        return undefined;
    }
    return Math.floor(parsed * 24 * 60 * 60);
};

const createApiKeyOnServer = async (input: { name?: string; prefix?: string; expiresIn?: number; profileId?: string }) => {
    const response = await fetch("/api/keys", {
        method: "POST",
        credentials: "include",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(input),
    });

    if (!response.ok) {
        const errorBody = await response.json().catch(() => ({}));
        return { error: { message: errorBody?.error ?? "Failed to create API key." } } as const;
    }

    const data = await response.json().catch(() => null);
    return { data } as const;
};

const saveAccountSettings = async (values: z.infer<typeof accountSchema>, refresh: () => Promise<void>) => {
    const updateResult = await authClient.updateUser({
        name: values.fullName.trim(),
        username: values.username.trim(),
        firstName: values.firstName?.trim() || undefined,
        lastName: values.lastName?.trim() || undefined,
        age: parseAge(values.age),
    });

    if (updateResult?.error) {
        return { type: "error", message: updateResult.error.message ?? "Failed to update profile." } as const;
    }

    const shouldChangePassword = Boolean(values.newPassword || values.currentPassword || values.confirmPassword);
    if (shouldChangePassword) {
        const passwordResult = await authClient.changePassword({
            currentPassword: values.currentPassword ?? "",
            newPassword: values.newPassword ?? "",
            revokeOtherSessions: true,
        });
        if (passwordResult?.error) {
            return { type: "error", message: passwordResult.error.message ?? "Failed to update password." } as const;
        }
    }

    await refresh();
    return { type: "success", message: "Account settings updated." } as const;
};

type AccountForm = ReactFormExtendedApi<
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

interface ProfileTabProps {
    form: AccountForm;
    avatarFallback: string;
    avatarUrl: string | null;
    fieldErrors: FieldErrorMap;
    formMessage: StatusMessage | null;
    clearFieldError: (fieldName: string) => void;
    onSubmit: () => void;
}

function ProfileTab({ form, avatarFallback, avatarUrl, fieldErrors, formMessage, clearFieldError, onSubmit }: ProfileTabProps) {
    return (
        <form
            onSubmit={(event) => {
                event.preventDefault();
                onSubmit();
            }}
        >
            <div className="grid gap-6 lg:grid-cols-12">
                <Card className="lg:col-span-7">
                    <CardHeader className="text-center">
                        <CardTitle className="text-center">Identity</CardTitle>
                        <CardDescription className="text-center">Core details for your profile.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <FieldSet>
                            <FieldGroup className="w-full">
                                <Field orientation="vertical">
                                    <FieldLabel className="w-full justify-center text-center" htmlFor="fullName">
                                        Display name
                                        <FieldHint label="Display name help" text="Shown on your profile and shared across your workspace." />
                                    </FieldLabel>
                                    <FieldContent className="mx-auto w-full max-w-sm">
                                        <form.Field name="fullName">
                                            {(field) => (
                                                <>
                                                    <Input
                                                        className="w-full"
                                                        id={field.name}
                                                        name={field.name}
                                                        onBlur={field.handleBlur}
                                                        onChange={(event) => {
                                                            field.handleChange(event.target.value);
                                                            clearFieldError(field.name);
                                                        }}
                                                        placeholder="Jane Doe"
                                                        value={field.state.value}
                                                    />
                                                    {fieldErrors[field.name]?.length ? (
                                                        <FieldDescription className="text-destructive">{fieldErrors[field.name]?.join(" ")}</FieldDescription>
                                                    ) : null}
                                                </>
                                            )}
                                        </form.Field>
                                    </FieldContent>
                                </Field>

                                <Field orientation="vertical">
                                    <FieldLabel className="w-full justify-center text-center" htmlFor="username">
                                        Username
                                        <FieldHint label="Username help" text="Your unique handle for sharing and mentions." />
                                    </FieldLabel>
                                    <FieldContent className="mx-auto w-full max-w-sm">
                                        <form.Field name="username">
                                            {(field) => (
                                                <>
                                                    <InputGroup className="w-full">
                                                        <InputGroupAddon align="inline-start">
                                                            <InputGroupText>@</InputGroupText>
                                                        </InputGroupAddon>
                                                        <InputGroupInput
                                                            className="w-full"
                                                            id={field.name}
                                                            name={field.name}
                                                            onBlur={field.handleBlur}
                                                            onChange={(event) => {
                                                                field.handleChange(event.target.value);
                                                                clearFieldError(field.name);
                                                            }}
                                                            placeholder="foundry-user"
                                                            value={field.state.value}
                                                        />
                                                    </InputGroup>
                                                    {fieldErrors[field.name]?.length ? (
                                                        <FieldDescription className="text-destructive">{fieldErrors[field.name]?.join(" ")}</FieldDescription>
                                                    ) : null}
                                                </>
                                            )}
                                        </form.Field>
                                    </FieldContent>
                                </Field>

                                <Field orientation="vertical">
                                    <FieldLabel className="w-full justify-center text-center" htmlFor="email">
                                        Email
                                        <FieldHint label="Email help" text="Email updates require verification." />
                                    </FieldLabel>
                                    <FieldContent className="mx-auto w-full max-w-sm">
                                        <form.Field name="email">
                                            {(field) => (
                                                <>
                                                    <Input className="w-full" disabled id={field.name} name={field.name} type="email" value={field.state.value} />
                                                </>
                                            )}
                                        </form.Field>
                                    </FieldContent>
                                </Field>
                            </FieldGroup>
                        </FieldSet>
                    </CardContent>
                </Card>

                <Card className="lg:col-span-5">
                    <CardHeader className="text-center">
                        <CardTitle className="text-center">Profile fields</CardTitle>
                        <CardDescription className="text-center">Optional details for your workspace.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <FieldSet>
                            <FieldGroup>
                                <div className="grid gap-6 lg:grid-cols-1">
                                    <Field>
                                        <FieldLabel className="w-full justify-center text-center" htmlFor="firstName">
                                            First name
                                            <FieldHint label="First name help" text="Shown in places where your first name is preferred." />
                                        </FieldLabel>
                                        <form.Field name="firstName">
                                            {(field) => (
                                                <Input
                                                    id={field.name}
                                                    name={field.name}
                                                    onBlur={field.handleBlur}
                                                    onChange={(event) => field.handleChange(event.target.value)}
                                                    placeholder="Jane"
                                                    value={field.state.value}
                                                />
                                            )}
                                        </form.Field>
                                    </Field>
                                    <Field>
                                        <FieldLabel className="w-full justify-center text-center" htmlFor="lastName">
                                            Last name
                                            <FieldHint label="Last name help" text="Used for formal identification in workspace details." />
                                        </FieldLabel>
                                        <form.Field name="lastName">
                                            {(field) => (
                                                <Input
                                                    id={field.name}
                                                    name={field.name}
                                                    onBlur={field.handleBlur}
                                                    onChange={(event) => field.handleChange(event.target.value)}
                                                    placeholder="Doe"
                                                    value={field.state.value}
                                                />
                                            )}
                                        </form.Field>
                                    </Field>
                                    <Field>
                                        <FieldLabel className="w-full justify-center text-center" htmlFor="age">
                                            Age
                                            <FieldHint label="Age help" text="Optional, stored with your account profile." />
                                        </FieldLabel>
                                        <form.Field name="age">
                                            {(field) => (
                                                <Input
                                                    id={field.name}
                                                    inputMode="numeric"
                                                    name={field.name}
                                                    onBlur={field.handleBlur}
                                                    onChange={(event) => {
                                                        field.handleChange(event.target.value);
                                                        clearFieldError(field.name);
                                                    }}
                                                    placeholder="30"
                                                    value={field.state.value}
                                                />
                                            )}
                                        </form.Field>
                                        {fieldErrors.age?.length ? <FieldDescription className="text-destructive">{fieldErrors.age.join(" ")}</FieldDescription> : null}
                                    </Field>
                                </div>
                            </FieldGroup>
                        </FieldSet>
                    </CardContent>
                </Card>

                <Card className="lg:col-span-5">
                    <CardHeader className="text-center">
                        <CardTitle className="text-center">Avatar</CardTitle>
                        <CardDescription className="text-center">Update your profile image.</CardDescription>
                    </CardHeader>
                    <CardContent className="flex flex-col gap-4">
                        <div className="grid gap-4 sm:grid-cols-[auto,1fr]">
                            <div className="flex items-center gap-4">
                                <Avatar className="size-16">
                                    <AvatarImage alt="User avatar" src={avatarUrl ?? undefined} />
                                    <AvatarFallback>{avatarFallback}</AvatarFallback>
                                </Avatar>
                                <div className="space-y-1">
                                    <p className="font-medium">Profile picture</p>
                                    <p className="text-muted-foreground text-sm">PNG, JPG up to 5MB.</p>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <p className="text-muted-foreground text-sm">Square images look best. Transparent PNGs keep your brand crisp.</p>
                                <div className="flex flex-wrap items-center gap-2">
                                    <Badge variant="outline">Synced</Badge>
                                    <span className="text-muted-foreground text-xs">Last updated just now</span>
                                </div>
                            </div>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            <Input accept="image/*" className="sr-only" id="avatarUpload" type="file" />
                            <Button asChild>
                                <label htmlFor="avatarUpload">Upload</label>
                            </Button>
                            <Button type="button" variant="outline">
                                Remove
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                <Card className="lg:col-span-7">
                    <CardHeader className="text-center">
                        <CardTitle className="text-center">Connected apps</CardTitle>
                        <CardDescription className="text-center">Manage OAuth connections to external services.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center justify-between rounded-lg border border-border px-4 py-3">
                            <div>
                                <p className="font-medium">GitHub</p>
                                <p className="text-muted-foreground text-sm">Code syncing and integrations.</p>
                            </div>
                            <div className="flex items-center gap-2">
                                <Badge variant="outline">Not connected</Badge>
                                <Button size="sm" type="button" variant="outline">
                                    Connect
                                </Button>
                            </div>
                        </div>
                        <div className="flex items-center justify-between rounded-lg border border-border px-4 py-3">
                            <div>
                                <p className="font-medium">Google</p>
                                <p className="text-muted-foreground text-sm">Calendar and identity sync.</p>
                            </div>
                            <div className="flex items-center gap-2">
                                <Badge>Connected</Badge>
                                <Button size="sm" type="button" variant="outline">
                                    Disconnect
                                </Button>
                            </div>
                        </div>
                        <div className="flex items-center justify-between rounded-lg border border-border px-4 py-3">
                            <div>
                                <p className="font-medium">Discord</p>
                                <p className="text-muted-foreground text-sm">Community and role sync.</p>
                            </div>
                            <div className="flex items-center gap-2">
                                <Badge variant="outline">Not connected</Badge>
                                <Button size="sm" type="button" variant="outline">
                                    Connect
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <div className="space-y-2 lg:col-span-12">
                    <p className="text-muted-foreground text-sm">Changes sync to your account immediately.</p>
                    {formMessage ? (
                        <FieldDescription className={formMessage.type === "error" ? "text-destructive" : "text-emerald-500"}>{formMessage.message}</FieldDescription>
                    ) : null}
                </div>
            </div>
        </form>
    );
}

interface PasswordCardProps {
    form: AccountForm;
    fieldErrors: FieldErrorMap;
    formMessage: StatusMessage | null;
    isSaving: boolean;
    clearFieldError: (fieldName: string) => void;
    onReset: () => void;
    onSubmit: () => void;
}

function PasswordCard({ form, fieldErrors, formMessage, isSaving, clearFieldError, onReset, onSubmit }: PasswordCardProps) {
    return (
        <Card>
            <CardHeader className="text-center">
                <CardTitle className="text-center">Security</CardTitle>
                <CardDescription className="text-center">Manage your password and account protection.</CardDescription>
            </CardHeader>
            <CardContent>
                <form
                    onSubmit={(event) => {
                        event.preventDefault();
                        onSubmit();
                    }}
                >
                    <div className="space-y-8">
                        <FieldSet>
                            <FieldLegend>Password</FieldLegend>
                            <FieldGroup>
                                <div className="grid gap-6 lg:grid-cols-3">
                                    <Field>
                                        <FieldLabel className="w-full justify-center text-center" htmlFor="currentPassword">
                                            Current password
                                            <FieldHint label="Current password help" text="Required to update your password." />
                                        </FieldLabel>
                                        <form.Field name="currentPassword">
                                            {(field) => (
                                                <Input
                                                    id={field.name}
                                                    name={field.name}
                                                    onBlur={field.handleBlur}
                                                    onChange={(event) => field.handleChange(event.target.value)}
                                                    type="password"
                                                    value={field.state.value}
                                                />
                                            )}
                                        </form.Field>
                                    </Field>
                                    <Field>
                                        <FieldLabel className="w-full justify-center text-center" htmlFor="newPassword">
                                            New password
                                            <FieldHint label="New password help" text="Use a strong, unique password." />
                                        </FieldLabel>
                                        <form.Field name="newPassword">
                                            {(field) => (
                                                <Input
                                                    id={field.name}
                                                    name={field.name}
                                                    onBlur={field.handleBlur}
                                                    onChange={(event) => field.handleChange(event.target.value)}
                                                    type="password"
                                                    value={field.state.value}
                                                />
                                            )}
                                        </form.Field>
                                    </Field>
                                    <Field>
                                        <FieldLabel className="w-full justify-center text-center" htmlFor="confirmPassword">
                                            Confirm password
                                            <FieldHint label="Confirm password help" text="Leave blank if you are not changing your password." />
                                        </FieldLabel>
                                        <form.Field name="confirmPassword">
                                            {(field) => (
                                                <Input
                                                    id={field.name}
                                                    name={field.name}
                                                    onBlur={field.handleBlur}
                                                    onChange={(event) => {
                                                        field.handleChange(event.target.value);
                                                        clearFieldError(field.name);
                                                    }}
                                                    type="password"
                                                    value={field.state.value}
                                                />
                                            )}
                                        </form.Field>
                                        {fieldErrors.confirmPassword?.length ? (
                                            <FieldDescription className="text-destructive">{fieldErrors.confirmPassword.join(" ")}</FieldDescription>
                                        ) : null}
                                    </Field>
                                </div>
                            </FieldGroup>
                        </FieldSet>

                        {formMessage ? (
                            <FieldDescription className={formMessage.type === "error" ? "text-destructive" : "text-emerald-500"}>{formMessage.message}</FieldDescription>
                        ) : null}

                        <CardFooter className="flex flex-col items-start gap-3 border-t pt-6">
                            <div className="flex flex-wrap items-center gap-3">
                                <Button disabled={isSaving} type="submit">
                                    {isSaving ? "Saving..." : "Save changes"}
                                </Button>
                                <Button disabled={isSaving} onClick={onReset} type="button" variant="outline">
                                    Reset
                                </Button>
                            </div>
                            <FieldDescription>Changes sync to your account immediately.</FieldDescription>
                        </CardFooter>
                    </div>
                </form>
            </CardContent>
        </Card>
    );
}

interface TwoFactorCardProps {
    twoFactorEnabled: boolean;
    twoFactorPassword: string;
    twoFactorCode: string;
    twoFactorMessage: StatusMessage | null;
    twoFactorLoading: boolean;
    totpUri: string | null;
    backupCodes: string[] | null;
    trustDevice: boolean;
    setTwoFactorPassword: (value: string) => void;
    setTwoFactorCode: (value: string) => void;
    setTrustDevice: (value: boolean) => void;
    onEnableTwoFactor: () => void;
    onVerifyTotp: () => void;
    onDisableTwoFactor: () => void;
    onGenerateBackupCodes: () => void;
    onGetTotpUri: () => void;
}

interface TwoFactorEnabledPanelProps {
    backupCodes: string[] | null;
    totpUri: string | null;
    twoFactorLoading: boolean;
    twoFactorPassword: string;
    onDisableTwoFactor: () => void;
    onGenerateBackupCodes: () => void;
    onGetTotpUri: () => void;
}

function TwoFactorEnabledPanel({ backupCodes, totpUri, twoFactorLoading, twoFactorPassword, onDisableTwoFactor, onGenerateBackupCodes, onGetTotpUri }: TwoFactorEnabledPanelProps) {
    return (
        <div className="space-y-4">
            <div className="flex flex-wrap gap-2">
                <Button disabled={twoFactorLoading || !twoFactorPassword} onClick={onDisableTwoFactor} type="button" variant="outline">
                    Disable 2FA
                </Button>
                <Button disabled={twoFactorLoading || !twoFactorPassword} onClick={onGenerateBackupCodes} type="button">
                    Generate backup codes
                </Button>
                <Button disabled={twoFactorLoading || !twoFactorPassword} onClick={onGetTotpUri} type="button" variant="outline">
                    Show QR code
                </Button>
            </div>

            {totpUri ? (
                <div className="h-48 w-48 rounded-xl border bg-muted/30 p-4">
                    <QRCode className="h-full w-full" data={totpUri} />
                </div>
            ) : null}

            {backupCodes?.length ? (
                <div className="space-y-3">
                    <h3 className="font-medium">Backup codes</h3>
                    <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                        {backupCodes.map((code) => (
                            <div className="rounded-md border bg-muted/40 px-3 py-2 font-mono text-sm" key={code}>
                                {code}
                            </div>
                        ))}
                    </div>
                </div>
            ) : null}
        </div>
    );
}

interface TwoFactorSetupPanelProps {
    backupCodes: string[] | null;
    totpUri: string | null;
    trustDevice: boolean;
    twoFactorCode: string;
    twoFactorLoading: boolean;
    twoFactorPassword: string;
    onEnableTwoFactor: () => void;
    onGetTotpUri: () => void;
    onVerifyTotp: () => void;
    setTrustDevice: (value: boolean) => void;
    setTwoFactorCode: (value: string) => void;
}

function TwoFactorSetupPanel({
    backupCodes,
    totpUri,
    trustDevice,
    twoFactorCode,
    twoFactorLoading,
    twoFactorPassword,
    onEnableTwoFactor,
    onGetTotpUri,
    onVerifyTotp,
    setTrustDevice,
    setTwoFactorCode,
}: TwoFactorSetupPanelProps) {
    return (
        <div className="space-y-6">
            <div className="flex flex-wrap gap-2">
                <Button disabled={twoFactorLoading || !twoFactorPassword} onClick={onEnableTwoFactor} type="button">
                    {twoFactorLoading ? "Working..." : "Enable 2FA"}
                </Button>
            </div>

            {totpUri ? (
                <div className="grid gap-6 lg:grid-cols-[auto,1fr]">
                    <div className="h-48 w-48 rounded-xl border bg-muted/30 p-4">
                        <QRCode className="h-full w-full" data={totpUri} />
                    </div>
                    <div className="space-y-4">
                        <div>
                            <h3 className="font-medium">Scan in your authenticator</h3>
                            <p className="text-muted-foreground text-sm">Use the QR code to add this account to your app.</p>
                        </div>
                        <Field>
                            <FieldLabel className="w-full justify-center text-center" htmlFor="twoFactorCode">
                                Verification code
                            </FieldLabel>
                            <Input id="twoFactorCode" inputMode="numeric" onChange={(event) => setTwoFactorCode(event.target.value)} placeholder="123456" value={twoFactorCode} />
                        </Field>
                        <div className="flex items-center gap-2">
                            <Checkbox checked={trustDevice} id="trustDevice" onCheckedChange={(value) => setTrustDevice(Boolean(value))} />
                            <Label className="text-muted-foreground text-sm" htmlFor="trustDevice">
                                Trust this device for 30 days
                            </Label>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            <Button disabled={twoFactorLoading} onClick={onVerifyTotp} type="button">
                                Verify code
                            </Button>
                            <Button disabled={twoFactorLoading || !twoFactorPassword} onClick={onGetTotpUri} type="button" variant="outline">
                                Refresh QR
                            </Button>
                        </div>
                    </div>
                </div>
            ) : null}

            {backupCodes?.length ? (
                <div className="space-y-3">
                    <h3 className="font-medium">Backup codes</h3>
                    <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                        {backupCodes.map((code) => (
                            <div className="rounded-md border bg-muted/40 px-3 py-2 font-mono text-sm" key={code}>
                                {code}
                            </div>
                        ))}
                    </div>
                </div>
            ) : null}
        </div>
    );
}

function TwoFactorCard({
    twoFactorEnabled,
    twoFactorPassword,
    twoFactorCode,
    twoFactorMessage,
    twoFactorLoading,
    totpUri,
    backupCodes,
    trustDevice,
    setTwoFactorPassword,
    setTwoFactorCode,
    setTrustDevice,
    onEnableTwoFactor,
    onVerifyTotp,
    onDisableTwoFactor,
    onGenerateBackupCodes,
    onGetTotpUri,
}: TwoFactorCardProps) {
    return (
        <Card>
            <CardHeader className="text-center">
                <CardTitle className="text-center">Two-factor authentication</CardTitle>
                <CardDescription className="text-center">Add a second verification step for sign-ins.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="flex flex-wrap items-center gap-2">
                    <Badge variant={twoFactorEnabled ? "default" : "outline"}>{twoFactorEnabled ? "Enabled" : "Not enabled"}</Badge>
                    <p className="text-muted-foreground text-sm">Authenticator apps are supported for code-based verification.</p>
                </div>

                <FieldSet>
                    <FieldLegend>Account password</FieldLegend>
                    <FieldGroup>
                        <Field>
                            <FieldLabel className="w-full justify-center text-center" htmlFor="twoFactorPassword">
                                Password
                                <FieldHint label="Two-factor password help" text="Required to enable, disable, or regenerate codes." />
                            </FieldLabel>
                            <Input
                                id="twoFactorPassword"
                                name="twoFactorPassword"
                                onChange={(event) => setTwoFactorPassword(event.target.value)}
                                type="password"
                                value={twoFactorPassword}
                            />
                        </Field>
                    </FieldGroup>
                </FieldSet>

                {twoFactorEnabled ? (
                    <TwoFactorEnabledPanel
                        backupCodes={backupCodes}
                        onDisableTwoFactor={onDisableTwoFactor}
                        onGenerateBackupCodes={onGenerateBackupCodes}
                        onGetTotpUri={onGetTotpUri}
                        totpUri={totpUri}
                        twoFactorLoading={twoFactorLoading}
                        twoFactorPassword={twoFactorPassword}
                    />
                ) : (
                    <TwoFactorSetupPanel
                        backupCodes={backupCodes}
                        onEnableTwoFactor={onEnableTwoFactor}
                        onGetTotpUri={onGetTotpUri}
                        onVerifyTotp={onVerifyTotp}
                        setTrustDevice={setTrustDevice}
                        setTwoFactorCode={setTwoFactorCode}
                        totpUri={totpUri}
                        trustDevice={trustDevice}
                        twoFactorCode={twoFactorCode}
                        twoFactorLoading={twoFactorLoading}
                        twoFactorPassword={twoFactorPassword}
                    />
                )}

                {twoFactorMessage ? (
                    <FieldDescription className={twoFactorMessage.type === "error" ? "text-destructive" : "text-emerald-500"}>{twoFactorMessage.message}</FieldDescription>
                ) : null}
            </CardContent>
        </Card>
    );
}

interface SecurityTabProps {
    form: AccountForm;
    fieldErrors: FieldErrorMap;
    formMessage: StatusMessage | null;
    isSaving: boolean;
    clearFieldError: (fieldName: string) => void;
    onReset: () => void;
    onSubmit: () => void;
    onSendPasswordSetup: () => void;
    passwordSetupLoading: boolean;
    passwordSetupMessage: StatusMessage | null;
    twoFactorEnabled: boolean;
    twoFactorPassword: string;
    twoFactorCode: string;
    twoFactorMessage: StatusMessage | null;
    twoFactorLoading: boolean;
    totpUri: string | null;
    backupCodes: string[] | null;
    trustDevice: boolean;
    setTwoFactorPassword: (value: string) => void;
    setTwoFactorCode: (value: string) => void;
    setTrustDevice: (value: boolean) => void;
    onEnableTwoFactor: () => void;
    onVerifyTotp: () => void;
    onDisableTwoFactor: () => void;
    onGenerateBackupCodes: () => void;
    onGetTotpUri: () => void;
}

function SecurityTab({
    form,
    fieldErrors,
    formMessage,
    isSaving,
    clearFieldError,
    onReset,
    onSubmit,
    onSendPasswordSetup,
    passwordSetupLoading,
    passwordSetupMessage,
    twoFactorEnabled,
    twoFactorPassword,
    twoFactorCode,
    twoFactorMessage,
    twoFactorLoading,
    totpUri,
    backupCodes,
    trustDevice,
    setTwoFactorPassword,
    setTwoFactorCode,
    setTrustDevice,
    onEnableTwoFactor,
    onVerifyTotp,
    onDisableTwoFactor,
    onGenerateBackupCodes,
    onGetTotpUri,
}: SecurityTabProps) {
    return (
        <div className="grid gap-6 lg:grid-cols-12">
            <div className="lg:col-span-7">
                <PasswordCard
                    clearFieldError={clearFieldError}
                    fieldErrors={fieldErrors}
                    form={form}
                    formMessage={formMessage}
                    isSaving={isSaving}
                    onReset={onReset}
                    onSubmit={onSubmit}
                />
            </div>
            <div className="lg:col-span-5">
                <TwoFactorCard
                    backupCodes={backupCodes}
                    onDisableTwoFactor={onDisableTwoFactor}
                    onEnableTwoFactor={onEnableTwoFactor}
                    onGenerateBackupCodes={onGenerateBackupCodes}
                    onGetTotpUri={onGetTotpUri}
                    onVerifyTotp={onVerifyTotp}
                    setTrustDevice={setTrustDevice}
                    setTwoFactorCode={setTwoFactorCode}
                    setTwoFactorPassword={setTwoFactorPassword}
                    totpUri={totpUri}
                    trustDevice={trustDevice}
                    twoFactorCode={twoFactorCode}
                    twoFactorEnabled={twoFactorEnabled}
                    twoFactorLoading={twoFactorLoading}
                    twoFactorMessage={twoFactorMessage}
                    twoFactorPassword={twoFactorPassword}
                />
            </div>
            <Card className="lg:col-span-12">
                <CardHeader className="text-center">
                    <CardTitle className="text-center">Create a password</CardTitle>
                    <CardDescription className="text-center">OAuth users can add a password for email sign-ins.</CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col items-center gap-4">
                    <p className="max-w-lg text-center text-muted-foreground text-sm">
                        We&apos;ll email a secure link to create your password. This is useful if you signed up with an OAuth provider and want a direct login option.
                    </p>
                    <Button disabled={passwordSetupLoading} onClick={onSendPasswordSetup} type="button" variant="outline">
                        {passwordSetupLoading ? "Sending..." : "Send setup email"}
                    </Button>
                    {passwordSetupMessage ? (
                        <FieldDescription className={passwordSetupMessage.type === "error" ? "text-destructive" : "text-emerald-500"}>
                            {passwordSetupMessage.message}
                        </FieldDescription>
                    ) : null}
                </CardContent>
            </Card>
        </div>
    );
}

interface ApiKeysTabProps {
    apiKeyExpiresInDays: string;
    apiKeyLoading: boolean;
    apiKeyMessage: StatusMessage | null;
    apiKeyName: string;
    apiKeyPrefix: string;
    apiKeyProfileId: string;
    apiKeys: ApiKeyEntry[];
    lastCreatedKey: string | null;
    onCopyKey: () => void;
    onCreateApiKey: () => void;
    onDeleteApiKey: (keyId: string) => void;
    onLoadApiKeys: () => void;
    setApiKeyExpiresInDays: (value: string) => void;
    setApiKeyName: (value: string) => void;
    setApiKeyPrefix: (value: string) => void;
    setApiKeyProfileId: (value: string) => void;
}

function ApiKeysTab({
    apiKeyExpiresInDays,
    apiKeyLoading,
    apiKeyMessage,
    apiKeyName,
    apiKeyPrefix,
    apiKeyProfileId,
    apiKeys,
    lastCreatedKey,
    onCopyKey,
    onCreateApiKey,
    onDeleteApiKey,
    onLoadApiKeys,
    setApiKeyExpiresInDays,
    setApiKeyName,
    setApiKeyPrefix,
    setApiKeyProfileId,
}: ApiKeysTabProps) {
    return (
        <div className="grid gap-6 lg:grid-cols-12">
            <Card className="lg:col-span-5">
                <CardHeader className="text-center">
                    <CardTitle className="text-center">Create API key</CardTitle>
                    <CardDescription className="text-center">Generate keys for automation and integrations.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <FieldSet>
                        <FieldLegend>Create a new key</FieldLegend>
                        <FieldGroup>
                            <div className="grid gap-6 lg:grid-cols-1">
                                <Field>
                                    <FieldLabel className="w-full justify-center text-center" htmlFor="apiKeyName">
                                        Key name
                                        <FieldHint label="Key name help" text="Optional label to help you recognize this key." />
                                    </FieldLabel>
                                    <Input id="apiKeyName" onChange={(event) => setApiKeyName(event.target.value)} placeholder="Production deployer" value={apiKeyName} />
                                </Field>
                                <Field>
                                    <FieldLabel className="w-full justify-center text-center" htmlFor="apiKeyProfile">
                                        Permission profile
                                        <FieldHint label="Permission profile help" text="Select the access level for this key." />
                                    </FieldLabel>
                                    <Select onValueChange={setApiKeyProfileId} value={apiKeyProfileId}>
                                        <SelectTrigger id="apiKeyProfile">
                                            <SelectValue placeholder="Select profile" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {API_KEY_PROFILES.map((profile) => (
                                                <SelectItem key={profile.id} value={profile.id}>
                                                    {profile.label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <p className="text-muted-foreground text-sm">
                                        {API_KEY_PROFILES.find((profile) => profile.id === apiKeyProfileId)?.description ?? "Select permissions for this key."}
                                    </p>
                                </Field>
                                <Field>
                                    <FieldLabel className="w-full justify-center text-center" htmlFor="apiKeyPrefix">
                                        Prefix
                                        <FieldHint label="Prefix help" text="Helps identify keys in logs (include an underscore)." />
                                    </FieldLabel>
                                    <Input id="apiKeyPrefix" onChange={(event) => setApiKeyPrefix(event.target.value)} placeholder="fdry_" value={apiKeyPrefix} />
                                </Field>
                                <Field>
                                    <FieldLabel className="w-full justify-center text-center" htmlFor="apiKeyExpires">
                                        Expires in (days)
                                        <FieldHint label="Expiration help" text="Leave blank for no expiration." />
                                    </FieldLabel>
                                    <Input
                                        id="apiKeyExpires"
                                        inputMode="numeric"
                                        onChange={(event) => setApiKeyExpiresInDays(event.target.value)}
                                        placeholder="30"
                                        value={apiKeyExpiresInDays}
                                    />
                                </Field>
                            </div>
                        </FieldGroup>
                    </FieldSet>

                    <div className="flex flex-wrap items-center gap-3">
                        <Button onClick={onCreateApiKey} type="button">
                            Create API key
                        </Button>
                        {lastCreatedKey ? (
                            <Button onClick={onCopyKey} type="button" variant="outline">
                                Copy key
                            </Button>
                        ) : null}
                    </div>
                    {lastCreatedKey ? <FieldDescription className="text-emerald-500">Save this key now — you won&apos;t see it again. {lastCreatedKey}</FieldDescription> : null}
                    {apiKeyMessage ? (
                        <FieldDescription className={apiKeyMessage.type === "error" ? "text-destructive" : "text-emerald-500"}>{apiKeyMessage.message}</FieldDescription>
                    ) : null}
                </CardContent>
            </Card>

            <Card className="lg:col-span-7">
                <CardHeader className="text-center">
                    <CardTitle className="text-center">Active keys</CardTitle>
                    <CardDescription className="text-center">Keys attached to your account.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-muted-foreground text-sm">Manage existing keys and revoke access.</p>
                        </div>
                        <Button disabled={apiKeyLoading} onClick={onLoadApiKeys} type="button" variant="outline">
                            {apiKeyLoading ? "Refreshing..." : "Refresh"}
                        </Button>
                    </div>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Name</TableHead>
                                <TableHead>Prefix</TableHead>
                                <TableHead>Profile</TableHead>
                                <TableHead>Created</TableHead>
                                <TableHead>Expires</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {apiKeys.length === 0 ? (
                                <TableRow>
                                    <TableCell className="py-6 text-muted-foreground" colSpan={7}>
                                        No API keys yet.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                apiKeys.map((key) => (
                                    <TableRow key={key.id}>
                                        <TableCell className="font-medium">{key.name || "Untitled key"}</TableCell>
                                        <TableCell>{key.prefix || key.start || "—"}</TableCell>
                                        <TableCell>{getProfileLabel(key.metadata?.profile ?? null)}</TableCell>
                                        <TableCell>{formatDate(key.createdAt)}</TableCell>
                                        <TableCell>{formatDate(key.expiresAt)}</TableCell>
                                        <TableCell>{key.enabled === false ? <Badge variant="outline">Disabled</Badge> : <Badge>Active</Badge>}</TableCell>
                                        <TableCell className="text-right">
                                            <Button onClick={() => onDeleteApiKey(key.id)} size="sm" type="button" variant="ghost">
                                                Revoke
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}

export default function AccountPage() {
    const { data, isPending, error, refetch } = useSession();
    const pathname = usePathname();
    const router = useRouter();
    const searchParams = useSearchParams();
    const [fieldErrors, setFieldErrors] = useState<FieldErrorMap>({});
    const [formMessage, setFormMessage] = useState<StatusMessage | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const [apiKeys, setApiKeys] = useState<ApiKeyEntry[]>([]);
    const [apiKeyMessage, setApiKeyMessage] = useState<StatusMessage | null>(null);
    const [apiKeyLoading, setApiKeyLoading] = useState(false);
    const [apiKeyName, setApiKeyName] = useState("");
    const [apiKeyPrefix, setApiKeyPrefix] = useState("fdry_");
    const [apiKeyExpiresInDays, setApiKeyExpiresInDays] = useState("");
    const [apiKeyProfileId, setApiKeyProfileId] = useState(API_KEY_PROFILES[1]?.id ?? "launcher-free");
    const [lastCreatedKey, setLastCreatedKey] = useState<string | null>(null);
    const [twoFactorPassword, setTwoFactorPassword] = useState("");
    const [twoFactorCode, setTwoFactorCode] = useState("");
    const [twoFactorMessage, setTwoFactorMessage] = useState<StatusMessage | null>(null);
    const [twoFactorLoading, setTwoFactorLoading] = useState(false);
    const [totpUri, setTotpUri] = useState<string | null>(null);
    const [backupCodes, setBackupCodes] = useState<string[] | null>(null);
    const [trustDevice, setTrustDevice] = useState(true);
    const [passwordSetupLoading, setPasswordSetupLoading] = useState(false);
    const [passwordSetupMessage, setPasswordSetupMessage] = useState<StatusMessage | null>(null);

    const activeTab = useMemo<AccountTab>(() => {
        const tab = searchParams.get("tab");
        return ACCOUNT_TABS.includes(tab as AccountTab) ? (tab as AccountTab) : "profile";
    }, [searchParams]);

    const twoFactorEnabled = useMemo(() => {
        const user = data?.user as { twoFactorEnabled?: boolean | null } | undefined;
        return Boolean(user?.twoFactorEnabled);
    }, [data?.user]);

    const avatarData = useMemo(() => {
        const user = data?.user as { name?: string | null; email?: string | null; image?: string | null } | undefined;
        const fallbackSource = user?.name || user?.email || "U";
        return {
            avatarUrl: user?.image ?? null,
            avatarFallback: fallbackSource.slice(0, 2).toUpperCase(),
        };
    }, [data?.user]);

    const handleTabChange = useCallback(
        (value: string) => {
            const nextTab = ACCOUNT_TABS.includes(value as AccountTab) ? (value as AccountTab) : "profile";
            if (nextTab === activeTab) {
                return;
            }
            const params = new URLSearchParams(searchParams.toString());
            params.set("tab", nextTab);
            router.push(`${pathname}?${params.toString()}`);
        },
        [activeTab, pathname, router, searchParams]
    );

    const clearFieldError = useCallback((fieldName: string) => {
        setFieldErrors((prev) => {
            if (!prev[fieldName]) {
                return prev;
            }
            const copy: FieldErrorMap = { ...prev };
            delete copy[fieldName];
            return copy;
        });
    }, []);

    const loadApiKeys = useCallback(async () => {
        setApiKeyLoading(true);
        setApiKeyMessage(null);
        try {
            const result = await authClient.apiKey.list({});
            if (result?.error) {
                setApiKeyMessage({ type: "error", message: result.error.message ?? "Failed to load API keys." });
                setApiKeys([]);
                return;
            }
            const keys = (result?.data ?? []) as ApiKeyEntry[];
            setApiKeys(keys);
        } catch {
            setApiKeyMessage({ type: "error", message: "Failed to load API keys." });
            setApiKeys([]);
        } finally {
            setApiKeyLoading(false);
        }
    }, []);

    const handleCreateApiKey = useCallback(async () => {
        setApiKeyMessage(null);
        setLastCreatedKey(null);
        try {
            const expiresIn = toSecondsFromDays(apiKeyExpiresInDays.trim());
            const profile = API_KEY_PROFILES.find((item) => item.id === apiKeyProfileId) ?? API_KEY_PROFILES[0];
            const result = await createApiKeyOnServer({
                name: apiKeyName.trim() || undefined,
                prefix: apiKeyPrefix.trim() || undefined,
                expiresIn,
                profileId: profile?.id,
            });
            if (result?.error) {
                setApiKeyMessage({ type: "error", message: result.error.message ?? "Failed to create API key." });
                return;
            }
            const createdKey = (result?.data as { key?: string } | undefined)?.key ?? null;
            setLastCreatedKey(createdKey);
            setApiKeyName("");
            setApiKeyExpiresInDays("");
            await loadApiKeys();
            setApiKeyMessage({ type: "success", message: "API key created." });
        } catch {
            setApiKeyMessage({ type: "error", message: "Failed to create API key." });
        }
    }, [apiKeyExpiresInDays, apiKeyName, apiKeyPrefix, apiKeyProfileId, loadApiKeys]);

    const handleDeleteApiKey = useCallback(
        async (keyId: string) => {
            setApiKeyMessage(null);
            try {
                const result = await authClient.apiKey.delete({ keyId });
                if (result?.error) {
                    setApiKeyMessage({ type: "error", message: result.error.message ?? "Failed to delete API key." });
                    return;
                }
                await loadApiKeys();
                setApiKeyMessage({ type: "success", message: "API key deleted." });
            } catch {
                setApiKeyMessage({ type: "error", message: "Failed to delete API key." });
            }
        },
        [loadApiKeys]
    );

    const handleCopyKey = useCallback(async () => {
        if (!lastCreatedKey) {
            return;
        }
        try {
            await navigator.clipboard?.writeText(lastCreatedKey);
            setApiKeyMessage({ type: "success", message: "API key copied to clipboard." });
        } catch {
            setApiKeyMessage({ type: "error", message: "Unable to copy API key." });
        }
    }, [lastCreatedKey]);

    const handleEnableTwoFactor = useCallback(async () => {
        setTwoFactorMessage(null);
        setTwoFactorLoading(true);
        try {
            const result = await authClient.twoFactor.enable({
                password: twoFactorPassword,
                issuer: "Foundry",
            });
            if (result?.error) {
                setTwoFactorMessage({ type: "error", message: result.error.message ?? "Failed to enable two-factor." });
                return;
            }
            const payload = result?.data as { totpURI?: string; backupCodes?: string[] } | null;
            setTotpUri(payload?.totpURI ?? null);
            setBackupCodes(payload?.backupCodes ?? null);
            setTwoFactorMessage({ type: "success", message: "Scan the QR code and verify your code to finish setup." });
        } catch {
            setTwoFactorMessage({ type: "error", message: "Failed to enable two-factor." });
        } finally {
            setTwoFactorLoading(false);
        }
    }, [twoFactorPassword]);

    const handleVerifyTotp = useCallback(async () => {
        if (!twoFactorCode.trim()) {
            setTwoFactorMessage({ type: "error", message: "Enter the verification code." });
            return;
        }
        setTwoFactorLoading(true);
        setTwoFactorMessage(null);
        try {
            const result = await authClient.twoFactor.verifyTotp({
                code: twoFactorCode.trim(),
                trustDevice,
            });
            if (result?.error) {
                setTwoFactorMessage({ type: "error", message: result.error.message ?? "Failed to verify code." });
                return;
            }
            setTwoFactorMessage({ type: "success", message: "Two-factor enabled." });
            setTwoFactorCode("");
            setTotpUri(null);
            setBackupCodes(null);
            await refetch();
        } catch {
            setTwoFactorMessage({ type: "error", message: "Failed to verify code." });
        } finally {
            setTwoFactorLoading(false);
        }
    }, [twoFactorCode, trustDevice, refetch]);

    const handleDisableTwoFactor = useCallback(async () => {
        setTwoFactorMessage(null);
        setTwoFactorLoading(true);
        try {
            const result = await authClient.twoFactor.disable({
                password: twoFactorPassword,
            });
            if (result?.error) {
                setTwoFactorMessage({ type: "error", message: result.error.message ?? "Failed to disable two-factor." });
                return;
            }
            setTwoFactorMessage({ type: "success", message: "Two-factor disabled." });
            setTotpUri(null);
            setBackupCodes(null);
            setTwoFactorCode("");
            await refetch();
        } catch {
            setTwoFactorMessage({ type: "error", message: "Failed to disable two-factor." });
        } finally {
            setTwoFactorLoading(false);
        }
    }, [twoFactorPassword, refetch]);

    const handleGenerateBackupCodes = useCallback(async () => {
        setTwoFactorMessage(null);
        setTwoFactorLoading(true);
        try {
            const result = await authClient.twoFactor.generateBackupCodes({
                password: twoFactorPassword,
            });
            if (result?.error) {
                setTwoFactorMessage({ type: "error", message: result.error.message ?? "Failed to generate backup codes." });
                return;
            }
            const payload = result?.data as { backupCodes?: string[] } | null;
            setBackupCodes(payload?.backupCodes ?? null);
            setTwoFactorMessage({ type: "success", message: "Backup codes updated." });
        } catch {
            setTwoFactorMessage({ type: "error", message: "Failed to generate backup codes." });
        } finally {
            setTwoFactorLoading(false);
        }
    }, [twoFactorPassword]);

    const handleGetTotpUri = useCallback(async () => {
        setTwoFactorMessage(null);
        setTwoFactorLoading(true);
        try {
            const result = await authClient.twoFactor.getTotpUri({
                password: twoFactorPassword,
            });
            if (result?.error) {
                setTwoFactorMessage({ type: "error", message: result.error.message ?? "Failed to fetch QR code." });
                return;
            }
            const payload = result?.data as { totpURI?: string } | null;
            setTotpUri(payload?.totpURI ?? null);
            setTwoFactorMessage({ type: "success", message: "QR code refreshed." });
        } catch {
            setTwoFactorMessage({ type: "error", message: "Failed to fetch QR code." });
        } finally {
            setTwoFactorLoading(false);
        }
    }, [twoFactorPassword]);

    const handleSendPasswordSetup = useCallback(async () => {
        const email = (data?.user as { email?: string | null } | undefined)?.email;
        if (!email) {
            setPasswordSetupMessage({ type: "error", message: "No email found for your account." });
            return;
        }
        setPasswordSetupLoading(true);
        setPasswordSetupMessage(null);
        try {
            const response = await fetch("/api/auth/forgot", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ email }),
            });
            if (!response.ok) {
                setPasswordSetupMessage({ type: "error", message: "Failed to send setup email." });
                return;
            }
            setPasswordSetupMessage({ type: "success", message: "Password setup email sent." });
        } catch {
            setPasswordSetupMessage({ type: "error", message: "Failed to send setup email." });
        } finally {
            setPasswordSetupLoading(false);
        }
    }, [data?.user]);

    const userDefaults = useMemo<AccountDefaults>(() => {
        const user = data?.user as
            | {
                  name?: string | null;
                  username?: string | null;
                  email?: string | null;
                  firstName?: string | null;
                  lastName?: string | null;
                  age?: number | null;
              }
            | undefined;

        return {
            fullName: user?.name ?? "",
            username: user?.username ?? "",
            email: user?.email ?? "",
            firstName: user?.firstName ?? "",
            lastName: user?.lastName ?? "",
            age: user?.age != null ? String(user.age) : "",
            currentPassword: "",
            newPassword: "",
            confirmPassword: "",
        };
    }, [data?.user]);

    const form = useForm({
        defaultValues: userDefaults,
        onSubmit: async ({ value }) => {
            setFormMessage(null);
            const parsed = accountSchema.safeParse(value as unknown);
            if (!parsed.success) {
                setFieldErrors(buildErrorMap(parsed.error.issues));
                return;
            }
            setFieldErrors({});
            if (!data?.user) {
                setFormMessage({ type: "error", message: "You must be signed in to update your account." });
                return;
            }

            setIsSaving(true);
            try {
                const result = await saveAccountSettings(parsed.data, refetch);
                setFormMessage(result);
            } catch {
                setFormMessage({ type: "error", message: "Something went wrong while saving." });
            } finally {
                setIsSaving(false);
            }
        },
    });

    const handleAccountSubmit = useCallback(() => {
        form.handleSubmit();
    }, [form]);

    const handleAccountReset = useCallback(() => {
        form.reset(userDefaults);
    }, [form, userDefaults]);

    useEffect(() => {
        if (!data?.user) {
            return;
        }
        form.reset(userDefaults);
    }, [data?.user, form, userDefaults]);

    useEffect(() => {
        if (!data?.user) {
            return;
        }
        loadApiKeys().catch(() => undefined);
    }, [data?.user, loadApiKeys]);

    if (isPending) {
        return (
            <div className="mx-auto flex w-full max-w-4xl flex-col gap-6 p-8">
                <Card>
                    <CardHeader>
                        <CardTitle>Account settings</CardTitle>
                        <CardDescription>Loading your account details...</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="h-12 w-full animate-pulse rounded-md bg-muted" />
                        <div className="h-12 w-2/3 animate-pulse rounded-md bg-muted" />
                        <div className="h-12 w-1/2 animate-pulse rounded-md bg-muted" />
                    </CardContent>
                </Card>
            </div>
        );
    }

    if (!data?.user || error) {
        return (
            <div className="mx-auto flex w-full max-w-4xl flex-col gap-6 p-8">
                <Card>
                    <CardHeader>
                        <CardTitle>Sign in required</CardTitle>
                        <CardDescription>Please sign in to manage your account settings.</CardDescription>
                    </CardHeader>
                    <CardFooter>
                        <Button asChild>
                            <a href="/auth/login">Go to sign in</a>
                        </Button>
                    </CardFooter>
                </Card>
            </div>
        );
    }

    return (
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 p-8">
            <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="space-y-2">
                    <h1 className="font-semibold text-2xl">Account settings</h1>
                    <p className="text-muted-foreground">Manage your profile, security, and API access.</p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                    {activeTab === "profile" ? (
                        <>
                            <Button disabled={isSaving} onClick={handleAccountSubmit} type="button">
                                {isSaving ? "Saving..." : "Save changes"}
                            </Button>
                            <Button disabled={isSaving} onClick={handleAccountReset} type="button" variant="outline">
                                Reset
                            </Button>
                        </>
                    ) : null}
                    <Button onClick={() => signOut()} type="button" variant="outline">
                        Sign out
                    </Button>
                </div>
            </div>

            <Tabs className="space-y-6" onValueChange={handleTabChange} value={activeTab}>
                <TabsList className="grid w-full max-w-xl grid-cols-3">
                    {ACCOUNT_TABS.map((tab) => (
                        <TabsTrigger key={tab} type="button" value={tab}>
                            {TAB_LABELS[tab]}
                        </TabsTrigger>
                    ))}
                </TabsList>

                <TabsContent className="space-y-6" value="profile">
                    <ProfileTab
                        avatarFallback={avatarData.avatarFallback}
                        avatarUrl={avatarData.avatarUrl}
                        clearFieldError={clearFieldError}
                        fieldErrors={fieldErrors}
                        form={form}
                        formMessage={formMessage}
                        onSubmit={handleAccountSubmit}
                    />
                </TabsContent>

                <TabsContent className="space-y-6" value="security">
                    <SecurityTab
                        backupCodes={backupCodes}
                        clearFieldError={clearFieldError}
                        fieldErrors={fieldErrors}
                        form={form}
                        formMessage={formMessage}
                        isSaving={isSaving}
                        onDisableTwoFactor={handleDisableTwoFactor}
                        onEnableTwoFactor={handleEnableTwoFactor}
                        onGenerateBackupCodes={handleGenerateBackupCodes}
                        onGetTotpUri={handleGetTotpUri}
                        onReset={handleAccountReset}
                        onSendPasswordSetup={handleSendPasswordSetup}
                        onSubmit={handleAccountSubmit}
                        onVerifyTotp={handleVerifyTotp}
                        passwordSetupLoading={passwordSetupLoading}
                        passwordSetupMessage={passwordSetupMessage}
                        setTrustDevice={setTrustDevice}
                        setTwoFactorCode={setTwoFactorCode}
                        setTwoFactorPassword={setTwoFactorPassword}
                        totpUri={totpUri}
                        trustDevice={trustDevice}
                        twoFactorCode={twoFactorCode}
                        twoFactorEnabled={twoFactorEnabled}
                        twoFactorLoading={twoFactorLoading}
                        twoFactorMessage={twoFactorMessage}
                        twoFactorPassword={twoFactorPassword}
                    />
                </TabsContent>

                <TabsContent className="space-y-6" value="api-keys">
                    <ApiKeysTab
                        apiKeyExpiresInDays={apiKeyExpiresInDays}
                        apiKeyLoading={apiKeyLoading}
                        apiKeyMessage={apiKeyMessage}
                        apiKeyName={apiKeyName}
                        apiKeyPrefix={apiKeyPrefix}
                        apiKeyProfileId={apiKeyProfileId}
                        apiKeys={apiKeys}
                        lastCreatedKey={lastCreatedKey}
                        onCopyKey={handleCopyKey}
                        onCreateApiKey={handleCreateApiKey}
                        onDeleteApiKey={handleDeleteApiKey}
                        onLoadApiKeys={loadApiKeys}
                        setApiKeyExpiresInDays={setApiKeyExpiresInDays}
                        setApiKeyName={setApiKeyName}
                        setApiKeyPrefix={setApiKeyPrefix}
                        setApiKeyProfileId={setApiKeyProfileId}
                    />
                </TabsContent>
            </Tabs>
        </div>
    );
}
