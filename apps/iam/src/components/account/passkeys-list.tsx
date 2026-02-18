"use client";

import { LinkSlashIcon } from "@foundry/ui/components/icons/link-slash";
import { Badge } from "@foundry/ui/primitives/badge";
import { Button } from "@foundry/ui/primitives/button";
import { FieldDescription } from "@foundry/ui/primitives/field";
import { useTranslations } from "next-intl";

export interface Passkey {
    id: string;
    name?: string | null;
    authenticatorAttachment?: string | null;
    createdAt?: string | Date | null;
    created_at?: string | Date | null;
}

interface PasskeysListProps {
    passkeys: Passkey[];
    loading: boolean;
    actionMessage?: { type: "error" | "success"; message: string } | null;
    onAdd: () => Promise<void> | void;
    onRefresh: () => Promise<void> | void;
    onRemove: (id: string) => Promise<void> | void;
}

export default function PasskeysList({ passkeys, loading, actionMessage, onAdd, onRefresh, onRemove }: PasskeysListProps) {
    const t = useTranslations("AccountPage");

    return (
        <>
            <div className="flex flex-wrap items-center gap-2">
                <Button disabled={loading} onClick={onAdd} type="button">
                    {t("security.passkeys.addButton")}
                </Button>
                <Button onClick={onRefresh} type="button" variant="outline">
                    {t("security.refresh")}
                </Button>
            </div>

            {actionMessage ? (
                <FieldDescription className={actionMessage.type === "error" ? "text-destructive" : "text-emerald-500"}>{actionMessage.message}</FieldDescription>
            ) : null}

            {/* content area (avoid nested ternaries for readability/lint) */}
            {(() => {
                if (loading) {
                    return <div className="h-12 w-full animate-pulse rounded bg-muted" />;
                }

                if (passkeys.length) {
                    return (
                        <div className="grid gap-2">
                            {passkeys.map((pk) => (
                                <div className="flex items-center justify-between gap-4 rounded-md border px-3 py-2" key={pk.id}>
                                    <div className="flex items-center gap-3">
                                        <Badge>{pk.authenticatorAttachment ?? "auth"}</Badge>
                                        <div>
                                            <div className="font-medium">{pk.name ?? pk.id}</div>
                                            <div className="text-muted-foreground text-xs">{new Date(pk.createdAt ?? pk.created_at ?? Date.now()).toLocaleString()}</div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Button onClick={() => onRemove(pk.id)} type="button" variant="outline">
                                            <LinkSlashIcon className="mr-2 h-4 w-4" /> {t("security.passkeys.remove")}
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    );
                }

                return <div className="rounded-md border bg-muted/40 px-3 py-4 text-muted-foreground text-sm">{t("security.passkeys.empty")}</div>;
            })()}
        </>
    );
}
