"use client";

import { Button } from "@foundry/ui/primitives/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@foundry/ui/primitives/card";
import { AlertTriangle, Ban, Eye, EyeOff, Filter, Shield } from "lucide-react";

export function ContentBlockingTab() {
    return (
        <div className="space-y-6">
            {/* Content Filtering */}
            <Card>
                <CardHeader>
                    <CardTitle>Content Filtering</CardTitle>
                    <CardDescription>Control what content you see across Foundry</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center justify-between rounded-lg border p-4">
                        <div className="flex items-start gap-3">
                            <Eye className="mt-1 h-5 w-5 text-muted-foreground" />
                            <div>
                                <p className="font-medium">Mature Content</p>
                                <p className="text-muted-foreground text-sm">Filter or show warnings for mature content</p>
                            </div>
                        </div>
                        <Button disabled variant="outline">
                            Configure
                        </Button>
                    </div>

                    <div className="flex items-center justify-between rounded-lg border p-4">
                        <div className="flex items-start gap-3">
                            <AlertTriangle className="mt-1 h-5 w-5 text-muted-foreground" />
                            <div>
                                <p className="font-medium">Sensitive Content</p>
                                <p className="text-muted-foreground text-sm">Hide content with sensitive themes</p>
                            </div>
                        </div>
                        <Button disabled variant="outline">
                            Configure
                        </Button>
                    </div>

                    <div className="rounded-lg bg-muted/50 p-4">
                        <p className="text-center text-muted-foreground text-sm">
                            <Filter className="mr-1 inline h-4 w-4" />
                            Content filtering system coming soon!
                        </p>
                    </div>
                </CardContent>
            </Card>

            {/* Blocked Tags */}
            <Card>
                <CardHeader>
                    <CardTitle>Blocked Tags</CardTitle>
                    <CardDescription>Hide content with specific tags</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-col items-center justify-center space-y-3 py-8">
                        <Ban className="h-12 w-12 text-muted-foreground" />
                        <p className="text-center text-muted-foreground">No blocked tags</p>
                        <p className="max-w-md text-center text-muted-foreground text-sm">Add tags to hide content you don't want to see</p>
                        <Button disabled variant="outline">
                            Add Tag
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Blocked Users */}
            <Card>
                <CardHeader>
                    <CardTitle>Blocked Users</CardTitle>
                    <CardDescription>Hide content from specific users</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-col items-center justify-center space-y-3 py-8">
                        <EyeOff className="h-12 w-12 text-muted-foreground" />
                        <p className="text-center text-muted-foreground">No blocked users</p>
                        <p className="max-w-md text-center text-muted-foreground text-sm">Block users to hide their content and prevent interactions</p>
                    </div>
                </CardContent>
            </Card>

            {/* Privacy & Safety */}
            <Card>
                <CardHeader>
                    <CardTitle>Privacy & Safety</CardTitle>
                    <CardDescription>Additional privacy and safety settings</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center justify-between rounded-lg border p-4">
                        <div className="flex items-start gap-3">
                            <Shield className="mt-1 h-5 w-5 text-muted-foreground" />
                            <div>
                                <p className="font-medium">Safe Browsing</p>
                                <p className="text-muted-foreground text-sm">Enhanced protection against potentially harmful content</p>
                            </div>
                        </div>
                        <Button disabled variant="outline">
                            Enable
                        </Button>
                    </div>

                    <div className="rounded-lg bg-muted/50 p-4">
                        <p className="text-center text-muted-foreground text-sm">
                            <Shield className="mr-1 inline h-4 w-4" />
                            Advanced safety features coming soon!
                        </p>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
