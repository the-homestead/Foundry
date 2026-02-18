import { Body, Container, Head, Heading, Html, Preview, Tailwind, Text } from "@react-email/components";
import { createTranslator } from "next-intl";
import EMAIL_COLORS from "../colors";

type Locale = "en" | "de" | "es" | "fr" | "it" | "ja" | "ko" | "pt" | "ru" | "zh";

interface OrgNoticeProps {
    name?: string;
    locale?: Locale;
    orgName?: string;
    noticeType?: "role_changed" | "removed" | "member_removed";
    details?: string;
}

const DEFAULT_LOCALE: Locale = "en";

export const OrgNotice = async ({ name, locale, orgName, noticeType = "role_changed", details }: OrgNoticeProps) => {
    const usedLocale: Locale = locale ?? DEFAULT_LOCALE;
    const t = createTranslator({
        messages: await import(`../../messages/${usedLocale}.json`),
        namespace: "emails",
        locale: usedLocale,
    });

    if (!name) {
        name = t("common.user");
    }

    const previewText = t("organization.notice.preview", { orgName: orgName ?? "" });

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
                            {t("organization.notice.subject", { orgName: orgName ?? "" })}
                        </Heading>

                        <div style={{ height: 6, width: 56, backgroundColor: EMAIL_COLORS.primary, margin: "8px auto" }} />

                        <Text className="mb-[12px] text-center text-[14px]" style={{ color: EMAIL_COLORS.foreground }}>
                            {t(`organization.notice.${noticeType}`, { details: details ?? "" })}
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

OrgNotice.PreviewProps = {
    name: "Jane",
    orgName: "Foundry Labs",
    noticeType: "role_changed",
    details: "Promoted to Admin",
    locale: "en",
} as OrgNoticeProps;

export default OrgNotice;
