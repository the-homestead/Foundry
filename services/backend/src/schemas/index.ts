import z from "zod/v4";

// Validation for query parameters, eg - `/hello?name=John`
export const querySchema = z.object({
    name: z.string().optional(),
});

// Validation for response body, eg - `"Hello, John!"`
export const responseSchema = z.string();
