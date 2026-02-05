"use client";
import { Input } from "@foundry/ui/primitives/input";
import { InputGroup, InputGroupAddon, InputGroupInput, InputGroupText } from "@foundry/ui/primitives/input-group";
import { Label } from "@foundry/ui/primitives/label";
import type React from "react";
import { useState } from "react";
import { AtSymbolIcon } from "../icons/at-symbol";
import { LockClosedIcon } from "../icons/lock-closed";

type Mode = "login" | "register" | "forgot" | "reset";

export default function AuthForm({ mode = "login", onSubmit }: { mode?: Mode; onSubmit: (data: Record<string, string>) => Promise<void> | void }) {
    const [email, setEmail] = useState("");
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [confirm, setConfirm] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const submit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        if ((mode === "register" || mode === "reset") && password !== confirm) {
            setError("Passwords do not match");
            return;
        }
        setLoading(true);
        try {
            await onSubmit({ username, email, password, confirm });
            // biome-ignore lint/suspicious/noExplicitAny: Error
        } catch (err: any) {
            setError(err?.message || String(err));
        } finally {
            setLoading(false);
        }
    };

    const getButtonLabel = () => {
        if (loading) {
            return "Please wait…";
        }
        switch (mode) {
            case "login":
                return "Sign in";
            case "register":
                return "Create account";
            case "forgot":
                return "Send reset link";
            case "reset":
                return "Reset password";
            default:
                return "Submit";
        }
    };

    return (
        <form className="w-full max-w-md space-y-4" onSubmit={submit}>
            {mode === "register" && (
                <div>
                    <Label className="mb-1 block font-medium text-sm">Username</Label>
                    <Input className="normal-case" onChange={(e) => setUsername(e.target.value)} placeholder="Username" required value={username} />
                </div>
            )}

            {(mode === "login" || mode === "register" || mode === "forgot" || mode === "reset") && (
                <div>
                    <Label className="mb-1 block font-medium text-sm">Email</Label>
                    <InputGroup className="w-full">
                        <InputGroupAddon align="inline-start">
                            <InputGroupText>
                                <AtSymbolIcon />
                            </InputGroupText>
                        </InputGroupAddon>
                        <InputGroupInput className="normal-case" onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" required type="email" value={email} />
                    </InputGroup>
                </div>
            )}

            {(mode === "login" || mode === "register" || mode === "reset") && (
                <div>
                    <Label className="mb-1 block font-medium text-sm">Password</Label>
                    <InputGroup className="w-full">
                        <InputGroupAddon align="inline-start">
                            <InputGroupText>
                                <LockClosedIcon />
                            </InputGroupText>
                        </InputGroupAddon>
                        <InputGroupInput className="normal-case" onChange={(e) => setPassword(e.target.value)} placeholder="Password" required type="password" value={password} />
                    </InputGroup>
                </div>
            )}

            {(mode === "register" || mode === "reset") && (
                <div>
                    <Label className="mb-1 block font-medium text-sm">Confirm Password</Label>
                    <Input className="normal-case" onChange={(e) => setConfirm(e.target.value)} placeholder="Confirm password" required type="password" value={confirm} />
                </div>
            )}

            {error && <div className="text-red-600 text-sm">{error}</div>}

            <div>
                <button className="btn" disabled={loading} type="submit">
                    {getButtonLabel()}
                </button>
            </div>
        </form>
    );
}
