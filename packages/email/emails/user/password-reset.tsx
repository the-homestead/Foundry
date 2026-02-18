import { Body, Button, Container, Head, Heading, Html, Preview, Section, Tailwind, Text } from "@react-email/components";
import { createTranslator } from "next-intl";
import EMAIL_COLORS from "../colors";

type Locale = "en" | "de" | "es" | "fr" | "it" | "ja" | "ko" | "pt" | "ru" | "zh";

interface PasswordResetProps {
    name?: string;
    locale?: Locale;
    resetUrl?: string;
    expiresHours?: number;
}

const DEFAULT_LOCALE: Locale = "en";

export const PasswordResetEmail = async ({ name, locale, resetUrl, expiresHours }: PasswordResetProps) => {
    const usedLocale: Locale = locale ?? DEFAULT_LOCALE;
    const t = createTranslator({
        messages: await import(`../../messages/${usedLocale}.json`),
        namespace: "emails",
        locale: usedLocale,
    });

    if (!name) {
        name = t("common.user");
    }

    const previewText = t("passwordReset.preview");

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
                            {t("passwordReset.subject")}
                        </Heading>

                        <div style={{ height: 6, width: 56, backgroundColor: EMAIL_COLORS.primary, margin: "8px auto" }} />

                        <Text className="mb-[24px] text-center text-[14px]" style={{ color: EMAIL_COLORS.foreground }}>
                            {t("passwordReset.body", { name })}
                        </Text>

                        <Section className="my-[24px] text-center">
                            <Button
                                className="rounded px-5 py-3 font-medium text-[13px] no-underline"
                                href={resetUrl ?? "#"}
                                style={{ backgroundColor: EMAIL_COLORS.primary, color: EMAIL_COLORS.primaryForeground, border: `1px solid ${EMAIL_COLORS.border}` }}
                            >
                                {t("passwordReset.buttonText")}
                            </Button>
                        </Section>

                        <Text className="mb-[12px] text-center text-[13px]" style={{ color: EMAIL_COLORS.mutedForeground }}>
                            {t("passwordReset.expires", { hours: expiresHours ?? 24 })}
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

PasswordResetEmail.PreviewProps = {
    name: "Jane Doe",
    resetUrl: "https://example.com/reset?token=abc",
    locale: "en",
} as PasswordResetProps;

export default PasswordResetEmail;
