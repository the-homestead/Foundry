import { Body, Container, Head, Heading, Html, Preview, Tailwind, Text } from "@react-email/components";
import { createTranslator } from "next-intl";
import EMAIL_COLORS from "../colors";

type Locale = "en" | "de" | "es" | "fr" | "it" | "ja" | "ko" | "pt" | "ru" | "zh";

interface RecoveryCodesProps {
    name?: string;
    locale?: Locale;
    codes?: string[];
}

const DEFAULT_LOCALE: Locale = "en";

export const RecoveryCodes = async ({ name, locale, codes }: RecoveryCodesProps) => {
    const usedLocale: Locale = locale ?? DEFAULT_LOCALE;
    const t = createTranslator({ messages: await import(`../../messages/${usedLocale}.json`), namespace: "emails", locale: usedLocale });

    if (!name) {
        name = t("common.user");
    }
    const previewText = t("recoveryCodes.preview");

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
                            {t("recoveryCodes.subject")}
                        </Heading>

                        <div style={{ height: 6, width: 56, backgroundColor: EMAIL_COLORS.primary, margin: "8px auto" }} />

                        <Text className="mb-[12px] text-center text-[14px]" style={{ color: EMAIL_COLORS.foreground }}>
                            {t("recoveryCodes.body")}
                        </Text>

                        <div style={{ textAlign: "center", margin: "12px 0" }}>
                            <div
                                style={{
                                    fontFamily: "monospace",
                                    display: "inline-block",
                                    padding: 12,
                                    borderRadius: 8,
                                    border: `1px solid ${EMAIL_COLORS.border}`,
                                    backgroundColor: "rgba(255,255,255,0.02)",
                                    color: EMAIL_COLORS.foreground,
                                }}
                            >
                                {(codes ?? []).map((c, i) => (
                                    <div key={`code-${i}`} style={{ marginBottom: 6 }}>
                                        {c}
                                    </div>
                                ))}
                            </div>
                        </div>

                        <Text className="text-center text-[11px]" style={{ color: EMAIL_COLORS.mutedForeground }}>
                            {t("common.foundry")}
                        </Text>
                    </Container>
                </Body>
            </Tailwind>
        </Html>
    );
};

RecoveryCodes.PreviewProps = { name: "Jane", codes: ["ABCD-1234", "EFGH-5678", "IJKL-9012"], locale: "en" } as RecoveryCodesProps;

export default RecoveryCodes;
