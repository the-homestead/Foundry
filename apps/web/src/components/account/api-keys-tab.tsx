"use client";

import { Button } from "@foundry/ui/primitives/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@foundry/ui/primitives/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@foundry/ui/primitives/dialog";
import { Field, FieldDescription, FieldGroup, FieldLabel, FieldLegend, FieldSet } from "@foundry/ui/primitives/field";
import { Input } from "@foundry/ui/primitives/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@foundry/ui/primitives/select";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { ApiKeysStats } from "./api-keys-stats";
import { ApiKeysTable } from "./api-keys-table";
import { FieldHint } from "./field-hint";
import { IpRestrictionsDialog } from "./ip-restrictions-dialog";
import { KeyDetailsDialog } from "./key-details-dialog";
import { RateLimitsDialog } from "./rate-limits-dialog";
import { ScopesDialog } from "./scopes-dialog";
import { API_KEY_PROFILES } from "./types/constants";
import type { ApiKeyEntry, StatusMessage } from "./types/types";

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
    apiKeyCreating?: boolean;
    pendingRevokeId?: string | null;
    setPendingRevokeId?: (value: string | null) => void;
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
    apiKeyCreating = false,
    pendingRevokeId,
    setPendingRevokeId,
}: ApiKeysTabProps) {
    const t = useTranslations("AccountPage");
    const c = useTranslations("common");
    const [createOpen, setCreateOpen] = useState(false);
    const [showCreatedKey, setShowCreatedKey] = useState(false);

    // Dialog states for key management
    const [ipDialogOpen, setIpDialogOpen] = useState(false);
    const [rateLimitDialogOpen, setRateLimitDialogOpen] = useState(false);
    const [scopesDialogOpen, setScopesDialogOpen] = useState(false);
    const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
    const [selectedKey, setSelectedKey] = useState<ApiKeyEntry | null>(null);

    useEffect(() => {
        if (!apiKeyMessage) {
            return;
        }

        if (apiKeyMessage.type === "error") {
            toast.error(String(apiKeyMessage.message));
        } else {
            toast.success(String(apiKeyMessage.message));
        }
    }, [apiKeyMessage]);

    useEffect(() => {
        if (!lastCreatedKey) {
            return;
        }

        // Close the create form and open a modal to show the created key so user can copy it
        setCreateOpen(false);
        setShowCreatedKey(true);
        toast.success(String(t("success.apiKeyCreated")));
    }, [lastCreatedKey, t]);

    // Handlers for the table actions
    const handleIpRestrictions = (key: ApiKeyEntry) => {
        setSelectedKey(key);
        setIpDialogOpen(true);
    };

    const handleRateLimits = (key: ApiKeyEntry) => {
        setSelectedKey(key);
        setRateLimitDialogOpen(true);
    };

    const handleScopes = (key: ApiKeyEntry) => {
        setSelectedKey(key);
        setScopesDialogOpen(true);
    };

    const handleViewDetails = (key: ApiKeyEntry) => {
        setSelectedKey(key);
        setDetailsDialogOpen(true);
    };

    const handleSaveIpRestrictions = async (keyId: string, whitelist: string[], blacklist: string[]) => {
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_SERVER_APP_URL}/api-keys/${keyId}/ip-restrictions`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                },
                credentials: "include",
                body: JSON.stringify({ whitelist, blacklist }),
            });

            if (!response.ok) {
                throw new Error("Failed to update IP restrictions");
            }

            toast.success("IP restrictions updated");
            onLoadApiKeys(); // Refresh the list
        } catch (_error) {
            toast.error("Failed to update IP restrictions");
        }
    };

    const handleSaveRateLimits = async (keyId: string, limits: { requestsPerMinute?: number | null; requestsPerHour?: number | null; requestsPerDay?: number | null }) => {
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_SERVER_APP_URL}/api-keys/${keyId}/rate-limits`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                },
                credentials: "include",
                body: JSON.stringify(limits),
            });

            if (!response.ok) {
                throw new Error("Failed to update rate limits");
            }

            toast.success("Rate limits updated");
            onLoadApiKeys(); // Refresh the list
        } catch (_error) {
            toast.error("Failed to update rate limits");
        }
    };

    const handleSaveScopes = async (keyId: string, scopes: string[]) => {
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_SERVER_APP_URL}/api-keys/${keyId}/scopes`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                },
                credentials: "include",
                body: JSON.stringify({ scopes }),
            });

            if (!response.ok) {
                throw new Error("Failed to update scopes");
            }

            toast.success("Scopes updated");
            onLoadApiKeys(); // Refresh the list
        } catch (_error) {
            toast.error("Failed to update scopes");
        }
    };

    return (
        <div className="grid gap-6 lg:grid-cols-12">
            <Card className="lg:col-span-12">
                <CardHeader className="text-center">
                    <CardTitle className="text-center">{t("apiKeys.list.title")}</CardTitle>
                    <CardDescription className="text-center">{t("apiKeys.list.description")}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {/* Analytics Stats */}
                    <ApiKeysStats apiKeys={apiKeys} />

                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <p className="text-muted-foreground text-sm">
                            {apiKeys.length} {t("apiKeys.list.keysLabel")}
                        </p>
                        <div className="flex items-center gap-2">
                            <Button disabled={apiKeyLoading} onClick={onLoadApiKeys} type="button" variant="outline">
                                {apiKeyLoading ? c("buttons.refreshing") : c("buttons.refresh")}
                            </Button>
                            <Dialog onOpenChange={setCreateOpen} open={createOpen}>
                                <DialogTrigger asChild>
                                    <Button type="button">{t("apiKeys.create.createButton")}</Button>
                                </DialogTrigger>
                                <DialogContent>
                                    <DialogHeader>
                                        <DialogTitle>{t("apiKeys.create.title")}</DialogTitle>
                                        <DialogDescription>{t("apiKeys.create.description")}</DialogDescription>
                                    </DialogHeader>
                                    <div className="space-y-6">
                                        <FieldSet>
                                            <FieldLegend>{t("apiKeys.create.title")}</FieldLegend>
                                            <FieldGroup>
                                                <div className="grid gap-6 lg:grid-cols-1">
                                                    <Field>
                                                        <FieldLabel className="w-full" htmlFor="apiKeyName">
                                                            {t("apiKeys.create.nameLabel")}
                                                            <FieldHint label={t("apiKeys.create.nameLabel")} text={t("apiKeys.create.nameHelp")} />
                                                        </FieldLabel>
                                                        <Input
                                                            id="apiKeyName"
                                                            onChange={(event) => setApiKeyName(event.target.value)}
                                                            placeholder={String(t("apiKeys.create.nameHelp"))}
                                                            value={apiKeyName}
                                                        />
                                                    </Field>
                                                    <Field>
                                                        <FieldLabel className="w-full" htmlFor="apiKeyProfile">
                                                            {t("apiKeys.create.profileLabel")}
                                                            <FieldHint label={t("apiKeys.create.profileLabel")} text={t("apiKeys.create.profileHelp")} />
                                                        </FieldLabel>
                                                        <Select onValueChange={setApiKeyProfileId} value={apiKeyProfileId}>
                                                            <SelectTrigger id="apiKeyProfile">
                                                                <SelectValue placeholder={t("apiKeys.create.profileHelp")} />
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
                                                            {API_KEY_PROFILES.find((profile) => profile.id === apiKeyProfileId)?.description ?? t("apiKeys.create.profileHelp")}
                                                        </p>
                                                    </Field>
                                                    <Field>
                                                        <FieldLabel className="w-full" htmlFor="apiKeyPrefix">
                                                            {t("apiKeys.create.prefixLabel")}
                                                            <FieldHint label={t("apiKeys.create.prefixLabel")} text={t("apiKeys.create.prefixHelp")} />
                                                        </FieldLabel>
                                                        <Input
                                                            id="apiKeyPrefix"
                                                            onChange={(event) => setApiKeyPrefix(event.target.value)}
                                                            placeholder={String(t("apiKeys.create.prefixHelp"))}
                                                            value={apiKeyPrefix}
                                                        />
                                                    </Field>
                                                    <Field>
                                                        <FieldLabel className="w-full" htmlFor="apiKeyExpires">
                                                            {t("apiKeys.create.expiresLabel")}
                                                            <FieldHint label={t("apiKeys.create.expiresLabel")} text={t("apiKeys.create.expiresHelp")} />
                                                        </FieldLabel>
                                                        <Input
                                                            id="apiKeyExpires"
                                                            inputMode="numeric"
                                                            onChange={(event) => setApiKeyExpiresInDays(event.target.value)}
                                                            placeholder={String(t("apiKeys.create.expiresHelp"))}
                                                            value={apiKeyExpiresInDays}
                                                        />
                                                    </Field>
                                                </div>
                                            </FieldGroup>
                                        </FieldSet>

                                        <div className="flex items-center gap-3">
                                            <Button disabled={apiKeyCreating} onClick={onCreateApiKey} type="button">
                                                {apiKeyCreating ? c("states.saving") : t("apiKeys.create.createButton")}
                                            </Button>
                                            {lastCreatedKey ? (
                                                <Button onClick={onCopyKey} type="button" variant="outline">
                                                    {t("apiKeys.create.copyButton")}
                                                </Button>
                                            ) : null}
                                        </div>
                                        {lastCreatedKey ? (
                                            <FieldDescription className="text-emerald-500">
                                                {t("apiKeys.create.createdNote")} {lastCreatedKey}
                                            </FieldDescription>
                                        ) : null}
                                        {apiKeyMessage ? (
                                            <FieldDescription aria-live="polite" className={apiKeyMessage.type === "error" ? "text-destructive" : "text-emerald-500"} role="status">
                                                {apiKeyMessage.message}
                                            </FieldDescription>
                                        ) : null}
                                    </div>
                                </DialogContent>
                            </Dialog>
                        </div>
                    </div>

                    {/* TanStack Table Component */}
                    <ApiKeysTable
                        data={apiKeys}
                        onDelete={onDeleteApiKey}
                        onIpRestrictions={handleIpRestrictions}
                        onRateLimits={handleRateLimits}
                        onRefresh={onLoadApiKeys}
                        onScopes={handleScopes}
                        onViewDetails={handleViewDetails}
                        pendingRevokeId={pendingRevokeId}
                        setPendingRevokeId={setPendingRevokeId}
                    />

                    {/* Dialog for displaying created key */}
                    <Dialog onOpenChange={setShowCreatedKey} open={showCreatedKey}>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>{t("apiKeys.create.createdNote")}</DialogTitle>
                                <DialogDescription>{t("apiKeys.create.createdNote")}</DialogDescription>
                            </DialogHeader>

                            <div className="space-y-4">
                                <div className="rounded-md border bg-muted p-4 font-mono text-sm">{lastCreatedKey}</div>

                                <div className="flex items-center gap-2">
                                    <Button
                                        onClick={async () => {
                                            if (!lastCreatedKey) {
                                                return;
                                            }
                                            await navigator.clipboard.writeText(lastCreatedKey);
                                            toast.success(String(t("success.apiKeyCopied")));
                                        }}
                                    >
                                        {String(c("buttons.copy"))}
                                    </Button>
                                    <Button onClick={() => setShowCreatedKey(false)} variant="ghost">
                                        {String(c("buttons.close"))}
                                    </Button>
                                </div>
                            </div>
                        </DialogContent>
                    </Dialog>

                    {/* IP Restrictions Dialog */}
                    {selectedKey ? (
                        <IpRestrictionsDialog
                            apiKeyId={selectedKey.id}
                            apiKeyName={selectedKey.name ?? "Unnamed Key"}
                            blacklist={selectedKey.metadata?.ipBlacklist ?? []}
                            onOpenChange={setIpDialogOpen}
                            onSave={handleSaveIpRestrictions}
                            open={ipDialogOpen}
                            whitelist={selectedKey.metadata?.ipWhitelist ?? []}
                        />
                    ) : null}

                    {/* Rate Limits Dialog */}
                    {selectedKey ? (
                        <RateLimitsDialog
                            apiKeyId={selectedKey.id}
                            apiKeyName={selectedKey.name ?? "Unnamed Key"}
                            currentLimits={selectedKey.metadata?.rateLimit ?? null}
                            onOpenChange={setRateLimitDialogOpen}
                            onSave={handleSaveRateLimits}
                            open={rateLimitDialogOpen}
                        />
                    ) : null}

                    {/* Scopes Dialog */}
                    {selectedKey ? (
                        <ScopesDialog
                            apiKeyId={selectedKey.id}
                            apiKeyName={selectedKey.name ?? "Unnamed Key"}
                            onOpenChange={setScopesDialogOpen}
                            onSave={handleSaveScopes}
                            open={scopesDialogOpen}
                            selectedScopes={selectedKey.metadata?.scopes ?? []}
                        />
                    ) : null}

                    {/* Key Details Dialog */}
                    <KeyDetailsDialog apiKey={selectedKey} onOpenChange={setDetailsDialogOpen} open={detailsDialogOpen} />
                </CardContent>
            </Card>
        </div>
    );
}
