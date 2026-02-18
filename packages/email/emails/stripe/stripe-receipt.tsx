import { Body, Button, Column, Container, Head, Heading, Hr, Html, Preview, Row, Section, Tailwind, Text } from "@react-email/components";
import { createTranslator } from "next-intl";
import EMAIL_COLORS from "../colors";

type Locale = "en" | "de" | "es" | "fr" | "it" | "ja" | "ko" | "pt" | "ru" | "zh";

interface LineItem {
    description: string;
    amount: string;
    quantity?: number;
}

interface Customer {
    name?: string;
    email?: string;
    address?: string[];
}

interface StripeReceiptProps {
    name?: string;
    locale?: Locale;
    description?: string; // fallback single-line description
    amount?: string; // fallback single amount
    invoiceId?: string;
    invoiceDate?: string;
    customer?: Customer;
    items?: LineItem[];
    subtotal?: string;
    tax?: string;
    total?: string;
    receiptUrl?: string;
}

const DEFAULT_LOCALE: Locale = "en";

export const StripeReceipt = async ({ name, locale, description, amount, invoiceId, invoiceDate, customer, items, subtotal, tax, total, receiptUrl }: StripeReceiptProps) => {
    const usedLocale: Locale = locale ?? DEFAULT_LOCALE;
    const t = createTranslator({
        messages: await import(`../../messages/${usedLocale}.json`),
        namespace: "emails",
        locale: usedLocale,
    });

    if (!name) {
        name = t("common.user");
    }

    const previewText = t("stripe.receipt.preview");

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
                            {t("stripe.receipt.subject")}
                        </Heading>

                        <div style={{ height: 6, width: 56, backgroundColor: EMAIL_COLORS.primary, margin: "8px auto" }} />

                        {/* Invoice and customer header */}
                        <Section className="mt-[18px]">
                            <Row>
                                <Column>
                                    {invoiceId && (
                                        <Text className="text-[12px]" style={{ color: EMAIL_COLORS.mutedForeground }}>
                                            {t("stripe.invoice.invoiceIdLabel")}: {invoiceId}
                                        </Text>
                                    )}
                                    {invoiceDate && (
                                        <Text className="text-[12px]" style={{ color: EMAIL_COLORS.mutedForeground }}>
                                            {t("stripe.invoice.invoiceDateLabel")}: {invoiceDate}
                                        </Text>
                                    )}
                                </Column>

                                <Column align="right">
                                    {customer && (
                                        <div style={{ textAlign: "right" }}>
                                            <Text className="text-[13px]" style={{ color: EMAIL_COLORS.mutedForeground }}>
                                                {t("stripe.invoice.billedToLabel")}
                                            </Text>
                                            <Text className="text-[14px]" style={{ color: EMAIL_COLORS.foreground }}>
                                                {customer.name ?? ""}
                                            </Text>
                                            {customer.email && (
                                                <Text className="text-[12px]" style={{ color: EMAIL_COLORS.mutedForeground }}>
                                                    {customer.email}
                                                </Text>
                                            )}
                                            {customer?.address?.map((line, i) => (
                                                <Text className="text-[12px]" key={`addr-${line?.replace(/\s+/g, "-")}-${i}`} style={{ color: EMAIL_COLORS.mutedForeground }}>
                                                    {line}
                                                </Text>
                                            ))}
                                        </div>
                                    )}
                                </Column>
                            </Row>
                        </Section>

                        {/* Line items */}
                        {items && items.length > 0 ? (
                            <Section className="mt-[18px]">
                                {items.map((it, idx) => (
                                    <Row key={`item-${it.description.replace(/\s+/g, "-")}-${idx}`} style={{ paddingTop: idx === 0 ? 0 : 8 }}>
                                        <Column>
                                            <Text className="text-[14px]" style={{ color: EMAIL_COLORS.foreground }}>
                                                {it.description}
                                            </Text>
                                            {it.quantity && (
                                                <Text className="text-[12px]" style={{ color: EMAIL_COLORS.mutedForeground }}>
                                                    {t("stripe.invoice.quantityLabel")}: {it.quantity}
                                                </Text>
                                            )}
                                        </Column>
                                        <Column align="right">
                                            <Text className="text-[14px]" style={{ color: EMAIL_COLORS.foreground }}>
                                                {it.amount}
                                            </Text>
                                        </Column>
                                    </Row>
                                ))}
                            </Section>
                        ) : (
                            <Section className="mt-[18px]">
                                <Row>
                                    <Column>
                                        <Text className="text-[13px]" style={{ color: EMAIL_COLORS.mutedForeground }}>
                                            {t("stripe.receipt.itemLabel")}
                                        </Text>
                                        <Text className="text-[14px]" style={{ color: EMAIL_COLORS.foreground }}>
                                            {description ?? ""}
                                        </Text>
                                    </Column>
                                    <Column align="right">
                                        <Text className="font-semibold text-[14px]" style={{ color: EMAIL_COLORS.foreground }}>
                                            {total ?? amount ?? ""}
                                        </Text>
                                    </Column>
                                </Row>
                            </Section>
                        )}

                        <Hr className="my-[18px]" style={{ borderColor: EMAIL_COLORS.border }} />

                        <Section>
                            <Row>
                                <Column>
                                    {subtotal && (
                                        <Text className="text-[12px]" style={{ color: EMAIL_COLORS.mutedForeground }}>
                                            {t("stripe.invoice.subtotalLabel")}: {subtotal}
                                        </Text>
                                    )}
                                    {tax && (
                                        <Text className="text-[12px]" style={{ color: EMAIL_COLORS.mutedForeground }}>
                                            {t("stripe.invoice.taxLabel")}: {tax}
                                        </Text>
                                    )}
                                </Column>
                                <Column align="right">
                                    <Text className="font-semibold text-[18px]" style={{ color: EMAIL_COLORS.foreground }}>
                                        {total ?? subtotal ?? amount ?? ""}
                                    </Text>
                                </Column>
                            </Row>
                        </Section>

                        {receiptUrl && (
                            <Section className="my-[24px] text-center">
                                <Button
                                    className="rounded px-5 py-3 font-medium text-[13px] no-underline"
                                    href={receiptUrl}
                                    style={{ backgroundColor: EMAIL_COLORS.primary, color: EMAIL_COLORS.primaryForeground, border: `1px solid ${EMAIL_COLORS.border}` }}
                                >
                                    {t("stripe.receipt.button")}
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

StripeReceipt.PreviewProps = {
    name: "Jane",
    invoiceId: "INV-20260128-001",
    invoiceDate: "Jan 28, 2026",
    customer: { name: "Jane Doe", email: "jane@example.com", address: ["123 Main St", "City, ST 12345"] },
    items: [
        { description: "Pro Subscription (Monthly)", amount: "$9.99", quantity: 1 },
        { description: "Extra storage", amount: "$1.00", quantity: 1 },
    ],
    subtotal: "$10.99",
    tax: "$0.88",
    total: "$11.87",
    receiptUrl: "https://example.com/receipt/123",
    locale: "en",
} as StripeReceiptProps;

export default StripeReceipt;
