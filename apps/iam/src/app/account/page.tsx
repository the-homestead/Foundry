import { currentUserHasPassword, getLinkedAccounts } from "@foundry/iam/actions/accounts";
import { getApiKeys } from "@foundry/iam/actions/api-keys";
import { getUserPasskeys } from "@foundry/iam/actions/passkeys";
import { AccountPageClient } from "@foundry/iam/components/account/account-page-client";
import { ProfileTabShell } from "@foundry/iam/components/account/profile-tab-shell";
import type { AccountDefaults } from "@foundry/iam/components/account/types/types";
import auth from "@foundry/iam/lib/auth";
import type { Metadata } from "next";
import { headers } from "next/headers";
import { getTranslations } from "next-intl/server";
import { Suspense } from "react";

export async function generateMetadata(): Promise<Metadata> {
    const t = await getTranslations("AccountPage");

    return {
        title: t("title"),
        description: t("description"),
    };
}

async function loadInitialTabData(tab?: string | null) {
    if (tab === "apiKeys") {
        return { initialApiKeys: await getApiKeys() };
    }

    if (tab === "security") {
        const [initialPasskeys, initialLinkedAccounts, initialHasPassword] = await Promise.all([getUserPasskeys(), getLinkedAccounts(), currentUserHasPassword()]);

        return { initialPasskeys, initialLinkedAccounts, initialHasPassword };
    }

    return {};
}

export default async function AccountPage({
    searchParams,
}: {
    // Next.js 16: searchParams is async and must be awaited
    searchParams?: Promise<{ tab?: string | string[] } | undefined>;
}) {
    const t = await getTranslations("common");

    const resolvedSearchParams = searchParams ? await searchParams : undefined;
    const tab = Array.isArray(resolvedSearchParams?.tab) ? resolvedSearchParams.tab[0] : resolvedSearchParams?.tab;
    const activeTab = typeof tab === "string" && tab ? tab : "profile";

    if (activeTab === "profile") {
        // Fetch authoritative user data server-side and provide as initial values to the client wrapper
        const session = await auth.api.getSession({ headers: await headers() });
        const user = session?.user;

        const initialValues: AccountDefaults = {
            fullName: user?.name ?? "",
            username: user?.username ?? "",
            email: user?.email ?? "",
            firstName: user?.firstName ?? "",
            firstNamePublic: user?.firstNamePublic ?? false,
            lastName: user?.lastName ?? "",
            lastNamePublic: user?.lastNamePublic ?? false,
            age: user?.age != null ? String(user.age) : "",
            agePublic: user?.agePublic ?? false,
            currentPassword: "",
            newPassword: "",
            confirmPassword: "",
        };

        const avatarFallback = (user?.name || user?.email || "U").slice(0, 2).toUpperCase();

        return (
            <Suspense fallback={<div>{t("states.loading")}</div>}>
                <ProfileTabShell avatarFallback={avatarFallback} avatarUrl={user?.image ?? null} initialValues={initialValues} />
            </Suspense>
        );
    }

    // For non-profile tabs fetch authoritative data server-side so the
    // client wrapper can hydrate from a single source of truth and avoid
    // repeated server-action calls during hydration / Strict Mode.
    const { initialApiKeys, initialPasskeys, initialLinkedAccounts, initialHasPassword } = await loadInitialTabData(activeTab);

    return (
        <Suspense fallback={<div>{t("states.loading")}</div>}>
            <AccountPageClient
                initialApiKeys={initialApiKeys}
                initialHasPassword={initialHasPassword}
                initialLinkedAccounts={initialLinkedAccounts}
                initialPasskeys={initialPasskeys}
            />
        </Suspense>
    );
}
