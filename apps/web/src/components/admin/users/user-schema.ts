import { z } from "zod";

export const userFormSchema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().email("Invalid email address"),
    role: z.string().min(1, "Role is required"),
    password: z.string().min(8, "Password must be at least 8 characters").optional(),
    image: z.string().url("Invalid URL").optional().or(z.literal("")),
    isBanned: z.boolean().default(false).optional(),
    banReason: z.string().optional(),
});

export type UserFormValues = z.infer<typeof userFormSchema>;

export interface AdminUser {
    id: string;
    name: string;
    email: string;
    image?: string | null;
    role?: string;
    createdAt: string | Date;
    banned?: boolean;
    banReason?: string;
    banExpires?: Date | number | null;
}
