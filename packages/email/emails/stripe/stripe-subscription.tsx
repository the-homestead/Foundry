import { Body, Button, Container, Head, Heading, Html, Preview, Section, Tailwind, Text } from "@react-email/components";
import { createTranslator } from "next-intl";
import EMAIL_COLORS from "../colors";

type Locale = "en" | "de" | "es" | "fr" | "it" | "ja" | "ko" | "pt" | "ru" | "zh";

interface StripeSubscriptionProps {
    name?: string;
    locale?: Locale;
    plan?: string;
    startDate?: string;
    manageUrl?: string;
}

const DEFAULT_LOCALE: Locale = "en";

export const StripeSubscription = async ({ name, locale, plan, startDate, manageUrl }: StripeSubscriptionProps) => {
    const usedLocale: Locale = locale ?? DEFAULT_LOCALE;
    const t = createTranslator({
        messages: await import(`../../messages/${usedLocale}.json`),
        namespace: "emails",
        locale: usedLocale,
    });

    if (!name) {
        name = t("common.user");
    }

    const previewText = t("stripe.subscription.preview");

    return (
        <Html>
            <Head />
            <Preview>{previewText}</Preview>

            <Tailwind>
                <Body className="mx-auto my-auto px-2 font-sans" style={{ backgroundColor: EMAIL_COLORS.background }}>
                    <Container
                        className="mx-auto my-[40px] max-w-[580px] rounded p-[32px]"
                        style={{ backgroundColor: EMAIL_COLORS.card, border: `1px solid ${EMAIL_COLORS.border}` }}
                    >
                        <Heading className="mx-0 mb-[8px] text-center font-semibold text-[22px]" style={{ color: EMAIL_COLORS.foreground }}>
                            {t("stripe.subscription.subject")}
                        </Heading>

                        <div style={{ height: 6, width: 56, backgroundColor: EMAIL_COLORS.primary, margin: "8px auto" }} />

                        <div style={{ textAlign: "center", marginBottom: 12 }}>
                            <div style={{ fontSize: 16, fontWeight: 700, color: EMAIL_COLORS.foreground }}>{plan ?? ""}</div>
                            <div style={{ color: EMAIL_COLORS.foreground, fontSize: 13 }}>{t("stripe.subscription.body", { plan: plan ?? "", startDate: startDate ?? "" })}</div>
                        </div>

                        {manageUrl && (
                            <Section className="my-[24px] text-center">
                                <Button
                                    className="rounded px-5 py-3 font-medium text-[13px] no-underline"
                                    href={manageUrl}
                                    style={{ backgroundColor: EMAIL_COLORS.primary, color: EMAIL_COLORS.primaryForeground, border: `1px solid ${EMAIL_COLORS.border}` }}
                                >
                                    {t("stripe.subscription.manageButton")}
                                </Button>
                            </Section>
                        )}

                        <Text className="text-center text-[11px]" style={{ color: EMAIL_COLORS.mutedForeground }}>
                            {t("common.foundry")}
                        </Text>
                    </Container>
                </Body>
            </Tailwind>
        </Html>
    );
};

StripeSubscription.PreviewProps = {
    name: "Jane",
    plan: "Pro",
    startDate: "Jan 1, 2026",
    manageUrl: "https://example.com/billing",
    locale: "en",
} as StripeSubscriptionProps;

export default StripeSubscription;
