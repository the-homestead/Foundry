"use client";
import { getPathname, useRouter } from "@foundry/iam/i18n/navigation";
import { authClient } from "@foundry/iam/lib/auth-client";
import AuthForm from "@foundry/ui/components/auth/auth-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@foundry/ui/primitives/card";
import { useLocale, useTranslations } from "next-intl";
import { useState } from "react";

export default function ForgotPage() {
    const router = useRouter();
    const t = useTranslations("AuthPage");
    const locale = useLocale();
    const [message, setMessage] = useState<{ type: "success" | "error"; message: string } | null>(null);

    const handleSubmit = async (data: Record<string, string>) => {
        const { email } = data;
        if (!email) {
            setMessage({ type: "error", message: t("forgot.emailRequired") });
            return;
        }
        setMessage(null);
        try {
            const pathname = getPathname({ href: "/auth/reset", locale });
            const safePathname = pathname.replace(/\/undefined(?=\/|$)/g, `/${locale ?? "en"}`);
            const redirectTo = `${window.location.origin}${safePathname}`;

            const { error } = await authClient.requestPasswordReset({
                email,
                redirectTo,
            });

            if (error) {
                setMessage({ type: "error", message: error.message || t("forgot.sendFailed") });
                return;
            }
            setMessage({ type: "success", message: t("forgot.sendSuccess") });
            router.push("/auth/login");
        } catch (err: unknown) {
            let errMessage: string;
            if (err instanceof Error) {
                errMessage = err.message;
            } else if (typeof err === "string") {
                errMessage = err;
            } else {
                errMessage = t("forgot.sendFailed");
            }
            setMessage({ type: "error", message: errMessage });
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
                    {message ? <p className={message.type === "error" ? "mt-4 text-destructive text-sm" : "mt-4 text-emerald-500 text-sm"}>{message.message}</p> : null}
                </CardContent>
            </Card>
        </div>
    );
}
