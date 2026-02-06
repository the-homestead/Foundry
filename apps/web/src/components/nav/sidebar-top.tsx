"use client";

import { Separator } from "@foundry/ui/primitives/separator";
import { SidebarTrigger } from "@foundry/ui/primitives/sidebar";
import { useTranslations } from "next-intl";
import { Breadcrumbs } from "./breadcrumbs";

export default function SidebarTop() {
    const t = useTranslations("common");

    return (
        <header className="flex h-16 shrink-0 items-center gap-2">
            <div className="flex items-center gap-2 px-4">
                <SidebarTrigger className="-ml-1" />
                <Separator className="mr-2 data-[orientation=vertical]:h-4" orientation="vertical" />
                <Breadcrumbs rootLabel={t("breadcrumbs.home")} />
            </div>
        </header>
    );
}
