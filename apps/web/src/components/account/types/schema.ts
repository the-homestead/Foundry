// biome-ignore lint/performance/noNamespaceImport: <Zod>
import * as z from "zod";

export const accountSchema = z
    .object({
        fullName: z.string().min(2, "Enter your full name"),
        username: z.string().min(3, "Username must be at least 3 characters").max(20),
        email: z.string().email("Enter a valid email"),
        firstName: z.string().optional(),
        firstNamePublic: z.boolean().optional(),
        lastName: z.string().optional(),
        lastNamePublic: z.boolean().optional(),
        age: z
            .string()
            .optional()
            .refine((value) => (value ? !Number.isNaN(Number(value)) : true), {
                message: "Enter a valid age",
            }),
        agePublic: z.boolean().optional(),
        currentPassword: z.string().optional(),
        newPassword: z.string().optional(),
        confirmPassword: z.string().optional(),
    })
    .refine(
        (data) => {
            const hasPasswordChange = Boolean(data.currentPassword || data.newPassword || data.confirmPassword);
            if (!hasPasswordChange) {
                return true;
            }
            const hasAllFields = Boolean(data.currentPassword && data.newPassword && data.confirmPassword);
            if (!hasAllFields) {
                return false;
            }
            return data.newPassword === data.confirmPassword;
        },
        {
            message: "Passwords must match and include the current password",
            path: ["confirmPassword"],
        }
    );
