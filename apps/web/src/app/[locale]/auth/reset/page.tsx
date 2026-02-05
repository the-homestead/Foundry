import { redirect } from "@foundry/web/i18n/navigation";
import type { Locale } from "next-intl";
import { createTranslator } from "next-intl";

export default async function LocalizedResetIndex({ params, searchParams }: { params: Promise<{ locale: string }>; searchParams: Promise<{ token?: string }> }) {
    const { token } = (await searchParams) ?? {};
    const { locale } = (await params) ?? {};
    if (!token) {
        const t = createTranslator({
            messages: await import("../../../../../messages/" + (locale ?? "en") + ".json"),
            namespace: "AuthPage",
            locale: locale as Locale,
        });

        return (
            <div className="mx-auto flex w-full max-w-lg flex-col gap-6 p-8">
                <div className="p-6">
                    <h1 className="text-2xl font-semibold">{t("reset.missingTokenTitle")}</h1>
                    <p className="mt-2 text-sm text-muted-foreground">{t("reset.missingTokenDescription")}</p>
                </div>
            </div>
        );
    }

    // Redirect to tokenized reset route within the same locale using
    // the project's next-intl navigation wrapper so locale prefixes
    // are applied correctly and no `any` casts are needed.
    redirect({ href: `/auth/reset/${encodeURIComponent(token)}`, locale: locale as Locale });
}
 