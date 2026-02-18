import type { Locale } from "next-intl";
import { createTranslator } from "next-intl";
import ResetClient from "./[token]/reset-client";

export default async function LocalizedResetIndex({ params, searchParams }: { params: Promise<{ locale: string }>; searchParams: Promise<{ token?: string }> }) {
    const { token } = (await searchParams) ?? {};
    const { locale } = (await params) ?? {};
    if (!token) {
        const t = createTranslator({
            messages: await import(`../../../../messages/${locale ?? "en"}.json`),
            namespace: "AuthPage",
            locale: locale as Locale,
        });

        return (
            <div className="mx-auto flex w-full max-w-lg flex-col gap-6 p-8">
                <div className="p-6">
                    <h1 className="font-semibold text-2xl">{t("reset.missingTokenTitle")}</h1>
                    <p className="mt-2 text-muted-foreground text-sm">{t("reset.missingTokenDescription")}</p>
                </div>
            </div>
        );
    }

    // If a token was provided in the query string, render the same client
    // reset UI we use for the tokenized route. This avoids an extra redirect
    // (and the risk of producing '/undefined' paths) while keeping behavior
    // identical for both `/auth/reset?token=...` and `/auth/reset/:token`.
    return <ResetClient token={token} />;
}
