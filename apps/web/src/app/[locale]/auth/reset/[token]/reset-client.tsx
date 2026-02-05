"use client";
import AuthForm from "@foundry/ui/components/auth/auth-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@foundry/ui/primitives/card";
import { useRouter } from "@foundry/web/i18n/navigation";
import { useTranslations } from "next-intl";
import { useState } from "react";

export default function ResetClient({ token }: { token: string }) {
    const router = useRouter();
    const t = useTranslations("AuthPage");
    const [message, setMessage] = useState<{ type: "success" | "error"; message: string } | null>(null);

    const handleSubmit = async (data: Record<string, string>) => {
        const { password } = data;
        setMessage(null);
        try {
            const res = await fetch("/api/auth/reset", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ token, password }),
            });
            if (!res.ok) {
                const text = await res.text();
                throw new Error(text || "Failed to reset password");
            }
            setMessage({ type: "success", message: t("reset.successRedirecting") });
            router.push("/auth/login");
        } catch (err: unknown) {
            const messageText = err instanceof Error ? err.message : String(err) || "Failed to reset password";
            setMessage({ type: "error", message: messageText });
        }
    };

    return (
        <div className="mx-auto flex w-full max-w-lg flex-col gap-6 p-8">
            <Card>
                <CardHeader>
                    <CardTitle>{t("reset.title")}</CardTitle>
                    <CardDescription>{t("reset.description")}</CardDescription>
                </CardHeader>
                <CardContent>
                    <AuthForm mode="reset" onSubmit={handleSubmit} />
                    {message ? <p className={message.type === "error" ? "mt-4 text-destructive text-sm" : "mt-4 text-emerald-500 text-sm"}>{message.message}</p> : null}
                </CardContent>
            </Card>
        </div>
    );
}
