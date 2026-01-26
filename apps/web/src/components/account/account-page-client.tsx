"use client";

import { Button } from "@foundry/ui/primitives/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@foundry/ui/primitives/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@foundry/ui/primitives/tabs";
import { authClient, signOut, useSession } from "@foundry/web/lib/auth-client";
import { useForm } from "@tanstack/react-form";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { useCallback, useEffect, useMemo, useState } from "react";
import type * as z from "zod";

import { ApiKeysTab } from "./api-keys-tab";
import { ProfileTab } from "./profile-tab";
import { SecurityTab } from "./security-tab";
import { ACCOUNT_TABS, API_KEY_PROFILES } from "./types/constants";
import { accountSchema } from "./types/schema";
import type { AccountDefaults, AccountTab, ApiKeyEntry, FieldErrorMap, StatusMessage } from "./types/types";

import { buildErrorMap, parseAge, toSecondsFromDays } from "./utils";

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
    return { type: "success", messageKey: "accountUpdated" } as const;
};

export function AccountPageClient() {
    const t = useTranslations("AccountPage");
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
            const nextUrl = `${pathname}?${params.toString()}`;
            router.push(nextUrl as never);
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
                setApiKeyMessage({ type: "error", message: result.error.message ?? t("saveFailed") });
                return;
            }
            const createdKey = (result?.data as { key?: string } | undefined)?.key ?? null;
            setLastCreatedKey(createdKey);
            setApiKeyName("");
            setApiKeyExpiresInDays("");
            await loadApiKeys();
            setApiKeyMessage({ type: "success", message: t("apiKeyCreated") });
        } catch {
            setApiKeyMessage({ type: "error", message: "Failed to create API key." });
        }
    }, [apiKeyExpiresInDays, apiKeyName, apiKeyPrefix, apiKeyProfileId, loadApiKeys, t]);

    const handleDeleteApiKey = useCallback(
        async (keyId: string) => {
            setApiKeyMessage(null);
            try {
                const result = await authClient.apiKey.delete({ keyId });
                if (result?.error) {
                    setApiKeyMessage({ type: "error", message: result.error.message ?? t("saveFailed") });
                    return;
                }
                await loadApiKeys();
                setApiKeyMessage({ type: "success", message: t("apiKeyDeleted") });
            } catch {
                setApiKeyMessage({ type: "error", message: "Failed to delete API key." });
            }
        },
        [loadApiKeys, t]
    );

    const handleCopyKey = useCallback(async () => {
        if (!lastCreatedKey) {
            return;
        }
        try {
            await navigator.clipboard?.writeText(lastCreatedKey);
            setApiKeyMessage({ type: "success", message: t("apiKeyCopied") });
        } catch {
            setApiKeyMessage({ type: "error", message: t("apiKeyCopyFailed") });
        }
    }, [lastCreatedKey, t]);

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
                // Localize known success messages or map server-provided keys
                if (result?.type === "success") {
                    // server returns messageKey when available
                    const message = result && (result as { messageKey?: string }).messageKey === "accountUpdated" ? t("accountUpdated") : (result?.message ?? t("accountUpdated"));
                    setFormMessage({ type: result.type, message });
                } else if (result?.type === "error") {
                    // If server returned a message, show it; otherwise use generic failure
                    setFormMessage({ type: "error", message: result.message ?? t("saveFailed") });
                } else {
                    setFormMessage(result as StatusMessage);
                }
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
                        <CardTitle>{t("heading")}</CardTitle>
                        <CardDescription>{t("loading")}</CardDescription>
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
                        <CardTitle>{t("signInRequiredTitle")}</CardTitle>
                        <CardDescription>{t("signInRequiredDescription")}</CardDescription>
                    </CardHeader>
                    <CardFooter>
                        <Button asChild>
                            <a href="/auth/login">{t("goToSignIn")}</a>
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
                    <h1 className="font-semibold text-2xl">{t("heading")}</h1>
                    <p className="text-muted-foreground">{t("description")}</p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                    {activeTab === "profile" ? (
                        <>
                            <Button disabled={isSaving} onClick={handleAccountSubmit} type="button">
                                {isSaving ? t("saving") : t("save")}
                            </Button>
                            <Button disabled={isSaving} onClick={handleAccountReset} type="button" variant="outline">
                                {t("reset")}
                            </Button>
                        </>
                    ) : null}
                    <Button onClick={() => signOut()} type="button" variant="outline">
                        {t("signOut")}
                    </Button>
                </div>
            </div>

            <Tabs className="space-y-6" onValueChange={handleTabChange} value={activeTab}>
                <TabsList className="grid w-full max-w-xl grid-cols-3">
                    {ACCOUNT_TABS.map((tab) => (
                        <TabsTrigger key={tab} type="button" value={tab}>
                            {t(`tabs.${tab}`)}
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
