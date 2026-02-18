"use client";
import { authClient } from "@foundry/iam/lib/auth-client";
import RegisterForm from "@foundry/ui/components/auth/register-form";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { toast } from "sonner";

export default function RegisterPage() {
    const router = useRouter();
    const t = useTranslations("AuthPage");
    const lastUsedMethod = authClient.getLastUsedLoginMethod();

    const handleSocial = async (provider: string) => {
        await authClient.signIn.social({ provider });
    };

    // Extracted handler to reduce inline complexity in JSX
    const handleSubmit = async ({
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
        try {
            const normalizedFirstName = firstName?.trim() ?? "";
            const normalizedLastName = lastName?.trim() ?? "";
            const normalizedAge = age ? Number(age) : 0;

            const res = await authClient.signUp.email({
                email,
                password,
                name: username,
            });

            if (res && typeof res === "object" && "error" in (res as Record<string, unknown>)) {
                const err = (res as Record<string, unknown>).error;
                let message = t("register.failed");
                if (typeof err === "string") {
                    message = err;
                } else if (err && typeof (err as { message?: unknown }).message === "string") {
                    message = (err as { message?: string }).message as string;
                }
                toast.error(message);
                return;
            }

            // Update additional fields after signup if provided
            await applyAdditionalProfileFields(normalizedFirstName, normalizedLastName, normalizedAge);

            router.push("/");
        } catch (err: unknown) {
            const message = (err as Error)?.message ?? t("register.failed");
            toast.error(message);
        }
    };

    async function applyAdditionalProfileFields(first: string, last: string, ageNum: number) {
        const hasAny = Boolean(first || last || ageNum);
        if (!hasAny) {
            return;
        }

        const updateData: Record<string, unknown> = {};
        if (first) {
            updateData.firstName = first;
        }
        if (last) {
            updateData.lastName = last;
        }
        if (ageNum) {
            updateData.age = ageNum;
        }

        // biome-ignore lint/suspicious/noExplicitAny: Additional fields not in base type
        await authClient.updateUser(updateData as any);
    }

    return (
        <div className="p-6">
            <h1 className="mb-4 text-center font-semibold text-2xl">{t("register.title")}</h1>
            <RegisterForm lastUsedMethod={lastUsedMethod} onSocialClick={handleSocial} onSubmit={handleSubmit} />
        </div>
    );
}
