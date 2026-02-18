import { Body, Button, Container, Head, Heading, Html, Preview, Section, Tailwind, Text } from "@react-email/components";
import { createTranslator } from "next-intl";
import EMAIL_COLORS from "../colors";

type Locale = "en" | "de" | "es" | "fr" | "it" | "ja" | "ko" | "pt" | "ru" | "zh";

interface StripeInvoiceFailedProps {
    name?: string;
    locale?: Locale;
    amount?: string;
    attemptCount?: number;
    invoiceUrl?: string;
}

const DEFAULT_LOCALE: Locale = "en";

export const StripeInvoiceFailed = async ({ name, locale, amount, attemptCount, invoiceUrl }: StripeInvoiceFailedProps) => {
    const usedLocale: Locale = locale ?? DEFAULT_LOCALE;
    const t = createTranslator({
        messages: await import(`../../messages/${usedLocale}.json`),
        namespace: "emails",
        locale: usedLocale,
    });

    if (!name) {
        name = t("common.user");
    }

    const previewText = t("stripe.invoiceFailed.preview");

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
                            {t("stripe.invoiceFailed.subject")}
                        </Heading>

                        <div style={{ height: 6, width: 56, backgroundColor: EMAIL_COLORS.primary, margin: "8px auto" }} />

                        <div style={{ textAlign: "center", marginBottom: 12 }}>
                            <div style={{ fontSize: 18, fontWeight: 700, color: EMAIL_COLORS.foreground }}>{amount ?? ""}</div>
                            <div style={{ color: EMAIL_COLORS.foreground, fontSize: 13 }}>
                                {t("stripe.invoiceFailed.body", { amount: amount ?? "", attempts: attemptCount ?? 1 })}
                            </div>
                        </div>

                        {invoiceUrl && (
                            <Section className="my-[24px] text-center">
                                <Button
                                    className="rounded px-5 py-3 font-medium text-[13px] no-underline"
                                    href={invoiceUrl}
                                    style={{ backgroundColor: EMAIL_COLORS.primary, color: EMAIL_COLORS.primaryForeground, border: `1px solid ${EMAIL_COLORS.border}` }}
                                >
                                    {t("stripe.invoiceFailed.button")}
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

StripeInvoiceFailed.PreviewProps = {
    name: "Jane",
    amount: "$9.99",
    attemptCount: 2,
    invoiceUrl: "https://example.com/invoice/123",
    locale: "en",
} as StripeInvoiceFailedProps;

export default StripeInvoiceFailed;
