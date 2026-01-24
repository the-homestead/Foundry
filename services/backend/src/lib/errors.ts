/** biome-ignore-all lint/style/useConsistentMemberAccessibility: <Def> */
import type { Context } from "hono";
import type { ContentfulStatusCode } from "hono/utils/http-status";
import { z } from "zod";

export const errorResponseSchema = z.object({
    error: z.object({
        code: z.string(),
        message: z.string(),
        type: z.enum(["client", "server"]),
        details: z.unknown().optional(),
    }),
});

export type ErrorResponse = z.infer<typeof errorResponseSchema>;

export class APIError extends Error {
    public readonly code: string;
    public readonly statusCode: ContentfulStatusCode;
    public readonly type: "client" | "server";
    public readonly details?: unknown;

    constructor(code: string, message: string, type: "client" | "server" = "server", statusCode: ContentfulStatusCode = 500, details?: unknown) {
        super(message);
        this.code = code;
        this.type = type;
        this.statusCode = statusCode;
        this.details = details;
        this.name = "APIError";
    }
}

export function createErrorResponse(error: APIError): ErrorResponse {
    return {
        error: {
            code: error.code,
            message: error.message,
            type: error.type,
            details: error.details,
        },
    };
}

export function handleError(c: Context, error: unknown) {
    if (error instanceof APIError) {
        return c.json(createErrorResponse(error), error.statusCode);
    }

    console.error("Unhandled error:", error);
    const internalError = new APIError("INTERNAL_ERROR", "An unexpected error occurred", "server", 500);
    return c.json(createErrorResponse(internalError), 500);
}
