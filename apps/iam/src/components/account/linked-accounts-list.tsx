"use client";

import type { LinkedAccount } from "@foundry/database";
import { LinkSlashIcon } from "@foundry/ui/components/icons/link-slash";
import { Badge } from "@foundry/ui/primitives/badge";
import { Button } from "@foundry/ui/primitives/button";
import { useTranslations } from "next-intl";

interface LinkedAccountsListProps {
    linkedAccounts: LinkedAccount[];
    sessionAccounts: LinkedAccount[];
    loading: boolean;
    onUnlink: (providerId: string, accountId?: string) => void;
}

export default function LinkedAccountsList({ linkedAccounts, sessionAccounts, loading, onUnlink }: LinkedAccountsListProps) {
    const t = useTranslations("AccountPage");

    const list = linkedAccounts.length ? linkedAccounts : (sessionAccounts ?? []);

    if (loading) {
        return <div className="h-24 w-full animate-pulse rounded bg-muted" />;
    }

    if (!list.length) {
        return <div className="rounded-md border bg-muted/40 px-3 py-4 text-muted-foreground text-sm">{t("security.linkedAccounts.empty")}</div>;
    }

    return (
        <div className="grid gap-2">
            {list.map((acct) => (
                <div className="flex items-center justify-between gap-4 rounded-md border px-3 py-2" key={acct.id ?? acct.accountId ?? acct.providerId}>
                    <div className="flex items-center gap-3">
                        <Badge>{acct.providerId}</Badge>
                        <div>
                            <div className="font-medium">{acct.providerId}</div>
                            <div className="text-muted-foreground text-xs">{(acct as unknown as { email?: string }).email ?? acct.accountId ?? ""}</div>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button onClick={() => onUnlink(acct.providerId, acct.accountId)} type="button" variant="outline">
                            <LinkSlashIcon className="mr-2 h-4 w-4" /> {t("security.linkedAccounts.unlink")}
                        </Button>
                    </div>
                </div>
            ))}
        </div>
    );
}
