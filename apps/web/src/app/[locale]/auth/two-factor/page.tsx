"use client";

import { Button } from "@foundry/ui/primitives/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@foundry/ui/primitives/card";
import { Checkbox } from "@foundry/ui/primitives/checkbox";
import { Field, FieldDescription, FieldGroup, FieldLabel } from "@foundry/ui/primitives/field";
import { Input } from "@foundry/ui/primitives/input";
import { Label } from "@foundry/ui/primitives/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@foundry/ui/primitives/tabs";
import { authClient } from "@foundry/web/lib/auth-client";
import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";

const TABS = ["authenticator", "otp", "backup"] as const;

type TwoFactorTab = (typeof TABS)[number];

export default function TwoFactorPage() {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState<TwoFactorTab>("authenticator");
    const [totpCode, setTotpCode] = useState("");
    const [otpCode, setOtpCode] = useState("");
    const [backupCode, setBackupCode] = useState("");
    const [trustDevice, setTrustDevice] = useState(true);
    const [message, setMessage] = useState<{ type: "success" | "error"; message: string } | null>(null);
    const [loading, setLoading] = useState(false);

    const handleVerifyTotp = useCallback(async () => {
        if (!totpCode.trim()) {
            setMessage({ type: "error", message: "Enter your authentication code." });
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
                setMessage({ type: "error", message: result.error.message ?? "Failed to verify code." });
                return;
            }
            setMessage({ type: "success", message: "Verified. Redirecting..." });
            router.push("/account?tab=security");
        } catch {
            setMessage({ type: "error", message: "Failed to verify code." });
        } finally {
            setLoading(false);
        }
    }, [router, totpCode, trustDevice]);

    const handleSendOtp = useCallback(async () => {
        setLoading(true);
        setMessage(null);
        try {
            const result = await authClient.twoFactor.sendOtp({});
            if (result?.error) {
                setMessage({ type: "error", message: result.error.message ?? "Failed to send one-time code." });
                return;
            }
            setMessage({ type: "success", message: "One-time code sent." });
        } catch {
            setMessage({ type: "error", message: "Failed to send one-time code." });
        } finally {
            setLoading(false);
        }
    }, []);

    const handleVerifyOtp = useCallback(async () => {
        if (!otpCode.trim()) {
            setMessage({ type: "error", message: "Enter the one-time code." });
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
                setMessage({ type: "error", message: result.error.message ?? "Failed to verify one-time code." });
                return;
            }
            setMessage({ type: "success", message: "Verified. Redirecting..." });
            router.push("/account?tab=security");
        } catch {
            setMessage({ type: "error", message: "Failed to verify one-time code." });
        } finally {
            setLoading(false);
        }
    }, [otpCode, router, trustDevice]);

    const handleVerifyBackup = useCallback(async () => {
        if (!backupCode.trim()) {
            setMessage({ type: "error", message: "Enter a backup code." });
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
                setMessage({ type: "error", message: result.error.message ?? "Failed to verify backup code." });
                return;
            }
            setMessage({ type: "success", message: "Verified. Redirecting..." });
            router.push("/account?tab=security");
        } catch {
            setMessage({ type: "error", message: "Failed to verify backup code." });
        } finally {
            setLoading(false);
        }
    }, [backupCode, router, trustDevice]);

    return (
        <div className="mx-auto flex w-full max-w-lg flex-col gap-6 p-8">
            <Card>
                <CardHeader>
                    <CardTitle>Two-factor verification</CardTitle>
                    <CardDescription>Enter your verification code to finish signing in.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <Tabs onValueChange={(value) => setActiveTab(value as TwoFactorTab)} value={activeTab}>
                        <TabsList className="grid w-full grid-cols-3">
                            <TabsTrigger type="button" value="authenticator">
                                Authenticator
                            </TabsTrigger>
                            <TabsTrigger type="button" value="otp">
                                One-time code
                            </TabsTrigger>
                            <TabsTrigger type="button" value="backup">
                                Backup code
                            </TabsTrigger>
                        </TabsList>

                        <TabsContent className="space-y-4" value="authenticator">
                            <FieldGroup>
                                <Field>
                                    <FieldLabel htmlFor="totpCode">Authentication code</FieldLabel>
                                    <Input id="totpCode" inputMode="numeric" onChange={(event) => setTotpCode(event.target.value)} placeholder="123456" value={totpCode} />
                                    <FieldDescription>Use the code from your authenticator app.</FieldDescription>
                                </Field>
                            </FieldGroup>
                        </TabsContent>

                        <TabsContent className="space-y-4" value="otp">
                            <FieldGroup>
                                <Field>
                                    <FieldLabel htmlFor="otpCode">One-time code</FieldLabel>
                                    <Input id="otpCode" inputMode="numeric" onChange={(event) => setOtpCode(event.target.value)} placeholder="123456" value={otpCode} />
                                    <FieldDescription>We will send a code to your email or phone.</FieldDescription>
                                </Field>
                            </FieldGroup>
                            <Button disabled={loading} onClick={handleSendOtp} type="button" variant="outline">
                                Send code
                            </Button>
                        </TabsContent>

                        <TabsContent className="space-y-4" value="backup">
                            <FieldGroup>
                                <Field>
                                    <FieldLabel htmlFor="backupCode">Backup code</FieldLabel>
                                    <Input id="backupCode" onChange={(event) => setBackupCode(event.target.value)} placeholder="ABCD-1234" value={backupCode} />
                                    <FieldDescription>Use one of your saved backup codes.</FieldDescription>
                                </Field>
                            </FieldGroup>
                        </TabsContent>
                    </Tabs>

                    <div className="flex items-center gap-2">
                        <Checkbox checked={trustDevice} id="trustDevice" onCheckedChange={(value) => setTrustDevice(Boolean(value))} />
                        <Label className="text-muted-foreground text-sm" htmlFor="trustDevice">
                            Trust this device for 30 days
                        </Label>
                    </div>

                    {message ? <FieldDescription className={message.type === "error" ? "text-destructive" : "text-emerald-500"}>{message.message}</FieldDescription> : null}
                </CardContent>
                <CardFooter className="flex flex-wrap gap-2">
                    {activeTab === "authenticator" ? (
                        <Button disabled={loading} onClick={handleVerifyTotp} type="button">
                            Verify code
                        </Button>
                    ) : null}
                    {activeTab === "otp" ? (
                        <Button disabled={loading} onClick={handleVerifyOtp} type="button">
                            Verify code
                        </Button>
                    ) : null}
                    {activeTab === "backup" ? (
                        <Button disabled={loading} onClick={handleVerifyBackup} type="button">
                            Verify backup code
                        </Button>
                    ) : null}
                </CardFooter>
            </Card>
        </div>
    );
}
