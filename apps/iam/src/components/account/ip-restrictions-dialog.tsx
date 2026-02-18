"use client";

import { Badge } from "@foundry/ui/primitives/badge";
import { Button } from "@foundry/ui/primitives/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@foundry/ui/primitives/dialog";
import { Input } from "@foundry/ui/primitives/input";
import { Label } from "@foundry/ui/primitives/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@foundry/ui/primitives/tabs";
import { Textarea } from "@foundry/ui/primitives/textarea";
import { X } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

// IPv4 pattern
const IPV4_PATTERN = /^(\d{1,3}\.){3}\d{1,3}(\/\d{1,2})?$/;
// IPv6 pattern (simplified)
const IPV6_PATTERN = /^([0-9a-fA-F]{0,4}:){2,7}[0-9a-fA-F]{0,4}(\/\d{1,3})?$/;

interface IpRestrictionsDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    apiKeyId: string;
    apiKeyName: string;
    whitelist?: string[];
    blacklist?: string[];
    onSave: (keyId: string, whitelist: string[], blacklist: string[]) => void;
}

export function IpRestrictionsDialog({ open, onOpenChange, apiKeyId, apiKeyName, whitelist = [], blacklist = [], onSave }: IpRestrictionsDialogProps) {
    const [whitelistIps, setWhitelistIps] = useState<string[]>(whitelist);
    const [blacklistIps, setBlacklistIps] = useState<string[]>(blacklist);
    const [newIp, setNewIp] = useState("");

    const validateIp = (ip: string): boolean => {
        if (IPV4_PATTERN.test(ip)) {
            const parts = ip.split("/")[0]?.split(".");
            if (!parts) {
                return false;
            }
            return parts.every((part) => Number.parseInt(part, 10) <= 255);
        }

        return IPV6_PATTERN.test(ip);
    };

    const addIp = (type: "whitelist" | "blacklist") => {
        const trimmedIp = newIp.trim();
        if (!trimmedIp) {
            toast.error("Please enter an IP address");
            return;
        }

        if (!validateIp(trimmedIp)) {
            toast.error("Invalid IP address format. Use IPv4 (e.g., 192.168.1.1) or IPv6, optionally with CIDR notation (/24)");
            return;
        }

        if (type === "whitelist") {
            if (whitelistIps.includes(trimmedIp)) {
                toast.error("IP already in whitelist");
                return;
            }
            setWhitelistIps([...whitelistIps, trimmedIp]);
        } else {
            if (blacklistIps.includes(trimmedIp)) {
                toast.error("IP already in blacklist");
                return;
            }
            setBlacklistIps([...blacklistIps, trimmedIp]);
        }

        setNewIp("");
        toast.success(`Added ${trimmedIp} to ${type}`);
    };

    const removeIp = (ip: string, type: "whitelist" | "blacklist") => {
        if (type === "whitelist") {
            setWhitelistIps(whitelistIps.filter((i) => i !== ip));
        } else {
            setBlacklistIps(blacklistIps.filter((i) => i !== ip));
        }
        toast.success(`Removed ${ip} from ${type}`);
    };

    const bulkAddIps = (ips: string, type: "whitelist" | "blacklist") => {
        const lines = ips
            .split("\n")
            .map((line) => line.trim())
            .filter((line) => line.length > 0);

        const validIps: string[] = [];
        const invalidIps: string[] = [];

        for (const ip of lines) {
            if (validateIp(ip)) {
                validIps.push(ip);
            } else {
                invalidIps.push(ip);
            }
        }

        if (invalidIps.length > 0) {
            toast.error(`${invalidIps.length} invalid IP(s): ${invalidIps.slice(0, 3).join(", ")}${invalidIps.length > 3 ? "..." : ""}`);
        }

        if (validIps.length > 0) {
            if (type === "whitelist") {
                const newIps = validIps.filter((ip) => !whitelistIps.includes(ip));
                setWhitelistIps([...whitelistIps, ...newIps]);
                toast.success(`Added ${newIps.length} IP(s) to whitelist`);
            } else {
                const newIps = validIps.filter((ip) => !blacklistIps.includes(ip));
                setBlacklistIps([...blacklistIps, ...newIps]);
                toast.success(`Added ${newIps.length} IP(s) to blacklist`);
            }
        }
    };

    const handleSave = () => {
        onSave(apiKeyId, whitelistIps, blacklistIps);
        toast.success("IP restrictions updated");
        onOpenChange(false);
    };

    return (
        <Dialog onOpenChange={onOpenChange} open={open}>
            <DialogContent className="max-w-3xl">
                <DialogHeader>
                    <DialogTitle>IP Restrictions</DialogTitle>
                    <DialogDescription>
                        Manage IP whitelist and blacklist for API key: <strong>{apiKeyName}</strong>
                    </DialogDescription>
                </DialogHeader>

                <Tabs className="w-full" defaultValue="whitelist">
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="whitelist">
                            Whitelist
                            {whitelistIps.length > 0 ? <Badge className="ml-2">{whitelistIps.length}</Badge> : null}
                        </TabsTrigger>
                        <TabsTrigger value="blacklist">
                            Blacklist
                            {blacklistIps.length > 0 ? <Badge className="ml-2">{blacklistIps.length}</Badge> : null}
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent className="space-y-4" value="whitelist">
                        <div className="space-y-2">
                            <Label htmlFor="whitelist-ip">Add IP Address</Label>
                            <div className="flex gap-2">
                                <Input
                                    id="whitelist-ip"
                                    onChange={(e) => setNewIp(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === "Enter") {
                                            addIp("whitelist");
                                        }
                                    }}
                                    placeholder="192.168.1.1 or 192.168.1.0/24"
                                    value={newIp}
                                />
                                <Button onClick={() => addIp("whitelist")} type="button">
                                    Add
                                </Button>
                            </div>
                            <p className="text-muted-foreground text-sm">Only requests from these IPs will be allowed. Leave empty to allow all IPs.</p>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="whitelist-bulk">Bulk Add (one IP per line)</Label>
                            <Textarea
                                id="whitelist-bulk"
                                onBlur={(e) => {
                                    if (e.target.value.trim()) {
                                        bulkAddIps(e.target.value, "whitelist");
                                        e.target.value = "";
                                    }
                                }}
                                placeholder="192.168.1.1&#10;10.0.0.0/8&#10;172.16.0.0/12"
                                rows={4}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label>Whitelisted IPs ({whitelistIps.length})</Label>
                            <div className="max-h-48 space-y-1 overflow-y-auto rounded-md border p-2">
                                {whitelistIps.length === 0 ? (
                                    <p className="text-center text-muted-foreground text-sm">No IPs whitelisted</p>
                                ) : (
                                    whitelistIps.map((ip) => (
                                        <div className="flex items-center justify-between rounded bg-muted p-2" key={ip}>
                                            <code className="text-sm">{ip}</code>
                                            <Button onClick={() => removeIp(ip, "whitelist")} size="sm" type="button" variant="ghost">
                                                <X className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </TabsContent>

                    <TabsContent className="space-y-4" value="blacklist">
                        <div className="space-y-2">
                            <Label htmlFor="blacklist-ip">Add IP Address</Label>
                            <div className="flex gap-2">
                                <Input
                                    id="blacklist-ip"
                                    onChange={(e) => setNewIp(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === "Enter") {
                                            addIp("blacklist");
                                        }
                                    }}
                                    placeholder="192.168.1.1 or 192.168.1.0/24"
                                    value={newIp}
                                />
                                <Button onClick={() => addIp("blacklist")} type="button">
                                    Add
                                </Button>
                            </div>
                            <p className="text-muted-foreground text-sm">Requests from these IPs will be blocked.</p>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="blacklist-bulk">Bulk Add (one IP per line)</Label>
                            <Textarea
                                id="blacklist-bulk"
                                onBlur={(e) => {
                                    if (e.target.value.trim()) {
                                        bulkAddIps(e.target.value, "blacklist");
                                        e.target.value = "";
                                    }
                                }}
                                placeholder="192.168.1.100&#10;10.0.0.0/8"
                                rows={4}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label>Blacklisted IPs ({blacklistIps.length})</Label>
                            <div className="max-h-48 space-y-1 overflow-y-auto rounded-md border p-2">
                                {blacklistIps.length === 0 ? (
                                    <p className="text-center text-muted-foreground text-sm">No IPs blacklisted</p>
                                ) : (
                                    blacklistIps.map((ip) => (
                                        <div className="flex items-center justify-between rounded bg-muted p-2" key={ip}>
                                            <code className="text-sm">{ip}</code>
                                            <Button onClick={() => removeIp(ip, "blacklist")} size="sm" type="button" variant="ghost">
                                                <X className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </TabsContent>
                </Tabs>

                <div className="flex justify-end gap-2">
                    <Button onClick={() => onOpenChange(false)} type="button" variant="outline">
                        Cancel
                    </Button>
                    <Button onClick={handleSave} type="button">
                        Save Changes
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
