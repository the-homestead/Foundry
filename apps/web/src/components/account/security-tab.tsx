"use client";

import { Button } from "@foundry/ui/primitives/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@foundry/ui/primitives/card";
import { FieldDescription } from "@foundry/ui/primitives/field";

import { PasswordCard } from "./password-card";
import { TwoFactorCard } from "./two-factor-card";
import type { AccountForm, FieldErrorMap, StatusMessage } from "./types";

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

export function SecurityTab({
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
