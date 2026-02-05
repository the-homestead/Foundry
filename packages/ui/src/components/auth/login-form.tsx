"use client";
import { AtSymbolIcon, LockClosedIcon } from "@foundry/ui/icons";
import { cn } from "@foundry/ui/lib/utils";
import { Badge } from "@foundry/ui/primitives/badge";
import { Button } from "@foundry/ui/primitives/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@foundry/ui/primitives/card";
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel, FieldSeparator } from "@foundry/ui/primitives/field";
import { InputGroup, InputGroupAddon, InputGroupInput, InputGroupText } from "@foundry/ui/primitives/input-group";
import { useForm } from "@tanstack/react-form";
import type React from "react";
import { useState } from "react";
// biome-ignore lint/performance/noNamespaceImport: <Def>
import * as z from "zod";
import SocialAuthButtons from "./social-auth-button";

const loginSchema = z.object({
    email: z.string().email("Enter a valid email"),
    password: z.string().min(1, "Enter your password"),
});

export default function LoginForm({
    className,
    lastUsedMethod,
    onPasskey,
    onSubmit,
    onSocialClick,
}: React.PropsWithChildren<{
    className?: string;
    lastUsedMethod?: string | null;
    onPasskey?: () => void;
    onSubmit?: (data: { email: string; password: string }) => Promise<void> | void;
    onSocialClick?: (provider: string) => void;
}>) {
    const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});

    const form = useForm({
        defaultValues: { email: "", password: "" },
        onSubmit: async ({ value }) => {
            const parsed = loginSchema.safeParse(value as unknown);
            if (!parsed.success) {
                const map: Record<string, string[]> = {};
                for (const issue of parsed.error.issues) {
                    const key = issue.path.length ? issue.path.join(".") : "form";
                    map[key] = map[key] ?? [];
                    map[key].push(issue.message);
                }
                setFieldErrors(map);
                return;
            }
            setFieldErrors({});
            await onSubmit?.({ email: String(parsed.data.email).trim(), password: String(parsed.data.password) });
        },
    });

    return (
        <div className={cn("mx-auto flex w-full max-w-md flex-col gap-6", className)}>
            <Card>
                <CardHeader>
                    <CardTitle>Login to your account</CardTitle>
                    <CardDescription>Enter your email and password to sign in.</CardDescription>
                </CardHeader>
                <CardContent>
                    <form
                        onSubmit={(e) => {
                            e.preventDefault();
                            form.handleSubmit();
                        }}
                    >
                        <FieldGroup>
                            <form.Field name="email">
                                {(field) => {
                                    const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
                                    return (
                                        <Field data-invalid={isInvalid}>
                                            <FieldLabel htmlFor={field.name}>Email</FieldLabel>
                                            <InputGroup>
                                                <InputGroupAddon align="inline-start">
                                                    <InputGroupText>
                                                        <AtSymbolIcon />
                                                    </InputGroupText>
                                                </InputGroupAddon>
                                                <InputGroupInput
                                                    aria-invalid={isInvalid}
                                                    autoComplete="username webauthn"
                                                    id={field.name}
                                                    name={field.name}
                                                    onBlur={field.handleBlur}
                                                    onChange={(e) => {
                                                        field.handleChange(e.target.value);
                                                        setFieldErrors((p) => {
                                                            if (!p[field.name]) {
                                                                return p;
                                                            }
                                                            const copy = { ...p };
                                                            delete copy[field.name];
                                                            return copy;
                                                        });
                                                    }}
                                                    placeholder="you@example.com"
                                                    type="email"
                                                    value={field.state.value}
                                                />
                                            </InputGroup>
                                            {(() => {
                                                const fieldErrorMessages = fieldErrors[field.name]?.map((m) => ({ message: m }));
                                                const metaErrorMessages = isInvalid
                                                    ? field.state.meta.errors?.map((m) => ({ message: (m as unknown as { message: string }).message }))
                                                    : undefined;
                                                const allErrors = fieldErrorMessages || metaErrorMessages;
                                                return allErrors ? <FieldError errors={allErrors} /> : null;
                                            })()}
                                        </Field>
                                    );
                                }}
                            </form.Field>

                            <form.Field name="password">
                                {(field) => {
                                    const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
                                    return (
                                        <Field>
                                            <div className="flex items-center">
                                                <FieldLabel htmlFor={field.name}>Password</FieldLabel>
                                                <a className="ml-auto inline-block text-sm underline-offset-4 hover:underline" href="/auth/forgot">
                                                    Forgot your password?
                                                </a>
                                            </div>
                                            <InputGroup>
                                                <InputGroupAddon align="inline-start">
                                                    <InputGroupText>
                                                        <LockClosedIcon />
                                                    </InputGroupText>
                                                </InputGroupAddon>
                                                <InputGroupInput
                                                    aria-invalid={isInvalid}
                                                    autoComplete="current-password webauthn"
                                                    id={field.name}
                                                    name={field.name}
                                                    onBlur={field.handleBlur}
                                                    onChange={(e) => {
                                                        field.handleChange(e.target.value);
                                                        setFieldErrors((p) => {
                                                            if (!p[field.name]) {
                                                                return p;
                                                            }
                                                            const copy = { ...p };
                                                            delete copy[field.name];
                                                            return copy;
                                                        });
                                                    }}
                                                    type="password"
                                                    value={field.state.value}
                                                />
                                            </InputGroup>
                                            {(() => {
                                                const fieldErrorMessages = fieldErrors[field.name]?.map((m) => ({ message: m }));
                                                const metaErrorMessages = isInvalid
                                                    ? field.state.meta.errors?.map((m) => ({ message: (m as unknown as { message: string }).message }))
                                                    : undefined;
                                                const allErrors = fieldErrorMessages || metaErrorMessages;
                                                return allErrors ? <FieldError errors={allErrors} /> : null;
                                            })()}
                                        </Field>
                                    );
                                }}
                            </form.Field>

                            <Field>
                                <div className="flex flex-wrap items-center justify-center gap-2">
                                    <Button className="w-32" onClick={() => form.handleSubmit()} type="button">
                                        Sign in
                                    </Button>
                                    {lastUsedMethod === "email" ? <Badge variant="outline">Last used</Badge> : null}
                                    {onPasskey ? (
                                        <Button className="w-32" onClick={onPasskey} type="button" variant="outline">
                                            Use passkey
                                        </Button>
                                    ) : null}
                                </div>
                                <FieldSeparator className="mt-4 mb-4">
                                    <FieldDescription className="mt-4 text-center">
                                        Don&apos;t have an account?{" "}
                                        <a className="link" href="/auth/register">
                                            Sign up
                                        </a>
                                    </FieldDescription>
                                </FieldSeparator>
                            </Field>
                        </FieldGroup>
                    </form>
                    {onSocialClick && (
                        <div className="mt-3">
                            <SocialAuthButtons lastUsedMethod={lastUsedMethod} onClick={onSocialClick} />
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
