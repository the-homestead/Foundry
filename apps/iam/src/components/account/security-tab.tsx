"use client";

import type { LinkedAccount } from "@foundry/database";
import { getLinkedAccounts } from "@foundry/iam/actions/accounts";
import { deletePasskey, getUserPasskeys } from "@foundry/iam/actions/passkeys";
import { authClient, useSession } from "@foundry/iam/lib/auth-client";
import { FingerPrintIcon } from "@foundry/ui/components/icons/finger-print";
import { KeyIcon } from "@foundry/ui/components/icons/key";
import { ShieldCheckIcon } from "@foundry/ui/components/icons/shield-check";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@foundry/ui/primitives/card";
import { useTranslations } from "next-intl";
import { useCallback, useEffect, useMemo, useState } from "react";
import LinkedAccountsList from "./linked-accounts-list";
import PasskeysList, { type Passkey } from "./passkeys-list";
import { PasswordCard } from "./password-card";
import { TwoFactorCard } from "./two-factor-card";
import type { AccountForm, FieldErrorMap, StatusMessage } from "./types/types";

interface SecurityTabProps {
    /** true when the current user already has an email/password credential */
    hasPassword?: boolean;
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
    // initial server-provided values to avoid client-side server-action
    // reads during hydration.
    initialPasskeys?: Passkey[];
    initialLinkedAccounts?: LinkedAccount[];
}

export function SecurityTab({
    hasPassword = false,
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
    initialPasskeys,
    initialLinkedAccounts,
}: SecurityTabProps) {
    const t = useTranslations("AccountPage");
    const c = useTranslations("common");
    const { data: sessionData, refetch: refetchSession } = useSession();

    const [linkedAccounts, setLinkedAccounts] = useState<LinkedAccount[]>(initialLinkedAccounts ?? []);
    const [passkeys, setPasskeys] = useState<Passkey[]>(initialPasskeys ?? []);
    const [loadingPasskeys, setLoadingPasskeys] = useState(false);
    const [loadingAccounts, setLoadingAccounts] = useState(false);
    const [actionMessage, setActionMessage] = useState<StatusMessage | null>(null);

    const userAccountsFromSession = useMemo<LinkedAccount[]>(() => (sessionData?.user as unknown as { accounts?: LinkedAccount[] })?.accounts ?? [], [sessionData?.user]);

    const loadPasskeys = useCallback(async () => {
        setLoadingPasskeys(true);
        try {
            const pk = (await getUserPasskeys()) ?? [];
            setPasskeys(Array.isArray(pk) ? pk : []);
        } catch (err) {
            console.error("loadPasskeys failed:", err);
            setPasskeys([]);
        } finally {
            setLoadingPasskeys(false);
        }
    }, []);

    const loadAccounts = useCallback(async () => {
        setLoadingAccounts(true);
        try {
            // Prefer server action for authoritative account list (avoids extra client/server roundtrips)
            const accts = (await getLinkedAccounts()) ?? [];
            setLinkedAccounts(Array.isArray(accts) ? accts : []);
        } catch (err) {
            console.error("loadAccounts failed:", err);
            setLinkedAccounts([]);
        } finally {
            setLoadingAccounts(false);
        }
    }, []);

    useEffect(() => {
        // If no server-provided data was given, fetch authoritative lists.
        if (passkeys.length === 0) {
            loadPasskeys();
        }

        if (linkedAccounts.length === 0) {
            loadAccounts();
        }
    }, [loadPasskeys, loadAccounts, passkeys.length, linkedAccounts.length]);

    const addPasskey = useCallback(async () => {
        setActionMessage(null);
        try {
            const result = (await authClient.passkey.addPasskey?.({})) as { error?: { message?: string } } | undefined;
            if (result?.error) {
                setActionMessage({ type: "error", message: result.error.message ?? "Failed to add passkey." });
                return;
            }
            setActionMessage({ type: "success", message: "Passkey added." });
            await loadPasskeys();
            await refetchSession?.();
        } catch (err) {
            console.error("addPasskey failed:", err);
            const message = err instanceof Error ? err.message : String(err);
            setActionMessage({ type: "error", message: message ?? "Failed to add passkey." });
        }
    }, [loadPasskeys, refetchSession]);

    const removePasskey = useCallback(
        async (id: string) => {
            setActionMessage(null);
            try {
                const res = await deletePasskey(id);
                if (!res?.success) {
                    setActionMessage({ type: "error", message: "Failed to remove passkey." });
                    return;
                }
                setActionMessage({ type: "success", message: "Passkey removed." });
                await loadPasskeys();
                await refetchSession?.();
            } catch (err) {
                console.error("removePasskey failed:", err);
                const message = err instanceof Error ? err.message : String(err);
                setActionMessage({ type: "error", message: message ?? "Failed to remove passkey." });
            }
        },
        [loadPasskeys, refetchSession]
    );

    const unlinkAccount = useCallback(
        async (providerId: string, accountId?: string) => {
            setActionMessage(null);
            try {
                const result = (await authClient.unlinkAccount?.({ providerId, accountId })) as { error?: { message?: string } } | undefined;
                if (result?.error) {
                    setActionMessage({ type: "error", message: result.error.message ?? "Failed to unlink account." });
                    return;
                }
                setActionMessage({ type: "success", message: "Account unlinked." });
                await loadAccounts();
                await refetchSession?.();
            } catch (err) {
                console.error("unlinkAccount failed:", err);
                const message = err instanceof Error ? err.message : String(err);
                setActionMessage({ type: "error", message: message ?? "Failed to unlink account." });
            }
        },
        [loadAccounts, refetchSession]
    );

    const securityScore = useMemo(() => {
        let score = 0;
        if (twoFactorEnabled) {
            score += 40;
        }
        if (userAccountsFromSession.some((a) => a.providerId === "credential")) {
            score += 20;
        }
        if (passkeys.length) {
            score += 30;
        }
        return Math.min(100, score);
    }, [twoFactorEnabled, userAccountsFromSession, passkeys]);

    return (
        <div className="flex flex-col gap-6">
            <Card>
                <CardHeader className="flex items-center justify-between">
                    <div>
                        <CardTitle>{t("security.overview.title")}</CardTitle>
                        <CardDescription>{t("security.overview.description")}</CardDescription>
                    </div>
                    <div className="text-right">
                        <div className="font-medium text-sm">{t("security.overview.score", { score: securityScore })}</div>
                        <div className="mt-2 h-2 w-48 overflow-hidden rounded bg-muted">
                            <div className="h-full bg-emerald-500" style={{ width: `${securityScore}%` }} />
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="grid gap-4 md:grid-cols-3">
                    <div className="space-y-2">
                        <div className="flex items-center gap-2">
                            <ShieldCheckIcon className="h-5 w-5 text-emerald-500" />
                            <div>
                                <div className="font-medium text-sm">{t("security.twoFactor.shortTitle")}</div>
                                <div className="text-muted-foreground text-xs">{twoFactorEnabled ? c("fields.enabled") : c("fields.notEnabled")}</div>
                            </div>
                        </div>
                    </div>
                    <div className="space-y-2">
                        <div className="flex items-center gap-2">
                            <FingerPrintIcon className="h-5 w-5 text-amber-500" />
                            <div>
                                <div className="font-medium text-sm">{t("security.signInMethods.passkeys")}</div>
                                <div className="text-muted-foreground text-xs">
                                    {loadingPasskeys ? t("loading") : `${passkeys.length} ${t("security.signInMethods.registered")}`}
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="space-y-2">
                        <div className="flex items-center gap-2">
                            <KeyIcon className="h-5 w-5 text-sky-500" />
                            <div>
                                <div className="font-medium text-sm">{t("security.password.title")}</div>
                                <div className="text-muted-foreground text-xs">{hasPassword ? t("security.password.set") : t("security.password.notSet")}</div>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <div className="grid gap-6 md:grid-cols-2">
                <div>
                    <PasswordCard
                        clearFieldError={clearFieldError}
                        fieldErrors={fieldErrors}
                        form={form}
                        formMessage={formMessage}
                        hasPassword={hasPassword}
                        isSaving={isSaving}
                        onReset={onReset}
                        onSendPasswordSetup={onSendPasswordSetup}
                        onSubmit={onSubmit}
                        passwordSetupLoading={passwordSetupLoading}
                        passwordSetupMessage={passwordSetupMessage}
                    />

                    <Card className="mt-6">
                        <CardHeader>
                            <CardTitle>{t("security.passkeys.title")}</CardTitle>
                            <CardDescription>{t("security.passkeys.description")}</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <PasskeysList
                                actionMessage={actionMessage}
                                loading={loadingPasskeys}
                                onAdd={addPasskey}
                                onRefresh={loadPasskeys}
                                onRemove={removePasskey}
                                passkeys={passkeys}
                            />
                        </CardContent>
                    </Card>

                    {/* Password setup is now handled inside PasswordCard */}
                </div>

                <div>
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

                    <Card className="mt-6">
                        <CardHeader>
                            <CardTitle>{t("security.linkedAccounts.title")}</CardTitle>
                            <CardDescription>{t("security.linkedAccounts.description")}</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <LinkedAccountsList linkedAccounts={linkedAccounts} loading={loadingAccounts} onUnlink={unlinkAccount} sessionAccounts={userAccountsFromSession} />
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
