"use client";
import AuthForm from "@foundry/ui/components/auth/auth-form";
import { useRouter } from "next/navigation";

export default function ForgotPage() {
    const router = useRouter();

    const handleSubmit = async (data: Record<string, string>) => {
        const { email } = data;
        try {
            const res = await fetch("/api/auth/forgot", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email }),
            });
            if (!res.ok) {
                throw new Error("Failed to send reset link");
            }
            router.push("/auth/login");
            // biome-ignore lint/suspicious/noExplicitAny: Error
        } catch (err: any) {
            throw new Error(err?.message || "Failed to send reset link");
        }
    };

    return (
        <div className="p-6">
            <h1 className="mb-4 font-semibold text-2xl">Reset password</h1>
            <p className="mb-4 text-sm">Enter your email and we will send a password reset link.</p>
            <AuthForm mode="forgot" onSubmit={handleSubmit} />
        </div>
    );
}
