import { z } from "zod";

export const gameFormSchema = z.object({
    name: z.string().min(1, "Name is required"),
    slug: z
        .string()
        .min(1, "Slug is required")
        .regex(/^[a-z0-9-]+$/, "Slug must be lowercase alphanumeric with dashes"),
    description: z.string().min(1, "Description is required"),
    images: z.object({
        cover: z.string().url("Must be a valid URL").optional().or(z.literal("")),
        icon: z.string().url("Must be a valid URL").optional().or(z.literal("")),
        background: z.string().url("Must be a valid URL").optional().or(z.literal("")),
    }),
    capabilities: z.object({
        versions: z.string().refine((val) => val.length > 0, "At least one version is required (comma separated)"),
        modloaders: z.string().refine((val) => val.length > 0, "At least one modloader is required (comma separated)"),
    }),
});

export type GameFormData = z.infer<typeof gameFormSchema>;
