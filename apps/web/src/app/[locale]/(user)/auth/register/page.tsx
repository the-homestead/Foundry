"use client";
import RegisterForm from "@foundry/ui/components/auth/register-form";
import { authClient } from "@foundry/web/lib/auth-client";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";

export default function RegisterPage() {
    const router = useRouter();
    const t = useTranslations("AuthPage");
    const lastUsedMethod = authClient.getLastUsedLoginMethod();

    const handleSocial = async (provider: string) => {
        await authClient.signIn.social({ provider });
    };

    return (
        <div className="p-6">
            <h1 className="mb-4 font-semibold text-2xl">{t("register.title")}</h1>
            <RegisterForm
                lastUsedMethod={lastUsedMethod}
                onSocialClick={handleSocial}
                onSubmit={async ({
                    age,
                    email,
                    firstName,
                    lastName,
                    password,
                    username,
                }: {
                    age?: string;
                    email: string;
                    firstName?: string;
                    lastName?: string;
                    password: string;
                    username: string;
                }) => {
                    const normalizedFirstName = firstName?.trim() ?? "";
                    const normalizedLastName = lastName?.trim() ?? "";
                    const normalizedAge = age ? Number(age) : 0;
                    const res = await authClient.signUp.email({
                        email,
                        password,
                        name: username,
                        firstName: normalizedFirstName,
                        lastName: normalizedLastName,
                        age: normalizedAge,
                        lastLoginMethod: "email",
                        roles: [],
                    });
                    if (res && typeof res === "object" && "error" in (res as Record<string, unknown>)) {
                        const err = (res as Record<string, unknown>).error;
                        throw new Error(String(err ?? t("register.failed")));
                    }
                    router.push("/");
                }}
            />
        </div>
    );
}
