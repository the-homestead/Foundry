import { Body, Button, Container, Head, Heading, Html, Preview, Section, Tailwind, Text } from "@react-email/components";
import { createTranslator } from "next-intl";
import EMAIL_COLORS from "../colors";

type Locale = "en" | "de" | "es" | "fr" | "it" | "ja" | "ko" | "pt" | "ru" | "zh";

interface VerifyEmailProps {
    name?: string;
    locale?: Locale;
    verifyUrl?: string;
}

const DEFAULT_LOCALE: Locale = "en";

export const VerifyEmail = async ({ name, locale, verifyUrl }: VerifyEmailProps) => {
    const usedLocale: Locale = locale ?? DEFAULT_LOCALE;
    const t = createTranslator({
        messages: await import(`../../messages/${usedLocale}.json`),
        namespace: "emails",
        locale: usedLocale,
    });

    if (!name) {
        name = t("common.user");
    }

    const previewText = t("verifyEmail.preview");

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
                            {t("verifyEmail.subject")}
                        </Heading>

                        <div style={{ height: 6, width: 56, backgroundColor: EMAIL_COLORS.primary, margin: "8px auto" }} />

                        <Text className="mb-[24px] text-center text-[14px]" style={{ color: EMAIL_COLORS.foreground }}>
                            {t("verifyEmail.body", { name })}
                        </Text>

                        <Section className="my-[24px] text-center">
                            <Button
                                className="rounded px-5 py-3 font-medium text-[13px] no-underline"
                                href={verifyUrl ?? "#"}
                                style={{ backgroundColor: EMAIL_COLORS.primary, color: EMAIL_COLORS.primaryForeground, border: `1px solid ${EMAIL_COLORS.border}` }}
                            >
                                {t("verifyEmail.buttonText")}
                            </Button>
                        </Section>

                        <Text className="text-center text-[11px]" style={{ color: EMAIL_COLORS.mutedForeground }}>
                            {t("common.foundry")}
                        </Text>
                    </Container>
                </Body>
            </Tailwind>
        </Html>
    );
};

VerifyEmail.PreviewProps = {
    name: "Jane Doe",
    verifyUrl: "https://example.com/verify?token=abc",
    locale: "en",
} as VerifyEmailProps;

export default VerifyEmail;
