"use client";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

export default function AuthErrorPage() {
    const params = useSearchParams();
    const error = params.get("error") ?? "unknown_error";

    return (
        <div className="p-6">
            <h1 className="mb-4 font-semibold text-2xl">Authentication error</h1>
            <p className="mb-4">An error occurred during authentication:</p>
            <pre className="mb-4 rounded bg-muted p-2">{error}</pre>
            <p className="mb-4">You can try signing in again.</p>
            <div className="flex gap-2">
                <Link className="underline" href="/auth/login">
                    Back to sign in
                </Link>
            </div>
        </div>
    );
}
