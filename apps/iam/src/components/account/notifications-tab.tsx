"use client";

import { getUserNotificationSettings, updateUserNotificationSettings } from "@foundry/iam/actions/notifications";
import { Button } from "@foundry/ui/primitives/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@foundry/ui/primitives/card";
import { Switch } from "@foundry/ui/primitives/switch";
import { Bell, Check, Download, Package } from "lucide-react";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { toast } from "sonner";

interface Prefs {
    emailSecurity: boolean;
    emailAccountUpdates: boolean;
    emailOrganization: boolean;
    emailApiKey: boolean;
    emailMarketing: boolean;
}

export function NotificationsTab() {
    const t = useTranslations("AccountPage");
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [prefs, setPrefs] = useState<Prefs | null>(null);

    useEffect(() => {
        let mounted = true;
        (async () => {
            try {
                const data = await getUserNotificationSettings();
                if (!mounted) {
                    return;
                }
                setPrefs({
                    emailSecurity: data.emailSecurity,
                    emailAccountUpdates: data.emailAccountUpdates,
                    emailOrganization: data.emailOrganization,
                    emailApiKey: data.emailApiKey,
                    emailMarketing: data.emailMarketing,
                });
            } catch (err) {
                console.error("Failed to load notification settings:", err);
            } finally {
                if (mounted) {
                    setLoading(false);
                }
            }
        })();
        return () => {
            mounted = false;
        };
    }, []);

    const toggle = async (key: keyof Prefs, value: boolean) => {
        if (!prefs) {
            return;
        }
        // security-related prefs are read-only in the UI
        if (key === "emailSecurity" || key === "emailAccountUpdates") {
            return;
        }

        const optimistic = { ...prefs, [key]: value };
        setPrefs(optimistic);
        setSaving(true);

        try {
            await updateUserNotificationSettings({
                // only send the user-controllable fields
                emailOrganization: optimistic.emailOrganization,
                emailApiKey: optimistic.emailApiKey,
                emailMarketing: optimistic.emailMarketing,
            });

            toast.success("Notification preferences updated");
        } catch (err) {
            console.error("Failed to update notification settings:", err);
            // revert
            setPrefs(prefs);
            toast.error("Failed to save preferences");
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="space-y-6">
            {/* Notification Preferences */}
            <Card>
                <CardHeader>
                    <CardTitle>{t("tabs.notifications")}</CardTitle>
                    <CardDescription>Manage how you receive notifications</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center justify-between rounded-lg border p-4">
                        <div className="flex items-start gap-3">
                            <Bell className="mt-1 h-5 w-5 text-muted-foreground" />
                            <div>
                                <p className="font-medium">Email Notifications</p>
                                <p className="text-muted-foreground text-sm">Receive updates about your projects and account</p>
                            </div>
                        </div>
                        <div>
                            <Button disabled={loading || saving} variant="outline">
                                {loading ? "Loading..." : saving ? "Saving..." : "Save"}
                            </Button>
                        </div>
                    </div>

                    {/* Security (read-only) */}
                    <div className="grid gap-3">
                        <div className="flex items-center justify-between rounded-lg border p-4">
                            <div>
                                <p className="font-medium">Security emails</p>
                                <p className="text-muted-foreground text-sm">Critical alerts (password reset, 2FA) — always enabled</p>
                            </div>
                            <Switch checked={prefs?.emailSecurity ?? true} disabled />
                        </div>

                        <div className="flex items-center justify-between rounded-lg border p-4">
                            <div>
                                <p className="font-medium">Account update emails</p>
                                <p className="text-muted-foreground text-sm">Important changes to your account — cannot be disabled</p>
                            </div>
                            <Switch checked={prefs?.emailAccountUpdates ?? true} disabled />
                        </div>
                    </div>

                    {/* Optional preferences */}
                    <div className="grid gap-3">
                        <div className="flex items-center justify-between rounded-lg border p-4">
                            <div>
                                <p className="font-medium">Organization emails</p>
                                <p className="text-muted-foreground text-sm">Invites and organization updates</p>
                            </div>
                            <Switch checked={prefs?.emailOrganization ?? true} disabled={loading} onCheckedChange={(v) => toggle("emailOrganization", Boolean(v))} />
                        </div>

                        <div className="flex items-center justify-between rounded-lg border p-4">
                            <div>
                                <p className="font-medium">API key emails</p>
                                <p className="text-muted-foreground text-sm">Notifies when API keys are created, updated or revoked</p>
                            </div>
                            <Switch checked={prefs?.emailApiKey ?? true} disabled={loading} onCheckedChange={(v) => toggle("emailApiKey", Boolean(v))} />
                        </div>

                        <div className="flex items-center justify-between rounded-lg border p-4">
                            <div>
                                <p className="font-medium">Marketing emails</p>
                                <p className="text-muted-foreground text-sm">Product announcements and promotions</p>
                            </div>
                            <Switch checked={prefs?.emailMarketing ?? false} disabled={loading} onCheckedChange={(v) => toggle("emailMarketing", Boolean(v))} />
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Recent Notifications (example UI) */}
            <Card>
                <CardHeader>
                    <CardTitle>Recent Notifications</CardTitle>
                    <CardDescription>View your latest updates and alerts</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-3">
                        {/* Mock notification items */}
                        <div className="flex items-start gap-3 rounded-lg border p-4 opacity-60">
                            <Package className="mt-1 h-5 w-5 text-blue-500" />
                            <div className="flex-1">
                                <p className="font-medium">Project Update Available</p>
                                <p className="text-muted-foreground text-sm">New version of "Fallout 4 Mod" has been uploaded</p>
                                <p className="text-muted-foreground text-xs">2 hours ago</p>
                            </div>
                            <Check className="h-4 w-4 text-muted-foreground" />
                        </div>

                        <div className="flex items-start gap-3 rounded-lg border p-4 opacity-60">
                            <Download className="mt-1 h-5 w-5 text-green-500" />
                            <div className="flex-1">
                                <p className="font-medium">Download Complete</p>
                                <p className="text-muted-foreground text-sm">Your requested mod pack has been prepared</p>
                                <p className="text-muted-foreground text-xs">1 day ago</p>
                            </div>
                            <Check className="h-4 w-4 text-muted-foreground" />
                        </div>

                        <div className="rounded-lg bg-muted/50 p-4">
                            <p className="text-center text-muted-foreground text-sm">
                                <Bell className="mr-1 inline h-4 w-4" />
                                These are example notifications. Real notification system coming soon!
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Project Subscriptions */}
            <Card>
                <CardHeader>
                    <CardTitle>Project Subscriptions</CardTitle>
                    <CardDescription>Projects you're following for updates</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-col items-center justify-center space-y-3 py-8">
                        <Package className="h-12 w-12 text-muted-foreground" />
                        <p className="text-center text-muted-foreground">No project subscriptions yet</p>
                        <p className="max-w-md text-center text-muted-foreground text-sm">Subscribe to projects to receive notifications about updates and new releases</p>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
