import { Body, Button, Container, Head, Heading, Html, Preview, Section, Tailwind, Text } from "@react-email/components";
import { createTranslator } from "next-intl";
import EMAIL_COLORS from "../colors";

type Locale = "en" | "de" | "es" | "fr" | "it" | "ja" | "ko" | "pt" | "ru" | "zh";

interface AccountUpdatedProps {
    name?: string;
    locale?: Locale;
    changes?: string[];
    actionUrl?: string;
}

const DEFAULT_LOCALE: Locale = "en";

export const AccountUpdated = async ({ name, locale, changes = [], actionUrl }: AccountUpdatedProps) => {
    const usedLocale: Locale = locale ?? DEFAULT_LOCALE;
    const t = createTranslator({
        messages: await import(`../../messages/${usedLocale}.json`),
        namespace: "emails",
        locale: usedLocale,
    });

    if (!name) {
        name = t("common.user");
    }

    const previewText = t("accountUpdated.preview");

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
                            {t("accountUpdated.subject")}
                        </Heading>

                        <div style={{ height: 6, width: 56, backgroundColor: EMAIL_COLORS.primary, margin: "8px auto" }} />

                        <Text className="mb-[16px] text-center text-[14px]" style={{ color: EMAIL_COLORS.foreground }}>
                            {t("accountUpdated.body", { name })}
                        </Text>

                        {changes.length > 0 && (
                            <div style={{ textAlign: "center", marginBottom: 12 }}>
                                {changes.map((c, i) => (
                                    <span
                                        key={`chg-${i}-${c.replace(/\s+/g, "-")}`}
                                        style={{
                                            display: "inline-block",
                                            padding: "6px 10px",
                                            margin: 6,
                                            borderRadius: 9999,
                                            border: `1px solid ${EMAIL_COLORS.border}`,
                                            color: EMAIL_COLORS.foreground,
                                            fontSize: 13,
                                        }}
                                    >
                                        {c}
                                    </span>
                                ))}
                            </div>
                        )}

                        <div style={{ borderLeft: `4px solid ${EMAIL_COLORS.destructive}`, padding: "10px 12px", margin: "8px auto 16px", maxWidth: 520 }}>
                            <Text className="text-[13px]" style={{ color: EMAIL_COLORS.foreground, fontWeight: 600 }}>
                                {t("accountUpdated.alert")}
                            </Text>
                        </div>

                        <Section className="my-[24px] text-center">
                            <Button
                                className="rounded px-5 py-3 font-medium text-[13px] no-underline"
                                href={actionUrl ?? "#"}
                                style={{ backgroundColor: EMAIL_COLORS.primary, color: EMAIL_COLORS.primaryForeground, border: `1px solid ${EMAIL_COLORS.border}` }}
                            >
                                {t("accountUpdated.actionButton")}
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

AccountUpdated.PreviewProps = {
    name: "Jane",
    changes: ["username", "password"],
    locale: "en",
} as AccountUpdatedProps;

export default AccountUpdated;
