import { Body, Button, Container, Head, Heading, Hr, Html, Preview, Section, Tailwind, Text } from "@react-email/components";
import { createTranslator } from "next-intl";
import EMAIL_COLORS from "../colors";

type Locale = "en" | "de" | "es" | "fr" | "it" | "ja" | "ko" | "pt" | "ru" | "zh";

interface WelcomeEmailProps {
    name?: string;
    locale?: Locale;
}

const DEFAULT_LOCALE: Locale = "en";

export const WelcomeEmail = async ({ name, locale }: WelcomeEmailProps) => {
    const previewText = "Welcome to Acme";
    const usedLocale: Locale = locale ?? DEFAULT_LOCALE;
    const t = createTranslator({
        messages: await import(`../../messages/${usedLocale}.json`),
        namespace: "emails",
        locale: usedLocale,
    });

    if (!name) {
        name = t("common.user");
    }

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
                        {/* Header */}

                        <Heading className="mx-0 mb-[8px] text-center font-semibold text-[22px]" style={{ color: EMAIL_COLORS.foreground }}>
                            {t("welcome.subject", { name })}
                        </Heading>
                        <div style={{ height: 6, width: 56, backgroundColor: EMAIL_COLORS.primary, margin: "8px auto" }} />

                        <Text className="mb-[24px] text-center text-[14px]" style={{ color: EMAIL_COLORS.mutedForeground }}>
                            We’re glad you’re here.
                        </Text>

                        <Text className="mb-[24px] text-center text-[15px] leading-[24px]" style={{ color: EMAIL_COLORS.foreground }}>
                            {t("welcome.body")}
                        </Text>

                        {/* CTA */}
                        <Section className="my-[24px] text-center">
                            <Button
                                className="rounded px-5 py-3 font-medium text-[13px] no-underline"
                                href="https://example.com/dashboard"
                                style={{ backgroundColor: EMAIL_COLORS.primary, color: EMAIL_COLORS.primaryForeground, border: `1px solid ${EMAIL_COLORS.border}` }}
                            >
                                {t("welcome.buttonText")}
                            </Button>
                        </Section>

                        <Hr className="my-[28px]" style={{ borderColor: EMAIL_COLORS.muted }} />

                        {/* Footer */}
                        <Text className="text-center text-[13px] leading-[22px]" style={{ color: EMAIL_COLORS.mutedForeground }}>
                            {t("welcome.questions")}
                        </Text>

                        <Text className="mt-[32px] text-center text-[11px]" style={{ color: EMAIL_COLORS.mutedForeground }}>
                            {t("common.foundry")}
                        </Text>
                    </Container>
                </Body>
            </Tailwind>
        </Html>
    );
};

WelcomeEmail.PreviewProps = {
    name: "John Lennon",
    locale: "en",
} as WelcomeEmailProps;

export default WelcomeEmail;
