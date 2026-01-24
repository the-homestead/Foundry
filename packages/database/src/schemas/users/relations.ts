import { relations } from "drizzle-orm";
import { accountTable, apikeyTable, passkeyTable, sessionTable, twoFactorTable, userTable } from "./tables";

export const userRelations = relations(userTable, ({ many }) => ({
    sessions: many(sessionTable),
    accounts: many(accountTable),
    apikeys: many(apikeyTable),
    passkeys: many(passkeyTable),
    twoFactors: many(twoFactorTable),
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
