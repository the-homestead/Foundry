"use client";
import { resetPasswordWithToken } from "@foundry/iam/actions/passwords";

// The generated client wrapper for the server action can have stricter
// typings in the app-runtime. Narrow to a predictable call signature here
// so we can pass a runtime-guarded token without TypeScript noise.
const resetPasswordWithTokenClient = resetPasswordWithToken as unknown as (args: { token?: string; newPassword: string }) => Promise<unknown>;

import { useRouter } from "@foundry/iam/i18n/navigation";
import AuthForm from "@foundry/ui/components/auth/auth-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@foundry/ui/primitives/card";
import { useTranslations } from "next-intl";
import { useState } from "react";

export default function ResetClient({ token }: { token?: string }) {
    const router = useRouter();
    const t = useTranslations("AuthPage");
    const [message, setMessage] = useState<{ type: "success" | "error"; message: string } | null>(null);

    const handleSubmit = async (data: Record<string, string>) => {
        const { password } = data;
        setMessage(null);

        // password comes from a generic Record<string,string> so narrow it here
        if (!password) {
            setMessage({ type: "error", message: t("reset.failed") });
            return;
        }
        try {
            // copy prop into a local variable so TypeScript can reliably narrow its type
            const tokenValue = token;
            // ensure token is present (should always be true for this route)
            if (!tokenValue) {
                throw new Error(t("reset.failed"));
            }

            // Call server action (authoritative) which delegates to auth.api.resetPassword
            type ResetResult = { error?: { message?: string } } | undefined;
            // tokenValue is runtime-guarded above so narrow it to `string` explicitly
            const tokenValueStr: string = tokenValue;
            const passwordStr: string = password;
            const result = (await resetPasswordWithTokenClient({ token: tokenValueStr, newPassword: passwordStr })) as ResetResult;
            if (result?.error) {
                throw new Error(result.error.message ?? t("reset.failed"));
            }

            setMessage({ type: "success", message: t("reset.successRedirecting") });
            router.push("/auth/login");
        } catch (err: unknown) {
            const messageText = err instanceof Error ? err.message : String(err) || t("reset.failed");
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
