"use client";
import AuthForm from "@foundry/ui/components/auth/auth-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@foundry/ui/primitives/card";
import { useRouter } from "@foundry/web/i18n/navigation";
import { useState } from "react";
import { useTranslations } from "next-intl";

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
        } catch (err: any) {
            setMessage({ type: "error", message: err?.message || "Failed to reset password" });
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
                    {message ? (
                        <p className={message.type === "error" ? "mt-4 text-sm text-destructive" : "mt-4 text-sm text-emerald-500"}>{message.message}</p>
                    ) : null}
                </CardContent>
            </Card>
        </div>
    );
}
