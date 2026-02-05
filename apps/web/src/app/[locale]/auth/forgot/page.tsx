"use client";
import AuthForm from "@foundry/ui/components/auth/auth-form";
import { authClient } from "@foundry/web/lib/auth-client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@foundry/ui/primitives/card";
import { useRouter } from "@foundry/web/i18n/navigation";
import { useState } from "react";
import { useTranslations } from "next-intl";

export default function ForgotPage() {
    const router = useRouter();
    const t = useTranslations("AuthPage");
    const [message, setMessage] = useState<{ type: "success" | "error"; message: string } | null>(null);

    const handleSubmit = async (data: Record<string, string>) => {
        const { email } = data;
        if (!email) {
            setMessage({ type: "error", message: t("forgot.emailRequired") });
            return;
        }
        setMessage(null);
        try {
            const { error } = await authClient.requestPasswordReset({
                email,
                redirectTo: `${window.location.origin}/auth/reset`,
            });

            if (error) {
                setMessage({ type: "error", message: error.message || t("forgot.sendFailed") });
                return;
            }
            setMessage({ type: "success", message: t("forgot.sendSuccess") });
            router.push("/auth/login");
        } catch (err: any) {
            setMessage({ type: "error", message: err?.message || t("forgot.sendFailed") });
        }
    };

    return (
        <div className="mx-auto flex w-full max-w-lg flex-col gap-6 p-8">
            <Card>
                <CardHeader>
                    <CardTitle>{t("forgot.title")}</CardTitle>
                    <CardDescription>{t("forgot.description")}</CardDescription>
                </CardHeader>
                <CardContent>
                    <AuthForm mode="forgot" onSubmit={handleSubmit} />
                    {message ? (
                        <p className={message.type === "error" ? "mt-4 text-sm text-destructive" : "mt-4 text-sm text-emerald-500"}>{message.message}</p>
                    ) : null}
                </CardContent>
            </Card>
        </div>
    );
}
