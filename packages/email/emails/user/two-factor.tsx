import { Body, Container, Head, Heading, Html, Preview, Tailwind, Text } from "@react-email/components";
import { createTranslator } from "next-intl";
import EMAIL_COLORS from "../colors";

type Locale = "en" | "de" | "es" | "fr" | "it" | "ja" | "ko" | "pt" | "ru" | "zh";

interface TwoFactorProps {
    name?: string;
    locale?: Locale;
    code?: string;
    expiresMinutes?: number;
}

const DEFAULT_LOCALE: Locale = "en";

export const TwoFactorEmail = async ({ name, locale, code, expiresMinutes }: TwoFactorProps) => {
    const usedLocale: Locale = locale ?? DEFAULT_LOCALE;
    const t = createTranslator({
        messages: await import(`../../messages/${usedLocale}.json`),
        namespace: "emails",
        locale: usedLocale,
    });

    if (!name) {
        name = t("common.user");
    }

    const previewText = t("twoFactor.preview");
    const OTP_LENGTH = 6;
    const otpDigits = Array.from({ length: OTP_LENGTH }, (_, i) => code?.[i] ?? "");

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
                            {t("twoFactor.subject")}
                        </Heading>

                        <div style={{ height: 6, width: 56, backgroundColor: EMAIL_COLORS.primary, margin: "8px auto" }} />

                        <Text className="mb-[24px] text-center text-[14px]" style={{ color: EMAIL_COLORS.foreground }}>
                            {t("twoFactor.body", { name })}
                        </Text>

                        <div style={{ textAlign: "center", marginBottom: 8 }}>
                            {otpDigits.map((char, idx) => (
                                <div
                                    key={`otp-${char || "empty"}-${idx}`}
                                    style={{
                                        display: "inline-block",
                                        width: 44,
                                        height: 48,
                                        lineHeight: "48px",
                                        marginLeft: idx === 0 ? 0 : 8,
                                        borderRadius: 6,
                                        border: `1px solid ${EMAIL_COLORS.border}`,
                                        color: EMAIL_COLORS.foreground,
                                        fontWeight: 700,
                                        fontSize: 20,
                                        fontFamily: "monospace",
                                        textAlign: "center",
                                    }}
                                >
                                    {char || "—"}
                                </div>
                            ))}
                        </div>

                        <Text className="mb-[12px] text-center text-[13px]" style={{ color: EMAIL_COLORS.mutedForeground }}>
                            {t("twoFactor.expires", { minutes: expiresMinutes ?? 10 })}
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

TwoFactorEmail.PreviewProps = {
    name: "Jane Doe",
    code: "123456",
    locale: "en",
} as TwoFactorProps;

export default TwoFactorEmail;
