"use client";

import { Button } from "@foundry/ui/primitives/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@foundry/ui/primitives/dialog";
import { Input } from "@foundry/ui/primitives/input";
import { Label } from "@foundry/ui/primitives/label";
import { Textarea } from "@foundry/ui/primitives/textarea";
import { authClient } from "@foundry/web/lib/auth-client";
import { useForm } from "@tanstack/react-form";
import { zodValidator } from "@tanstack/zod-form-adapter";
import { Loader2 } from "lucide-react";
import { useEffect } from "react";
import { toast } from "sonner";
import { z } from "zod";
import type { AdminUser } from "./user-schema";

const banSchema = z.object({
    banReason: z.string().min(1, "Reason is required"),
    durationInHours: z.number().min(0).optional(),
});

interface BanDialogProps {
    user: AdminUser | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess: () => void;
}

export function BanDialog({ user, open, onOpenChange, onSuccess }: BanDialogProps) {
    const form = useForm({
        defaultValues: {
            banReason: "",
            durationInHours: undefined,
        },
        validatorAdapter: zodValidator(),
        validators: {
            onChange: banSchema,
        },
        onSubmit: async ({ value }) => {
            if (!user) {
                return;
            }
            try {
                await authClient.admin.banUser({
                    userId: user.id,
                    banReason: value.banReason,
                    banExpiresIn: value.durationInHours ? value.durationInHours * 60 * 60 : undefined,
                });
                toast.success(`User ${user.name} has been banned`);
                onOpenChange(false);
                onSuccess();
            } catch (error) {
                toast.error("Failed to ban user");
            }
        },
    });

    useEffect(() => {
        if (!open) {
            form.reset();
        }
    }, [open, form]);

    return (
        <Dialog onOpenChange={onOpenChange} open={open}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Ban User</DialogTitle>
                    <DialogDescription>Are you sure you want to ban {user?.name}? This will revoke all their sessions.</DialogDescription>
                </DialogHeader>
                <form
                    className="space-y-4"
                    onSubmit={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        form.handleSubmit();
                    }}
                >
                    <form.Field
                        children={(field) => (
                            <div className="space-y-2">
                                <Label htmlFor={field.name}>Reason</Label>
                                <Textarea
                                    id={field.name}
                                    name={field.name}
                                    onBlur={field.handleBlur}
                                    onChange={(e) => field.handleChange(e.target.value)}
                                    placeholder="Violation of terms..."
                                    value={field.state.value}
                                />
                                {field.state.meta.errors ? <p className="text-destructive text-sm">{field.state.meta.errors.join(", ")}</p> : null}
                            </div>
                        )}
                        name="banReason"
                    />

                    <form.Field
                        children={(field) => (
                            <div className="space-y-2">
                                <Label htmlFor={field.name}>Duration (Hours) - Optional</Label>
                                <Input
                                    id={field.name}
                                    min="0"
                                    name={field.name}
                                    onBlur={field.handleBlur}
                                    onChange={(e) => field.handleChange(e.target.valueAsNumber || undefined)}
                                    placeholder="Leave empty for permanent ban"
                                    type="number"
                                    value={field.state.value || ""}
                                />
                            </div>
                        )}
                        name="durationInHours"
                    />

                    <DialogFooter>
                        <Button onClick={() => onOpenChange(false)} type="button" variant="outline">
                            Cancel
                        </Button>
                        <form.Subscribe
                            children={([canSubmit, isSubmitting]) => (
                                <Button disabled={!canSubmit} type="submit" variant="destructive">
                                    {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    Ban User
                                </Button>
                            )}
                            selector={(state) => [state.canSubmit, state.isSubmitting]}
                        />
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
