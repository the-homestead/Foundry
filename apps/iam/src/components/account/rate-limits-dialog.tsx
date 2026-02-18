"use client";

import { Button } from "@foundry/ui/primitives/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@foundry/ui/primitives/dialog";
import { Input } from "@foundry/ui/primitives/input";
import { Label } from "@foundry/ui/primitives/label";
import { Switch } from "@foundry/ui/primitives/switch";
import { useState } from "react";
import { toast } from "sonner";

interface RateLimitConfig {
    requestsPerMinute?: number | null;
    requestsPerHour?: number | null;
    requestsPerDay?: number | null;
}

interface RateLimitsDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    apiKeyId: string;
    apiKeyName: string;
    currentLimits?: RateLimitConfig | null;
    onSave: (keyId: string, limits: RateLimitConfig) => void;
}

export function RateLimitsDialog({ open, onOpenChange, apiKeyId, apiKeyName, currentLimits, onSave }: RateLimitsDialogProps) {
    const [enabledMinute, setEnabledMinute] = useState(Boolean(currentLimits?.requestsPerMinute));
    const [enabledHour, setEnabledHour] = useState(Boolean(currentLimits?.requestsPerHour));
    const [enabledDay, setEnabledDay] = useState(Boolean(currentLimits?.requestsPerDay));

    const [perMinute, setPerMinute] = useState(currentLimits?.requestsPerMinute?.toString() ?? "60");
    const [perHour, setPerHour] = useState(currentLimits?.requestsPerHour?.toString() ?? "1000");
    const [perDay, setPerDay] = useState(currentLimits?.requestsPerDay?.toString() ?? "10000");

    // biome-ignore lint/complexity/noExcessiveCognitiveComplexity: <Def>
    const validateLimits = (limits: RateLimitConfig): string | null => {
        if (enabledMinute && (Number.isNaN(limits.requestsPerMinute) || (limits.requestsPerMinute ?? 0) <= 0)) {
            return "Requests per minute must be a positive number";
        }
        if (enabledHour && (Number.isNaN(limits.requestsPerHour) || (limits.requestsPerHour ?? 0) <= 0)) {
            return "Requests per hour must be a positive number";
        }
        if (enabledDay && (Number.isNaN(limits.requestsPerDay) || (limits.requestsPerDay ?? 0) <= 0)) {
            return "Requests per day must be a positive number";
        }

        // Logical validation
        if (enabledMinute && enabledHour && (limits.requestsPerMinute ?? 0) * 60 > (limits.requestsPerHour ?? 0)) {
            return "Per-minute limit exceeds per-hour limit (60 × per-minute > per-hour)";
        }
        if (enabledHour && enabledDay && (limits.requestsPerHour ?? 0) * 24 > (limits.requestsPerDay ?? 0)) {
            return "Per-hour limit exceeds per-day limit (24 × per-hour > per-day)";
        }

        return null;
    };

    const handleSave = () => {
        const limits: RateLimitConfig = {
            requestsPerMinute: enabledMinute ? Number.parseInt(perMinute, 10) || null : null,
            requestsPerHour: enabledHour ? Number.parseInt(perHour, 10) || null : null,
            requestsPerDay: enabledDay ? Number.parseInt(perDay, 10) || null : null,
        };

        const error = validateLimits(limits);
        if (error) {
            toast.error(error);
            return;
        }

        onSave(apiKeyId, limits);
        toast.success("Rate limits updated");
        onOpenChange(false);
    };

    const commonLimits = {
        free: { minute: 10, hour: 100, day: 1000 },
        basic: { minute: 60, hour: 1000, day: 10_000 },
        premium: { minute: 120, hour: 5000, day: 50_000 },
        unlimited: { minute: 1000, hour: 100_000, day: 1_000_000 },
    };

    const applyPreset = (preset: keyof typeof commonLimits) => {
        const limits = commonLimits[preset];
        setPerMinute(limits.minute.toString());
        setPerHour(limits.hour.toString());
        setPerDay(limits.day.toString());
        setEnabledMinute(true);
        setEnabledHour(true);
        setEnabledDay(true);
        toast.success(`Applied ${preset} tier limits`);
    };

    return (
        <Dialog onOpenChange={onOpenChange} open={open}>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle>Rate Limit Configuration</DialogTitle>
                    <DialogDescription>
                        Set request limits for API key: <strong>{apiKeyName}</strong>
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-6">
                    {/* Quick presets */}
                    <div className="space-y-2">
                        <Label>Quick Presets</Label>
                        <div className="flex flex-wrap gap-2">
                            <Button onClick={() => applyPreset("free")} size="sm" type="button" variant="outline">
                                Free Tier
                            </Button>
                            <Button onClick={() => applyPreset("basic")} size="sm" type="button" variant="outline">
                                Basic Tier
                            </Button>
                            <Button onClick={() => applyPreset("premium")} size="sm" type="button" variant="outline">
                                Premium Tier
                            </Button>
                            <Button onClick={() => applyPreset("unlimited")} size="sm" type="button" variant="outline">
                                Unlimited
                            </Button>
                        </div>
                    </div>

                    {/* Per-minute limit */}
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <div className="space-y-1">
                                <Label htmlFor="per-minute">Requests per Minute</Label>
                                <p className="text-muted-foreground text-sm">Maximum requests allowed in a 60-second window</p>
                            </div>
                            <Switch checked={enabledMinute} onCheckedChange={setEnabledMinute} />
                        </div>
                        {enabledMinute ? (
                            <Input id="per-minute" inputMode="numeric" onChange={(e) => setPerMinute(e.target.value)} placeholder="60" type="number" value={perMinute} />
                        ) : null}
                    </div>

                    {/* Per-hour limit */}
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <div className="space-y-1">
                                <Label htmlFor="per-hour">Requests per Hour</Label>
                                <p className="text-muted-foreground text-sm">Maximum requests allowed in a 60-minute window</p>
                            </div>
                            <Switch checked={enabledHour} onCheckedChange={setEnabledHour} />
                        </div>
                        {enabledHour ? (
                            <Input id="per-hour" inputMode="numeric" onChange={(e) => setPerHour(e.target.value)} placeholder="1000" type="number" value={perHour} />
                        ) : null}
                    </div>

                    {/* Per-day limit */}
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <div className="space-y-1">
                                <Label htmlFor="per-day">Requests per Day</Label>
                                <p className="text-muted-foreground text-sm">Maximum requests allowed in a 24-hour window</p>
                            </div>
                            <Switch checked={enabledDay} onCheckedChange={setEnabledDay} />
                        </div>
                        {enabledDay ? (
                            <Input id="per-day" inputMode="numeric" onChange={(e) => setPerDay(e.target.value)} placeholder="10000" type="number" value={perDay} />
                        ) : null}
                    </div>

                    {/* Preview */}
                    <div className="rounded-lg border bg-muted p-4">
                        <h4 className="mb-2 font-medium text-sm">Current Configuration</h4>
                        <div className="space-y-1 text-sm">
                            <p>
                                Per minute: <strong>{enabledMinute ? `${perMinute} requests` : "Unlimited"}</strong>
                            </p>
                            <p>
                                Per hour: <strong>{enabledHour ? `${perHour} requests` : "Unlimited"}</strong>
                            </p>
                            <p>
                                Per day: <strong>{enabledDay ? `${perDay} requests` : "Unlimited"}</strong>
                            </p>
                        </div>
                    </div>
                </div>

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
