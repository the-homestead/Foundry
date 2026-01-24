"use client";

import { QRCode } from "@foundry/ui/components";
import { Badge } from "@foundry/ui/primitives/badge";
import { Button } from "@foundry/ui/primitives/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@foundry/ui/primitives/card";
import { Checkbox } from "@foundry/ui/primitives/checkbox";
import { Field, FieldDescription, FieldGroup, FieldLabel, FieldLegend, FieldSet } from "@foundry/ui/primitives/field";
import { Input } from "@foundry/ui/primitives/input";
import { Label } from "@foundry/ui/primitives/label";

import { FieldHint } from "./field-hint";
import type { StatusMessage } from "./types";

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

export function TwoFactorCard({
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
