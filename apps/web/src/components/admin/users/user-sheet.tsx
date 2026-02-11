"use client";

import { Button } from "@foundry/ui/primitives/button";
import { Input } from "@foundry/ui/primitives/input";
import { Label } from "@foundry/ui/primitives/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@foundry/ui/primitives/select";
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle } from "@foundry/ui/primitives/sheet";
import { uploadAvatar } from "@foundry/web/actions/avatar";
import { authClient } from "@foundry/web/lib/auth-client";
import { useForm } from "@tanstack/react-form";
import { zodValidator } from "@tanstack/zod-form-adapter";
import { Loader2, Upload } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { type UserFormValues, userFormSchema } from "./user-schema";

interface UserSheetProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    user?: (UserFormValues & { id: string }) | null;
    onSuccess: () => void;
}

export function UserSheet({ open, onOpenChange, user, onSuccess }: UserSheetProps) {
    const isEditing = !!user;
    const [isUploading, setIsUploading] = useState(false);

    const form = useForm({
        defaultValues: {
            name: user?.name ?? "",
            email: user?.email ?? "",
            role: user?.role ?? "user",
            password: "",
            image: user?.image ?? "",
        } as UserFormValues,
        validatorAdapter: zodValidator(),
        validators: {
            onChange: userFormSchema,
        },
        onSubmit: async ({ value }) => {
            try {
                if (isEditing) {
                    await authClient.admin.updateUser({
                        userId: user.id,
                        data: {
                            name: value.name,
                            role: value.role,
                            image: value.image || undefined,
                        },
                    });

                    if (value.password) {
                        await authClient.admin.setUserPassword({
                            userId: user.id,
                            newPassword: value.password,
                        });
                    }

                    toast.success("User updated successfully");
                } else {
                    if (!value.password) {
                        form.setErrorMap({
                            onServer: { password: "Password is required for new users" },
                        });
                        return;
                    }
                    await authClient.admin.createUser({
                        name: value.name,
                        email: value.email,
                        password: value.password,
                        role: value.role,
                        data: {
                            image: value.image || undefined,
                        },
                    });
                    toast.success("User created successfully");
                }
                onOpenChange(false);
                onSuccess();
            } catch (error) {
                toast.error(isEditing ? "Failed to update user" : "Failed to create user");
                console.error(error);
            }
        },
    });

    // Reset form when user changes
    useMemo(() => {
        if (open) {
            form.reset({
                name: user?.name ?? "",
                email: user?.email ?? "",
                role: user?.role ?? "user",
                password: "",
                image: user?.image ?? "",
            });
        }
    }, [open, user, form]);

    return (
        <Sheet onOpenChange={onOpenChange} open={open}>
            <SheetContent className="p-6 sm:max-w-[425px]">
                <SheetHeader>
                    <SheetTitle>{isEditing ? "Edit User" : "Create User"}</SheetTitle>
                    <SheetDescription>{isEditing ? "Make changes to the user account here." : "Add a new user to the system."}</SheetDescription>
                </SheetHeader>
                <form
                    className="space-y-4 pt-4"
                    onSubmit={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        form.handleSubmit();
                    }}
                >
                    <form.Field
                        children={(field) => (
                            <div className="space-y-2">
                                <Label htmlFor={field.name}>Name</Label>
                                <Input
                                    id={field.name}
                                    name={field.name}
                                    onBlur={field.handleBlur}
                                    onChange={(e) => field.handleChange(e.target.value)}
                                    placeholder="John Doe"
                                    value={field.state.value}
                                />
                                {field.state.meta.errors ? <p className="text-destructive text-sm">{field.state.meta.errors.join(", ")}</p> : null}
                            </div>
                        )}
                        name="name"
                    />

                    <form.Field
                        children={(field) => (
                            <div className="space-y-2">
                                <Label htmlFor={field.name}>Email</Label>
                                <Input
                                    disabled={isEditing}
                                    id={field.name}
                                    name={field.name}
                                    onBlur={field.handleBlur}
                                    onChange={(e) => field.handleChange(e.target.value)}
                                    placeholder="john@example.com"
                                    value={field.state.value}
                                />
                                {field.state.meta.errors ? <p className="text-destructive text-sm">{field.state.meta.errors.join(", ")}</p> : null}
                            </div>
                        )}
                        name="email"
                    />

                    <form.Field
                        children={(field) => (
                            <div className="space-y-2">
                                <Label htmlFor={field.name}>Role</Label>
                                <Select onValueChange={field.handleChange} value={field.state.value}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select a role" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="user">User</SelectItem>
                                        <SelectItem value="admin">Admin</SelectItem>
                                    </SelectContent>
                                </Select>
                                {field.state.meta.errors ? <p className="text-destructive text-sm">{field.state.meta.errors.join(", ")}</p> : null}
                            </div>
                        )}
                        name="role"
                    />

                    <form.Field
                        children={(field) => (
                            <div className="space-y-2">
                                <Label htmlFor={field.name}>{isEditing ? "New Password (Optional)" : "Password"}</Label>
                                <Input
                                    id={field.name}
                                    name={field.name}
                                    onBlur={field.handleBlur}
                                    onChange={(e) => field.handleChange(e.target.value)}
                                    placeholder={isEditing ? "Leave blank to keep current" : "Secure password"}
                                    type="password"
                                    value={field.state.value || ""}
                                />
                                {field.state.meta.errors ? <p className="text-destructive text-sm">{field.state.meta.errors.join(", ")}</p> : null}
                            </div>
                        )}
                        name="password"
                    />

                    <form.Field
                        children={(field) => (
                            <div className="space-y-2">
                                <Label htmlFor={field.name}>Avatar URL</Label>
                                <div className="flex gap-2">
                                    <Input
                                        className="flex-1"
                                        id={field.name}
                                        name={field.name}
                                        onBlur={field.handleBlur}
                                        onChange={(e) => field.handleChange(e.target.value)}
                                        placeholder="https://example.com/avatar.jpg"
                                        value={field.state.value || ""}
                                    />
                                    {isEditing && (
                                        <>
                                            <input
                                                accept="image/*"
                                                className="hidden"
                                                id="avatar-upload"
                                                onChange={async (e) => {
                                                    const file = e.target.files?.[0];
                                                    if (!file) {
                                                        return;
                                                    }
                                                    if (!user?.id) {
                                                        return;
                                                    }
                                                    setIsUploading(true);
                                                    try {
                                                        const formData = new FormData();
                                                        formData.append("file", file);
                                                        const url = await uploadAvatar(formData, user.id);
                                                        field.handleChange(url);
                                                        toast.success("Avatar uploaded");
                                                    } catch (err) {
                                                        toast.error("Upload failed");
                                                        console.error(err);
                                                    } finally {
                                                        setIsUploading(false);
                                                    }
                                                }}
                                                type="file"
                                            />
                                            <Button
                                                disabled={isUploading}
                                                onClick={() => document.getElementById("avatar-upload")?.click()}
                                                size="icon"
                                                type="button"
                                                variant="outline"
                                            >
                                                {isUploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                                                <span className="sr-only">Upload</span>
                                            </Button>
                                        </>
                                    )}
                                </div>
                                {field.state.meta.errors ? <p className="text-destructive text-sm">{field.state.meta.errors.join(", ")}</p> : null}
                            </div>
                        )}
                        name="image"
                    />

                    <SheetFooter className="mt-4">
                        <form.Subscribe
                            children={([canSubmit, isSubmitting]) => (
                                <Button disabled={!canSubmit} type="submit">
                                    {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    {isEditing ? "Update User" : "Create User"}
                                </Button>
                            )}
                            selector={(state) => [state.canSubmit, state.isSubmitting]}
                        />
                    </SheetFooter>
                </form>
            </SheetContent>
        </Sheet>
    );
}
