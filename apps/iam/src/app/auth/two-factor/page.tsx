"use client";

import { useRouter } from "@foundry/iam/i18n/navigation";
import { authClient } from "@foundry/iam/lib/auth-client";
import { Button } from "@foundry/ui/primitives/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@foundry/ui/primitives/card";
import { Checkbox } from "@foundry/ui/primitives/checkbox";
import { Field, FieldDescription, FieldGroup, FieldLabel } from "@foundry/ui/primitives/field";
import { Input } from "@foundry/ui/primitives/input";
import { Label } from "@foundry/ui/primitives/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@foundry/ui/primitives/tabs";
import { useTranslations } from "next-intl";
import { useCallback, useState } from "react";

const TABS = ["authenticator", "otp", "backup"] as const;

type TwoFactorTab = (typeof TABS)[number];

export default function TwoFactorPage() {
    const router = useRouter();
    const t = useTranslations("AuthPage");
    const [activeTab, setActiveTab] = useState<TwoFactorTab>("authenticator");
    const [totpCode, setTotpCode] = useState("");
    const [otpCode, setOtpCode] = useState("");
    const [backupCode, setBackupCode] = useState("");
    const [trustDevice, setTrustDevice] = useState(true);
    const [message, setMessage] = useState<{ type: "success" | "error"; message: string } | null>(null);
    const [loading, setLoading] = useState(false);

    const handleVerifyTotp = useCallback(async () => {
        if (!totpCode.trim()) {
            setMessage({ type: "error", message: t("twoFactor.errors.enterAuthCode") });
            return;
        }
        setLoading(true);
        setMessage(null);
        try {
            const result = await authClient.twoFactor.verifyTotp({
                code: totpCode.trim(),
                trustDevice,
            });
            if (result?.error) {
                setMessage({ type: "error", message: result.error.message ?? t("twoFactor.errors.verifyFailed") });
                return;
            }
            setMessage({ type: "success", message: t("twoFactor.errors.verifiedRedirecting") });
            router.push("/account?tab=security");
        } catch {
            setMessage({ type: "error", message: t("twoFactor.errors.verifyFailed") });
        } finally {
            setLoading(false);
        }
    }, [router, totpCode, trustDevice, t]);

    const handleSendOtp = useCallback(async () => {
        setLoading(true);
        setMessage(null);
        try {
            const result = await authClient.twoFactor.sendOtp({});
            if (result?.error) {
                setMessage({ type: "error", message: result.error.message ?? t("twoFactor.errors.sendOtpFailed") });
                return;
            }
            setMessage({ type: "success", message: t("twoFactor.errors.oneTimeSent") });
        } catch {
            setMessage({ type: "error", message: t("twoFactor.errors.sendOtpFailed") });
        } finally {
            setLoading(false);
        }
    }, [t]);

    const handleVerifyOtp = useCallback(async () => {
        if (!otpCode.trim()) {
            setMessage({ type: "error", message: t("twoFactor.errors.enterOtpCode") });
            return;
        }
        setLoading(true);
        setMessage(null);
        try {
            const result = await authClient.twoFactor.verifyOtp({
                code: otpCode.trim(),
                trustDevice,
            });
            if (result?.error) {
                setMessage({ type: "error", message: result.error.message ?? t("twoFactor.errors.verifyFailed") });
                return;
            }
            setMessage({ type: "success", message: t("twoFactor.errors.verifiedRedirecting") });
            setMessage({ type: "success", message: t("twoFactor.errors.verifiedRedirecting") });
            router.push("/account?tab=security");
        } catch {
            setMessage({ type: "error", message: t("twoFactor.errors.verifyFailed") });
        } finally {
            setLoading(false);
        }
    }, [otpCode, router, trustDevice, t]);

    const handleVerifyBackup = useCallback(async () => {
        if (!backupCode.trim()) {
            setMessage({ type: "error", message: t("twoFactor.errors.enterBackupCode") });
            return;
        }
        setLoading(true);
        setMessage(null);
        try {
            const result = await authClient.twoFactor.verifyBackupCode({
                code: backupCode.trim(),
                trustDevice,
            });
            if (result?.error) {
                setMessage({ type: "error", message: result.error.message ?? t("twoFactor.errors.verifyBackupFailed") });
                return;
            }
            setMessage({ type: "success", message: t("twoFactor.errors.verifiedRedirecting") });
            router.push("/account?tab=security");
        } catch {
            setMessage({ type: "error", message: t("twoFactor.errors.verifyBackupFailed") });
        } finally {
            setLoading(false);
        }
    }, [backupCode, router, trustDevice, t]);

    return (
        <div className="mx-auto flex w-full max-w-lg flex-col gap-6 p-8">
            <Card>
                <CardHeader>
                    <CardTitle>{t("twoFactor.title")}</CardTitle>
                    <CardDescription>{t("twoFactor.description")}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <Tabs onValueChange={(value) => setActiveTab(value as TwoFactorTab)} value={activeTab}>
                        <TabsList className="grid w-full grid-cols-3">
                            <TabsTrigger type="button" value="authenticator">
                                {t("twoFactor.tabs.authenticator")}
                            </TabsTrigger>
                            <TabsTrigger type="button" value="otp">
                                {t("twoFactor.tabs.otp")}
                            </TabsTrigger>
                            <TabsTrigger type="button" value="backup">
                                {t("twoFactor.tabs.backup")}
                            </TabsTrigger>
                        </TabsList>

                        <TabsContent className="space-y-4" value="authenticator">
                            <FieldGroup>
                                <Field>
                                    <FieldLabel htmlFor="totpCode">{t("twoFactor.placeholders.totpCode")}</FieldLabel>
                                    <Input
                                        id="totpCode"
                                        inputMode="numeric"
                                        onChange={(event) => setTotpCode(event.target.value)}
                                        placeholder={t("twoFactor.placeholders.totpCode")}
                                        value={totpCode}
                                    />
                                    <FieldDescription>{t("twoFactor.description")}</FieldDescription>
                                </Field>
                            </FieldGroup>
                        </TabsContent>

                        <TabsContent className="space-y-4" value="otp">
                            <FieldGroup>
                                <Field>
                                    <FieldLabel htmlFor="otpCode">{t("twoFactor.placeholders.otpCode")}</FieldLabel>
                                    <Input
                                        id="otpCode"
                                        inputMode="numeric"
                                        onChange={(event) => setOtpCode(event.target.value)}
                                        placeholder={t("twoFactor.placeholders.otpCode")}
                                        value={otpCode}
                                    />
                                    <FieldDescription>{t("twoFactor.description")}</FieldDescription>
                                </Field>
                            </FieldGroup>
                            <Button disabled={loading} onClick={handleSendOtp} type="button" variant="outline">
                                {t("twoFactor.buttons.sendCode")}
                            </Button>
                        </TabsContent>

                        <TabsContent className="space-y-4" value="backup">
                            <FieldGroup>
                                <Field>
                                    <FieldLabel htmlFor="backupCode">{t("twoFactor.placeholders.backupCode")}</FieldLabel>
                                    <Input
                                        id="backupCode"
                                        onChange={(event) => setBackupCode(event.target.value)}
                                        placeholder={t("twoFactor.placeholders.backupCode")}
                                        value={backupCode}
                                    />
                                    <FieldDescription>{t("twoFactor.description")}</FieldDescription>
                                </Field>
                            </FieldGroup>
                        </TabsContent>
                    </Tabs>

                    <div className="flex items-center gap-2">
                        <Checkbox checked={trustDevice} id="trustDevice" onCheckedChange={(value) => setTrustDevice(Boolean(value))} />
                        <Label className="text-muted-foreground text-sm" htmlFor="trustDevice">
                            {t("twoFactor.trustDevice")}
                        </Label>
                    </div>

                    {message ? <FieldDescription className={message.type === "error" ? "text-destructive" : "text-emerald-500"}>{message.message}</FieldDescription> : null}
                </CardContent>
                <CardFooter className="flex flex-wrap gap-2">
                    {activeTab === "authenticator" ? (
                        <Button disabled={loading} onClick={handleVerifyTotp} type="button">
                            {t("twoFactor.buttons.verifyCode")}
                        </Button>
                    ) : null}
                    {activeTab === "otp" ? (
                        <Button disabled={loading} onClick={handleVerifyOtp} type="button">
                            {t("twoFactor.buttons.verifyCode")}
                        </Button>
                    ) : null}
                    {activeTab === "backup" ? (
                        <Button disabled={loading} onClick={handleVerifyBackup} type="button">
                            {t("twoFactor.buttons.verifyBackup")}
                        </Button>
                    ) : null}
                </CardFooter>
            </Card>
        </div>
    );
}
