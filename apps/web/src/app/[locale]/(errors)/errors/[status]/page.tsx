import { ErrorView } from "@foundry/ui/components";
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

interface Props {
    params: Promise<{ status: string }>;
}

const getStatusInfo = (t: (key: string) => string, code: number) => {
    const entries: Record<number, { title: string; message: string }> = {
        400: { title: t("400.title"), message: t("400.message") },
        401: { title: t("401.title"), message: t("401.message") },
        403: { title: t("403.title"), message: t("403.message") },
        404: { title: t("404.title"), message: t("404.message") },
        408: { title: t("408.title"), message: t("408.message") },
        429: { title: t("429.title"), message: t("429.message") },
        500: { title: t("500.title"), message: t("500.message") },
        501: { title: t("501.title"), message: t("501.message") },
        502: { title: t("502.title"), message: t("502.message") },
        503: { title: t("503.title"), message: t("503.message") },
        504: { title: t("504.title"), message: t("504.message") },
    };

    return entries[code] ?? { title: t("unknown.title"), message: t("unknown.message") };
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { status } = await params;
    const code = Number(status);
    const t = await getTranslations("ErrorStatus");
    const info = getStatusInfo(t, code);

    return {
        title: `${info.title} • ${code}`,
        description: info.message,
    };
}

export default async function StatusPage({ params }: Props) {
    const { status } = await params;
    const code = Number(status);
    const t = await getTranslations("ErrorStatus");
    const info = getStatusInfo(t, code);

    return <ErrorView message={info.message} status={code} title={info.title} />;
}
