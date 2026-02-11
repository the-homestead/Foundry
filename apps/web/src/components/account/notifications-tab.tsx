"use client";

import { Button } from "@foundry/ui/primitives/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@foundry/ui/primitives/card";
import { Bell, Check, Download, Package } from "lucide-react";

export function NotificationsTab() {
    return (
        <div className="space-y-6">
            {/* Notification Preferences */}
            <Card>
                <CardHeader>
                    <CardTitle>Notification Preferences</CardTitle>
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
                        <Button disabled variant="outline">
                            Configure
                        </Button>
                    </div>

                    <div className="rounded-lg bg-muted/50 p-4">
                        <p className="text-center text-muted-foreground text-sm">
                            <Bell className="mr-1 inline h-4 w-4" />
                            Notification preferences coming soon!
                        </p>
                    </div>
                </CardContent>
            </Card>

            {/* Recent Notifications */}
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
