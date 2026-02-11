"use client";
import LoginForm from "@foundry/ui/components/auth/login-form";
import { authClient, signInWithSSO } from "@foundry/web/lib/auth-client";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useEffect } from "react";

export default function LoginPage() {
    const router = useRouter();
    const t = useTranslations("AuthPage");
    const lastUsedMethod = authClient.getLastUsedLoginMethod();

    const handleSocial = async (provider: string) => {
        const ssoEnabled = process.env.NEXT_PUBLIC_SSO_ENABLED === "true";
        if (ssoEnabled && provider === "keycloak") {
            await signInWithSSO({ providerId: "keycloak" });
            return;
        }
        await authClient.signIn.social({ provider });
    };
    const handlePasskey = async () => {
        const result = await authClient.signIn.passkey({
            autoFill: false,
        });
        if (result?.error) {
            throw new Error(result.error.message ?? t("login.passkeyFailed"));
        }
        router.push("/");
    };

    useEffect(() => {
        if (!PublicKeyCredential?.isConditionalMediationAvailable) {
            return;
        }
        if (!PublicKeyCredential.isConditionalMediationAvailable()) {
            return;
        }
        authClient.signIn
            .passkey({
                autoFill: true,
                fetchOptions: {
                    onSuccess: () => {
                        router.push("/");
                    },
                },
            })
            .catch(() => undefined);
    }, [router]);

    return (
        <div className="p-6">
            <h1 className="mb-4 text-center font-semibold text-2xl">{t("login.title")}</h1>
            <LoginForm
                lastUsedMethod={lastUsedMethod}
                onPasskey={handlePasskey}
                onSocialClick={handleSocial}
                onSubmit={async (creds: { email: string; password: string }) => {
                    const { email, password } = creds;
                    const res = await authClient.signIn.email({ email, password });
                    if (res && typeof res === "object" && "error" in (res as Record<string, unknown>)) {
                        const err = (res as Record<string, unknown>).error;
                        throw new Error(String(err ?? t("login.signInFailed")));
                    }
                    router.push("/");
                }}
            />
        </div>
    );
}
