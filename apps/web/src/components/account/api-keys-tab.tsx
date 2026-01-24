"use client";

import { Badge } from "@foundry/ui/primitives/badge";
import { Button } from "@foundry/ui/primitives/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@foundry/ui/primitives/card";
import { Field, FieldDescription, FieldGroup, FieldLabel, FieldLegend, FieldSet } from "@foundry/ui/primitives/field";
import { Input } from "@foundry/ui/primitives/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@foundry/ui/primitives/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@foundry/ui/primitives/table";

import { API_KEY_PROFILES } from "./constants";
import { FieldHint } from "./field-hint";
import type { ApiKeyEntry, StatusMessage } from "./types";
import { formatDate, getProfileLabel } from "./utils";

interface ApiKeysTabProps {
    apiKeyExpiresInDays: string;
    apiKeyLoading: boolean;
    apiKeyMessage: StatusMessage | null;
    apiKeyName: string;
    apiKeyPrefix: string;
    apiKeyProfileId: string;
    apiKeys: ApiKeyEntry[];
    lastCreatedKey: string | null;
    onCopyKey: () => void;
    onCreateApiKey: () => void;
    onDeleteApiKey: (keyId: string) => void;
    onLoadApiKeys: () => void;
    setApiKeyExpiresInDays: (value: string) => void;
    setApiKeyName: (value: string) => void;
    setApiKeyPrefix: (value: string) => void;
    setApiKeyProfileId: (value: string) => void;
}

export function ApiKeysTab({
    apiKeyExpiresInDays,
    apiKeyLoading,
    apiKeyMessage,
    apiKeyName,
    apiKeyPrefix,
    apiKeyProfileId,
    apiKeys,
    lastCreatedKey,
    onCopyKey,
    onCreateApiKey,
    onDeleteApiKey,
    onLoadApiKeys,
    setApiKeyExpiresInDays,
    setApiKeyName,
    setApiKeyPrefix,
    setApiKeyProfileId,
}: ApiKeysTabProps) {
    return (
        <div className="grid gap-6 lg:grid-cols-12">
            <Card className="lg:col-span-5">
                <CardHeader className="text-center">
                    <CardTitle className="text-center">Create API key</CardTitle>
                    <CardDescription className="text-center">Generate keys for automation and integrations.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <FieldSet>
                        <FieldLegend>Create a new key</FieldLegend>
                        <FieldGroup>
                            <div className="grid gap-6 lg:grid-cols-1">
                                <Field>
                                    <FieldLabel className="w-full justify-center text-center" htmlFor="apiKeyName">
                                        Key name
                                        <FieldHint label="Key name help" text="Optional label to help you recognize this key." />
                                    </FieldLabel>
                                    <Input id="apiKeyName" onChange={(event) => setApiKeyName(event.target.value)} placeholder="Production deployer" value={apiKeyName} />
                                </Field>
                                <Field>
                                    <FieldLabel className="w-full justify-center text-center" htmlFor="apiKeyProfile">
                                        Permission profile
                                        <FieldHint label="Permission profile help" text="Select the access level for this key." />
                                    </FieldLabel>
                                    <Select onValueChange={setApiKeyProfileId} value={apiKeyProfileId}>
                                        <SelectTrigger id="apiKeyProfile">
                                            <SelectValue placeholder="Select profile" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {API_KEY_PROFILES.map((profile) => (
                                                <SelectItem key={profile.id} value={profile.id}>
                                                    {profile.label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <p className="text-muted-foreground text-sm">
                                        {API_KEY_PROFILES.find((profile) => profile.id === apiKeyProfileId)?.description ?? "Select permissions for this key."}
                                    </p>
                                </Field>
                                <Field>
                                    <FieldLabel className="w-full justify-center text-center" htmlFor="apiKeyPrefix">
                                        Prefix
                                        <FieldHint label="Prefix help" text="Helps identify keys in logs (include an underscore)." />
                                    </FieldLabel>
                                    <Input id="apiKeyPrefix" onChange={(event) => setApiKeyPrefix(event.target.value)} placeholder="fdry_" value={apiKeyPrefix} />
                                </Field>
                                <Field>
                                    <FieldLabel className="w-full justify-center text-center" htmlFor="apiKeyExpires">
                                        Expires in (days)
                                        <FieldHint label="Expiration help" text="Leave blank for no expiration." />
                                    </FieldLabel>
                                    <Input
                                        id="apiKeyExpires"
                                        inputMode="numeric"
                                        onChange={(event) => setApiKeyExpiresInDays(event.target.value)}
                                        placeholder="30"
                                        value={apiKeyExpiresInDays}
                                    />
                                </Field>
                            </div>
                        </FieldGroup>
                    </FieldSet>

                    <div className="flex flex-wrap items-center gap-3">
                        <Button onClick={onCreateApiKey} type="button">
                            Create API key
                        </Button>
                        {lastCreatedKey ? (
                            <Button onClick={onCopyKey} type="button" variant="outline">
                                Copy key
                            </Button>
                        ) : null}
                    </div>
                    {lastCreatedKey ? <FieldDescription className="text-emerald-500">Save this key now — you won&apos;t see it again. {lastCreatedKey}</FieldDescription> : null}
                    {apiKeyMessage ? (
                        <FieldDescription className={apiKeyMessage.type === "error" ? "text-destructive" : "text-emerald-500"}>{apiKeyMessage.message}</FieldDescription>
                    ) : null}
                </CardContent>
            </Card>

            <Card className="lg:col-span-7">
                <CardHeader className="text-center">
                    <CardTitle className="text-center">Active keys</CardTitle>
                    <CardDescription className="text-center">Keys attached to your account.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-muted-foreground text-sm">Manage existing keys and revoke access.</p>
                        </div>
                        <Button disabled={apiKeyLoading} onClick={onLoadApiKeys} type="button" variant="outline">
                            {apiKeyLoading ? "Refreshing..." : "Refresh"}
                        </Button>
                    </div>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Name</TableHead>
                                <TableHead>Prefix</TableHead>
                                <TableHead>Profile</TableHead>
                                <TableHead>Created</TableHead>
                                <TableHead>Expires</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {apiKeys.length === 0 ? (
                                <TableRow>
                                    <TableCell className="py-6 text-muted-foreground" colSpan={7}>
                                        No API keys yet.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                apiKeys.map((key) => (
                                    <TableRow key={key.id}>
                                        <TableCell className="font-medium">{key.name || "Untitled key"}</TableCell>
                                        <TableCell>{key.prefix || key.start || "—"}</TableCell>
                                        <TableCell>{getProfileLabel(key.metadata?.profile ?? null)}</TableCell>
                                        <TableCell>{formatDate(key.createdAt)}</TableCell>
                                        <TableCell>{formatDate(key.expiresAt)}</TableCell>
                                        <TableCell>{key.enabled === false ? <Badge variant="outline">Disabled</Badge> : <Badge>Active</Badge>}</TableCell>
                                        <TableCell className="text-right">
                                            <Button onClick={() => onDeleteApiKey(key.id)} size="sm" type="button" variant="ghost">
                                                Revoke
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
