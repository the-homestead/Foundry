/** biome-ignore-all lint/correctness/noUnusedFunctionParameters: <Def> */
/** biome-ignore-all lint/suspicious/noExplicitAny: <Def> */
/** biome-ignore-all lint/suspicious/useAwait: <Def> */

import { passkey } from "@better-auth/passkey";
import { stripe } from "@better-auth/stripe";
import { SYSTEM_CONFIG } from "@foundry/configs";
import { db, eq, memberTable, schema, userNotificationSettingsTable, userTable } from "@foundry/database";
import InviteAccepted from "@foundry/email/emails/org/invite-accepted";
import InviteCancelled from "@foundry/email/emails/org/invite-cancelled";
import InviteDeclined from "@foundry/email/emails/org/invite-declined";
import MemberRoleChanged from "@foundry/email/emails/org/member-role-changed";
import MemberWelcome from "@foundry/email/emails/org/member-welcome";
import OrgCreated from "@foundry/email/emails/org/org-created";
import OrgInvite from "@foundry/email/emails/org/org-invite";
import OrgNotice from "@foundry/email/emails/org/org-notice";
import OrgUpdated from "@foundry/email/emails/org/org-updated";
import OwnerChanged from "@foundry/email/emails/org/owner-changed";
import TeamCreated from "@foundry/email/emails/org/team-created";
import TeamDeleted from "@foundry/email/emails/org/team-deleted";
import TeamMemberAdded from "@foundry/email/emails/org/team-member-added";
import TeamMemberRemoved from "@foundry/email/emails/org/team-member-removed";
import TeamUpdated from "@foundry/email/emails/org/team-updated";
import AccountUpdated from "@foundry/email/emails/user/account-updated";
import BannedEmail from "@foundry/email/emails/user/banned";
import PasskeyNotice from "@foundry/email/emails/user/passkey-notice";
import PasswordResetEmail from "@foundry/email/emails/user/password-reset";
import TwoFactorEmail from "@foundry/email/emails/user/two-factor";
import VerifyEmail from "@foundry/email/emails/user/verify-email";
import WelcomeEmail from "@foundry/email/emails/user/welcome-base";
import { LAUNCHER_FREE, toApiKeyPermissions } from "@foundry/types/permissions/api-key";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { betterAuth } from "better-auth/minimal";
import { nextCookies } from "better-auth/next-js";
import { admin, apiKey, haveIBeenPwned, jwt, lastLoginMethod, multiSession, oidcProvider, organization, twoFactor, username } from "better-auth/plugins";
import { revalidateTag } from "next/cache";
import { createTranslator } from "next-intl";
import { Resend } from "resend";
import Stripe from "stripe";
import { ac, adminRole, devRole, userRole } from "./permissions";

// biome-ignore lint/style/noNonNullAssertion: <Def>
const fromEmail = process.env.EMAIL_SENDER_ADDRESS!;

type Locale = "en" | "de" | "es" | "fr" | "it" | "ja" | "ko" | "pt" | "ru" | "zh";

const SUPPORTED_LOCALES: Locale[] = ["en", "de", "es", "fr", "it", "ja", "ko", "pt", "ru", "zh"];

export async function detectLocaleFromRequest(request: any, fallback: Locale = "en"): Promise<Locale> {
    // 1) prefer explicit user locale if provided on the request object
    try {
        const maybeLocale = request?.locale ?? request?.headers?.get?.("x-locale") ?? undefined;
        if (maybeLocale && typeof maybeLocale === "string") {
            const normalized = maybeLocale.split("-")[0];
            if (SUPPORTED_LOCALES.includes(normalized as Locale)) {
                return normalized as Locale;
            }
        }

        // 2) parse Accept-Language header
        const header = request?.headers?.get?.("accept-language") ?? request?.headers?.["accept-language"] ?? undefined;
        if (typeof header === "string") {
            const headerStr: string = header;
            const parts = headerStr
                .split(",")
                .map((s: string) => {
                    const segment = s?.split(";")[0] ?? "";
                    return segment.trim().toLowerCase();
                })
                .filter(Boolean);
            for (const part of parts) {
                const base = part.split("-")[0];
                if (SUPPORTED_LOCALES.includes(part as Locale)) {
                    return part as Locale;
                }
                if (SUPPORTED_LOCALES.includes(base as Locale)) {
                    return base as Locale;
                }
            }
        }
    } catch (_e) {
        // fallthrough to default
    }
    return fallback;
}

const isProduction = process.env.NODE_ENV === "production";

// biome-ignore lint/style/noNonNullAssertion: <Def>
const resend = new Resend(process.env.RESEND_API_KEY!);
const defaultAuthUrl = "https://auth.homestead.systems";
const defaultWebUrl = "https://foundry.homestead.systems";
const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? defaultAuthUrl;
const webUrl = process.env.NEXT_PUBLIC_WEB_APP_URL ?? defaultWebUrl;
const authBaseUrl = process.env.BETTER_AUTH_URL ?? appUrl;
const _rawCookieDomain = process.env.AUTH_COOKIE_DOMAIN ?? "homestead.systems";
// Ensure cookie domain is a root-domain value suitable for cross-subdomain cookies
const cookieDomain = _rawCookieDomain.startsWith(".") ? _rawCookieDomain : `.${_rawCookieDomain}`;
const appOrigin = new URL(appUrl).origin;
const rpID = new URL(appUrl).hostname;
const adminUserIds = (process.env.ADMIN_USER_IDS ?? "")
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean);

const normalizeOrigin = (value: string | undefined) => {
    if (!value) {
        return null;
    }
    try {
        return new URL(value).origin;
    } catch (_error) {
        return null;
    }
};

const trustedOrigins = Array.from(
    new Set(
        [normalizeOrigin(appUrl), normalizeOrigin(authBaseUrl), normalizeOrigin(webUrl), normalizeOrigin(process.env.NEXT_PUBLIC_SERVER_APP_URL)].filter(
            (origin): origin is string => Boolean(origin)
        )
    )
);

// configure basic social providers from env (same as backend)
const socialProviders: Record<string, any> = {};
if (process.env.AUTH_GOOGLE_ID && process.env.AUTH_GOOGLE_SECRET) {
    socialProviders.google = {
        clientId: process.env.AUTH_GOOGLE_ID,
        clientSecret: process.env.AUTH_GOOGLE_SECRET,
        scope: ["openid", "email", "profile"],
    };
}
if (process.env.AUTH_GITHUB_ID && process.env.AUTH_GITHUB_SECRET) {
    socialProviders.github = {
        clientId: process.env.AUTH_GITHUB_ID,
        clientSecret: process.env.AUTH_GITHUB_SECRET,
        scope: ["user:email", "read:user"],
    };
}
if (process.env.AUTH_DISCORD_ID && process.env.AUTH_DISCORD_SECRET) {
    socialProviders.discord = {
        clientId: process.env.AUTH_DISCORD_ID,
        clientSecret: process.env.AUTH_DISCORD_SECRET,
        scope: ["identify", "email"],
    };
}

if (process.env.AUTH_GITLAB_ID && process.env.AUTH_GITLAB_SECRET) {
    socialProviders.gitlab = {
        clientId: process.env.AUTH_GITLAB_ID,
        clientSecret: process.env.AUTH_GITLAB_SECRET,
        scope: ["read_user"],
    };
}

if (process.env.AUTH_TWITCH_ID && process.env.AUTH_TWITCH_SECRET) {
    socialProviders.twitch = {
        clientId: process.env.AUTH_TWITCH_ID,
        clientSecret: process.env.AUTH_TWITCH_SECRET,
        scope: ["user:read:email"],
    };
}

// biome-ignore lint/style/noNonNullAssertion: <Stripe>
const stripeClient = new Stripe(process.env.STRIPE_WEBHOOK_SECRET_TEST!, {
    apiVersion: "2025-11-17.clover", // Latest API version as of Stripe SDK v20.0.0
});

export const auth = betterAuth({
    appName: "Foundry",
    baseURL: authBaseUrl,
    basePath: "/api/auth",
    trustedOrigins,
    experimental: { joins: true },

    // database adapter (uses same drizzle setup)
    database: drizzleAdapter(db, {
        provider: "pg",
        schema,
    }),

    user: {
        additionalFields: {
            age: {
                type: "number",
                input: false,
            },
            agePublic: {
                type: "boolean",
                input: false,
            },
            firstName: {
                type: "string",
                input: false,
            },
            firstNamePublic: {
                type: "boolean",
                input: false,
            },
            lastName: {
                type: "string",
                input: false,
            },
            lastNamePublic: {
                type: "boolean",
                input: false,
            },
            bio: {
                type: "string",
                input: false,
            },
        },
    },

    emailAndPassword: {
        enabled: true,
        requireEmailVerification: true,
        sendResetPassword: async ({ user, url, token }, request) => {
            const locale = await detectLocaleFromRequest(request as any, "en");
            const t = createTranslator({
                messages: await import(`../../messages/${locale}.json`),
                namespace: "emails",
                locale,
            });

            // Ensure any provided URL contains a valid locale segment and never
            // contains the literal string "undefined". If no URL is provided,
            // build a locale-prefixed reset URL.
            const ensureLocaleInResetUrl = (maybeUrl: string | undefined) => {
                // If no URL provided, return the app reset path (non-locale prefixed)
                if (!maybeUrl) {
                    return `${appUrl.replace(/\/$/, "")}/auth/reset/${encodeURIComponent(token ?? "")}`;
                }

                try {
                    const parsed = new URL(maybeUrl, appUrl);

                    // fix the specific bad-case where 'undefined' was interpolated into the path
                    if (parsed.pathname.includes("/undefined/")) {
                        parsed.pathname = parsed.pathname.replace("/undefined/", `/${locale}/`);
                        return parsed.toString();
                    }

                    // otherwise return the provided URL unchanged
                    return parsed.toString();
                } catch (_err) {
                    // fallback to safe non-localized path when parsing fails
                    return `${appUrl.replace(/\/$/, "")}/auth/reset/${encodeURIComponent(token ?? "")}`;
                }
            };

            const resetUrl = ensureLocaleInResetUrl(url);

            await resend.emails.send({
                from: fromEmail,
                to: user.email,
                subject: t("passwordReset.subject"),
                react: <PasswordResetEmail expiresHours={24} locale={locale} name={user.name || ""} resetUrl={resetUrl} />,
            });
        },
        onPasswordReset: async ({ user }: { user: any }, request: any) => {
            try {
                const locale = await detectLocaleFromRequest(request as any, "en");
                const t = createTranslator({
                    messages: await import(`../../messages/${locale}.json`),
                    namespace: "emails",
                    locale,
                });

                await resend.emails.send({
                    from: fromEmail,
                    to: user.email,
                    subject: t("accountUpdated.subject"),
                    react: <AccountUpdated changes={[t("accountUpdated.changes", { changes: "password" })]} locale={locale} name={user.name || ""} />,
                });
            } catch (e) {
                console.error("Failed to send account-updated email:", e);
            }
        },
    },
    emailVerification: {
        sendVerificationEmail: async ({ user, url, token }, request) => {
            const locale = await detectLocaleFromRequest(request as any, "en");
            const t = createTranslator({
                messages: await import(`../../messages/${locale}.json`),
                namespace: "emails",
                locale,
            });

            // Sanitize obvious '/undefined/' mistakes in the provided URL but
            // otherwise leave the URL unchanged (do not forcibly prefix locale).
            let safeVerifyUrl = url;
            try {
                if (url) {
                    const parsed = new URL(url, appUrl);
                    if (parsed.pathname.includes("/undefined/")) {
                        parsed.pathname = parsed.pathname.replace("/undefined/", `/${locale}/`);
                        safeVerifyUrl = parsed.toString();
                    }
                }
            } catch (_err) {
                /* fallthrough - keep original url */
            }

            await resend.emails.send({
                from: fromEmail,
                to: user.email,
                subject: t("verifyEmail.subject"),
                react: <VerifyEmail locale={locale} name={user.name || ""} verifyUrl={safeVerifyUrl} />,
            });
        },
    },
    advanced: {
        ipAddress: {
            ipAddressHeaders: ["x-forwarded-for", "x-real-ip", "x-client-ip"],
            disableIpTracking: false,
        },
        useSecureCookies: isProduction,
        // make cookies usable cross-site
        crossSubDomainCookies: {
            enabled: true,
            domain: cookieDomain,
        },
        defaultCookieAttributes: {
            httpOnly: true,
            sameSite: "none",
            secure: true,
        },
    },
    // Enable Better‑Auth cookie cache for faster auth checks on the client
    // - `cookieCache.enabled` keeps a small, short‑lived snapshot of session/user data
    // - `maxAge` is intentionally short (5 minutes) to reduce window for stale state
    // - `strategy: "compact"` keeps cookie size small while remaining secure for DB-backed apps
    session: {
        cookieCache: {
            enabled: true,
            maxAge: 60 * 5, // 5 minutes
            strategy: "compact",
        },
    },

    oauth: {
        defaultCallbackUrl: SYSTEM_CONFIG.redirectAfterSignIn,
        errorCallbackUrl: "/account?tab=profile&error=link_failed",
        linkAccountsByEmail: true,
    },

    account: {
        accountLinking: {
            enabled: true,
            trustedProviders: ["google", "github", "discord", "gitlab", "twitch"],
            allowDifferentEmails: true, // Allow linking accounts even if emails don't match
        },
    },

    disabledPaths: ["/token"],
    plugins: [
        jwt(),
        oidcProvider({
            loginPage: "/auth/login",
            // explicit consent page for OIDC authorization requests
            consentPage: "/consent",
            useJWTPlugin: true, // Enable JWT plugin integration
            allowDynamicClientRegistration: true,
            trustedClients: [
                {
                    clientId: "foundry-forum",
                    name: "Foundry Forum",
                    redirectUrls: ["https://foundry.homestead.systems/auth/oidc/callback", "https://forum.homestead.systems/auth/oidc/callback"],
                    disabled: false,
                    skipConsent: true,
                    // forum uses PKCE (public client) — mark as user-agent-based so token
                    // endpoint accepts PKCE-only exchanges without a client_secret
                    type: "user-agent-based",
                    metadata: {},
                },
            ],
        }),
        apiKey({
            enableSessionForAPIKeys: true,
            enableMetadata: true,
            permissions: { defaultPermissions: toApiKeyPermissions(LAUNCHER_FREE) },
        }),
        admin({
            ac,
            roles: {
                user: userRole,
                admin: adminRole,
                dev: devRole,
            },
            adminUserIds,
            defaultRole: "user",
        }),
        // Small internal plugin to handle user-level lifecycle emails (ban notifications)
        {
            id: "foundry-user-hooks",
            init() {
                return {
                    options: {
                        databaseHooks: {
                            user: {
                                create: {
                                    async after(userRecord: any) {
                                        try {
                                            if (!userRecord?.id) {
                                                return;
                                            }

                                            // Revalidate profile (new user)
                                            try {
                                                await revalidateTag(`user-profile:${userRecord.id}`, { profile: "short" } as unknown as any);
                                            } catch (err) {
                                                console.error("user.create.after revalidate failed:", err);
                                            }

                                            const toEmail = userRecord?.email;
                                            if (!toEmail) {
                                                return;
                                            }

                                            const locale = "en";
                                            const t = createTranslator({ messages: await import(`../../messages/${locale}.json`), namespace: "emails", locale });

                                            await resend.emails.send({
                                                from: fromEmail,
                                                to: toEmail,
                                                subject: t("welcome.subject", { name: userRecord?.name ?? toEmail }),
                                                react: <WelcomeEmail locale={locale} name={userRecord?.name ?? ""} />,
                                            });
                                        } catch (err) {
                                            console.error("user.create.after welcome email failed:", err);
                                        }
                                    },
                                },
                                update: {
                                    async after(payload) {
                                        // payload may be the updated user object or an object like { user, previous }
                                        const updatedUser = (payload && (payload.user ?? payload)) as any;
                                        const previous = (payload && (payload.previous ?? payload.previousUser)) as any;

                                        if (!updatedUser?.id) {
                                            return;
                                        }

                                        // Revalidate user profile UI
                                        try {
                                            await revalidateTag(`user-profile:${updatedUser.id}`, { profile: "short" } as unknown as any);
                                        } catch (err) {
                                            console.error("user.update.after revalidate failed:", err);
                                        }

                                        // Send an account-updated email for non-security changes when allowed
                                        // and always send for password changes (security-critical).
                                        try {
                                            if (previous) {
                                                const changed: string[] = [];
                                                if (previous.password !== updatedUser.password) {
                                                    changed.push("password");
                                                }
                                                if (previous.email !== updatedUser.email) {
                                                    changed.push("email");
                                                }
                                                if (previous.name !== updatedUser.name) {
                                                    changed.push("name");
                                                }
                                                if (previous.firstName !== updatedUser.firstName) {
                                                    changed.push("firstName");
                                                }
                                                if (previous.lastName !== updatedUser.lastName) {
                                                    changed.push("lastName");
                                                }
                                                if (previous.bio !== updatedUser.bio) {
                                                    changed.push("bio");
                                                }

                                                if (changed.length > 0) {
                                                    // security-related change (password) -> always notify
                                                    const mustSend = changed.includes("password");

                                                    // for other account updates respect the user's preference
                                                    let sendAccountUpdate = mustSend;
                                                    if (!mustSend) {
                                                        const prefsRow = (
                                                            await db
                                                                .select()
                                                                .from(userNotificationSettingsTable)
                                                                .where(eq(userNotificationSettingsTable.userId, updatedUser.id))
                                                                .limit(1)
                                                        )?.[0];
                                                        const allow = prefsRow ? Boolean(prefsRow.emailAccountUpdates) : true;
                                                        sendAccountUpdate = Boolean(allow);
                                                    }

                                                    if (sendAccountUpdate && updatedUser.email) {
                                                        const locale = "en";
                                                        const t = createTranslator({ messages: await import(`../../messages/${locale}.json`), namespace: "emails", locale });

                                                        await resend.emails.send({
                                                            from: fromEmail,
                                                            to: updatedUser.email,
                                                            subject: t("accountUpdated.subject"),
                                                            react: (
                                                                <AccountUpdated
                                                                    changes={changed.map((c) => t("accountUpdated.changes", { changes: c }))}
                                                                    locale={locale}
                                                                    name={updatedUser.name || updatedUser.email}
                                                                />
                                                            ),
                                                        });
                                                    }
                                                }
                                            }
                                        } catch (err) {
                                            console.error("user.update.after account-updated send failed:", err);
                                        }
                                        // If banned state changed to true -> send ban email (security-critical)
                                        try {
                                            if (previous && previous.banned !== updatedUser.banned && Boolean(updatedUser.banned)) {
                                                const toEmail = updatedUser.email;
                                                if (!toEmail) {
                                                    return;
                                                }

                                                const locale = "en";
                                                const t = createTranslator({ messages: await import(`../../messages/${locale}.json`), namespace: "emails", locale });

                                                await resend.emails.send({
                                                    from: fromEmail,
                                                    to: toEmail,
                                                    subject: t("banned.subject"),
                                                    react: (
                                                        <BannedEmail
                                                            appealUrl={`${appUrl}/support/appeal`}
                                                            locale={locale as any}
                                                            name={updatedUser.name ?? toEmail}
                                                            reason={updatedUser.banReason}
                                                        />
                                                    ),
                                                });
                                            }
                                        } catch (err) {
                                            console.error("user.update.after ban email failed:", err);
                                        }
                                    },
                                },
                            },
                        },
                    },
                };
            },
        },
        multiSession(),
        haveIBeenPwned({ customPasswordCompromisedMessage: "Please choose a more secure password." }),
        lastLoginMethod({ storeInDatabase: true }),
        passkey({ origin: appOrigin, rpID, rpName: "Foundry" }),
        // plugin: passkey lifecycle (revalidate + passkey notice emails)
        {
            id: "foundry-passkey-hooks",
            init(_ctx: any) {
                return {
                    options: {
                        // runtime supports model-specific hooks (passkey) but the public
                        // TypeScript types don't include them — cast to `any` to avoid
                        // type errors while preserving runtime behavior.
                        databaseHooks: {
                            passkey: {
                                create: {
                                    async after(passkeyRecord: any) {
                                        try {
                                            if (passkeyRecord?.userId) {
                                                await revalidateTag(`passkeys:${passkeyRecord.userId}`, { profile: "short" } as unknown as any);
                                            }
                                        } catch (err) {
                                            console.error("passkey.create.after revalidate failed:", err);
                                        }

                                        try {
                                            const toUser = passkeyRecord?.userId
                                                ? (await db.select().from(userTable).where(eq(userTable.id, passkeyRecord.userId)).limit(1))[0]
                                                : undefined;
                                            const toEmail = toUser?.email;
                                            if (!toEmail) {
                                                return;
                                            }

                                            const locale = "en";
                                            const device = passkeyRecord?.name ?? passkeyRecord?.deviceType ?? undefined;

                                            await resend.emails.send({
                                                from: fromEmail,
                                                to: toEmail,
                                                subject: (await createTranslator({ messages: await import(`../../messages/${locale}.json`), namespace: "emails", locale }))(
                                                    "passkey.subject",
                                                    { action: "added" }
                                                ),
                                                react: (
                                                    <PasskeyNotice
                                                        action="added"
                                                        device={device}
                                                        locale={locale as any}
                                                        manageUrl={`${appUrl}/account?tab=security`}
                                                        name={toUser?.name ?? toEmail}
                                                    />
                                                ),
                                            });
                                        } catch (err) {
                                            console.error("passkey.create.after send email failed:", err);
                                        }
                                    },
                                },
                                delete: {
                                    async after(passkeyRecord: any) {
                                        try {
                                            if (passkeyRecord?.userId) {
                                                await revalidateTag(`passkeys:${passkeyRecord.userId}`, { profile: "short" } as unknown as any);
                                            }
                                        } catch (err) {
                                            console.error("passkey.delete.after revalidate failed:", err);
                                        }

                                        try {
                                            const toUser = passkeyRecord?.userId
                                                ? (await db.select().from(userTable).where(eq(userTable.id, passkeyRecord.userId)).limit(1))[0]
                                                : undefined;
                                            const toEmail = toUser?.email;
                                            if (!toEmail) {
                                                return;
                                            }

                                            const locale = "en";
                                            const device = passkeyRecord?.name ?? passkeyRecord?.deviceType ?? undefined;

                                            await resend.emails.send({
                                                from: fromEmail,
                                                to: toEmail,
                                                subject: (await createTranslator({ messages: await import(`../../messages/${locale}.json`), namespace: "emails", locale }))(
                                                    "passkey.subject",
                                                    { action: "deleted" }
                                                ),
                                                react: (
                                                    <PasskeyNotice
                                                        action="deleted"
                                                        device={device}
                                                        locale={locale as any}
                                                        manageUrl={`${appUrl}/account?tab=security`}
                                                        name={toUser?.name ?? toEmail}
                                                    />
                                                ),
                                            });
                                        } catch (err) {
                                            console.error("passkey.delete.after send email failed:", err);
                                        }
                                    },
                                },
                            },
                        },
                    },
                } as any;
            },
        },
        twoFactor({
            issuer: "Foundry",
            sendOTP: async ({ user, otp }: { user: any; otp: string }, ctx: { request?: any }) => {
                try {
                    const locale = await detectLocaleFromRequest(ctx.request ?? ctx, "en");
                    const t = createTranslator({
                        messages: await import(`../../messages/${locale}.json`),
                        namespace: "emails",
                        locale,
                    });

                    await resend.emails.send({
                        from: fromEmail,
                        to: user.email,
                        subject: t("twoFactor.subject"),
                        react: <TwoFactorEmail code={otp} expiresMinutes={10} locale={locale} name={user.name || ""} />,
                    });
                } catch (e) {
                    // log and swallow so 2FA flow isn't blocked by email failures
                    console.error("Failed to send 2FA email", e);
                }
            },
        }),
        username({
            minUsernameLength: 3,
            maxUsernameLength: 30,
            usernameValidator: (username) => {
                // biome-ignore lint/performance/useTopLevelRegex: <Reg>
                const usernameRegex = /^[a-zA-Z0-9_]+$/; // Alphanumeric and underscores only
                if (!usernameRegex.test(username)) {
                    return false;
                }
                return true;
            },
        }),
        stripe({
            stripeClient,
            // biome-ignore lint/style/noNonNullAssertion: <Def>
            stripeWebhookSecret: process.env.STRIPE_WEBHOOK_SECRET_TEST!,
            createCustomerOnSignUp: true,
        }),
        organization({
            teams: { enabled: true },
            allowUserToCreateOrganization: (_user) => {
                //TODO: Implement a restriction on who can create organizations if needed
                return true;
            },

            // Organization hooks: revalidation + transactional emails where applicable.
            // Security-critical emails (password reset, verification, 2FA) are
            // delivered elsewhere and always allowed. Optional notifications
            // respect `user_notification_settings` when available.
            organizationHooks: {
                afterCreateOrganization: async ({ organization, member, user }) => {
                    try {
                        // Invalidate org list for creator and org detail
                        await revalidateTag(`organizations:${user.id}`, { profile: "medium" } as unknown as any);
                        if (organization?.id) {
                            await revalidateTag(`organization:${organization.id}`, { profile: "medium" } as unknown as any);
                        }
                        // send org-created to the creator
                        try {
                            const toEmail = user?.email;
                            if (toEmail) {
                                const locale = "en";
                                const t = createTranslator({ messages: await import(`../../messages/${locale}.json`), namespace: "emails", locale });

                                await resend.emails.send({
                                    from: fromEmail,
                                    to: toEmail,
                                    subject: t("organization.created.subject", { orgName: organization?.name ?? "" }),
                                    react: <OrgCreated locale={locale as any} name={user?.name ?? toEmail} orgName={organization?.name ?? ""} />,
                                });
                            }
                        } catch (err) {
                            console.error("orgHook.afterCreateOrganization send org-created failed:", err);
                        }
                    } catch (err) {
                        console.error("orgHook.afterCreateOrganization revalidate failed:", err);
                    }
                },
                // Send an invitation email when an invitation is created
                afterCreateInvitation: async ({ invitation, inviter, organization }) => {
                    try {
                        // organization may be undefined in some hook callers; bail early when absent
                        if (!(organization?.id && organization?.name)) {
                            return;
                        }

                        const locale = "en";
                        await resend.emails.send({
                            from: fromEmail,
                            to: invitation.email,
                            subject: (await createTranslator({ messages: await import(`../../messages/${locale}.json`), namespace: "emails", locale }))(
                                "organization.invite.subject",
                                { orgName: organization.name }
                            ),
                            react: (
                                <OrgInvite
                                    inviter={inviter?.name ?? ""}
                                    inviteUrl={`${appUrl}/orgs/${organization.id}/invitations/${invitation.id}`}
                                    locale={locale}
                                    name={invitation.email}
                                    orgName={organization.name}
                                />
                            ),
                        });
                    } catch (err) {
                        console.error("orgHook.afterCreateInvitation send invite failed:", err);
                    }
                },
                afterAcceptInvitation: async ({ invitation, member, user, organization }) => {
                    try {
                        const inviterId = invitation?.inviterId ?? invitation?.inviter?.id ?? undefined;
                        if (!inviterId) {
                            return;
                        }

                        const inviterRow = (await db.select().from(userTable).where(eq(userTable.id, inviterId)).limit(1))?.[0];
                        if (!inviterRow?.email) {
                            return;
                        }

                        const prefs = (await db.select().from(userNotificationSettingsTable).where(eq(userNotificationSettingsTable.userId, inviterId)).limit(1))?.[0];
                        const allow = prefs ? Boolean(prefs.emailOrganization) : true;
                        if (!allow) {
                            return;
                        }

                        const locale = "en";
                        await resend.emails.send({
                            from: fromEmail,
                            to: inviterRow.email,
                            subject: (await createTranslator({ messages: await import(`../../messages/${locale}.json`), namespace: "emails", locale }))(
                                "organization.inviteAccepted.subject",
                                { orgName: organization?.name ?? "" }
                            ),
                            react: (
                                <InviteAccepted
                                    inviter={inviterRow.name ?? inviterRow.email}
                                    locale={locale as any}
                                    name={inviterRow.name ?? inviterRow.email}
                                    orgName={organization?.name}
                                />
                            ),
                        });
                    } catch (err) {
                        console.error("orgHook.afterAcceptInvitation send failed:", err);
                    }
                },
                afterRejectInvitation: async ({ invitation, user, organization }) => {
                    try {
                        const inviterId = invitation?.inviterId ?? undefined;
                        if (!inviterId) {
                            return;
                        }

                        const inviterRow = (await db.select().from(userTable).where(eq(userTable.id, inviterId)).limit(1))?.[0];
                        if (!inviterRow?.email) {
                            return;
                        }

                        const prefs = (await db.select().from(userNotificationSettingsTable).where(eq(userNotificationSettingsTable.userId, inviterId)).limit(1))?.[0];
                        const allow = prefs ? Boolean(prefs.emailOrganization) : true;
                        if (!allow) {
                            return;
                        }

                        const locale = "en";
                        await resend.emails.send({
                            from: fromEmail,
                            to: inviterRow.email,
                            subject: (await createTranslator({ messages: await import(`../../messages/${locale}.json`), namespace: "emails", locale }))(
                                "organization.inviteDeclined.subject",
                                { orgName: organization?.name ?? "" }
                            ),
                            react: <InviteDeclined locale={locale as any} name={inviterRow.name ?? inviterRow.email} orgName={organization?.name} />,
                        });
                    } catch (err) {
                        console.error("orgHook.afterRejectInvitation send failed:", err);
                    }
                },
                afterCancelInvitation: async ({ invitation, cancelledBy, organization }) => {
                    try {
                        const toEmail = invitation?.email;
                        if (!toEmail) {
                            return;
                        }

                        const locale = "en";
                        await resend.emails.send({
                            from: fromEmail,
                            to: toEmail,
                            subject: (await createTranslator({ messages: await import(`../../messages/${locale}.json`), namespace: "emails", locale }))(
                                "organization.inviteCancelled.subject",
                                { orgName: organization?.name ?? "" }
                            ),
                            react: <InviteCancelled locale={locale as any} name={toEmail} orgName={organization?.name} />,
                        });
                    } catch (err) {
                        console.error("orgHook.afterCancelInvitation send failed:", err);
                    }
                },
                afterUpdateOrganization: async ({ organization }) => {
                    try {
                        if (!organization?.id) {
                            return;
                        }
                        await revalidateTag(`organization:${organization.id}`, { profile: "medium" } as unknown as any);
                        // notify org members about the update (preference-aware)
                        try {
                            const members = await db.select().from(memberTable).where(eq(memberTable.organizationId, organization.id));
                            if (members?.length) {
                                const locale = "en";
                                const t = createTranslator({ messages: await import(`../../messages/${locale}.json`), namespace: "emails", locale });
                                await Promise.all(
                                    members.map(async (m) => {
                                        try {
                                            const userRow = (await db.select().from(userTable).where(eq(userTable.id, m.userId)).limit(1))?.[0];
                                            if (!userRow?.email) {
                                                return;
                                            }
                                            const prefs = (
                                                await db.select().from(userNotificationSettingsTable).where(eq(userNotificationSettingsTable.userId, m.userId)).limit(1)
                                            )?.[0];
                                            const allow = prefs ? Boolean(prefs.emailOrganization) : true;
                                            if (!allow) {
                                                return;
                                            }

                                            await resend.emails.send({
                                                from: fromEmail,
                                                to: userRow.email,
                                                subject: t("organization.updated.subject", { orgName: organization.name ?? "" }),
                                                react: (
                                                    <OrgUpdated
                                                        details={t("organization.updated.body", { details: "Settings changed" })}
                                                        locale={locale as any}
                                                        name={userRow.name ?? userRow.email}
                                                        orgName={organization.name}
                                                    />
                                                ),
                                            });
                                        } catch (e) {
                                            console.error("orgHook.afterUpdateOrganization notify member failed:", e);
                                        }
                                    })
                                );
                            }
                        } catch (err) {
                            console.error("orgHook.afterUpdateOrganization notify members failed:", err);
                        }
                    } catch (err) {
                        console.error("orgHook.afterUpdateOrganization revalidate failed:", err);
                    }
                },
                afterAddMember: async ({ member, user, organization }) => {
                    try {
                        // Revalidate member lists for org and the affected user
                        if (organization?.id) {
                            await revalidateTag(`organization-members:${organization.id}`, { profile: "short" } as unknown as any);
                        }
                        await revalidateTag(`organizations:${user.id}`, { profile: "medium" } as unknown as any);

                        // Send welcome + org-notice emails to the newly added user where allowed.
                        try {
                            const newUser = user as { id?: string; email?: string; name?: string } | undefined;
                            const targetUserId = newUser?.id ?? member?.userId;
                            if (targetUserId) {
                                const settings = await db.select().from(userNotificationSettingsTable).where(eq(userNotificationSettingsTable.userId, targetUserId)).limit(1);
                                const prefs = settings?.[0];
                                const sendOrg = prefs ? Boolean(prefs.emailOrganization) : true;

                                if (sendOrg) {
                                    const toEmail = newUser?.email ?? (await db.select().from(userTable).where(eq(userTable.id, targetUserId)).limit(1))[0]?.email;
                                    if (toEmail) {
                                        const locale = "en";
                                        await resend.emails.send({
                                            from: fromEmail,
                                            to: toEmail,
                                            subject: (await createTranslator({ messages: await import(`../../messages/${locale}.json`), namespace: "emails", locale }))(
                                                "organization.memberAdded.subject",
                                                { orgName: organization?.name ?? "" }
                                            ),
                                            react: (
                                                <MemberWelcome
                                                    inviter={user?.name ?? ""}
                                                    locale={locale as any}
                                                    manageUrl={`${appUrl}/orgs/${organization?.id ?? ""}`}
                                                    name={newUser?.name ?? toEmail}
                                                    orgName={organization?.name ?? ""}
                                                />
                                            ),
                                        });
                                    }
                                }
                            }
                        } catch (err) {
                            console.error("orgHook.afterAddMember email send failed:", err);
                        }
                    } catch (err) {
                        console.error("orgHook.afterAddMember revalidate failed:", err);
                    }
                },
                afterRemoveMember: async ({ member, user, organization }) => {
                    try {
                        if (organization?.id) {
                            await revalidateTag(`organization-members:${organization.id}`, { profile: "short" } as unknown as any);
                        }
                        await revalidateTag(`organizations:${user.id}`, { profile: "medium" } as unknown as any);

                        // notify removed user (best-effort)
                        try {
                            const removedUserId = member?.userId;
                            if (removedUserId) {
                                const removed = await db.select().from(userTable).where(eq(userTable.id, removedUserId)).limit(1);
                                const toEmail = removed?.[0]?.email;
                                if (toEmail && organization?.name) {
                                    const locale = "en";
                                    await resend.emails.send({
                                        from: fromEmail,
                                        to: toEmail,
                                        subject: (await createTranslator({ messages: await import(`../../messages/${locale}.json`), namespace: "emails", locale }))(
                                            "organization.notice.subject",
                                            { orgName: organization.name }
                                        ),
                                        react: await OrgNotice({
                                            locale: locale as any,
                                            orgName: organization.name,
                                            noticeType: "member_removed",
                                            details: "You were removed from the organization.",
                                            name: removed?.[0]?.name ?? toEmail,
                                        } as any),
                                    });
                                }
                            }
                        } catch (err) {
                            console.error("orgHook.afterRemoveMember email failed:", err);
                        }
                    } catch (err) {
                        console.error("orgHook.afterRemoveMember revalidate failed:", err);
                    }
                },
                afterCreateTeam: async ({ team, user, organization }) => {
                    try {
                        if (organization?.id) {
                            await revalidateTag(`organization-teams:${organization.id}`, { profile: "medium" } as unknown as any);
                        }
                        if (team?.id) {
                            await revalidateTag(`team:${team.id}`, { profile: "medium" } as unknown as any);
                        }
                        // Notify org members about the new team (preference-aware)
                        try {
                            if (organization?.id && team?.name) {
                                const members = await db.select().from(memberTable).where(eq(memberTable.organizationId, organization.id));
                                const locale = "en";
                                await Promise.all(
                                    members.map(async (m) => {
                                        try {
                                            const userRow = (await db.select().from(userTable).where(eq(userTable.id, m.userId)).limit(1))?.[0];
                                            if (!userRow?.email) {
                                                return;
                                            }
                                            const prefs = (
                                                await db.select().from(userNotificationSettingsTable).where(eq(userNotificationSettingsTable.userId, m.userId)).limit(1)
                                            )?.[0];
                                            const allow = prefs ? Boolean(prefs.emailOrganization) : true;
                                            if (!allow) {
                                                return;
                                            }

                                            await resend.emails.send({
                                                from: fromEmail,
                                                to: userRow.email,
                                                subject: (await createTranslator({ messages: await import(`../../messages/${locale}.json`), namespace: "emails", locale }))(
                                                    "organization.team.created.subject",
                                                    { teamName: team.name }
                                                ),
                                                react: (
                                                    <TeamCreated
                                                        locale={locale as any}
                                                        manageUrl={`${appUrl}/orgs/${organization.id}/teams/${team.id}`}
                                                        name={userRow.name ?? userRow.email}
                                                        orgName={organization?.name}
                                                        teamName={team.name}
                                                    />
                                                ),
                                            });
                                        } catch (e) {
                                            console.error("orgHook.afterCreateTeam notify member failed:", e);
                                        }
                                    })
                                );
                            }
                        } catch (err) {
                            console.error("orgHook.afterCreateTeam notify members failed:", err);
                        }
                    } catch (err) {
                        console.error("orgHook.afterCreateTeam revalidate failed:", err);
                    }
                },
                afterUpdateTeam: async ({ team }) => {
                    try {
                        if (team?.id) {
                            await revalidateTag(`team:${team.id}`, { profile: "medium" } as unknown as any);
                        }
                        // Notify org members about the team update (preference-aware)
                        try {
                            if (team?.organizationId) {
                                const members = await db.select().from(memberTable).where(eq(memberTable.organizationId, team.organizationId));
                                await Promise.all(
                                    members.map(async (m) => {
                                        try {
                                            const userRow = (await db.select().from(userTable).where(eq(userTable.id, m.userId)).limit(1))?.[0];
                                            if (!userRow?.email) {
                                                return;
                                            }
                                            const prefs = (
                                                await db.select().from(userNotificationSettingsTable).where(eq(userNotificationSettingsTable.userId, m.userId)).limit(1)
                                            )?.[0];
                                            const allow = prefs ? Boolean(prefs.emailOrganization) : true;
                                            if (!allow) {
                                                return;
                                            }

                                            try {
                                                const t = (await createTranslator({ messages: await import("../../messages/en.json"), namespace: "emails", locale: "en" })) as any;
                                                await resend.emails.send({
                                                    from: fromEmail,
                                                    to: userRow.email,
                                                    subject: t("organization.team.updated.subject", { teamName: team.name ?? "" }),
                                                    react: <TeamUpdated locale={"en" as any} name={userRow.name ?? userRow.email} teamName={team.name} />,
                                                });
                                            } catch (e) {
                                                console.error("orgHook.afterUpdateTeam send failed:", e);
                                            }
                                        } catch (e) {
                                            console.error("orgHook.afterUpdateTeam notify member failed:", e);
                                        }
                                    })
                                );
                            }
                        } catch (err) {
                            console.error("orgHook.afterUpdateTeam notify members failed:", err);
                        }
                    } catch (err) {
                        console.error("orgHook.afterUpdateTeam revalidate failed:", err);
                    }
                },
                afterDeleteTeam: async ({ team }) => {
                    try {
                        if (team?.organizationId) {
                            await revalidateTag(`organization-teams:${team.organizationId}`, { profile: "medium" } as unknown as any);
                        }
                        if (team?.id) {
                            await revalidateTag(`team:${team.id}`, { profile: "short" } as unknown as any);
                        }
                        // Notify org members that a team was deleted (preference-aware)
                        try {
                            if (team?.organizationId && team?.name) {
                                const members = await db.select().from(memberTable).where(eq(memberTable.organizationId, team.organizationId));
                                const _locale = "en";
                                await Promise.all(
                                    members.map(async (m) => {
                                        try {
                                            const userRow = (await db.select().from(userTable).where(eq(userTable.id, m.userId)).limit(1))?.[0];
                                            if (!userRow?.email) {
                                                return;
                                            }
                                            const prefs = (
                                                await db.select().from(userNotificationSettingsTable).where(eq(userNotificationSettingsTable.userId, m.userId)).limit(1)
                                            )?.[0];
                                            const allow = prefs ? Boolean(prefs.emailOrganization) : true;
                                            if (!allow) {
                                                return;
                                            }

                                            try {
                                                const t = (await createTranslator({ messages: await import("../../messages/en.json"), namespace: "emails", locale: "en" })) as any;
                                                await resend.emails.send({
                                                    from: fromEmail,
                                                    to: userRow.email,
                                                    subject: t("organization.team.deleted.subject", { teamName: team.name ?? "" }),
                                                    react: <TeamDeleted locale={"en" as any} name={userRow.name ?? userRow.email} teamName={team.name} />,
                                                });
                                            } catch (e) {
                                                console.error("orgHook.afterDeleteTeam send failed:", e);
                                            }
                                        } catch (e) {
                                            console.error("orgHook.afterDeleteTeam notify member failed:", e);
                                        }
                                    })
                                );
                            }
                        } catch (err) {
                            console.error("orgHook.afterDeleteTeam notify members failed:", err);
                        }
                    } catch (err) {
                        console.error("orgHook.afterDeleteTeam revalidate failed:", err);
                    }
                },
                afterAddTeamMember: async ({ teamMember, team }) => {
                    try {
                        if (team?.id) {
                            await revalidateTag(`team-members:${team.id}`, { profile: "short" } as unknown as any);
                        }

                        // Send team-member-added email to the newly added user (preference-aware)
                        try {
                            const addedUserId = teamMember?.userId;
                            if (addedUserId) {
                                const settings = await db.select().from(userNotificationSettingsTable).where(eq(userNotificationSettingsTable.userId, addedUserId)).limit(1);
                                const prefs = settings?.[0];
                                const allow = prefs ? Boolean(prefs.emailOrganization) : true;
                                if (!allow) {
                                    return;
                                }

                                const toUser = (await db.select().from(userTable).where(eq(userTable.id, addedUserId)).limit(1))?.[0];
                                const toEmail = toUser?.email;
                                if (!toEmail) {
                                    return;
                                }

                                const locale = "en";
                                await resend.emails.send({
                                    from: fromEmail,
                                    to: toEmail,
                                    subject: (await createTranslator({ messages: await import(`../../messages/${locale}.json`), namespace: "emails", locale }))(
                                        "organization.teamMemberAdded.subject",
                                        { teamName: team?.name ?? "" }
                                    ),
                                    react: (
                                        <TeamMemberAdded
                                            locale={locale as any}
                                            manageUrl={`${appUrl}/orgs/${team?.organizationId}/teams/${team?.id}`}
                                            name={toUser?.name ?? toEmail}
                                            teamName={team?.name}
                                        />
                                    ),
                                });
                            }
                        } catch (err) {
                            console.error("orgHook.afterAddTeamMember send failed:", err);
                        }
                    } catch (err) {
                        console.error("orgHook.afterAddTeamMember revalidate failed:", err);
                    }
                },
                afterRemoveTeamMember: async ({ teamMember, team }) => {
                    try {
                        if (team?.id) {
                            await revalidateTag(`team-members:${team.id}`, { profile: "short" } as unknown as any);
                        }

                        // Notify the removed user (preference-aware)
                        try {
                            const removedUserId = teamMember?.userId;
                            if (removedUserId) {
                                const toUser = (await db.select().from(userTable).where(eq(userTable.id, removedUserId)).limit(1))?.[0];
                                const toEmail = toUser?.email;
                                if (!toEmail) {
                                    return;
                                }

                                const settings = await db.select().from(userNotificationSettingsTable).where(eq(userNotificationSettingsTable.userId, removedUserId)).limit(1);
                                const prefs = settings?.[0];
                                const allow = prefs ? Boolean(prefs.emailOrganization) : true;
                                if (!allow) {
                                    return;
                                }

                                const locale = "en";
                                await resend.emails.send({
                                    from: fromEmail,
                                    to: toEmail,
                                    subject: (await createTranslator({ messages: await import(`../../messages/${locale}.json`), namespace: "emails", locale }))(
                                        "organization.teamMemberRemoved.subject",
                                        { teamName: team?.name ?? "" }
                                    ),
                                    react: <TeamMemberRemoved locale={locale as any} name={toUser?.name ?? toEmail} teamName={team?.name} />,
                                });
                            }
                        } catch (err) {
                            console.error("orgHook.afterRemoveTeamMember notify failed:", err);
                        }
                    } catch (err) {
                        console.error("orgHook.afterRemoveTeamMember revalidate failed:", err);
                    }
                },
                // Notify when a member's role is changed; broadcast owner changes when applicable
                afterUpdateMemberRole: async ({ member, previousRole, user, organization }) => {
                    try {
                        if (organization?.id) {
                            await revalidateTag(`organization-members:${organization.id}`, { profile: "short" } as unknown as any);
                        }

                        const targetUserId = member?.userId;
                        if (targetUserId) {
                            const settings = (await db.select().from(userNotificationSettingsTable).where(eq(userNotificationSettingsTable.userId, targetUserId)).limit(1))?.[0];
                            const allow = settings ? Boolean(settings.emailOrganization) : true;
                            if (allow) {
                                const toUser = (await db.select().from(userTable).where(eq(userTable.id, targetUserId)).limit(1))?.[0];
                                const toEmail = toUser?.email;
                                if (toEmail) {
                                    const locale = "en";
                                    await resend.emails.send({
                                        from: fromEmail,
                                        to: toEmail,
                                        subject: (await createTranslator({ messages: await import(`../../messages/${locale}.json`), namespace: "emails", locale }))(
                                            "organization.memberRoleChanged.subject",
                                            { orgName: organization?.name ?? "" }
                                        ),
                                        react: <MemberRoleChanged locale={locale as any} name={toUser?.name ?? toEmail} orgName={organization?.name} role={member?.role} />,
                                    });
                                }
                            }
                        }

                        // If promoted to owner, broadcast owner-changed to members (best-effort)
                        if (previousRole !== "owner" && member?.role === "owner") {
                            try {
                                const newOwnerUser = (await db.select().from(userTable).where(eq(userTable.id, member.userId)).limit(1))?.[0];
                                // try to find a previous owner (best-effort)
                                const prevOwnerCandidates = await db.select().from(memberTable).where(eq(memberTable.organizationId, organization?.id));
                                const prevOwnerMember = prevOwnerCandidates?.find((m) => m.role === "owner" && m.userId !== member.userId);
                                let previousOwnerName = "";
                                if (prevOwnerMember) {
                                    const prevUser = (await db.select().from(userTable).where(eq(userTable.id, prevOwnerMember.userId)).limit(1))?.[0];
                                    previousOwnerName = prevUser?.name ?? prevUser?.email ?? "";
                                }

                                const members = await db.select().from(memberTable).where(eq(memberTable.organizationId, organization?.id));
                                const locale = "en";
                                await Promise.all(
                                    members.map(async (m) => {
                                        try {
                                            const userRow = (await db.select().from(userTable).where(eq(userTable.id, m.userId)).limit(1))?.[0];
                                            if (!userRow?.email) {
                                                return;
                                            }
                                            const prefs = (
                                                await db.select().from(userNotificationSettingsTable).where(eq(userNotificationSettingsTable.userId, m.userId)).limit(1)
                                            )?.[0];
                                            const allow = prefs ? Boolean(prefs.emailOrganization) : true;
                                            if (!allow) {
                                                return;
                                            }

                                            await resend.emails.send({
                                                from: fromEmail,
                                                to: userRow.email,
                                                subject: (await createTranslator({ messages: await import(`../../messages/${locale}.json`), namespace: "emails", locale }))(
                                                    "organization.ownerChanged.subject",
                                                    { orgName: organization?.name ?? "" }
                                                ),
                                                react: (
                                                    <OwnerChanged
                                                        locale={locale as any}
                                                        name={userRow.name ?? userRow.email}
                                                        newOwner={newOwnerUser?.name ?? newOwnerUser?.email}
                                                        orgName={organization?.name}
                                                        previousOwner={previousOwnerName}
                                                    />
                                                ),
                                            });
                                        } catch (e) {
                                            console.error("orgHook.afterUpdateMemberRole notify owner-change failed:", e);
                                        }
                                    })
                                );
                            } catch (err) {
                                console.error("orgHook.afterUpdateMemberRole owner-change broadcast failed:", err);
                            }
                        }
                    } catch (err) {
                        console.error("orgHook.afterUpdateMemberRole failed:", err);
                    }
                },
            },
        }),
        // must be last so Set-Cookie headers are surfaced through Next.js
        nextCookies(),
    ],

    rateLimit: {
        enabled: isProduction,
        window: 10,
        max: 100,
        storage: "memory",
    },
    logger: {
        level: isProduction ? "warn" : "info",
    },
    telemetry: {
        enabled: false,
    },

    secret: process.env.BETTER_AUTH_SECRET ?? process.env.AUTH_SECRET,
    socialProviders,
});

export default auth;
