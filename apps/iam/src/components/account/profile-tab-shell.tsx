"use client";

import { revalidateUserProfileTag } from "@foundry/iam/actions/profile";
import { authClient, useSession } from "@foundry/iam/lib/auth-client";
import { useForm } from "@tanstack/react-form";
import { useCallback, useEffect, useState } from "react";
import { ProfileTab } from "./profile-tab";
import { accountSchema } from "./types/schema";
import type { AccountDefaults, AccountForm, FieldErrorMap, StatusMessage } from "./types/types";
import { buildErrorMap } from "./utils";

interface ProfileTabShellProps {
    initialValues?: AccountDefaults;
    form?: AccountForm; // optional external AccountForm
    avatarFallback: string;
    avatarUrl: string | null;
    // when `form` is provided the parent manages these
    fieldErrors?: FieldErrorMap;
    formMessage?: StatusMessage | null;
    clearFieldError?: (fieldName: string) => void;
    onSubmit?: () => void;
}

export function ProfileTabShell({
    initialValues,
    form: externalForm,
    avatarFallback,
    avatarUrl,
    fieldErrors: externalFieldErrors,
    formMessage: externalFormMessage,
    clearFieldError: externalClearFieldError,
    onSubmit: externalOnSubmit,
}: ProfileTabShellProps) {
    const { refetch } = useSession();
    const isExternal = Boolean(externalForm);

    // internal-only state (used when not external)
    const [internalFieldErrors, setInternalFieldErrors] = useState<FieldErrorMap>({});
    const [internalFormMessage, setInternalFormMessage] = useState<StatusMessage | null>(null);

    const internalForm = useForm({
        defaultValues: initialValues ?? ({} as AccountDefaults),
        // biome-ignore lint/complexity/noExcessiveCognitiveComplexity: <Def>
        onSubmit: async ({ value }) => {
            setInternalFormMessage(null);
            const parsed = accountSchema.safeParse(value as unknown);
            if (!parsed.success) {
                setInternalFieldErrors(buildErrorMap(parsed.error.issues));
                return;
            }
            setInternalFieldErrors({});

            const hasPasswordChange = Boolean(parsed.data.currentPassword || parsed.data.newPassword || parsed.data.confirmPassword);

            try {
                const updateData: Record<string, string> = {};

                if (parsed.data.fullName !== undefined && parsed.data.fullName !== (initialValues?.fullName ?? "")) {
                    updateData.name = parsed.data.fullName;
                }
                if (parsed.data.username !== undefined && parsed.data.username !== (initialValues?.username ?? "")) {
                    updateData.username = parsed.data.username;
                }
                if (parsed.data.email && parsed.data.email !== (initialValues?.email ?? "")) {
                    updateData.email = parsed.data.email;
                }
                if (parsed.data.firstName !== undefined && parsed.data.firstName !== (initialValues?.firstName ?? "")) {
                    updateData.firstName = parsed.data.firstName;
                }
                if (parsed.data.lastName !== undefined && parsed.data.lastName !== (initialValues?.lastName ?? "")) {
                    updateData.lastName = parsed.data.lastName;
                }
                if (parsed.data.age !== undefined && parsed.data.age !== (initialValues?.age ?? "") && String(parsed.data.age).trim() !== "") {
                    updateData.age = String(parsed.data.age);
                }
                if (typeof parsed.data.firstNamePublic === "boolean" && parsed.data.firstNamePublic !== (initialValues?.firstNamePublic ?? false)) {
                    updateData.firstNamePublic = String(parsed.data.firstNamePublic);
                }
                if (typeof parsed.data.lastNamePublic === "boolean" && parsed.data.lastNamePublic !== (initialValues?.lastNamePublic ?? false)) {
                    updateData.lastNamePublic = String(parsed.data.lastNamePublic);
                }
                if (typeof parsed.data.agePublic === "boolean" && parsed.data.agePublic !== (initialValues?.agePublic ?? false)) {
                    updateData.agePublic = String(parsed.data.agePublic);
                }

                if (Object.keys(updateData).length === 0 && !hasPasswordChange) {
                    return;
                }

                const result = await authClient.updateUser(updateData);
                if (result?.error) {
                    setInternalFormMessage({ type: "error", message: result.error.message ?? "Failed to save profile" });
                    return;
                }

                try {
                    await revalidateUserProfileTag();
                } catch (err) {
                    console.error("revalidateUserProfileTag failed:", err);
                }

                if (parsed.data.newPassword && parsed.data.currentPassword) {
                    const passwordResult = await authClient.changePassword({
                        currentPassword: parsed.data.currentPassword,
                        newPassword: parsed.data.newPassword,
                    });
                    if (passwordResult?.error) {
                        setInternalFormMessage({ type: "error", message: passwordResult.error.message ?? "Failed to change password" });
                        return;
                    }
                }

                setInternalFormMessage({ type: "success", message: "Account updated" });
                try {
                    await refetch();
                } catch (err) {
                    console.error("session refetch failed:", err);
                }
            } catch (err) {
                console.error(err);
                setInternalFormMessage({ type: "error", message: "Save failed" });
            }
        },
    });

    useEffect(() => {
        if (!isExternal && initialValues) {
            internalForm.reset(initialValues);
        }
    }, [initialValues, internalForm, isExternal]);

    const clearFieldError = useCallback(
        (fieldName: string) => {
            if (isExternal && externalClearFieldError) {
                externalClearFieldError(fieldName);
                return;
            }

            setInternalFieldErrors((prev) => {
                if (!prev[fieldName]) {
                    return prev;
                }
                const copy: FieldErrorMap = { ...prev };
                delete copy[fieldName];
                return copy;
            });
        },
        [isExternal, externalClearFieldError]
    );

    const handleSubmit = useCallback(() => {
        if (isExternal && externalOnSubmit) {
            externalOnSubmit();
            return;
        }
        internalForm.handleSubmit();
    }, [isExternal, externalOnSubmit, internalForm]);

    const form = externalForm ?? internalForm;
    const effectiveFieldErrors = isExternal ? (externalFieldErrors ?? {}) : internalFieldErrors;
    const effectiveFormMessage = isExternal ? (externalFormMessage ?? null) : internalFormMessage;

    return (
        <ProfileTab
            avatarFallback={avatarFallback}
            avatarUrl={avatarUrl}
            clearFieldError={clearFieldError}
            fieldErrors={effectiveFieldErrors}
            form={form}
            formMessage={effectiveFormMessage}
            onSubmit={handleSubmit}
        />
    );
}
