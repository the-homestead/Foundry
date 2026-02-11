import { relations } from "drizzle-orm";
import {
    accountTable,
    apikeyTable,
    invitationTable,
    memberTable,
    organizationTable,
    passkeyTable,
    sessionTable,
    ssoProviderTable,
    teamMemberTable,
    teamTable,
    twoFactorTable,
    userTable,
} from "./tables";

export const userRelations = relations(userTable, ({ many }) => ({
    sessions: many(sessionTable),
    accounts: many(accountTable),
    apikeys: many(apikeyTable),
    passkeys: many(passkeyTable),
    twoFactors: many(twoFactorTable),
    ssoProviders: many(ssoProviderTable),
    teamMembers: many(teamMemberTable),
    members: many(memberTable),
    invitations: many(invitationTable),
}));

export const sessionRelations = relations(sessionTable, ({ one }) => ({
    user: one(userTable, {
        fields: [sessionTable.userId],
        references: [userTable.id],
    }),
}));

export const accountRelations = relations(accountTable, ({ one }) => ({
    user: one(userTable, {
        fields: [accountTable.userId],
        references: [userTable.id],
    }),
}));

export const apikeyRelations = relations(apikeyTable, ({ one }) => ({
    user: one(userTable, {
        fields: [apikeyTable.userId],
        references: [userTable.id],
    }),
}));

export const passkeyRelations = relations(passkeyTable, ({ one }) => ({
    user: one(userTable, {
        fields: [passkeyTable.userId],
        references: [userTable.id],
    }),
}));

export const twoFactorRelations = relations(twoFactorTable, ({ one }) => ({
    user: one(userTable, {
        fields: [twoFactorTable.userId],
        references: [userTable.id],
    }),
}));

export const organizationRelations = relations(organizationTable, ({ many }) => ({
    teams: many(teamTable),
    members: many(memberTable),
    invitations: many(invitationTable),
}));

export const teamRelations = relations(teamTable, ({ one, many }) => ({
    organization: one(organizationTable, {
        fields: [teamTable.organizationId],
        references: [organizationTable.id],
    }),
    teamMembers: many(teamMemberTable),
}));

export const teamMemberRelations = relations(teamMemberTable, ({ one }) => ({
    team: one(teamTable, {
        fields: [teamMemberTable.teamId],
        references: [teamTable.id],
    }),
    user: one(userTable, {
        fields: [teamMemberTable.userId],
        references: [userTable.id],
    }),
}));

export const memberRelations = relations(memberTable, ({ one }) => ({
    organization: one(organizationTable, {
        fields: [memberTable.organizationId],
        references: [organizationTable.id],
    }),
    user: one(userTable, {
        fields: [memberTable.userId],
        references: [userTable.id],
    }),
}));

export const invitationRelations = relations(invitationTable, ({ one }) => ({
    organization: one(organizationTable, {
        fields: [invitationTable.organizationId],
        references: [organizationTable.id],
    }),
    user: one(userTable, {
        fields: [invitationTable.inviterId],
        references: [userTable.id],
    }),
}));

export const ssoProviderRelations = relations(ssoProviderTable, ({ one }) => ({
    user: one(userTable, {
        fields: [ssoProviderTable.userId],
        references: [userTable.id],
    }),
    organization: one(organizationTable, {
        fields: [ssoProviderTable.organizationId],
        references: [organizationTable.id],
    }),
}));
