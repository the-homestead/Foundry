"use client";

import { Badge } from "@foundry/ui/primitives/badge";
import { Button } from "@foundry/ui/primitives/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@foundry/ui/primitives/dialog";
import { Separator } from "@foundry/ui/primitives/separator";
import { Copy } from "lucide-react";
import { toast } from "sonner";
import type { ApiKeyEntry } from "./types/types";
import { formatDate, getProfileLabel } from "./utils";

interface DetailRowProps {
    label: string;
    value: string | number | null | undefined;
    copyable?: boolean;
}

function DetailRow({ label, value, copyable }: DetailRowProps) {
    const copyToClipboard = async (text: string, label: string) => {
        try {
            await navigator.clipboard.writeText(text);
            toast.success(`${label} copied to clipboard`);
        } catch {
            toast.error("Failed to copy to clipboard");
        }
    };

    return (
        <div className="flex items-center justify-between py-2">
            <span className="text-muted-foreground text-sm">{label}</span>
            <div className="flex items-center gap-2">
                <span className="font-mono text-sm">{value ?? "—"}</span>
                {copyable && value ? (
                    <Button onClick={() => copyToClipboard(String(value), label)} size="sm" type="button" variant="ghost">
                        <Copy className="h-3 w-3" />
                    </Button>
                ) : null}
            </div>
        </div>
    );
}

interface KeyDetailsDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    apiKey: ApiKeyEntry | null;
    onEdit?: () => void;
}

export function KeyDetailsDialog({ open, onOpenChange, apiKey, onEdit }: KeyDetailsDialogProps) {
    if (!apiKey) {
        return null;
    }

    return (
        <Dialog onOpenChange={onOpenChange} open={open}>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle>{apiKey.name || "Untitled API Key"}</DialogTitle>
                    <DialogDescription>Complete details for this API key</DialogDescription>
                </DialogHeader>

                <div className="space-y-6">
                    {/* Basic Information */}
                    <div>
                        <h3 className="mb-3 font-semibold text-sm">Basic Information</h3>
                        <div className="divide-y rounded-md border">
                            <DetailRow copyable label="Key ID" value={apiKey.id} />
                            <DetailRow label="Name" value={apiKey.name} />
                            <DetailRow copyable label="Prefix" value={apiKey.prefix ?? apiKey.start} />
                            <DetailRow label="Profile" value={getProfileLabel(apiKey.metadata?.profile ?? null)} />
                            <div className="flex items-center justify-between px-3 py-2">
                                <span className="text-muted-foreground text-sm">Status</span>
                                {apiKey.enabled === false ? <Badge variant="outline">Disabled</Badge> : <Badge>Active</Badge>}
                            </div>
                        </div>
                    </div>

                    {/* Dates */}
                    <div>
                        <h3 className="mb-3 font-semibold text-sm">Dates</h3>
                        <div className="divide-y rounded-md border">
                            <DetailRow label="Created" value={formatDate(apiKey.createdAt)} />
                            <DetailRow label="Expires" value={formatDate(apiKey.expiresAt)} />
                            <DetailRow label="Last Used" value={formatDate(apiKey.lastUsedAt) || "Never"} />
                        </div>
                    </div>

                    {/* Usage Statistics */}
                    <div>
                        <h3 className="mb-3 font-semibold text-sm">Usage Statistics</h3>
                        <div className="divide-y rounded-md border">
                            <DetailRow label="Total Requests" value={(apiKey.usageCount ?? 0).toLocaleString()} />
                            <DetailRow label="Remaining Requests" value={apiKey.remaining ? apiKey.remaining.toLocaleString() : "Unlimited"} />
                            <div className="flex items-center justify-between px-3 py-2">
                                <span className="text-muted-foreground text-sm">Rate Limiting</span>
                                {apiKey.rateLimitEnabled ? <Badge variant="secondary">Enabled</Badge> : <Badge variant="outline">Disabled</Badge>}
                            </div>
                        </div>
                    </div>

                    {/* Tags */}
                    {apiKey.tags && apiKey.tags.length > 0 ? (
                        <div>
                            <h3 className="mb-3 font-semibold text-sm">Tags</h3>
                            <div className="flex flex-wrap gap-2">
                                {apiKey.tags.map((tag) => (
                                    <Badge key={tag} variant="secondary">
                                        {tag}
                                    </Badge>
                                ))}
                            </div>
                        </div>
                    ) : null}

                    {/* IP Restrictions */}
                    {(apiKey.metadata?.ipWhitelist?.length ?? 0) > 0 || (apiKey.metadata?.ipBlacklist?.length ?? 0) > 0 ? (
                        <div>
                            <h3 className="mb-3 font-semibold text-sm">IP Restrictions</h3>
                            <div className="space-y-3">
                                {apiKey.metadata?.ipWhitelist && apiKey.metadata.ipWhitelist.length > 0 ? (
                                    <div>
                                        <p className="mb-2 text-muted-foreground text-xs">Whitelisted IPs ({apiKey.metadata.ipWhitelist.length})</p>
                                        <div className="max-h-32 space-y-1 overflow-y-auto rounded-md border bg-muted p-2">
                                            {apiKey.metadata.ipWhitelist.map((ip) => (
                                                <code className="block text-xs" key={ip}>
                                                    {ip}
                                                </code>
                                            ))}
                                        </div>
                                    </div>
                                ) : null}

                                {apiKey.metadata?.ipBlacklist && apiKey.metadata.ipBlacklist.length > 0 ? (
                                    <div>
                                        <p className="mb-2 text-muted-foreground text-xs">Blacklisted IPs ({apiKey.metadata.ipBlacklist.length})</p>
                                        <div className="max-h-32 space-y-1 overflow-y-auto rounded-md border bg-muted p-2">
                                            {apiKey.metadata.ipBlacklist.map((ip) => (
                                                <code className="block text-xs" key={ip}>
                                                    {ip}
                                                </code>
                                            ))}
                                        </div>
                                    </div>
                                ) : null}
                            </div>
                        </div>
                    ) : null}

                    {/* Rate Limits */}
                    {apiKey.metadata?.rateLimit ? (
                        <div>
                            <h3 className="mb-3 font-semibold text-sm">Rate Limits</h3>
                            <div className="divide-y rounded-md border">
                                <DetailRow label="Per Minute" value={apiKey.metadata.rateLimit.requestsPerMinute ?? "Unlimited"} />
                                <DetailRow label="Per Hour" value={apiKey.metadata.rateLimit.requestsPerHour ?? "Unlimited"} />
                                <DetailRow label="Per Day" value={apiKey.metadata.rateLimit.requestsPerDay ?? "Unlimited"} />
                            </div>
                        </div>
                    ) : null}

                    {/* Scopes */}
                    {apiKey.metadata?.scopes && apiKey.metadata.scopes.length > 0 ? (
                        <div>
                            <h3 className="mb-3 font-semibold text-sm">Scopes ({apiKey.metadata.scopes.length})</h3>
                            <div className="max-h-48 space-y-1 overflow-y-auto rounded-md border p-3">
                                {apiKey.metadata.scopes.map((scope) => (
                                    <Badge className="mr-1 mb-1" key={scope} variant="outline">
                                        {scope}
                                    </Badge>
                                ))}
                            </div>
                        </div>
                    ) : null}
                </div>

                <Separator />

                <div className="flex justify-end gap-2">
                    <Button onClick={() => onOpenChange(false)} type="button" variant="outline">
                        Close
                    </Button>
                    {onEdit ? (
                        <Button onClick={onEdit} type="button">
                            Edit Settings
                        </Button>
                    ) : null}
                </div>
            </DialogContent>
        </Dialog>
    );
}
