"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@foundry/ui/primitives/avatar";
import { Badge } from "@foundry/ui/primitives/badge";
import { Button } from "@foundry/ui/primitives/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@foundry/ui/primitives/card";
import { Field, FieldContent, FieldDescription, FieldGroup, FieldLabel, FieldSet } from "@foundry/ui/primitives/field";
import { Input } from "@foundry/ui/primitives/input";
import { InputGroup, InputGroupAddon, InputGroupInput, InputGroupText } from "@foundry/ui/primitives/input-group";

import { FieldHint } from "./field-hint";
import type { AccountForm, FieldErrorMap, StatusMessage } from "./types";

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
                        <CardTitle className="text-center">Identity</CardTitle>
                        <CardDescription className="text-center">Core details for your profile.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <FieldSet>
                            <FieldGroup className="w-full">
                                <Field orientation="vertical">
                                    <FieldLabel className="w-full justify-center text-center" htmlFor="fullName">
                                        Display name
                                        <FieldHint label="Display name help" text="Shown on your profile and shared across your workspace." />
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
                                        Username
                                        <FieldHint label="Username help" text="Your unique handle for sharing and mentions." />
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
                                        Email
                                        <FieldHint label="Email help" text="Email updates require verification." />
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
                        <CardTitle className="text-center">Profile fields</CardTitle>
                        <CardDescription className="text-center">Optional details for your workspace.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <FieldSet>
                            <FieldGroup>
                                <div className="grid gap-6 lg:grid-cols-1">
                                    <Field>
                                        <FieldLabel className="w-full justify-center text-center" htmlFor="firstName">
                                            First name
                                            <FieldHint label="First name help" text="Shown in places where your first name is preferred." />
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
                                            Last name
                                            <FieldHint label="Last name help" text="Used for formal identification in workspace details." />
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
                        <CardTitle className="text-center">Avatar</CardTitle>
                        <CardDescription className="text-center">Update your profile image.</CardDescription>
                    </CardHeader>
                    <CardContent className="flex flex-col gap-4">
                        <div className="grid gap-4 sm:grid-cols-[auto,1fr]">
                            <div className="flex items-center gap-4">
                                <Avatar className="size-16">
                                    <AvatarImage alt="User avatar" src={avatarUrl ?? undefined} />
                                    <AvatarFallback>{avatarFallback}</AvatarFallback>
                                </Avatar>
                                <div className="space-y-1">
                                    <p className="font-medium">Profile picture</p>
                                    <p className="text-muted-foreground text-sm">PNG, JPG up to 5MB.</p>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <p className="text-muted-foreground text-sm">Square images look best. Transparent PNGs keep your brand crisp.</p>
                                <div className="flex flex-wrap items-center gap-2">
                                    <Badge variant="outline">Synced</Badge>
                                    <span className="text-muted-foreground text-xs">Last updated just now</span>
                                </div>
                            </div>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            <Input accept="image/*" className="sr-only" id="avatarUpload" type="file" />
                            <Button asChild>
                                <label htmlFor="avatarUpload">Upload</label>
                            </Button>
                            <Button type="button" variant="outline">
                                Remove
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                <Card className="lg:col-span-7">
                    <CardHeader className="text-center">
                        <CardTitle className="text-center">Connected apps</CardTitle>
                        <CardDescription className="text-center">Manage OAuth connections to external services.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center justify-between rounded-lg border border-border px-4 py-3">
                            <div>
                                <p className="font-medium">GitHub</p>
                                <p className="text-muted-foreground text-sm">Code syncing and integrations.</p>
                            </div>
                            <div className="flex items-center gap-2">
                                <Badge variant="outline">Not connected</Badge>
                                <Button size="sm" type="button" variant="outline">
                                    Connect
                                </Button>
                            </div>
                        </div>
                        <div className="flex items-center justify-between rounded-lg border border-border px-4 py-3">
                            <div>
                                <p className="font-medium">Google</p>
                                <p className="text-muted-foreground text-sm">Calendar and identity sync.</p>
                            </div>
                            <div className="flex items-center gap-2">
                                <Badge>Connected</Badge>
                                <Button size="sm" type="button" variant="outline">
                                    Disconnect
                                </Button>
                            </div>
                        </div>
                        <div className="flex items-center justify-between rounded-lg border border-border px-4 py-3">
                            <div>
                                <p className="font-medium">Discord</p>
                                <p className="text-muted-foreground text-sm">Community and role sync.</p>
                            </div>
                            <div className="flex items-center gap-2">
                                <Badge variant="outline">Not connected</Badge>
                                <Button size="sm" type="button" variant="outline">
                                    Connect
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <div className="space-y-2 lg:col-span-12">
                    <p className="text-muted-foreground text-sm">Changes sync to your account immediately.</p>
                    {formMessage ? (
                        <FieldDescription className={formMessage.type === "error" ? "text-destructive" : "text-emerald-500"}>{formMessage.message}</FieldDescription>
                    ) : null}
                </div>
            </div>
        </form>
    );
}
