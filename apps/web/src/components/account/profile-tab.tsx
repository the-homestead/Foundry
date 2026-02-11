"use client";

import { PhDiscordLogoDuotone, PhGithubLogoDuotone, PhGitlabLogoDuotone, PhGoogleLogoDuotone, PhTwitchLogoDuotone } from "@foundry/ui/components/cicons";
import { Alert, AlertDescription, AlertTitle } from "@foundry/ui/primitives/alert";
import { Badge } from "@foundry/ui/primitives/badge";
import { Button } from "@foundry/ui/primitives/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@foundry/ui/primitives/card";
import { Checkbox } from "@foundry/ui/primitives/checkbox";
import { Field, FieldDescription, FieldGroup, FieldLabel, FieldSet } from "@foundry/ui/primitives/field";
import { Input } from "@foundry/ui/primitives/input";
import { InputGroup, InputGroupAddon, InputGroupInput, InputGroupText } from "@foundry/ui/primitives/input-group";
import { Separator } from "@foundry/ui/primitives/separator";
import { Skeleton } from "@foundry/ui/primitives/skeleton";
import { getLinkedAccounts } from "@foundry/web/actions/accounts";
import { authClient } from "@foundry/web/lib/auth-client";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { useCallback, useEffect, useState } from "react";
import { AvatarUploadDialog } from "./avatar-upload-dialog";
import { FieldHint } from "./field-hint";
import type { AccountForm, FieldErrorMap, StatusMessage } from "./types/types";

interface LinkedAccount {
    id: string;
    accountId: string;
    providerId: string;
    userId: string;
    createdAt: Date;
    updatedAt: Date;
}

interface ProfileTabProps {
    form: AccountForm;
    avatarFallback: string;
    avatarUrl: string | null;
    fieldErrors: FieldErrorMap;
    formMessage: StatusMessage | null;
    clearFieldError: (fieldName: string) => void;
    onSubmit: () => void;
}

export function ProfileTab({ form, avatarFallback, avatarUrl, fieldErrors, formMessage, clearFieldError, onSubmit }: ProfileTabProps) {
    const t = useTranslations("AccountPage");
    const searchParams = useSearchParams();
    const { data: sessionData } = authClient.useSession();
    const userId = sessionData?.user?.id ?? "";
    const [linkedAccounts, setLinkedAccounts] = useState<LinkedAccount[]>([]);
    const [loadingAccounts, setLoadingAccounts] = useState(true);
    const [linkError, setLinkError] = useState<string | null>(null);

    // Check for error in URL params
    useEffect(() => {
        const error = searchParams.get("error");
        if (error === "link_failed") {
            setLinkError("Failed to link account. The account may already be linked to another user.");
            // Clear the error from URL after 5 seconds
            const timer = setTimeout(() => setLinkError(null), 5000);
            return () => clearTimeout(timer);
        }
    }, [searchParams]);
    const AVAILABLE_PROVIDERS = [
        { id: "github", name: "GitHub", icon: PhGithubLogoDuotone },
        { id: "google", name: "Google", icon: PhGoogleLogoDuotone },
        { id: "discord", name: "Discord", icon: PhDiscordLogoDuotone },
        { id: "gitlab", name: "GitLab", icon: PhGitlabLogoDuotone },
        { id: "twitch", name: "Twitch", icon: PhTwitchLogoDuotone },
    ];

    const loadLinkedAccounts = useCallback(async () => {
        if (!userId) {
            return;
        }

        setLoadingAccounts(true);
        try {
            // Fetch linked accounts from server action
            const accounts = await getLinkedAccounts();
            setLinkedAccounts(accounts);
        } catch (error) {
            console.error("Failed to load linked accounts:", error);
        } finally {
            setLoadingAccounts(false);
        }
    }, [userId]);

    useEffect(() => {
        loadLinkedAccounts();
    }, [loadLinkedAccounts]);

    const isLinked = (providerId: string) => {
        return linkedAccounts.some((account) => account.providerId === providerId);
    };

    const handleLinkAccount = useCallback(async (providerId: string) => {
        try {
            // Link the social provider to the user's account
            await authClient.linkSocial({
                provider: providerId,
                callbackURL: "/account?tab=profile", // Redirect back to profile tab after linking
            });
        } catch (error) {
            console.error(`Failed to link ${providerId}:`, error);
        }
    }, []);

    const handleUnlinkAccount = useCallback(
        async (providerId: string) => {
            try {
                // Unlink the social provider from the user's account
                await authClient.unlinkAccount({
                    providerId,
                });
                // Refresh the linked accounts list
                await loadLinkedAccounts();
            } catch (error) {
                console.error(`Failed to unlink ${providerId}:`, error);
            }
        },
        [loadLinkedAccounts]
    );
    return (
        <form
            onSubmit={(event) => {
                event.preventDefault();
                onSubmit();
            }}
        >
            <div className="grid gap-6 lg:grid-cols-12">
                <div className="flex flex-col gap-6 lg:col-span-8">
                    <Card>
                        <CardHeader>
                            <CardTitle>{t("profile.identity.title")}</CardTitle>
                            <CardDescription>{t("profile.identity.description")}</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <FieldSet>
                                <FieldGroup className="w-full space-y-6">
                                    <div className="space-y-4">
                                        <div className="grid gap-4 sm:grid-cols-2">
                                            <Field orientation="vertical">
                                                <FieldLabel htmlFor="username">{t("profile.identity.username")}</FieldLabel>
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
                                            </Field>

                                            <Field orientation="vertical">
                                                <FieldLabel htmlFor="email">{t("profile.identity.email")}</FieldLabel>
                                                <form.Field name="email">
                                                    {(field) => <Input className="w-full" disabled id={field.name} name={field.name} type="email" value={field.state.value} />}
                                                </form.Field>
                                            </Field>
                                        </div>

                                        <Field orientation="vertical">
                                            <FieldLabel htmlFor="fullName">
                                                {t("profile.identity.displayName")}
                                                <FieldHint label={t("profile.identity.displayName")} text={t("profile.identity.displayNameHelp")} />
                                            </FieldLabel>
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
                                        </Field>
                                    </div>

                                    <Separator />

                                    <div className="space-y-4">
                                        <p className="font-medium text-muted-foreground text-sm">Optional Information</p>
                                        <div className="grid gap-4 sm:grid-cols-3">
                                            <Field orientation="vertical">
                                                <div className="flex items-center justify-between">
                                                    <FieldLabel htmlFor="firstName">{t("profile.fields.firstName")}</FieldLabel>
                                                    <form.Field name="firstNamePublic">
                                                        {(field) => (
                                                            <div className="flex cursor-pointer items-center gap-2 text-muted-foreground text-xs">
                                                                <Checkbox checked={field.state.value} onCheckedChange={(checked) => field.handleChange(Boolean(checked))} />
                                                                <span>Public</span>
                                                            </div>
                                                        )}
                                                    </form.Field>
                                                </div>
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

                                            <Field orientation="vertical">
                                                <div className="flex items-center justify-between">
                                                    <FieldLabel htmlFor="lastName">{t("profile.fields.lastName")}</FieldLabel>
                                                    <form.Field name="lastNamePublic">
                                                        {(field) => (
                                                            <div className="flex cursor-pointer items-center gap-2 text-muted-foreground text-xs">
                                                                <Checkbox checked={field.state.value} onCheckedChange={(checked) => field.handleChange(Boolean(checked))} />
                                                                <span>Public</span>
                                                            </div>
                                                        )}
                                                    </form.Field>
                                                </div>
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

                                            <Field orientation="vertical">
                                                <div className="flex items-center justify-between">
                                                    <FieldLabel htmlFor="age">Age</FieldLabel>
                                                    <form.Field name="agePublic">
                                                        {(field) => (
                                                            <div className="flex cursor-pointer items-center gap-2 text-muted-foreground text-xs">
                                                                <Checkbox checked={field.state.value} onCheckedChange={(checked) => field.handleChange(Boolean(checked))} />
                                                                <span>Public</span>
                                                            </div>
                                                        )}
                                                    </form.Field>
                                                </div>
                                                <form.Field name="age">
                                                    {(field) => (
                                                        <Input
                                                            className="w-full"
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
                                    </div>

                                    <div className="flex flex-col gap-2 border-t pt-4">
                                        {formMessage ? (
                                            <FieldDescription className={formMessage.type === "error" ? "text-destructive" : "text-emerald-500"}>
                                                {formMessage.message}
                                            </FieldDescription>
                                        ) : null}
                                        <p className="text-muted-foreground text-sm">{t("security.changesSync")}</p>
                                    </div>
                                </FieldGroup>
                            </FieldSet>
                        </CardContent>
                    </Card>
                </div>

                <div className="flex flex-col gap-6 lg:col-span-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>{t("profile.avatar.title")}</CardTitle>
                            <CardDescription>Upload your profile picture</CardDescription>
                        </CardHeader>
                        <CardContent className="flex flex-col items-center gap-4 text-center">
                            <AvatarUploadDialog avatarFallback={avatarFallback} avatarUrl={avatarUrl} userId={userId} />
                            <p className="text-muted-foreground text-xs">{t("profile.avatar.pictureNote")}</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Connected Accounts</CardTitle>
                            <CardDescription>Sign in methods linked to your account</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            {linkError ? (
                                <Alert variant="destructive">
                                    <AlertTitle>Error</AlertTitle>
                                    <AlertDescription>{linkError}</AlertDescription>
                                </Alert>
                            ) : null}
                            {loadingAccounts ? (
                                <div className="space-y-2">
                                    {new Array(5).fill(0).map((_, i) => (
                                        <Skeleton className="h-12 w-full" key={`skeleton-${i.toString()}`} />
                                    ))}
                                </div>
                            ) : (
                                AVAILABLE_PROVIDERS.map((provider) => {
                                    const Icon = provider.icon;
                                    const linked = isLinked(provider.id);

                                    return (
                                        <div className="flex items-center justify-between rounded-md border px-3 py-2 transition-colors hover:bg-accent/50" key={provider.id}>
                                            <div className="flex items-center gap-3">
                                                <div className="flex h-8 w-8 items-center justify-center rounded-md bg-muted">
                                                    <Icon className="h-4 w-4" />
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="font-medium text-sm">{provider.name}</span>
                                                    <span className="text-muted-foreground text-xs">OAuth provider</span>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Badge className="text-[10px]" variant={linked ? "default" : "outline"}>
                                                    {linked ? "Linked" : "Not linked"}
                                                </Badge>
                                                <Button
                                                    className={linked ? "h-7 text-destructive hover:bg-destructive hover:text-destructive-foreground" : "h-7"}
                                                    onClick={() => (linked ? handleUnlinkAccount(provider.id) : handleLinkAccount(provider.id))}
                                                    size="sm"
                                                    type="button"
                                                    variant="ghost"
                                                >
                                                    {linked ? "Unlink" : "Link"}
                                                </Button>
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </form>
    );
}
