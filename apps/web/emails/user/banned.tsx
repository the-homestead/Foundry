import { Body, Button, Container, Head, Heading, Html, Preview, Section, Tailwind, Text } from "@react-email/components";
import { createTranslator } from "next-intl";
import EMAIL_COLORS from "../colors";

type Locale = "en" | "de" | "es" | "fr" | "it" | "ja" | "ko" | "pt" | "ru" | "zh";

interface BannedProps {
    name?: string;
    locale?: Locale;
    reason?: string;
    appealUrl?: string;
}

const DEFAULT_LOCALE: Locale = "en";

export const BannedEmail = async ({ name, locale, reason, appealUrl }: BannedProps) => {
    const usedLocale: Locale = locale ?? DEFAULT_LOCALE;
    const t = createTranslator({
        messages: await import(`../../messages/${usedLocale}.json`),
        namespace: "emails",
        locale: usedLocale,
    });

    if (!name) {
        name = t("common.user");
    }

    const previewText = t("banned.preview");

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
                            {t("banned.bodyIntro")}
                        </Heading>

                        <Text className="mb-[6px] text-center text-[12px]" style={{ color: EMAIL_COLORS.mutedForeground, fontWeight: 600 }}>
                            {t("banned.reasonLabel")}
                        </Text>

                        <div
                            style={{
                                border: `1px solid ${EMAIL_COLORS.border}`,
                                padding: "12px",
                                borderRadius: 8,
                                marginBottom: 18,
                                maxWidth: 460,
                                marginLeft: "auto",
                                marginRight: "auto",
                            }}
                        >
                            <Text className="text-center text-[14px]" style={{ color: EMAIL_COLORS.foreground }}>
                                {reason ?? t("banned.noReason")}
                            </Text>
                        </div>

                        {appealUrl && (
                            <Section className="my-[8px] text-center">
                                <Button
                                    className="rounded px-5 py-3 font-medium text-[13px] no-underline"
                                    href={appealUrl}
                                    style={{ backgroundColor: EMAIL_COLORS.primary, color: EMAIL_COLORS.primaryForeground, border: `1px solid ${EMAIL_COLORS.border}` }}
                                >
                                    {t("banned.appealButton")}
                                </Button>
                            </Section>
                        )}

                        <Text className="mt-[12px] mb-[6px] text-center text-[12px]" style={{ color: EMAIL_COLORS.mutedForeground }}>
                            {t("banned.appealExplain")}
                        </Text>

                        <Text className="text-center text-[11px]" style={{ color: EMAIL_COLORS.mutedForeground }}>
                            {t("common.foundry")}
                        </Text>
                    </Container>
                </Body>
            </Tailwind>
        </Html>
    );
};

BannedEmail.PreviewProps = {
    name: "Jane",
    reason: "Violation of terms",
    appealUrl: "https://example.com/contact",
    locale: "en",
} as BannedProps;

export default BannedEmail;
