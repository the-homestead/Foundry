"use client";

import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@foundry/ui/primitives/alert-dialog";
import { Badge } from "@foundry/ui/primitives/badge";
import { Button } from "@foundry/ui/primitives/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@foundry/ui/primitives/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@foundry/ui/primitives/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@foundry/ui/primitives/dropdown-menu";
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@foundry/ui/primitives/empty";
import { Field, FieldDescription, FieldGroup, FieldLabel, FieldLegend, FieldSet } from "@foundry/ui/primitives/field";
import { Input } from "@foundry/ui/primitives/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@foundry/ui/primitives/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@foundry/ui/primitives/table";
import { MoreHorizontalIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { FieldHint } from "./field-hint";
import { API_KEY_PROFILES } from "./types/constants";
import type { ApiKeyEntry, StatusMessage } from "./types/types";
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
    const [search, setSearch] = useState("");
    const [filterProfile, setFilterProfile] = useState("all");
    const [createOpen, setCreateOpen] = useState(false);
    const [showCreatedKey, setShowCreatedKey] = useState(false);

    const profiles = API_KEY_PROFILES;
    const filteredKeys = useMemo(() => {
        const q = search.trim().toLowerCase();
        return apiKeys.filter((k) => {
            if (filterProfile !== "all" && k.metadata?.profile !== filterProfile) {
                return false;
            }
            if (!q) {
                return true;
            }
            const name = (k.name ?? "").toLowerCase();
            const prefix = (k.prefix ?? k.start ?? "").toLowerCase();
            return name.includes(q) || prefix.includes(q);
        });
    }, [apiKeys, search, filterProfile]);

    const copyPrefix = async (prefix?: string | null) => {
        if (!prefix) {
            return;
        }
        try {
            await navigator.clipboard?.writeText(prefix);
            toast.success(String(t("success.apiKeyCopied")));
        } catch {
            toast.error(String(t("apiKeys.create.copyFailed")));
        }
    };

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

    const getRelativeDays = (dateInput?: string | Date | null) => {
        if (!dateInput) {
            return "—";
        }
        const d = typeof dateInput === "string" ? new Date(dateInput) : dateInput;
        if (Number.isNaN(d.getTime())) {
            return "—";
        }
        const diffMs = d.getTime() - Date.now();
        const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));
        if (diffDays === 0) {
            return String(c("dates.today"));
        }
        if (diffDays > 0) {
            return String(t("apiKeys.list.inDays", { n: diffDays }));
        }
        return String(t("apiKeys.list.daysAgo", { n: Math.abs(diffDays) }));
    };

    return (
        <div className="grid gap-6 lg:grid-cols-12">
            <Card className="lg:col-span-12">
                <CardHeader className="text-center">
                    <CardTitle className="text-center">{t("apiKeys.list.title")}</CardTitle>
                    <CardDescription className="text-center">{t("apiKeys.list.description")}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex items-center gap-3">
                            <Input className="w-64" onChange={(e) => setSearch(e.target.value)} placeholder={String(c("placeholders.search"))} value={search} />
                            <Select onValueChange={setFilterProfile} value={filterProfile}>
                                <SelectTrigger className="w-48" id="profileFilter">
                                    <SelectValue placeholder={String(t("apiKeys.list.allProfiles"))} />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">{String(t("apiKeys.list.allProfiles"))}</SelectItem>
                                    {profiles.map((p) => (
                                        <SelectItem key={p.id} value={p.id}>
                                            {p.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <p className="text-muted-foreground text-sm">
                                {filteredKeys.length} {t("apiKeys.list.keysLabel")}
                            </p>
                        </div>
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
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>{t("apiKeys.list.columns.name")}</TableHead>
                                <TableHead>{t("apiKeys.list.columns.prefix")}</TableHead>
                                <TableHead>{t("apiKeys.list.columns.profile")}</TableHead>
                                <TableHead>{t("apiKeys.list.columns.created")}</TableHead>
                                <TableHead>{t("apiKeys.list.columns.expires")}</TableHead>
                                <TableHead>{t("apiKeys.list.columns.status")}</TableHead>
                                <TableHead className="text-right">{t("apiKeys.list.columns.actions")}</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredKeys.length === 0 ? (
                                <TableRow>
                                    <TableCell className="py-6 text-muted-foreground" colSpan={7}>
                                        <div className="py-6">
                                            <Empty>
                                                <EmptyMedia variant="default" />
                                                <EmptyHeader>
                                                    <EmptyTitle>{String(t("apiKeys.list.title"))}</EmptyTitle>
                                                    <EmptyDescription>{t("apiKeys.list.noKeys")}</EmptyDescription>
                                                    <EmptyContent>
                                                        <Button onClick={() => setCreateOpen(true)}>{t("apiKeys.create.createButton")}</Button>
                                                    </EmptyContent>
                                                </EmptyHeader>
                                            </Empty>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filteredKeys.map((key) => (
                                    <TableRow key={key.id}>
                                        <TableCell className="font-medium">{key.name || t("apiKeys.list.untitled")}</TableCell>
                                        <TableCell>{key.prefix || key.start || "—"}</TableCell>
                                        <TableCell>{getProfileLabel(key.metadata?.profile ?? null)}</TableCell>
                                        <TableCell>
                                            <div className="flex flex-col">
                                                <span className="font-mono text-sm">{formatDate(key.createdAt)}</span>
                                                <span className="text-muted-foreground text-xs">{getRelativeDays(key.createdAt)}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex flex-col">
                                                <span className="font-mono text-sm">{formatDate(key.expiresAt)}</span>
                                                <span className="text-muted-foreground text-xs">{getRelativeDays(key.expiresAt)}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            {key.enabled === false ? <Badge variant="outline">{c("fields.disabled")}</Badge> : <Badge>{c("fields.active")}</Badge>}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button aria-label={t("apiKeys.list.columns.actions")} size="sm" variant="ghost">
                                                            <MoreHorizontalIcon />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuItem onSelect={() => copyPrefix(key.prefix ?? key.start ?? null)}>
                                                            {String(c("buttons.copy"))}
                                                        </DropdownMenuItem>
                                                        <DropdownMenuSeparator />
                                                        <DropdownMenuItem data-variant="destructive" onSelect={() => setPendingRevokeId?.(key.id)}>
                                                            {t("apiKeys.list.revoke")}
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>

                    {/* Revoke confirmation modal */}
                    <AlertDialog onOpenChange={(open) => !open && setPendingRevokeId?.(null)} open={Boolean(pendingRevokeId)}>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>{t("apiKeys.list.revokeConfirmTitle")}</AlertDialogTitle>
                                <AlertDialogDescription>{t("apiKeys.list.revokeConfirmDescription")}</AlertDialogDescription>
                            </AlertDialogHeader>
                            <div className="flex items-center justify-end gap-2">
                                <AlertDialogCancel>{String(c("buttons.cancel"))}</AlertDialogCancel>
                                <AlertDialogAction
                                    onClick={() => {
                                        if (pendingRevokeId) {
                                            onDeleteApiKey(pendingRevokeId);
                                        }
                                    }}
                                >
                                    {t("apiKeys.list.revoke")}
                                </AlertDialogAction>
                            </div>
                        </AlertDialogContent>
                    </AlertDialog>
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
                </CardContent>
            </Card>
        </div>
    );
}
