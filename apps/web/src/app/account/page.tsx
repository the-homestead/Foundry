import { AccountPageClient } from "@foundry/web/components/account/account-page-client";
import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Account Settings",
};

export default function AccountPage() {
    return <AccountPageClient />;
}
