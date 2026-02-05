"use client";

import { Button } from "@foundry/ui/primitives/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@foundry/ui/primitives/card";
import { Field, FieldDescription, FieldGroup, FieldLabel, FieldLegend, FieldSet } from "@foundry/ui/primitives/field";
import { Input } from "@foundry/ui/primitives/input";
import { useTranslations } from "next-intl";
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
    const t = useTranslations("AccountPage");
    const c = useTranslations("common");
    return (
        <Card>
            <CardHeader className="text-center">
                <CardTitle className="text-center">{t("security.title")}</CardTitle>
                <CardDescription className="text-center">{t("security.description")}</CardDescription>
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
                            <FieldLegend>{t("security.passwordLegend")}</FieldLegend>
                            <FieldGroup>
                                <div className="grid gap-6 lg:grid-cols-3">
                                    <Field>
                                        <FieldLabel className="w-full justify-center text-center" htmlFor="currentPassword">
                                            {t("security.currentPassword")}
                                            <FieldHint label={t("security.currentPassword")} text={t("security.currentPasswordHelp")} />
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
                                            {t("security.newPassword")}
                                            <FieldHint label={t("security.newPassword")} text={t("security.newPasswordHelp")} />
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
                                            {t("security.confirmPassword")}
                                            <FieldHint label={t("security.confirmPassword")} text={t("security.confirmPasswordHelp")} />
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
                                    {isSaving ? c("buttons.saving") : c("buttons.save")}
                                </Button>
                                <Button disabled={isSaving} onClick={onReset} type="button" variant="outline">
                                    {c("buttons.reset")}
                                </Button>
                            </div>
                            <FieldDescription>{t("security.changesSync")}</FieldDescription>
                        </CardFooter>
                    </div>
                </form>
            </CardContent>
        </Card>
    );
}
