"use client";
import { AtSymbolIcon, LockClosedIcon } from "@foundry/ui/icons";
import { cn } from "@foundry/ui/lib/utils";
import { Button } from "@foundry/ui/primitives/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@foundry/ui/primitives/card";
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel, FieldSeparator } from "@foundry/ui/primitives/field";
import { Input } from "@foundry/ui/primitives/input";
import { InputGroup, InputGroupAddon, InputGroupInput, InputGroupText } from "@foundry/ui/primitives/input-group";
import { useForm } from "@tanstack/react-form";
import { useState } from "react";
// biome-ignore lint/performance/noNamespaceImport: <Def>
import * as z from "zod";
import SocialAuthButtons from "./social-auth-button";

const registerSchema = z
    .object({
        username: z.string().min(3, "Username must be at least 3 characters").max(20),
        email: z.string().email("Enter a valid email"),
        password: z.string().min(8, "Password must be at least 8 characters"),
        confirmPassword: z.string().min(1),
        firstName: z.string().optional(),
        lastName: z.string().optional(),
        age: z.string().optional(),
    })
    .refine((data) => data.password === data.confirmPassword, {
        message: "Passwords do not match",
        path: ["confirmPassword"],
    });

export default function RegisterForm({
    className,
    lastUsedMethod,
    onSubmit,
    onSocialClick,
}: {
    className?: string;
    lastUsedMethod?: string | null;
    onSubmit?: (data: { username: string; email: string; password: string; firstName?: string; lastName?: string; age?: string }) => Promise<void> | void;
    onSocialClick?: (provider: string) => void;
}) {
    const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});

    const form = useForm({
        defaultValues: { username: "", email: "", password: "", confirmPassword: "", firstName: "", lastName: "", age: "" },
        onSubmit: async ({ value }) => {
            const parsed = registerSchema.safeParse(value as unknown);
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
            await onSubmit?.({
                username: String(parsed.data.username).trim(),
                email: String(parsed.data.email).trim(),
                password: String(parsed.data.password),
                firstName: parsed.data.firstName ? String(parsed.data.firstName).trim() : undefined,
                lastName: parsed.data.lastName ? String(parsed.data.lastName).trim() : undefined,
                age: parsed.data.age ? String(parsed.data.age).trim() : undefined,
            });
        },
    });

    return (
        <div className={cn("mx-auto flex w-full max-w-3xl flex-col gap-6", className)}>
            <Card>
                <CardHeader>
                    <CardTitle>Create an account</CardTitle>
                    <CardDescription>Sign up with email and password, or use a social provider.</CardDescription>
                </CardHeader>
                <CardContent>
                    <form
                        onSubmit={(e) => {
                            e.preventDefault();
                            form.handleSubmit();
                        }}
                    >
                        <FieldGroup>
                            <div className="grid grid-cols-2 gap-6">
                                <div>
                                    <form.Field name="username">
                                        {(field) => {
                                            const isInvalid = !!fieldErrors[field.name];
                                            return (
                                                <Field data-invalid={isInvalid}>
                                                    <FieldLabel htmlFor={field.name}>Username</FieldLabel>
                                                    <Input
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
                                                        placeholder="username"
                                                        value={field.state.value}
                                                    />
                                                    {(() => {
                                                        const errors = fieldErrors[field.name];
                                                        return errors ? (
                                                            <FieldError
                                                                errors={errors.map((m) => ({
                                                                    message: m,
                                                                }))}
                                                            />
                                                        ) : null;
                                                    })()}
                                                </Field>
                                            );
                                        }}
                                    </form.Field>

                                    <form.Field name="email">
                                        {(field) => {
                                            const isInvalid = !!fieldErrors[field.name];
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
                                                            autoComplete="email webauthn"
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
                                                        const errors = fieldErrors[field.name];
                                                        return errors ? (
                                                            <FieldError
                                                                errors={errors.map((m) => ({
                                                                    message: m,
                                                                }))}
                                                            />
                                                        ) : null;
                                                    })()}
                                                </Field>
                                            );
                                        }}
                                    </form.Field>
                                </div>

                                <div className="border-l pl-6">
                                    <div className="mb-4 grid grid-cols-2 gap-2">
                                        <form.Field name="firstName">
                                            {(field) => (
                                                <Field>
                                                    <FieldLabel htmlFor={field.name}>First name (optional)</FieldLabel>
                                                    <Input
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
                                                        placeholder="First"
                                                        value={field.state.value}
                                                    />
                                                </Field>
                                            )}
                                        </form.Field>

                                        <form.Field name="lastName">
                                            {(field) => (
                                                <Field>
                                                    <FieldLabel htmlFor={field.name}>Last name (optional)</FieldLabel>
                                                    <Input
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
                                                        placeholder="Last"
                                                        value={field.state.value}
                                                    />
                                                </Field>
                                            )}
                                        </form.Field>
                                    </div>

                                    <form.Field name="age">
                                        {(field) => (
                                            <Field>
                                                <FieldLabel htmlFor={field.name}>Age (optional)</FieldLabel>
                                                <Input
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
                                                    placeholder="e.g. 30"
                                                    value={field.state.value}
                                                />
                                            </Field>
                                        )}
                                    </form.Field>
                                </div>
                            </div>

                            <form.Field name="password">
                                {(field) => {
                                    const isInvalid = !!fieldErrors[field.name];
                                    return (
                                        <Field>
                                            <FieldLabel htmlFor={field.name}>Password</FieldLabel>
                                            <InputGroup>
                                                <InputGroupAddon align="inline-start">
                                                    <InputGroupText>
                                                        <LockClosedIcon />
                                                    </InputGroupText>
                                                </InputGroupAddon>
                                                <InputGroupInput
                                                    aria-invalid={isInvalid}
                                                    autoComplete="new-password webauthn"
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
                                                const errors = fieldErrors[field.name];
                                                return errors ? (
                                                    <FieldError
                                                        errors={errors.map((m) => ({
                                                            message: m,
                                                        }))}
                                                    />
                                                ) : null;
                                            })()}
                                        </Field>
                                    );
                                }}
                            </form.Field>

                            <form.Field name="confirmPassword">
                                {(field) => {
                                    const isInvalid = !!fieldErrors[field.name];
                                    return (
                                        <Field>
                                            <FieldLabel htmlFor={field.name}>Confirm password</FieldLabel>
                                            <InputGroup>
                                                <InputGroupAddon align="inline-start">
                                                    <InputGroupText>
                                                        <LockClosedIcon />
                                                    </InputGroupText>
                                                </InputGroupAddon>
                                                <InputGroupInput
                                                    aria-invalid={isInvalid}
                                                    autoComplete="new-password webauthn"
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
                                                const errors = fieldErrors[field.name];
                                                return errors ? (
                                                    <FieldError
                                                        errors={errors.map((m) => ({
                                                            message: m,
                                                        }))}
                                                    />
                                                ) : null;
                                            })()}
                                        </Field>
                                    );
                                }}
                            </form.Field>

                            <Field>
                                <div className="mb-2 flex items-center justify-center">
                                    <Button className="w-full" onClick={() => form.handleSubmit()} type="submit" variant="default">
                                        Create account
                                    </Button>
                                </div>
                            </Field>
                        </FieldGroup>
                    </form>
                    {onSocialClick && (
                        <>
                            <FieldSeparator>
                                <FieldDescription className="mt-2 text-center">Or continue with</FieldDescription>
                            </FieldSeparator>
                            <div className="mt-3">
                                <SocialAuthButtons lastUsedMethod={lastUsedMethod} onClick={onSocialClick} />
                            </div>
                        </>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
