import { redirect } from "@foundry/web/i18n/navigation";
import { auth } from "@foundry/web/lib/auth";
import type { Metadata } from "next";
import { headers } from "next/headers";
import { getTranslations } from "next-intl/server";
import AdminClient from "./admin-client";

interface Props {
    params: Promise<{ locale: string }>;
}

export async function generateMetadata(): Promise<Metadata> {
    const t = await getTranslations("AdminPage");

    return {
        title: t("title"),
        description: t("description"),
    };
}

export default async function AdminPage({ params }: Props) {
    const { locale } = await params;
    const session = await auth.api.getSession({
        headers: await headers(),
    });

    if (!session?.user) {
        redirect({ href: "/auth/login", locale });
    }

    const adminUserIds = (process.env.ADMIN_USER_IDS ?? "")
        .split(",")
        .map((value) => value.trim())
        .filter(Boolean);

    const user = session.user as Record<string, unknown>;
    const roleValue = user.role;
    const rolesValue = user.roles;
    const roles = new Set<string>();

    if (typeof roleValue === "string") {
        roles.add(roleValue);
    }
    if (Array.isArray(roleValue)) {
        for (const role of roleValue) {
            if (typeof role === "string") {
                roles.add(role);
            }
        }
    }
    if (Array.isArray(rolesValue)) {
        for (const role of rolesValue) {
            if (typeof role === "string") {
                roles.add(role);
            }
        }
    }

    const isAdmin = adminUserIds.includes(String(user.id ?? ""));

    if (!isAdmin) {
        redirect({ href: "/errors/403", locale });
    }

    return <AdminClient />;
}
