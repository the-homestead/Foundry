import { z } from "zod";

const trimmedString = z.string().trim();
const optionalString = trimmedString.optional().transform((value) => (value && value.length > 0 ? value : undefined));

export const listUsersQuerySchema = z.object({
    searchValue: optionalString,
    searchField: z.enum(["email", "name"]).optional(),
    searchOperator: z.enum(["contains", "starts_with", "ends_with"]).optional(),
    limit: z.number().int().min(1).max(200).optional(),
    offset: z.number().int().min(0).optional(),
    sortBy: optionalString,
    sortDirection: z.enum(["asc", "desc"]).optional(),
    filterField: optionalString,
    filterValue: z.union([z.string(), z.number(), z.boolean()]).optional(),
    filterOperator: z.enum(["eq", "ne", "lt", "lte", "gt", "gte"]).optional(),
});

export const createUserSchema = z.object({
    email: trimmedString.email(),
    password: trimmedString.min(8),
    name: trimmedString.min(1),
    role: z.union([trimmedString, z.array(trimmedString)]).optional(),
    data: z.record(z.string(), z.unknown()).optional(),
});

export const updateUserSchema = z.object({
    userId: trimmedString.min(1),
    data: z.record(z.string(), z.unknown()),
});

export const setRoleSchema = z.object({
    userId: trimmedString.min(1),
    role: z.union([trimmedString, z.array(trimmedString)]),
});

export const setPasswordSchema = z.object({
    userId: trimmedString.min(1),
    newPassword: trimmedString.min(8),
});

export const banUserSchema = z.object({
    userId: trimmedString.min(1),
    banReason: optionalString,
    banExpiresIn: z.number().int().min(1).optional(),
});

export const unbanUserSchema = z.object({
    userId: trimmedString.min(1),
});

export const impersonateSchema = z.object({
    userId: trimmedString.min(1),
});

export const listUserSessionsSchema = z.object({
    userId: trimmedString.min(1),
});

export const revokeSessionsSchema = z.object({
    userId: trimmedString.min(1),
});

export const revokeSessionSchema = z.object({
    sessionToken: trimmedString.min(1),
});

export const removeUserSchema = z.object({
    userId: trimmedString.min(1),
});

export const permissionCheckSchema = z.object({
    permissions: z.record(z.string(), z.array(z.string().min(1))).refine((value) => Object.keys(value).length > 0, {
        message: "Permissions must not be empty.",
    }),
});

export const userSchema = z.object({
    id: trimmedString,
    email: z.string().email().optional().nullable(),
    name: z.string().optional().nullable(),
    role: z
        .union([z.string(), z.array(z.string())])
        .optional()
        .nullable(),
    banned: z.boolean().optional().nullable(),
    banReason: z.string().optional().nullable(),
    banExpires: z.string().optional().nullable(),
});

export const listUsersResponseSchema = z.object({
    users: z.array(userSchema),
    total: z.number(),
    limit: z.number().optional().nullable(),
    offset: z.number().optional().nullable(),
});

export const sessionSchema = z.object({
    sessionToken: trimmedString,
    expiresAt: z.string().optional().nullable(),
    createdAt: z.string().optional().nullable(),
    userId: trimmedString.optional().nullable(),
    impersonatedBy: z.string().optional().nullable(),
});

export const listSessionsResponseSchema = z.object({
    sessions: z.array(sessionSchema).optional(),
    total: z.number().optional(),
    limit: z.number().optional(),
    offset: z.number().optional(),
});

export type AdminUser = z.infer<typeof userSchema>;
export type AdminSession = z.infer<typeof sessionSchema>;
