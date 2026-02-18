/** biome-ignore-all lint/performance/useTopLevelRegex: <Shh> */
"use client";

import { ExclamationTriangleIcon } from "@foundry/ui/icons";
import { Alert, AlertDescription, AlertTitle } from "@foundry/ui/primitives/alert";
import { Button } from "@foundry/ui/primitives/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@foundry/ui/primitives/card";
import { Field, FieldDescription, FieldGroup, FieldLabel, FieldLegend, FieldSet } from "@foundry/ui/primitives/field";
import { Input } from "@foundry/ui/primitives/input";
import { useTranslations } from "next-intl";
import { useMemo, useState } from "react";
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
    /** true when the current user already has an email/password credential */
    hasPassword?: boolean;
    onSendPasswordSetup?: () => void;
    passwordSetupLoading?: boolean;
    passwordSetupMessage?: StatusMessage | null;
}

export function PasswordCard({
    form,
    fieldErrors,
    formMessage,
    isSaving,
    clearFieldError,
    onReset,
    onSubmit,
    hasPassword = true,
    onSendPasswordSetup,
    passwordSetupLoading = false,
    passwordSetupMessage = null,
}: PasswordCardProps) {
    const t = useTranslations("AccountPage");
    const c = useTranslations("common");
    const [strength, setStrength] = useState(0);

    const calcStrength = (pw: string) => {
        let score = 0;
        if (!pw) {
            return 0;
        }
        if (pw.length >= 8) {
            score++;
        }
        if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) {
            score++;
        }
        if (/\d/.test(pw)) {
            score++;
        }
        if (/[^A-Za-z0-9]/.test(pw) || pw.length >= 12) {
            score++;
        }
        return Math.min(score, 4);
    };

    const strengthLabel = useMemo(() => {
        switch (strength) {
            case 0:
                return t("security.passwordStrength.empty");
            case 1:
                return t("security.passwordStrength.weak");
            case 2:
                return t("security.passwordStrength.fair");
            case 3:
                return t("security.passwordStrength.good");
            default:
                return t("security.passwordStrength.strong");
        }
    }, [strength, t]);
    return (
        <Card>
            <CardHeader className="text-center">
                <CardTitle className="text-center">{t("security.title")}</CardTitle>
                <CardDescription className="text-center">{t("security.description")}</CardDescription>
            </CardHeader>
            <CardContent>
                {/* Alert + CTA when the user does not have a password set */}
                {hasPassword ? null : (
                    <Alert className="mb-4" variant="warning">
                        <ExclamationTriangleIcon className="h-6 w-6 text-warning-foreground" />

                        <AlertTitle className="pl-7">{t("security.createPasswordCard.title")}</AlertTitle>

                        <AlertDescription className="text-center">
                            {t("security.createPasswordCard.explain")}
                            {passwordSetupMessage ? (
                                <div className="mt-2 justify-center text-center">
                                    <FieldDescription className={passwordSetupMessage.type === "error" ? "text-destructive" : "text-emerald-500"}>
                                        {passwordSetupMessage.message}
                                    </FieldDescription>
                                </div>
                            ) : null}
                        </AlertDescription>

                        <div className="col-start-2 mt-4 flex justify-center">
                            <Button disabled={passwordSetupLoading || !onSendPasswordSetup} onClick={onSendPasswordSetup} type="button">
                                {passwordSetupLoading ? t("security.createPasswordCard.sending") : t("security.createPasswordCard.sendButton")}
                            </Button>
                        </div>
                    </Alert>
                )}
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
                                <div className="grid gap-6 md:grid-cols-2">
                                    <Field>
                                        <FieldLabel className="w-full" htmlFor="currentPassword">
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
                                        <FieldLabel className="w-full" htmlFor="newPassword">
                                            {t("security.newPassword")}
                                            <FieldHint label={t("security.newPassword")} text={t("security.newPasswordHelp")} />
                                        </FieldLabel>
                                        <form.Field name="newPassword">
                                            {(field) => (
                                                <Input
                                                    id={field.name}
                                                    name={field.name}
                                                    onBlur={field.handleBlur}
                                                    onChange={(event) => {
                                                        field.handleChange(event.target.value);
                                                        setStrength(calcStrength(event.target.value));
                                                    }}
                                                    type="password"
                                                    value={field.state.value}
                                                />
                                            )}
                                        </form.Field>

                                        {/* simple strength meter */}
                                        <div className="mt-2">
                                            <div className="flex gap-1">
                                                {[1, 2, 3, 4].map((i) => {
                                                    let colorClass = "bg-muted";
                                                    if (strength >= i) {
                                                        if (strength <= 1) {
                                                            colorClass = "bg-destructive";
                                                        } else if (strength === 2) {
                                                            colorClass = "bg-amber-400";
                                                        } else {
                                                            colorClass = "bg-emerald-500";
                                                        }
                                                    }
                                                    return <div className={`h-2 flex-1 rounded ${colorClass}`} key={i} />;
                                                })}
                                            </div>
                                            <FieldDescription className="mt-2 text-muted-foreground text-xs">{strengthLabel}</FieldDescription>
                                        </div>
                                    </Field>

                                    <Field className="md:col-span-2">
                                        <FieldLabel className="w-full" htmlFor="confirmPassword">
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
