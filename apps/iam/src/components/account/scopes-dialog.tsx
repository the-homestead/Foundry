"use client";

import { Badge } from "@foundry/ui/primitives/badge";
import { Button } from "@foundry/ui/primitives/button";
import { Checkbox } from "@foundry/ui/primitives/checkbox";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@foundry/ui/primitives/dialog";
import { Input } from "@foundry/ui/primitives/input";
import { Label } from "@foundry/ui/primitives/label";
import { ScrollArea } from "@foundry/ui/primitives/scroll-area";
import { Separator } from "@foundry/ui/primitives/separator";
import { useState } from "react";
import { toast } from "sonner";

interface ScopeCategory {
    id: string;
    label: string;
    description: string;
    scopes: Scope[];
}

interface Scope {
    id: string;
    label: string;
    description: string;
    required?: boolean;
}

const AVAILABLE_SCOPES: ScopeCategory[] = [
    {
        id: "projects",
        label: "Projects",
        description: "Access to project resources",
        scopes: [
            { id: "projects:read", label: "Read Projects", description: "View project details and list projects" },
            { id: "projects:write", label: "Write Projects", description: "Create and update projects" },
            { id: "projects:delete", label: "Delete Projects", description: "Delete projects" },
            { id: "projects:deploy", label: "Deploy Projects", description: "Deploy and manage project builds" },
        ],
    },
    {
        id: "assets",
        label: "Assets",
        description: "Access to asset management",
        scopes: [
            { id: "assets:read", label: "Read Assets", description: "Download and view assets" },
            { id: "assets:write", label: "Write Assets", description: "Upload new assets" },
            { id: "assets:delete", label: "Delete Assets", description: "Remove assets" },
        ],
    },
    {
        id: "users",
        label: "Users",
        description: "User management access",
        scopes: [
            { id: "users:read", label: "Read Users", description: "View user profiles" },
            { id: "users:write", label: "Write Users", description: "Update user information" },
            { id: "users:admin", label: "User Admin", description: "Full user management access" },
        ],
    },
    {
        id: "analytics",
        label: "Analytics",
        description: "Analytics and reporting",
        scopes: [
            { id: "analytics:read", label: "Read Analytics", description: "View analytics and reports" },
            { id: "analytics:export", label: "Export Analytics", description: "Export analytics data" },
        ],
    },
    {
        id: "billing",
        label: "Billing",
        description: "Billing and subscription management",
        scopes: [
            { id: "billing:read", label: "Read Billing", description: "View billing information" },
            { id: "billing:write", label: "Write Billing", description: "Update billing and payment methods" },
        ],
    },
];

interface ScopesDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    apiKeyId: string;
    apiKeyName: string;
    selectedScopes?: string[];
    onSave: (keyId: string, scopes: string[]) => void;
}

export function ScopesDialog({ open, onOpenChange, apiKeyId, apiKeyName, selectedScopes = [], onSave }: ScopesDialogProps) {
    const [scopes, setScopes] = useState<string[]>(selectedScopes);
    const [search, setSearch] = useState("");

    const toggleScope = (scopeId: string) => {
        if (scopes.includes(scopeId)) {
            setScopes(scopes.filter((s) => s !== scopeId));
        } else {
            setScopes([...scopes, scopeId]);
        }
    };

    const toggleCategory = (category: ScopeCategory) => {
        const categoryScopes = category.scopes.map((s) => s.id);
        const allSelected = categoryScopes.every((s) => scopes.includes(s));

        if (allSelected) {
            setScopes(scopes.filter((s) => !categoryScopes.includes(s)));
        } else {
            const newScopes = [...scopes];
            for (const scopeId of categoryScopes) {
                if (!newScopes.includes(scopeId)) {
                    newScopes.push(scopeId);
                }
            }
            setScopes(newScopes);
        }
    };

    const handleSave = () => {
        if (scopes.length === 0) {
            toast.error("Please select at least one scope");
            return;
        }

        onSave(apiKeyId, scopes);
        toast.success(`Updated ${scopes.length} scopes`);
        onOpenChange(false);
    };

    const filteredCategories = AVAILABLE_SCOPES.map((category) => ({
        ...category,
        scopes: category.scopes.filter((scope) => scope.label.toLowerCase().includes(search.toLowerCase()) || scope.description.toLowerCase().includes(search.toLowerCase())),
    })).filter((category) => category.scopes.length > 0);

    const applyPreset = (preset: "readonly" | "readwrite" | "admin") => {
        const presets = {
            readonly: ["projects:read", "assets:read", "users:read", "analytics:read", "billing:read"],
            readwrite: ["projects:read", "projects:write", "assets:read", "assets:write", "users:read", "analytics:read", "billing:read"],
            admin: AVAILABLE_SCOPES.flatMap((cat) => cat.scopes.map((s) => s.id)),
        };

        setScopes(presets[preset]);
        toast.success(`Applied ${preset} preset`);
    };

    return (
        <Dialog onOpenChange={onOpenChange} open={open}>
            <DialogContent className="max-w-3xl">
                <DialogHeader>
                    <DialogTitle>Manage Scopes & Permissions</DialogTitle>
                    <DialogDescription>
                        Configure access permissions for API key: <strong>{apiKeyName}</strong>
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                    {/* Search and presets */}
                    <div className="space-y-3">
                        <Input onChange={(e) => setSearch(e.target.value)} placeholder="Search scopes..." value={search} />

                        <div className="flex flex-wrap gap-2">
                            <Button onClick={() => applyPreset("readonly")} size="sm" type="button" variant="outline">
                                Read-Only
                            </Button>
                            <Button onClick={() => applyPreset("readwrite")} size="sm" type="button" variant="outline">
                                Read-Write
                            </Button>
                            <Button onClick={() => applyPreset("admin")} size="sm" type="button" variant="outline">
                                Admin (All)
                            </Button>
                            <Button onClick={() => setScopes([])} size="sm" type="button" variant="outline">
                                Clear All
                            </Button>
                        </div>

                        <div className="flex items-center gap-2">
                            <Badge variant="secondary">
                                {scopes.length} scope{scopes.length === 1 ? "" : "s"} selected
                            </Badge>
                        </div>
                    </div>

                    {/* Scopes list */}
                    <ScrollArea className="h-100 rounded-md border p-4">
                        <div className="space-y-6">
                            {filteredCategories.map((category) => {
                                const categoryScopes = category.scopes.map((s) => s.id);
                                const allSelected = categoryScopes.every((s) => scopes.includes(s));
                                const someSelected = categoryScopes.some((s) => scopes.includes(s));

                                return (
                                    <div key={category.id}>
                                        <div className="mb-3 flex items-center justify-between">
                                            <div>
                                                <h4 className="font-medium">{category.label}</h4>
                                                <p className="text-muted-foreground text-sm">{category.description}</p>
                                            </div>
                                            <Checkbox
                                                checked={allSelected}
                                                className="data-[state=indeterminate]:bg-primary"
                                                onCheckedChange={() => toggleCategory(category)}
                                                ref={(el) => {
                                                    if (el && someSelected && !allSelected) {
                                                        el.dataset.state = "indeterminate";
                                                    }
                                                }}
                                            />
                                        </div>

                                        <div className="space-y-2 pl-4">
                                            {category.scopes.map((scope) => (
                                                <div className="flex items-start gap-3" key={scope.id}>
                                                    <Checkbox checked={scopes.includes(scope.id)} disabled={scope.required} onCheckedChange={() => toggleScope(scope.id)} />
                                                    <div className="flex-1">
                                                        <Label className="cursor-pointer font-normal" htmlFor={scope.id}>
                                                            {scope.label}
                                                            {scope.required ? <Badge className="ml-2">Required</Badge> : null}
                                                        </Label>
                                                        <p className="text-muted-foreground text-xs">{scope.description}</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>

                                        <Separator className="mt-4" />
                                    </div>
                                );
                            })}
                        </div>
                    </ScrollArea>
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
