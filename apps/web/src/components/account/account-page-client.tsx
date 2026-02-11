"use client";

import { ArrowRightEndOnRectangleIcon } from "@foundry/ui/components/icons/arrow-right-end-on-rectangle";
import { Button } from "@foundry/ui/primitives/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@foundry/ui/primitives/card";
import { authClient, signOut, useSession } from "@foundry/web/lib/auth-client";
import { useForm } from "@tanstack/react-form";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { useCallback, useEffect, useMemo, useState } from "react";
import { AccountNavigation } from "./account-navigation";
import { ApiKeysTab } from "./api-keys-tab";
import { BillingTab } from "./billing-tab";
import { ContentBlockingTab } from "./content-blocking-tab";
import { NotificationsTab } from "./notifications-tab";
import { ProfileTab } from "./profile-tab";
import { SecurityTab } from "./security-tab";
import { SessionsTab } from "./sessions-tab";
import { ACCOUNT_TABS, API_KEY_PROFILES } from "./types/constants";
import { accountSchema } from "./types/schema";
import type { AccountDefaults, AccountTab, ApiKeyEntry, FieldErrorMap, StatusMessage } from "./types/types";
import { buildErrorMap } from "./utils";

export function AccountPageClient() {
    const t = useTranslations("AccountPage");
    const c = useTranslations("common");
    const { data, isPending: sessionPending, error, refetch } = useSession();
    const pathname = usePathname();
    const router = useRouter();
    const searchParams = useSearchParams();

    // Form state
    const [fieldErrors, setFieldErrors] = useState<FieldErrorMap>({});
    const [formMessage, setFormMessage] = useState<StatusMessage | null>(null);
    const [isSaving, setIsSaving] = useState(false);

    // API Keys state
    const [apiKeys, setApiKeys] = useState<ApiKeyEntry[]>([]);
    const [apiKeyMessage, setApiKeyMessage] = useState<StatusMessage | null>(null);
    const [apiKeyLoading, setApiKeyLoading] = useState(false);
    const [apiKeyName, setApiKeyName] = useState("");
    const [apiKeyPrefix, setApiKeyPrefix] = useState("fdry_");
    const [apiKeyExpiresInDays, setApiKeyExpiresInDays] = useState("");
    const [apiKeyProfileId, setApiKeyProfileId] = useState(API_KEY_PROFILES[1]?.id ?? "launcher-free");
    const [lastCreatedKey, setLastCreatedKey] = useState<string | null>(null);
    const [apiKeyCreating, setApiKeyCreating] = useState(false);
    const [pendingRevokeId, setPendingRevokeId] = useState<string | null>(null);

    // Two-factor state
    const [twoFactorPassword, setTwoFactorPassword] = useState("");
    const [twoFactorCode, setTwoFactorCode] = useState("");
    const [twoFactorMessage, setTwoFactorMessage] = useState<StatusMessage | null>(null);
    const [twoFactorLoading, setTwoFactorLoading] = useState(false);
    const [totpUri, setTotpUri] = useState<string | null>(null);
    const [backupCodes, setBackupCodes] = useState<string[] | null>(null);
    const [trustDevice, setTrustDevice] = useState(true);

    // Password setup state
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
                setApiKeyMessage({ type: "error", message: result.error.message ?? c("status.error") });
                setApiKeys([]);
            } else {
                const keys = (result?.data ?? []) as ApiKeyEntry[];
                setApiKeys(keys);
            }
        } catch {
            setApiKeyMessage({ type: "error", message: c("status.error") });
            setApiKeys([]);
        } finally {
            setApiKeyLoading(false);
        }
    }, [c]);

    const handleCreateApiKey = useCallback(async () => {
        setApiKeyMessage(null);
        setLastCreatedKey(null);
        setApiKeyCreating(true);
        try {
            const expiresIn = apiKeyExpiresInDays.trim() ? Math.floor(Number(apiKeyExpiresInDays) * 24 * 60 * 60) : undefined;

            const { data, error } = await authClient.apiKey.create({
                name: apiKeyName.trim() || undefined,
                expiresIn,
                prefix: apiKeyPrefix.trim() || undefined,
                metadata: {
                    profileId: apiKeyProfileId,
                },
            });

            if (error) {
                setApiKeyMessage({ type: "error", message: error.message ?? c("status.saveFailed") });
                return;
            }

            const createdKey = (data as { key?: string } | undefined)?.key ?? null;
            setLastCreatedKey(createdKey);
            setApiKeyName("");
            setApiKeyExpiresInDays("");
            await loadApiKeys();
            setApiKeyMessage({ type: "success", message: t("success.apiKeyCreated") });
        } catch {
            setApiKeyMessage({ type: "error", message: c("status.error") });
        } finally {
            setApiKeyCreating(false);
        }
    }, [apiKeyExpiresInDays, apiKeyName, apiKeyPrefix, apiKeyProfileId, loadApiKeys, t, c]);

    const handleDeleteApiKey = useCallback(
        async (keyId: string) => {
            setApiKeyMessage(null);
            if (pendingRevokeId !== keyId) {
                setPendingRevokeId(keyId);
                return;
            }

            try {
                const result = await authClient.apiKey.delete({ keyId });
                if (result?.error) {
                    setApiKeyMessage({ type: "error", message: result.error.message ?? c("status.saveFailed") });
                    return;
                }
                setPendingRevokeId(null);
                await loadApiKeys();
                setApiKeyMessage({ type: "success", message: t("success.apiKeyDeleted") });
            } catch {
                setApiKeyMessage({ type: "error", message: c("status.error") });
            }
        },
        [loadApiKeys, t, c, pendingRevokeId]
    );

    const handleCopyKey = useCallback(async () => {
        if (!lastCreatedKey) {
            return;
        }
        try {
            await navigator.clipboard?.writeText(lastCreatedKey);
            setApiKeyMessage({ type: "success", message: t("success.apiKeyCopied") });
        } catch {
            setApiKeyMessage({ type: "error", message: t("apiKeys.create.copyFailed") });
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
            setTwoFactorMessage({
                type: "success",
                message: "Scan the QR code and verify your code to finish setup.",
            });
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
            const { error } = await authClient.requestPasswordReset({
                email,
                redirectTo: `${window.location.origin}/auth/reset`,
            });

            if (error) {
                setPasswordSetupMessage({ type: "error", message: error.message ?? "Failed to send setup email." });
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
                  firstNamePublic?: boolean | null;
                  lastName?: string | null;
                  lastNamePublic?: boolean | null;
                  age?: number | null;
                  agePublic?: boolean | null;
              }
            | undefined;

        return {
            fullName: user?.name ?? "",
            username: user?.username ?? "",
            email: user?.email ?? "",
            firstName: user?.firstName ?? "",
            firstNamePublic: user?.firstNamePublic ?? false,
            lastName: user?.lastName ?? "",
            lastNamePublic: user?.lastNamePublic ?? false,
            age: user?.age != null ? String(user.age) : "",
            agePublic: user?.agePublic ?? false,
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
                setFormMessage({ type: "error", message: t("errors.mustSignIn") });
                return;
            }

            setIsSaving(true);
            try {
                const updateData: Record<string, string> = {};
                if (parsed.data.fullName) {
                    updateData.name = parsed.data.fullName;
                }
                if (parsed.data.email) {
                    updateData.email = parsed.data.email;
                }
                if (parsed.data.firstName !== undefined) {
                    updateData.firstName = parsed.data.firstName;
                }
                if (parsed.data.lastName !== undefined) {
                    updateData.lastName = parsed.data.lastName;
                }
                if (parsed.data.age !== undefined) {
                    updateData.age = String(parsed.data.age);
                }

                const result = await authClient.updateUser(updateData);
                if (result?.error) {
                    setFormMessage({ type: "error", message: result.error.message ?? c("status.saveFailed") });
                    return;
                }

                if (parsed.data.newPassword && parsed.data.currentPassword) {
                    const passwordResult = await authClient.changePassword({
                        currentPassword: parsed.data.currentPassword,
                        newPassword: parsed.data.newPassword,
                    });
                    if (passwordResult?.error) {
                        setFormMessage({ type: "error", message: passwordResult.error.message ?? c("status.saveFailed") });
                        return;
                    }
                }

                setFormMessage({ type: "success", message: t("success.accountUpdated") });
                await refetch();
            } catch {
                setFormMessage({ type: "error", message: c("status.saveFailed") });
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
        loadApiKeys();
    }, [data?.user, loadApiKeys]);

    if (sessionPending) {
        return (
            <div className="mx-auto flex w-full max-w-4xl flex-col gap-6 p-8">
                <Card>
                    <CardHeader>
                        <CardTitle>{t("heading")}</CardTitle>
                        <CardDescription>{t("errors.loading")}</CardDescription>
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
                        <CardTitle>{t("errors.signInRequiredTitle")}</CardTitle>
                        <CardDescription>{t("errors.signInRequiredDescription")}</CardDescription>
                    </CardHeader>
                    <CardFooter>
                        <Button asChild>
                            <a href="/auth/login">{c("buttons.goToSignIn")}</a>
                        </Button>
                    </CardFooter>
                </Card>
            </div>
        );
    }

    return (
        <div className="container mx-auto max-w-[1600px] px-4 py-8 md:px-6 lg:px-8">
            {/* Sticky Header */}
            <div className="sticky top-0 z-10 mb-6 flex flex-wrap items-center justify-between gap-4 bg-background/95 pb-4 backdrop-blur supports-[backdrop-filter]:bg-background/60 lg:mb-8">
                <div className="space-y-1">
                    <h1 className="font-bold text-2xl tracking-tight md:text-3xl">{t("heading")}</h1>
                    <p className="text-muted-foreground text-sm md:text-base">{t("description")}</p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                    {activeTab === "profile" && (
                        <>
                            <Button className="hidden sm:flex" disabled={isSaving} onClick={handleAccountReset} size="default" type="button" variant="outline">
                                {c("buttons.reset")}
                            </Button>
                            <Button disabled={isSaving} onClick={handleAccountSubmit} size="default" type="button">
                                {isSaving ? c("buttons.saving") : c("buttons.save")}
                            </Button>
                        </>
                    )}
                    <Button onClick={() => signOut()} size="default" type="button" variant="outline">
                        <ArrowRightEndOnRectangleIcon className="mr-2 h-4 w-4" />
                        <span className="hidden sm:inline">{c("buttons.signOut")}</span>
                        <span className="sm:hidden">Sign Out</span>
                    </Button>
                </div>
            </div>

            {/* Navigation & Content */}
            <AccountNavigation
                activeTab={activeTab}
                avatarFallback={avatarData.avatarFallback}
                avatarUrl={avatarData.avatarUrl}
                onTabChange={handleTabChange}
                twoFactorEnabled={twoFactorEnabled}
                userEmail={(data?.user as { email?: string | null })?.email ?? null}
                userName={(data?.user as { name?: string | null })?.name ?? null}
            >
                <div className="space-y-6">
                    {activeTab === "profile" && (
                        <ProfileTab
                            avatarFallback={avatarData.avatarFallback}
                            avatarUrl={avatarData.avatarUrl}
                            clearFieldError={clearFieldError}
                            fieldErrors={fieldErrors}
                            form={form}
                            formMessage={formMessage}
                            onSubmit={handleAccountSubmit}
                        />
                    )}

                    {activeTab === "security" && (
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
                    )}

                    {activeTab === "apiKeys" && (
                        <ApiKeysTab
                            apiKeyCreating={apiKeyCreating}
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
                    )}

                    {activeTab === "sessions" && <SessionsTab />}

                    {activeTab === "billing" && <BillingTab />}

                    {activeTab === "notifications" && <NotificationsTab />}

                    {activeTab === "contentBlocking" && <ContentBlockingTab />}
                </div>
            </AccountNavigation>
        </div>
    );
}
