"use client";

import { Button } from "@foundry/ui/primitives/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@foundry/ui/primitives/card";
import { Field, FieldDescription, FieldGroup, FieldLabel, FieldLegend, FieldSet } from "@foundry/ui/primitives/field";
import { Input } from "@foundry/ui/primitives/input";

import { FieldHint } from "./field-hint";
import type { AccountForm, FieldErrorMap, StatusMessage } from "./types/types";

interface PasswordCardProps {
    form: AccountForm;
    fieldErrors: FieldErrorMap;
    formMessage: StatusMessage | null;
    isSaving: boolean;
    clearFieldError: (fieldName: string) => void;
    onReset: () => void;
    onSubmit: () => void;
}

export function PasswordCard({ form, fieldErrors, formMessage, isSaving, clearFieldError, onReset, onSubmit }: PasswordCardProps) {
    return (
        <Card>
            <CardHeader className="text-center">
                <CardTitle className="text-center">Security</CardTitle>
                <CardDescription className="text-center">Manage your password and account protection.</CardDescription>
            </CardHeader>
            <CardContent>
                <form
                    onSubmit={(event) => {
                        event.preventDefault();
                        onSubmit();
                    }}
                >
                    <div className="space-y-8">
                        <FieldSet>
                            <FieldLegend>Password</FieldLegend>
                            <FieldGroup>
                                <div className="grid gap-6 lg:grid-cols-3">
                                    <Field>
                                        <FieldLabel className="w-full justify-center text-center" htmlFor="currentPassword">
                                            Current password
                                            <FieldHint label="Current password help" text="Required to update your password." />
                                        </FieldLabel>
                                        <form.Field name="currentPassword">
                                            {(field) => (
                                                <Input
                                                    id={field.name}
                                                    name={field.name}
                                                    onBlur={field.handleBlur}
                                                    onChange={(event) => field.handleChange(event.target.value)}
                                                    type="password"
                                                    value={field.state.value}
                                                />
                                            )}
                                        </form.Field>
                                    </Field>
                                    <Field>
                                        <FieldLabel className="w-full justify-center text-center" htmlFor="newPassword">
                                            New password
                                            <FieldHint label="New password help" text="Use a strong, unique password." />
                                        </FieldLabel>
                                        <form.Field name="newPassword">
                                            {(field) => (
                                                <Input
                                                    id={field.name}
                                                    name={field.name}
                                                    onBlur={field.handleBlur}
                                                    onChange={(event) => field.handleChange(event.target.value)}
                                                    type="password"
                                                    value={field.state.value}
                                                />
                                            )}
                                        </form.Field>
                                    </Field>
                                    <Field>
                                        <FieldLabel className="w-full justify-center text-center" htmlFor="confirmPassword">
                                            Confirm password
                                            <FieldHint label="Confirm password help" text="Leave blank if you are not changing your password." />
                                        </FieldLabel>
                                        <form.Field name="confirmPassword">
                                            {(field) => (
                                                <Input
                                                    id={field.name}
                                                    name={field.name}
                                                    onBlur={field.handleBlur}
                                                    onChange={(event) => {
                                                        field.handleChange(event.target.value);
                                                        clearFieldError(field.name);
                                                    }}
                                                    type="password"
                                                    value={field.state.value}
                                                />
                                            )}
                                        </form.Field>
                                        {fieldErrors.confirmPassword?.length ? (
                                            <FieldDescription className="text-destructive">{fieldErrors.confirmPassword.join(" ")}</FieldDescription>
                                        ) : null}
                                    </Field>
                                </div>
                            </FieldGroup>
                        </FieldSet>

                        {formMessage ? (
                            <FieldDescription className={formMessage.type === "error" ? "text-destructive" : "text-emerald-500"}>{formMessage.message}</FieldDescription>
                        ) : null}

                        <CardFooter className="flex flex-col items-start gap-3 border-t pt-6">
                            <div className="flex flex-wrap items-center gap-3">
                                <Button disabled={isSaving} type="submit">
                                    {isSaving ? "Saving..." : "Save changes"}
                                </Button>
                                <Button disabled={isSaving} onClick={onReset} type="button" variant="outline">
                                    Reset
                                </Button>
                            </div>
                            <FieldDescription>Changes sync to your account immediately.</FieldDescription>
                        </CardFooter>
                    </div>
                </form>
            </CardContent>
        </Card>
    );
}
