"use client";

import { cn } from "@foundry/ui/lib/utils";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@foundry/ui/primitives/breadcrumb";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { Fragment, useMemo } from "react";

interface BreadcrumbsProps {
    className?: string;
    rootLabel?: string;
    labelMap?: Record<string, string>;
    showRootOnMobile?: boolean;
}

const formatSegment = (segment: string) => {
    const decoded = decodeURIComponent(segment);
    const normalized = decoded.replace(/[-_]+/g, " ");
    const lower = normalized.toLowerCase();

    return lower.replace(/\b\w/g, (char) => char.toUpperCase());
};

export const Breadcrumbs = ({ className, rootLabel, labelMap, showRootOnMobile = false }: BreadcrumbsProps) => {
    const t = useTranslations("common");
    const resolvedRootLabel = rootLabel ?? t("breadcrumbs.home");
    const pathname = usePathname();

    const crumbs = useMemo(() => {
        const segments = pathname.split("/").filter(Boolean);

        return segments.map((segment, index) => {
            const href = `/${segments.slice(0, index + 1).join("/")}`;
            const label = labelMap?.[segment] ?? formatSegment(segment);

            return {
                href,
                label,
                isLast: index === segments.length - 1,
            };
        });
    }, [labelMap, pathname]);

    if (crumbs.length === 0) {
        return (
            <Breadcrumb className={className}>
                <BreadcrumbList>
                    <BreadcrumbItem>
                        <BreadcrumbPage>{resolvedRootLabel}</BreadcrumbPage>
                    </BreadcrumbItem>
                </BreadcrumbList>
            </Breadcrumb>
        );
    }

    return (
        <Breadcrumb className={className}>
            <BreadcrumbList>
                <BreadcrumbItem className={cn(!showRootOnMobile && "hidden md:block")}>
                    <BreadcrumbLink asChild>
                        <Link href="/">{resolvedRootLabel}</Link>
                    </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className={cn(!showRootOnMobile && "hidden md:block")} />
                {crumbs.map((crumb) => (
                    <Fragment key={crumb.href}>
                        <BreadcrumbItem>
                            {crumb.isLast ? (
                                <BreadcrumbPage>{crumb.label}</BreadcrumbPage>
                            ) : (
                                <BreadcrumbLink asChild>
                                    <Link href={crumb.href as never}>{crumb.label}</Link>
                                </BreadcrumbLink>
                            )}
                        </BreadcrumbItem>
                        {!crumb.isLast && <BreadcrumbSeparator />}
                    </Fragment>
                ))}
            </BreadcrumbList>
        </Breadcrumb>
    );
};
