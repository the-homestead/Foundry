/** biome-ignore-all lint/correctness/noUnusedFunctionParameters: <Def> */
/** biome-ignore-all lint/suspicious/noExplicitAny: <Def> */
/** biome-ignore-all lint/suspicious/useAwait: <Def> */
import { passkey } from "@better-auth/passkey";
import { sso } from "@better-auth/sso";
import { stripe } from "@better-auth/stripe";
import { db, schema } from "@foundry/database";
import { LAUNCHER_FREE, toApiKeyPermissions } from "@foundry/types/permissions/api-key";
import AccountUpdated from "@foundry/web/emails/user/account-updated";
import PasswordResetEmail from "@foundry/web/emails/user/password-reset";
import TwoFactorEmail from "@foundry/web/emails/user/two-factor";
import VerifyEmail from "@foundry/web/emails/user/verify-email";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { nextCookies } from "better-auth/next-js";
import { admin, apiKey, haveIBeenPwned, lastLoginMethod, multiSession, organization, twoFactor, username } from "better-auth/plugins";
import { createTranslator } from "next-intl";
import { Resend } from "resend";
import Stripe from "stripe";
import { SYSTEM_CONFIG } from "../constants";
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

// biome-ignore lint/style/noNonNullAssertion: <Def>
const resend = new Resend(process.env.RESEND_API_KEY!);
const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
const appOrigin = new URL(appUrl).origin;
const rpID = new URL(appUrl).hostname;
const adminUserIds = (process.env.ADMIN_USER_IDS ?? "")
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean);

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
    baseURL: process.env.NEXT_PUBLIC_APP_URL ?? appUrl,
    trustedOrigins: [appUrl],

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

            await resend.emails.send({
                from: fromEmail,
                to: user.email,
                subject: t("passwordReset.subject"),
                react: <PasswordResetEmail expiresHours={24} locale={locale} name={user.name || ""} resetUrl={url} />,
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

            await resend.emails.send({
                from: fromEmail,
                to: user.email,
                subject: t("verifyEmail.subject"),
                react: <VerifyEmail locale={locale} name={user.name || ""} verifyUrl={url} />,
            });
        },
    },
    advanced: {
        // make cookies usable cross-site
        crossSubDomainCookies: {
            enabled: true,
            domain: new URL(appUrl).hostname,
        },
        defaultCookieAttributes: {
            sameSite: "none",
            secure: true,
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

    plugins: [
        sso(),
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
        multiSession(),
        haveIBeenPwned({ customPasswordCompromisedMessage: "Please choose a more secure password." }),
        lastLoginMethod({ storeInDatabase: true }),
        passkey({ origin: appOrigin, rpID, rpName: "Foundry" }),
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

            /**
            organizationHooks: {
                // Organization creation hooks
                beforeCreateOrganization: ({ organization, user }) => {
                    // Run custom logic before organization is created
                    // Optionally modify the organization data
                    return {
                        data: {
                            ...organization,
                            metadata: {
                                customField: "value",
                            },
                        },
                    };
                },
                afterCreateOrganization: async ({ organization, member, user }) => {
                    // Run custom logic after organization is created
                    // e.g., create default resources, send notifications
                    // await setupDefaultResources(organization.id);
                },
                // Organization update hooks
                beforeUpdateOrganization: async ({ organization, user, member }) => {
                    // Validate updates, apply business rules
                    return {
                        data: {
                            ...organization,
                            name: organization.name?.toLowerCase(),
                        },
                    };
                },
                afterUpdateOrganization: async ({ organization, user, member }) => {
                    // Sync changes to external systems
                    // await syncOrganizationToExternalSystems(organization);
                },

                // Before a member is added to an organization
                beforeAddMember: async ({ member, user, organization }) => {
                    // Custom validation or modification
                    console.log(`Adding ${user.email} to ${organization.name}`);
                    // Optionally modify member data
                    return {
                        data: {
                            ...member,
                            role: "custom-role", // Override the role
                        },
                    };
                },
                // After a member is added
                afterAddMember: async ({ member, user, organization }) => {
                    // Send welcome email, create default resources, etc.
                    await sendWelcomeEmail(user.email, organization.name);
                },
                // Before a member is removed
                beforeRemoveMember: async ({ member, user, organization }) => {
                    // Cleanup user's resources, send notification, etc.
                    await cleanupUserResources(user.id, organization.id);
                },
                // After a member is removed
                afterRemoveMember: async ({ member, user, organization }) => {
                    await logMemberRemoval(user.id, organization.id);
                },
                // Before updating a member's role
                beforeUpdateMemberRole: async ({ member, newRole, user, organization }) => {
                    // Validate role change permissions
                    if (newRole === "owner" && !hasOwnerUpgradePermission(user)) {
                        throw new Error("Cannot upgrade to owner role");
                    }
                    // Optionally modify the role
                    return {
                        data: {
                            role: newRole,
                        },
                    };
                },
                // After updating a member's role
                afterUpdateMemberRole: async ({ member, previousRole, user, organization }) => {
                    await logRoleChange(user.id, previousRole, member.role);
                },

                // Before creating an invitation
                beforeCreateInvitation: async ({ invitation, inviter, organization }) => {
                    // Custom validation or expiration logic
                    const customExpiration = new Date(Date.now() + 1000 * 60 * 60 * 24 * 7); // 7 days
                    return {
                        data: {
                            ...invitation,
                            expiresAt: customExpiration,
                        },
                    };
                },
                // After creating an invitation
                afterCreateInvitation: async ({ invitation, inviter, organization }) => {
                    // Send custom invitation email, track metrics, etc.
                    await sendCustomInvitationEmail(invitation, organization);
                },
                // Before accepting an invitation
                beforeAcceptInvitation: async ({ invitation, user, organization }) => {
                    // Additional validation before acceptance
                    await validateUserEligibility(user, organization);
                },
                // After accepting an invitation
                afterAcceptInvitation: async ({ invitation, member, user, organization }) => {
                    // Setup user account, assign default resources
                    await setupNewMemberResources(user, organization);
                },
                // Before/after rejecting invitations
                beforeRejectInvitation: async ({ invitation, user, organization }) => {
                    // Log rejection reason, send notification to inviter
                },
                afterRejectInvitation: async ({ invitation, user, organization }) => {
                    await notifyInviterOfRejection(invitation.inviterId, user.email);
                },
                // Before/after cancelling invitations
                beforeCancelInvitation: async ({ invitation, cancelledBy, organization }) => {
                    // Verify cancellation permissions
                },
                afterCancelInvitation: async ({ invitation, cancelledBy, organization }) => {
                    await logInvitationCancellation(invitation.id, cancelledBy.id);
                },

                // Before creating a team
                beforeCreateTeam: async ({ team, user, organization }) => {
                    // Validate team name, apply naming conventions
                    return {
                        data: {
                            ...team,
                            name: team.name.toLowerCase().replace(/\s+/g, "-"),
                        },
                    };
                },
                // After creating a team
                afterCreateTeam: async ({ team, user, organization }) => {
                    // Create default team resources, channels, etc.
                    await createDefaultTeamResources(team.id);
                },
                // Before updating a team
                beforeUpdateTeam: async ({ team, updates, user, organization }) => {
                    // Validate updates, apply business rules
                    return {
                        data: {
                            ...updates,
                            name: updates.name?.toLowerCase(),
                        },
                    };
                },
                // After updating a team
                afterUpdateTeam: async ({ team, user, organization }) => {
                    await syncTeamChangesToExternalSystems(team);
                },
                // Before deleting a team
                beforeDeleteTeam: async ({ team, user, organization }) => {
                    // Backup team data, notify members
                    await backupTeamData(team.id);
                },
                // After deleting a team
                afterDeleteTeam: async ({ team, user, organization }) => {
                    await cleanupTeamResources(team.id);
                },
                // Team member operations
                beforeAddTeamMember: async ({ teamMember, team, user, organization }) => {
                    // Validate team membership limits, permissions
                    const memberCount = await getTeamMemberCount(team.id);
                    if (memberCount >= 10) {
                        throw new Error("Team is full");
                    }
                },
                afterAddTeamMember: async ({ teamMember, team, user, organization }) => {
                    await grantTeamAccess(user.id, team.id);
                },
                beforeRemoveTeamMember: async ({ teamMember, team, user, organization }) => {
                    // Backup user's team-specific data
                    await backupTeamMemberData(user.id, team.id);
                },
                afterRemoveTeamMember: async ({ teamMember, team, user, organization }) => {
                    await revokeTeamAccess(user.id, team.id);
                },
            },
            */
        }),
        // must be last so Set-Cookie headers are surfaced through Next.js
        nextCookies(),
    ],

    secret: process.env.AUTH_SECRET,
    socialProviders,
});

// export const getCurrentUser = async (): Promise<null | UserDbType> => {
//     const session = await auth.api.getSession({
//         headers: await headers(),
//     });
//     if (!session) {
//         return null;
//     }
//     return session.user as UserDbType;
// };

// export const getCurrentUserOrRedirect = async (forbiddenUrl = "/auth/sign-in", okUrl = "", ignoreForbidden = false): Promise<null | UserDbType> => {
//     const user = await getCurrentUser();

//     // if no user is found
//     if (!user) {
//         // redirect to forbidden url unless explicitly ignored
//         if (!ignoreForbidden) {
//             redirect(forbiddenUrl);
//         }
//         // if ignoring forbidden, return the null user immediately
//         // (don't proceed to okUrl check)
//         return user; // user is null here
//     }

//     // if user is found and an okUrl is provided, redirect there
//     if (okUrl) {
//         redirect(okUrl);
//     }

//     // if user is found and no okUrl is provided, return the user
//     return user; // user is UserDbType here
// };

export default auth;
