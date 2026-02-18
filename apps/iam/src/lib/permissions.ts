import { createAccessControl } from "better-auth/plugins/access";
import { adminAc, defaultStatements } from "better-auth/plugins/admin/access";

/**
 * make sure to use `as const` so typescript can infer the type correctly
 */
const statement = {
    ...defaultStatements,
    project: ["create", "share", "update", "delete"],
} as const;

export const ac = createAccessControl(statement);

export const userRole = ac.newRole({
    project: ["create"],
});
export const adminRole = ac.newRole({
    project: ["create", "update"],
    ...adminAc.statements,
});
export const devRole = ac.newRole({
    project: ["create", "update", "delete"],
    user: ["ban"],
});
