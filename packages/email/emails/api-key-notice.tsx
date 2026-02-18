import { Body, Button, Container, Head, Heading, Html, Preview, Section, Tailwind, Text } from "@react-email/components";
import { createTranslator } from "next-intl";
import EMAIL_COLORS from "./colors";

type Locale = "en" | "de" | "es" | "fr" | "it" | "ja" | "ko" | "pt" | "ru" | "zh";

interface ApiKeyNoticeProps {
    name?: string;
    locale?: Locale;
    action?: "created" | "updated" | "deleted";
    keyName?: string;
    prefix?: string;
    keyValue?: string; // only shown at creation
    manageUrl?: string;
}

const DEFAULT_LOCALE: Locale = "en";

export const ApiKeyNotice = async ({ name, locale, action = "created", keyName, prefix, keyValue, manageUrl }: ApiKeyNoticeProps) => {
    const usedLocale: Locale = locale ?? DEFAULT_LOCALE;
    const t = createTranslator({
        messages: await import(`../messages/${usedLocale}.json`),
        namespace: "emails",
        locale: usedLocale,
    });

    if (!name) {
        name = t("common.user");
    }

    const previewText = t("apiKey.preview", { action });

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
                            {t("apiKey.subject", { action })}
                        </Heading>

                        <div style={{ height: 6, width: 56, backgroundColor: EMAIL_COLORS.primary, margin: "8px auto" }} />

                        <Text className="mb-[12px] text-center text-[14px]" style={{ color: EMAIL_COLORS.foreground }}>
                            {t("apiKey.body", { action, name, keyName: keyName ?? t("apiKey.untitled") })}
                        </Text>

                        {prefix && (
                            <div style={{ textAlign: "center", marginBottom: 8 }}>
                                <span
                                    style={{
                                        display: "inline-block",
                                        padding: "6px 10px",
                                        borderRadius: 9999,
                                        border: `1px solid ${EMAIL_COLORS.border}`,
                                        color: EMAIL_COLORS.mutedForeground,
                                        fontSize: 13,
                                    }}
                                >
                                    {t("apiKey.prefix", { prefix })}
                                </span>
                            </div>
                        )}

                        {action === "created" && keyValue && (
                            <div style={{ textAlign: "center", marginBottom: 12 }}>
                                <div
                                    style={{
                                        fontFamily: "monospace",
                                        padding: "10px 14px",
                                        borderRadius: 8,
                                        border: `1px solid ${EMAIL_COLORS.border}`,
                                        display: "inline-block",
                                        color: EMAIL_COLORS.foreground,
                                        backgroundColor: "rgba(255,255,255,0.02)",
                                    }}
                                >
                                    {keyValue}
                                </div>
                                <Text className="mt-[8px] text-center text-[13px]" style={{ color: EMAIL_COLORS.mutedForeground }}>
                                    {t("apiKey.createdNote")}
                                </Text>
                            </div>
                        )}

                        {manageUrl && (
                            <Section className="my-[24px] text-center">
                                <Button
                                    className="rounded px-5 py-3 font-medium text-[13px] no-underline"
                                    href={manageUrl}
                                    style={{ backgroundColor: EMAIL_COLORS.primary, color: EMAIL_COLORS.primaryForeground, border: `1px solid ${EMAIL_COLORS.border}` }}
                                >
                                    {t("apiKey.manageButton")}
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

ApiKeyNotice.PreviewProps = {
    name: "Jane",
    action: "created",
    keyName: "Integration Key",
    prefix: "sk_",
    keyValue: "sk_test_51H...REDACTED",
    manageUrl: "https://example.com/settings/api-keys",
    locale: "en",
} as ApiKeyNoticeProps;

export default ApiKeyNotice;
