"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@foundry/ui/primitives/avatar";
import { Badge } from "@foundry/ui/primitives/badge";
import { Button } from "@foundry/ui/primitives/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@foundry/ui/primitives/card";
import { Field, FieldContent, FieldDescription, FieldGroup, FieldLabel, FieldSet } from "@foundry/ui/primitives/field";
import { Input } from "@foundry/ui/primitives/input";
import { InputGroup, InputGroupAddon, InputGroupInput, InputGroupText } from "@foundry/ui/primitives/input-group";
import { useTranslations } from "next-intl";
import { FieldHint } from "./field-hint";
import type { AccountForm, FieldErrorMap, StatusMessage } from "./types/types";

interface ProfileTabProps {
    form: AccountForm;
    avatarFallback: string;
    avatarUrl: string | null;
    fieldErrors: FieldErrorMap;
    formMessage: StatusMessage | null;
    clearFieldError: (fieldName: string) => void;
    onSubmit: () => void;
}

export function ProfileTab({ form, avatarFallback, avatarUrl, fieldErrors, formMessage, clearFieldError, onSubmit }: ProfileTabProps) {
    const t = useTranslations("AccountPage");
    const c = useTranslations("common");
    return (
        <form
            onSubmit={(event) => {
                event.preventDefault();
                onSubmit();
            }}
        >
            <div className="grid gap-6 lg:grid-cols-12">
                <Card className="lg:col-span-7">
                    <CardHeader className="text-center">
                        <CardTitle className="text-center">{t("profile.identity.title")}</CardTitle>
                        <CardDescription className="text-center">{t("profile.identity.description")}</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <FieldSet>
                            <FieldGroup className="w-full">
                                <Field orientation="vertical">
                                    <FieldLabel className="w-full justify-center text-center" htmlFor="fullName">
                                        {t("profile.identity.displayName")}
                                        <FieldHint label={t("profile.identity.displayName")} text={t("profile.identity.displayNameHelp")} />
                                    </FieldLabel>
                                    <FieldContent className="mx-auto w-full max-w-sm">
                                        <form.Field name="fullName">
                                            {(field) => (
                                                <>
                                                    <Input
                                                        className="w-full"
                                                        id={field.name}
                                                        name={field.name}
                                                        onBlur={field.handleBlur}
                                                        onChange={(event) => {
                                                            field.handleChange(event.target.value);
                                                            clearFieldError(field.name);
                                                        }}
                                                        placeholder="Jane Doe"
                                                        value={field.state.value}
                                                    />
                                                    {fieldErrors[field.name]?.length ? (
                                                        <FieldDescription className="text-destructive">{fieldErrors[field.name]?.join(" ")}</FieldDescription>
                                                    ) : null}
                                                </>
                                            )}
                                        </form.Field>
                                    </FieldContent>
                                </Field>

                                <Field orientation="vertical">
                                    <FieldLabel className="w-full justify-center text-center" htmlFor="username">
                                        {t("profile.identity.username")}
                                        <FieldHint label={t("profile.identity.username")} text={t("profile.identity.usernameHelp")} />
                                    </FieldLabel>
                                    <FieldContent className="mx-auto w-full max-w-sm">
                                        <form.Field name="username">
                                            {(field) => (
                                                <>
                                                    <InputGroup className="w-full">
                                                        <InputGroupAddon align="inline-start">
                                                            <InputGroupText>@</InputGroupText>
                                                        </InputGroupAddon>
                                                        <InputGroupInput
                                                            className="w-full"
                                                            id={field.name}
                                                            name={field.name}
                                                            onBlur={field.handleBlur}
                                                            onChange={(event) => {
                                                                field.handleChange(event.target.value);
                                                                clearFieldError(field.name);
                                                            }}
                                                            placeholder="foundry-user"
                                                            value={field.state.value}
                                                        />
                                                    </InputGroup>
                                                    {fieldErrors[field.name]?.length ? (
                                                        <FieldDescription className="text-destructive">{fieldErrors[field.name]?.join(" ")}</FieldDescription>
                                                    ) : null}
                                                </>
                                            )}
                                        </form.Field>
                                    </FieldContent>
                                </Field>

                                <Field orientation="vertical">
                                    <FieldLabel className="w-full justify-center text-center" htmlFor="email">
                                        {t("profile.identity.email")}
                                        <FieldHint label={t("profile.identity.email")} text={t("profile.identity.emailHelp")} />
                                    </FieldLabel>
                                    <FieldContent className="mx-auto w-full max-w-sm">
                                        <form.Field name="email">
                                            {(field) => <Input className="w-full" disabled id={field.name} name={field.name} type="email" value={field.state.value} />}
                                        </form.Field>
                                    </FieldContent>
                                </Field>
                            </FieldGroup>
                        </FieldSet>
                    </CardContent>
                </Card>

                <Card className="lg:col-span-5">
                    <CardHeader className="text-center">
                        <CardTitle className="text-center">{t("profile.fields.title")}</CardTitle>
                        <CardDescription className="text-center">{t("profile.fields.description")}</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <FieldSet>
                            <FieldGroup>
                                <div className="grid gap-6 lg:grid-cols-1">
                                    <Field>
                                        <FieldLabel className="w-full justify-center text-center" htmlFor="firstName">
                                            {t("profile.fields.firstName")}
                                            <FieldHint label={t("profile.fields.firstName")} text={t("profile.fields.firstNameHelp")} />
                                        </FieldLabel>
                                        <form.Field name="firstName">
                                            {(field) => (
                                                <Input
                                                    id={field.name}
                                                    name={field.name}
                                                    onBlur={field.handleBlur}
                                                    onChange={(event) => field.handleChange(event.target.value)}
                                                    placeholder="Jane"
                                                    value={field.state.value}
                                                />
                                            )}
                                        </form.Field>
                                    </Field>
                                    <Field>
                                        <FieldLabel className="w-full justify-center text-center" htmlFor="lastName">
                                            {t("profile.fields.lastName")}
                                            <FieldHint label={t("profile.fields.lastName")} text={t("profile.fields.lastNameHelp")} />
                                        </FieldLabel>
                                        <form.Field name="lastName">
                                            {(field) => (
                                                <Input
                                                    id={field.name}
                                                    name={field.name}
                                                    onBlur={field.handleBlur}
                                                    onChange={(event) => field.handleChange(event.target.value)}
                                                    placeholder="Doe"
                                                    value={field.state.value}
                                                />
                                            )}
                                        </form.Field>
                                    </Field>
                                    <Field>
                                        <FieldLabel className="w-full justify-center text-center" htmlFor="age">
                                            Age
                                            <FieldHint label="Age help" text="Optional, stored with your account profile." />
                                        </FieldLabel>
                                        <form.Field name="age">
                                            {(field) => (
                                                <Input
                                                    id={field.name}
                                                    inputMode="numeric"
                                                    name={field.name}
                                                    onBlur={field.handleBlur}
                                                    onChange={(event) => {
                                                        field.handleChange(event.target.value);
                                                        clearFieldError(field.name);
                                                    }}
                                                    placeholder="30"
                                                    value={field.state.value}
                                                />
                                            )}
                                        </form.Field>
                                        {fieldErrors.age?.length ? <FieldDescription className="text-destructive">{fieldErrors.age.join(" ")}</FieldDescription> : null}
                                    </Field>
                                </div>
                            </FieldGroup>
                        </FieldSet>
                    </CardContent>
                </Card>

                <Card className="lg:col-span-5">
                    <CardHeader className="text-center">
                        <CardTitle className="text-center">{t("profile.avatar.title")}</CardTitle>
                        <CardDescription className="text-center">{t("profile.avatar.description")}</CardDescription>
                    </CardHeader>
                    <CardContent className="flex flex-col gap-4">
                        <div className="grid gap-4 sm:grid-cols-[auto,1fr]">
                            <div className="flex items-center gap-4">
                                <Avatar className="size-16">
                                    <AvatarImage alt="User avatar" src={avatarUrl ?? undefined} />
                                    <AvatarFallback>{avatarFallback}</AvatarFallback>
                                </Avatar>
                                <div className="space-y-1">
                                    <p className="font-medium">{t("profile.avatar.picture")}</p>
                                    <p className="text-muted-foreground text-sm">{t("profile.avatar.pictureHelp")}</p>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <p className="text-muted-foreground text-sm">{t("profile.avatar.pictureNote")}</p>
                                <div className="flex flex-wrap items-center gap-2">
                                    <Badge variant="outline">Synced</Badge>
                                    <Badge variant="outline">{t("profile.avatar.synced")}</Badge>
                                    <span className="text-muted-foreground text-xs">{t("profile.avatar.lastUpdatedJustNow")}</span>
                                </div>
                            </div>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            <Input accept="image/*" className="sr-only" id="avatarUpload" type="file" />
                            <Button asChild>
                                <label htmlFor="avatarUpload">{c("buttons.upload")}</label>
                            </Button>
                            <Button type="button" variant="outline">
                                {c("buttons.remove")}
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                <Card className="lg:col-span-7">
                    <CardHeader className="text-center">
                        <CardTitle className="text-center">{t("profile.connectedApps.title")}</CardTitle>
                        <CardDescription className="text-center">{t("profile.connectedApps.description")}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center justify-between rounded-lg border border-border px-4 py-3">
                            <div>
                                <p className="font-medium">{t("profile.connectedApps.app.github.name")}</p>
                                <p className="text-muted-foreground text-sm">{t("profile.connectedApps.app.github.description")}</p>
                            </div>
                            <div className="flex items-center gap-2">
                                <Badge variant="outline">{c("fields.notConnected")}</Badge>
                                <Button size="sm" type="button" variant="outline">
                                    {c("buttons.connect")}
                                </Button>
                            </div>
                        </div>
                        <div className="flex items-center justify-between rounded-lg border border-border px-4 py-3">
                            <div>
                                <p className="font-medium">{t("profile.connectedApps.app.google.name")}</p>
                                <p className="text-muted-foreground text-sm">{t("profile.connectedApps.app.google.description")}</p>
                            </div>
                            <div className="flex items-center gap-2">
                                <Badge>{c("fields.connected")}</Badge>
                                <Button size="sm" type="button" variant="outline">
                                    {c("buttons.disconnect")}
                                </Button>
                            </div>
                        </div>
                        <div className="flex items-center justify-between rounded-lg border border-border px-4 py-3">
                            <div>
                                <p className="font-medium">{t("profile.connectedApps.app.discord.name")}</p>
                                <p className="text-muted-foreground text-sm">{t("profile.connectedApps.app.discord.description")}</p>
                            </div>
                            <div className="flex items-center gap-2">
                                <Badge variant="outline">{c("fields.notConnected")}</Badge>
                                <Button size="sm" type="button" variant="outline">
                                    {c("buttons.connect")}
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <div className="space-y-2 lg:col-span-12">
                    <p className="text-muted-foreground text-sm">{t("security.changesSync")}</p>
                    {formMessage ? (
                        <FieldDescription className={formMessage.type === "error" ? "text-destructive" : "text-emerald-500"}>{formMessage.message}</FieldDescription>
                    ) : null}
                </div>
            </div>
        </form>
    );
}
