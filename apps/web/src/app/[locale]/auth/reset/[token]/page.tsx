// Server component wrapper to pass token into client form
import AuthForm from "@foundry/ui/components/auth/auth-form";

export default function ResetPage({ params }: { params: { token: string } }) {
    return <ResetClient token={params.token} />;
}

function ResetClient({ token }: { token: string }) {
    "use client";
    const handleSubmit = async (data: Record<string, string>) => {
        const { password } = data;
        const res = await fetch("/api/auth/reset", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ token, password }),
        });
        if (!res.ok) {
            throw new Error("Failed to reset password");
        }
        // on success, redirect to login — client router not imported to keep this tiny
        window.location.href = "/auth/login";
    };

    return (
        <div className="p-6">
            <h1 className="mb-4 font-semibold text-2xl">Set a new password</h1>
            <AuthForm mode="reset" onSubmit={handleSubmit} />
        </div>
    );
}
