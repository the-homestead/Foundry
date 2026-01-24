import { AccountPageClient } from "@foundry/web/components/account/account-page-client";
import type { Metadata } from "next";
import { Suspense } from "react";

export const metadata: Metadata = {
    title: "Account Settings",
};

export default function AccountPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <AccountPageClient />
        </Suspense>
    );
}
