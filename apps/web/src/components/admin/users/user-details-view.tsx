"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@foundry/ui/primitives/avatar";
import { Badge } from "@foundry/ui/primitives/badge";
import { Button } from "@foundry/ui/primitives/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@foundry/ui/primitives/card";
import { Input } from "@foundry/ui/primitives/input";
import { Label } from "@foundry/ui/primitives/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@foundry/ui/primitives/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@foundry/ui/primitives/tabs";
import { uploadAvatar } from "@foundry/web/actions/avatar";
import { authClient } from "@foundry/web/lib/auth-client";
import { Ban as BanIcon, Check, Filter, FolderKanban, Loader2, Pencil, Search, Shield, Upload, X } from "lucide-react";
import { useRouter } from "next/navigation";
// biome-ignore lint/performance/noNamespaceImport: <React>
import * as React from "react";
import { toast } from "sonner";
import { BanDialog } from "./ban-dialog";
import type { AdminUser } from "./user-schema";

interface EditableFieldProps {
    label: string;
    value: string;
    onSave: (value: string) => Promise<void>;
}

function EditableField({ label, value, onSave }: EditableFieldProps) {
    const [isEditing, setIsEditing] = React.useState(false);
    const [tempValue, setTempValue] = React.useState(value);
    const [isLoading, setIsLoading] = React.useState(false);

    // Update tempValue if prop changes externally
    React.useEffect(() => {
        setTempValue(value);
    }, [value]);

    const handleSave = async () => {
        if (tempValue === value) {
            setIsEditing(false);
            return;
        }
        setIsLoading(true);
        try {
            await onSave(tempValue);
            setIsEditing(false);
            toast.success(`${label} updated`);
        } catch (_error) {
            toast.error(`Failed to update ${label}`);
            setTempValue(value); // Revert
        } finally {
            setIsLoading(false);
        }
    };

    const handleCancel = () => {
        setTempValue(value);
        setIsEditing(false);
    };

    if (isEditing) {
        return (
            <div className="space-y-2">
                <Label>{label}</Label>
                <div className="flex items-center gap-2">
                    <Input
                        autoFocus
                        onChange={(e) => setTempValue(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === "Enter") {
                                handleSave();
                            }
                            if (e.key === "Escape") {
                                handleCancel();
                            }
                        }}
                        value={tempValue}
                    />
                    <Button disabled={isLoading} onClick={handleSave} size="icon" variant="ghost">
                        {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4 text-green-500" />}
                    </Button>
                    <Button disabled={isLoading} onClick={handleCancel} size="icon" variant="ghost">
                        <X className="h-4 w-4 text-destructive" />
                    </Button>
                </div>
            </div>
        );
    }

    return (
        // biome-ignore lint/a11y/noStaticElementInteractions: <Is Interactive>
        // biome-ignore lint/a11y/noNoninteractiveElementInteractions: <Shh>
        <div className="group space-y-2" onDoubleClick={() => setIsEditing(true)}>
            <Label>{label}</Label>
            <div className="flex h-10 cursor-text items-center gap-2 rounded-md border border-transparent px-3 transition-colors hover:border-border">
                <span className="flex-1 truncate">{value}</span>
                <Pencil className="h-3 w-3 opacity-0 group-hover:opacity-50" />
            </div>
        </div>
    );
}

export function UserDetailsView({ userId }: { userId: string }) {
    const [user, setUser] = React.useState<AdminUser | null>(null);
    const [loading, setLoading] = React.useState(true);
    const router = useRouter();

    // Dialog states
    const [isBanOpen, setIsBanOpen] = React.useState(false);
    const [isAvatarUploading, setIsAvatarUploading] = React.useState(false);

    const fetchUser = React.useCallback(async () => {
        setLoading(true);
        try {
            // Using listUsers with filterField="id" to fetch specific user since searchField only supports email/name
            const { data } = await authClient.admin.listUsers({
                query: {
                    limit: 1,
                    filterField: "id",
                    filterValue: userId,
                    filterOperator: "eq",
                },
            });
            if (data?.users?.[0]) {
                setUser(data.users[0] as unknown as AdminUser);
            } else {
                toast.error("User not found");
                router.push("/management/users");
            }
        } catch (error) {
            console.error(error);
            toast.error("Failed to fetch user");
        } finally {
            setLoading(false);
        }
    }, [userId, router]);

    React.useEffect(() => {
        fetchUser();
    }, [fetchUser]);

    const handleUpdate = async (field: Partial<AdminUser>) => {
        if (!user) {
            return;
        }

        await authClient.admin.updateUser({
            userId: user.id,
            data: field as any,
        });

        // Optimistic update or refetch
        fetchUser();
    };

    const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!(file && user)) {
            return;
        }

        setIsAvatarUploading(true);
        try {
            const formData = new FormData();
            formData.append("file", file);
            const url = await uploadAvatar(formData, user.id);
            await handleUpdate({ image: url });
            toast.success("Avatar updated");
        } catch (err) {
            toast.error("Failed to upload avatar");
            console.error(err);
        } finally {
            setIsAvatarUploading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center p-8">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        );
    }

    if (!user) {
        return null;
    }

    const initials = user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);

    return (
        <div className="space-y-6">
            {/* Header Section */}
            <div className="flex flex-col gap-6 md:flex-row md:items-start">
                <div className="group relative">
                    <Avatar className="h-24 w-24 rounded-xl md:h-32 md:w-32">
                        <AvatarImage alt={user.name} src={user.image ?? undefined} />
                        <AvatarFallback className="rounded-xl text-2xl">{initials}</AvatarFallback>
                    </Avatar>
                    <div className="absolute inset-0 flex items-center justify-center rounded-xl bg-black/50 opacity-0 transition-opacity group-hover:opacity-100">
                        <label className="cursor-pointer rounded-full bg-white/10 p-2 transition-colors hover:bg-white/20" htmlFor="avatar-upload">
                            {isAvatarUploading ? <Loader2 className="h-6 w-6 animate-spin text-white" /> : <Upload className="h-6 w-6 text-white" />}
                        </label>
                        <input accept="image/*" className="hidden" disabled={isAvatarUploading} id="avatar-upload" onChange={handleAvatarUpload} type="file" />
                    </div>
                </div>

                <div className="flex-1 space-y-2">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="font-bold text-3xl tracking-tight">{user.name}</h1>
                            <div className="mt-1 flex items-center gap-2 text-muted-foreground">
                                <span>ID: {user.id}</span>
                                <Badge variant={user.role === "admin" ? "default" : "secondary"}>{user.role}</Badge>
                                {user.banned && <Badge variant="destructive">Banned</Badge>}
                            </div>
                        </div>
                        <div className="flex gap-2">
                            {user.banned ? (
                                <Button
                                    onClick={async () => {
                                        await authClient.admin.unbanUser({ userId: user.id });
                                        toast.success("User unbanned");
                                        fetchUser();
                                    }}
                                >
                                    <Shield className="mr-2 h-4 w-4" /> Unban User
                                </Button>
                            ) : (
                                <Button onClick={() => setIsBanOpen(true)} variant="destructive">
                                    <BanIcon className="mr-2 h-4 w-4" /> Ban User
                                </Button>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <Tabs className="w-full" defaultValue="overview">
                <TabsList>
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="projects">Projects</TabsTrigger>
                    <TabsTrigger value="sessions">Sessions</TabsTrigger>
                </TabsList>

                <TabsContent className="mt-6 space-y-6" value="overview">
                    <div className="grid gap-6 md:grid-cols-2">
                        <Card>
                            <CardHeader>
                                <CardTitle>Profile Information</CardTitle>
                                <CardDescription>Double-click fields to edit</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <EditableField label="Display Name" onSave={(val) => handleUpdate({ name: val })} value={user.name} />
                                <EditableField label="Email Address" onSave={(val) => handleUpdate({ email: val })} value={user.email} />
                                <div className="space-y-2">
                                    <Label>User Role</Label>
                                    <div className="flex h-10 items-center gap-2 rounded-md border border-input bg-muted/50 px-3 text-muted-foreground">{user.role}</div>
                                    <p className="text-muted-foreground text-xs">Roles cannot be changed here currently.</p>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Account Status</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <Label className="text-muted-foreground">Joined On</Label>
                                        <div className="font-medium">{new Date(user.createdAt).toLocaleDateString()}</div>
                                    </div>
                                    <div>
                                        <Label className="text-muted-foreground">Status</Label>
                                        <div className="font-medium">{user.banned ? "Banned" : "Active"}</div>
                                    </div>
                                    {user.banned && (
                                        <div className="col-span-2">
                                            <Label className="text-muted-foreground">Ban Reason</Label>
                                            <div className="font-medium text-destructive">{user.banReason || "No reason provided"}</div>
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                <TabsContent className="mt-6" value="projects">
                    <Card>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <div>
                                    <CardTitle>Projects</CardTitle>
                                    <CardDescription>Projects owned or managed by this user.</CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="flex flex-col gap-4">
                                <div className="flex items-center gap-2">
                                    <div className="relative flex-1">
                                        <Search className="absolute top-2.5 left-2.5 h-4 w-4 text-muted-foreground" />
                                        <Input className="pl-9" placeholder="Filter projects..." />
                                    </div>
                                    <Select defaultValue="all">
                                        <SelectTrigger className="w-[180px]">
                                            <SelectValue placeholder="Status" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">All Statuses</SelectItem>
                                            <SelectItem value="active">Active</SelectItem>
                                            <SelectItem value="archived">Archived</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <Button size="icon" variant="outline">
                                        <Filter className="h-4 w-4" />
                                    </Button>
                                </div>
                                <div className="flex flex-col items-center justify-center rounded-lg border border-dashed bg-muted/20 py-12 text-muted-foreground">
                                    <FolderKanban className="mb-3 h-10 w-10 opacity-50" />
                                    <p>No projects found matching current filters.</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent className="mt-6" value="sessions">
                    <Card>
                        <CardHeader>
                            <CardTitle>Active Sessions</CardTitle>
                            <CardDescription>Manage user sessions.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
                                <Button
                                    onClick={async () => {
                                        await authClient.admin.revokeUserSessions({ userId: user.id });
                                        toast.success("All sessions revoked");
                                    }}
                                    variant="outline"
                                >
                                    Revoke All Sessions
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>

            <BanDialog onOpenChange={setIsBanOpen} onSuccess={fetchUser} open={isBanOpen} user={user} />
        </div>
    );
}
