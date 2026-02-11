import { AccountPageClient } from "@foundry/web/components/account/account-page-client";
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { Suspense } from "react";

export async function generateMetadata(): Promise<Metadata> {
    const t = await getTranslations("AccountPage");

    return {
        title: t("title"),
        description: t("description"),
    };
}

export default async function AccountPage() {
    const t = await getTranslations("common");
    return (
        <Suspense fallback={<div>{t("states.loading")}</div>}>
            <AccountPageClient />
        </Suspense>
    );
}
