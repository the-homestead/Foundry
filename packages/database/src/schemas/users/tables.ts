import { boolean, index, integer, pgTable, text, timestamp, uniqueIndex } from "drizzle-orm/pg-core";

export const userTable = pgTable("user", {
    id: text("id").primaryKey(),
    name: text("name").notNull(),
    email: text("email").notNull().unique(),
    emailVerified: boolean("email_verified").default(false).notNull(),
    image: text("image"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
        .defaultNow()
        .$onUpdate(() => /* @__PURE__ */ new Date())
        .notNull(),
    role: text("role"),
    banned: boolean("banned").default(false),
    banReason: text("ban_reason"),
    banExpires: timestamp("ban_expires"),
    lastLoginMethod: text("last_login_method"),
    twoFactorEnabled: boolean("two_factor_enabled").default(false),
    username: text("username").unique(),
    displayUsername: text("display_username"),
    stripeCustomerId: text("stripe_customer_id"),
    age: integer("age"),
    agePublic: boolean("age_public"),
    firstName: text("first_name"),
    firstNamePublic: boolean("first_name_public"),
    lastName: text("last_name"),
    lastNamePublic: boolean("last_name_public"),
    bio: text("bio"),
});

export const sessionTable = pgTable(
    "session",
    {
        id: text("id").primaryKey(),
        expiresAt: timestamp("expires_at").notNull(),
        token: text("token").notNull().unique(),
        createdAt: timestamp("created_at").defaultNow().notNull(),
        updatedAt: timestamp("updated_at")
            .$onUpdate(() => /* @__PURE__ */ new Date())
            .notNull(),
        ipAddress: text("ip_address"),
        userAgent: text("user_agent"),
        userId: text("user_id")
            .notNull()
            .references(() => userTable.id, { onDelete: "cascade" }),
        impersonatedBy: text("impersonated_by"),
        activeOrganizationId: text("active_organization_id"),
        activeTeamId: text("active_team_id"),
    },
    (table) => [index("session_userId_idx").on(table.userId)]
);

export const accountTable = pgTable(
    "account",
    {
        id: text("id").primaryKey(),
        accountId: text("account_id").notNull(),
        providerId: text("provider_id").notNull(),
        userId: text("user_id")
            .notNull()
            .references(() => userTable.id, { onDelete: "cascade" }),
        accessToken: text("access_token"),
        refreshToken: text("refresh_token"),
        idToken: text("id_token"),
        accessTokenExpiresAt: timestamp("access_token_expires_at"),
        refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
        scope: text("scope"),
        password: text("password"),
        createdAt: timestamp("created_at").defaultNow().notNull(),
        updatedAt: timestamp("updated_at")
            .$onUpdate(() => /* @__PURE__ */ new Date())
            .notNull(),
    },
    (table) => [index("account_userId_idx").on(table.userId)]
);

export const verificationTable = pgTable(
    "verification",
    {
        id: text("id").primaryKey(),
        identifier: text("identifier").notNull(),
        value: text("value").notNull(),
        expiresAt: timestamp("expires_at").notNull(),
        createdAt: timestamp("created_at").defaultNow().notNull(),
        updatedAt: timestamp("updated_at")
            .defaultNow()
            .$onUpdate(() => /* @__PURE__ */ new Date())
            .notNull(),
    },
    (table) => [index("verification_identifier_idx").on(table.identifier)]
);

export const jwksTable = pgTable("jwks", {
    id: text("id").primaryKey(),
    publicKey: text("public_key").notNull(),
    privateKey: text("private_key").notNull(),
    createdAt: timestamp("created_at").notNull(),
    expiresAt: timestamp("expires_at"),
});

export const oauthApplicationTable = pgTable(
    "oauth_application",
    {
        id: text("id").primaryKey(),
        name: text("name"),
        icon: text("icon"),
        metadata: text("metadata"),
        clientId: text("client_id").unique(),
        clientSecret: text("client_secret"),
        redirectUrls: text("redirect_urls"),
        type: text("type"),
        disabled: boolean("disabled").default(false),
        userId: text("user_id").references(() => userTable.id, { onDelete: "cascade" }),
        createdAt: timestamp("created_at"),
        updatedAt: timestamp("updated_at"),
    },
    (table) => [index("oauthApplication_userId_idx").on(table.userId)]
);

export const oauthAccessTokenTable = pgTable(
    "oauth_access_token",
    {
        id: text("id").primaryKey(),
        accessToken: text("access_token").unique(),
        refreshToken: text("refresh_token").unique(),
        accessTokenExpiresAt: timestamp("access_token_expires_at"),
        refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
        clientId: text("client_id").references(() => oauthApplicationTable.clientId, {
            onDelete: "cascade",
        }),
        userId: text("user_id").references(() => userTable.id, { onDelete: "cascade" }),
        scopes: text("scopes"),
        createdAt: timestamp("created_at"),
        updatedAt: timestamp("updated_at"),
    },
    (table) => [index("oauthAccessToken_clientId_idx").on(table.clientId), index("oauthAccessToken_userId_idx").on(table.userId)]
);

export const oauthConsentTable = pgTable(
    "oauth_consent",
    {
        id: text("id").primaryKey(),
        clientId: text("client_id").references(() => oauthApplicationTable.clientId, {
            onDelete: "cascade",
        }),
        userId: text("user_id").references(() => userTable.id, { onDelete: "cascade" }),
        scopes: text("scopes"),
        createdAt: timestamp("created_at"),
        updatedAt: timestamp("updated_at"),
        consentGiven: boolean("consent_given"),
    },
    (table) => [index("oauthConsent_clientId_idx").on(table.clientId), index("oauthConsent_userId_idx").on(table.userId)]
);

export const apikeyTable = pgTable(
    "apikey",
    {
        id: text("id").primaryKey(),
        name: text("name"),
        start: text("start"),
        prefix: text("prefix"),
        key: text("key").notNull(),
        userId: text("user_id")
            .notNull()
            .references(() => userTable.id, { onDelete: "cascade" }),
        refillInterval: integer("refill_interval"),
        refillAmount: integer("refill_amount"),
        lastRefillAt: timestamp("last_refill_at"),
        enabled: boolean("enabled").default(true),
        rateLimitEnabled: boolean("rate_limit_enabled").default(true),
        rateLimitTimeWindow: integer("rate_limit_time_window").default(86_400_000),
        rateLimitMax: integer("rate_limit_max").default(10),
        requestCount: integer("request_count").default(0),
        remaining: integer("remaining"),
        lastRequest: timestamp("last_request"),
        expiresAt: timestamp("expires_at"),
        createdAt: timestamp("created_at").notNull(),
        updatedAt: timestamp("updated_at").notNull(),
        permissions: text("permissions"),
        metadata: text("metadata"),
    },
    (table) => [index("apikey_key_idx").on(table.key), index("apikey_userId_idx").on(table.userId)]
);

export const passkeyTable = pgTable(
    "passkey",
    {
        id: text("id").primaryKey(),
        name: text("name"),
        publicKey: text("public_key").notNull(),
        userId: text("user_id")
            .notNull()
            .references(() => userTable.id, { onDelete: "cascade" }),
        credentialID: text("credential_id").notNull(),
        counter: integer("counter").notNull(),
        deviceType: text("device_type").notNull(),
        backedUp: boolean("backed_up").notNull(),
        transports: text("transports"),
        createdAt: timestamp("created_at"),
        aaguid: text("aaguid"),
    },
    (table) => [index("passkey_userId_idx").on(table.userId), index("passkey_credentialID_idx").on(table.credentialID)]
);

export const twoFactorTable = pgTable(
    "two_factor",
    {
        id: text("id").primaryKey(),
        secret: text("secret").notNull(),
        backupCodes: text("backup_codes").notNull(),
        userId: text("user_id")
            .notNull()
            .references(() => userTable.id, { onDelete: "cascade" }),
    },
    (table) => [index("twoFactor_secret_idx").on(table.secret), index("twoFactor_userId_idx").on(table.userId)]
);

export const organizationTable = pgTable(
    "organization",
    {
        id: text("id").primaryKey(),
        name: text("name").notNull(),
        slug: text("slug").notNull().unique(),
        logo: text("logo"),
        createdAt: timestamp("created_at").notNull(),
        metadata: text("metadata"),
    },
    (table) => [uniqueIndex("organization_slug_uidx").on(table.slug)]
);

export const teamTable = pgTable(
    "team",
    {
        id: text("id").primaryKey(),
        name: text("name").notNull(),
        organizationId: text("organization_id")
            .notNull()
            .references(() => organizationTable.id, { onDelete: "cascade" }),
        createdAt: timestamp("created_at").notNull(),
        updatedAt: timestamp("updated_at").$onUpdate(() => /* @__PURE__ */ new Date()),
    },
    (table) => [index("team_organizationId_idx").on(table.organizationId)]
);

export const teamMemberTable = pgTable(
    "team_member",
    {
        id: text("id").primaryKey(),
        teamId: text("team_id")
            .notNull()
            .references(() => teamTable.id, { onDelete: "cascade" }),
        userId: text("user_id")
            .notNull()
            .references(() => userTable.id, { onDelete: "cascade" }),
        createdAt: timestamp("created_at"),
    },
    (table) => [index("teamMember_teamId_idx").on(table.teamId), index("teamMember_userId_idx").on(table.userId)]
);

export const memberTable = pgTable(
    "member",
    {
        id: text("id").primaryKey(),
        organizationId: text("organization_id")
            .notNull()
            .references(() => organizationTable.id, { onDelete: "cascade" }),
        userId: text("user_id")
            .notNull()
            .references(() => userTable.id, { onDelete: "cascade" }),
        role: text("role").default("member").notNull(),
        createdAt: timestamp("created_at").notNull(),
    },
    (table) => [index("member_organizationId_idx").on(table.organizationId), index("member_userId_idx").on(table.userId)]
);

export const invitationTable = pgTable(
    "invitation",
    {
        id: text("id").primaryKey(),
        organizationId: text("organization_id")
            .notNull()
            .references(() => organizationTable.id, { onDelete: "cascade" }),
        email: text("email").notNull(),
        role: text("role"),
        teamId: text("team_id"),
        status: text("status").default("pending").notNull(),
        expiresAt: timestamp("expires_at").notNull(),
        createdAt: timestamp("created_at").defaultNow().notNull(),
        inviterId: text("inviter_id")
            .notNull()
            .references(() => userTable.id, { onDelete: "cascade" }),
    },
    (table) => [index("invitation_organizationId_idx").on(table.organizationId), index("invitation_email_idx").on(table.email)]
);

// Stores per-user notification / email preferences. Keep security-critical
// messages enabled by default (password resets, verification, 2FA) while
// allowing users to opt out of non-essential notifications (marketing,
// organization notices they don't want, etc.). The table uses the user's
// id as the primary key for a 1:1 relation with `user`.
export const userNotificationSettingsTable = pgTable(
    "user_notification_settings",
    {
        userId: text("user_id")
            .primaryKey()
            .references(() => userTable.id, { onDelete: "cascade" }),
        // Security / required notifications (defaults = true)
        emailSecurity: boolean("email_security").default(true).notNull(), // login alerts, password reset notices, 2FA
        emailAccountUpdates: boolean("email_account_updates").default(true).notNull(),

        // Optional / user-controlled notifications
        emailOrganization: boolean("email_organization").default(true).notNull(),
        emailApiKey: boolean("email_apikey").default(true).notNull(),
        emailMarketing: boolean("email_marketing").default(false).notNull(),

        // Timestamps
        createdAt: timestamp("created_at").defaultNow().notNull(),
        updatedAt: timestamp("updated_at")
            .$onUpdate(() => /* @__PURE__ */ new Date())
            .notNull(),
    },
    (table) => [index("userNotification_userId_idx").on(table.userId)]
);
