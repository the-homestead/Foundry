import { Body, Button, Container, Head, Heading, Html, Preview, Section, Tailwind, Text } from "@react-email/components";
import { createTranslator } from "next-intl";
import EMAIL_COLORS from "../colors";

type Locale = "en" | "de" | "es" | "fr" | "it" | "ja" | "ko" | "pt" | "ru" | "zh";

interface OrgInviteProps {
    name?: string;
    locale?: Locale;
    orgName?: string;
    inviter?: string;
    role?: string;
    inviteUrl?: string;
}

const DEFAULT_LOCALE: Locale = "en";

export const OrgInvite = async ({ name, locale, orgName, inviter, role, inviteUrl }: OrgInviteProps) => {
    const usedLocale: Locale = locale ?? DEFAULT_LOCALE;
    const t = createTranslator({
        messages: await import(`../../messages/${usedLocale}.json`),
        namespace: "emails",
        locale: usedLocale,
    });

    if (!name) {
        name = t("common.user");
    }

    const previewText = t("organization.invite.preview", { orgName: orgName ?? "" });

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
                            {t("organization.invite.subject", { orgName: orgName ?? "" })}
                        </Heading>

                        <div style={{ height: 6, width: 56, backgroundColor: EMAIL_COLORS.primary, margin: "8px auto" }} />

                        <Text className="mb-[12px] text-center text-[14px]" style={{ color: EMAIL_COLORS.foreground }}>
                            {t("organization.invite.body", {
                                inviter: inviter ?? t("organization.invite.anonymous"),
                                orgName: orgName ?? "",
                                role: role ?? t("organization.invite.defaultRole"),
                            })}
                        </Text>

                        <Section className="my-[24px] text-center">
                            <Button
                                className="rounded px-5 py-3 font-medium text-[13px] no-underline"
                                href={inviteUrl ?? "#"}
                                style={{ backgroundColor: EMAIL_COLORS.primary, color: EMAIL_COLORS.primaryForeground, border: `1px solid ${EMAIL_COLORS.border}` }}
                            >
                                {t("organization.invite.button")}
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

OrgInvite.PreviewProps = {
    name: "Jane",
    orgName: "Foundry Labs",
    inviter: "Alice",
    role: "Admin",
    inviteUrl: "https://example.com/accept-invite",
    locale: "en",
} as OrgInviteProps;

export default OrgInvite;
