import { Body, Button, Container, Head, Heading, Html, Preview, Section, Tailwind, Text } from "@react-email/components";
import { createTranslator } from "next-intl";
import EMAIL_COLORS from "../colors";

type Locale = "en" | "de" | "es" | "fr" | "it" | "ja" | "ko" | "pt" | "ru" | "zh";

interface BadgeItem {
    label: string;
    value: string;
}

interface InactiveAccountReminderProps {
    name?: string;
    locale?: Locale;
    days?: number;
    ctaUrl?: string;

    // Allow admins to provide a custom subject/body when queuing the message
    subject?: string;
    body?: string; // can contain `{days}` placeholder

    // Optional badge-like highlights (ip, email, username, etc.) rendered similarly to `AccountUpdated`
    highlights?: BadgeItem[];

    // Support simple variant selection (admin can choose or pass `random` with `bodyVariants`)
    variant?: "default" | "friendly" | "urgent" | "random";
    bodyVariants?: string[];
}

const DEFAULT_LOCALE: Locale = "en";

export const InactiveAccountReminder = async ({ name, locale, days, ctaUrl, subject, body, highlights = [], variant = "default", bodyVariants }: InactiveAccountReminderProps) => {
    const usedLocale: Locale = locale ?? DEFAULT_LOCALE;
    const t = createTranslator({ messages: await import(`../../messages/${usedLocale}.json`), namespace: "emails", locale: usedLocale });

    if (!name) {
        name = t("common.user");
    }
    const previewText = t("inactiveAccountReminder.preview");

    // if variant=random and bodyVariants provided, pick one at send-time
    let resolvedBody = body ?? t("inactiveAccountReminder.body", { days: days ?? 30 });
    if (variant === "friendly") {
        resolvedBody = body ?? t("inactiveAccountReminder.friendly.body", { days: days ?? 30 });
    } else if (variant === "urgent") {
        resolvedBody = body ?? t("inactiveAccountReminder.urgent.body", { days: days ?? 30 });
    } else if (variant === "random" && Array.isArray(bodyVariants) && bodyVariants.length > 0) {
        const idx = Math.floor(Math.random() * bodyVariants.length);
        resolvedBody = bodyVariants?.[idx] ?? resolvedBody;
    }

    const _resolvedSubject =
        subject ??
        (variant === "friendly"
            ? t("inactiveAccountReminder.friendly.subject", { days: days ?? 30 })
            : variant === "urgent"
              ? t("inactiveAccountReminder.urgent.subject", { days: days ?? 30 })
              : t("inactiveAccountReminder.subject", { days: days ?? 30 }));

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
                            {t("inactiveAccountReminder.subject")}
                        </Heading>

                        <div style={{ height: 6, width: 56, backgroundColor: EMAIL_COLORS.primary, margin: "8px auto" }} />

                        <Text className="mb-[12px] text-center text-[14px]" style={{ color: EMAIL_COLORS.foreground }}>
                            {resolvedBody}
                        </Text>

                        {highlights.length > 0 && (
                            <div style={{ textAlign: "center", marginBottom: 12 }}>
                                {highlights.map((h, i) => (
                                    <span
                                        key={`hl-${i}-${h.label}`}
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
                                        {h.label}: {h.value}
                                    </span>
                                ))}
                            </div>
                        )}

                        {ctaUrl && (
                            <Section className="my-[24px] text-center">
                                <Button
                                    className="rounded px-5 py-3 font-medium text-[13px] no-underline"
                                    href={ctaUrl}
                                    style={{ backgroundColor: EMAIL_COLORS.primary, color: EMAIL_COLORS.primaryForeground, border: `1px solid ${EMAIL_COLORS.border}` }}
                                >
                                    {t("inactiveAccountReminder.cta")}
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

InactiveAccountReminder.PreviewProps = { name: "Jane", days: 90, ctaUrl: "https://example.com", locale: "en" } as InactiveAccountReminderProps;

export default InactiveAccountReminder;
