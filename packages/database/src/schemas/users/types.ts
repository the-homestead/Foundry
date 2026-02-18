import type { InferSelectModel } from "drizzle-orm";

import type { memberTable, organizationTable, sessionTable, teamMemberTable, teamTable, userNotificationSettingsTable, userTable } from "./tables";

export type Session = InferSelectModel<typeof sessionTable>;
export type User = InferSelectModel<typeof userTable>;
export type Member = InferSelectModel<typeof memberTable>;
export type Organization = InferSelectModel<typeof organizationTable>;
export type Team = InferSelectModel<typeof teamTable>;
export type TeamMember = InferSelectModel<typeof teamMemberTable>;
export type UserNotificationSettings = InferSelectModel<typeof userNotificationSettingsTable>;
