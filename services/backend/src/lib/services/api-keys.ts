import { auth } from "@foundry/backend/lib/auth.js";
import { APIError } from "../errors.js";

interface AuthApiClient {
    createApiKey: (input: {
        body: {
            name?: string;
            prefix?: string;
            expiresIn?: number;
            userId: string;
            permissions?: Record<string, string[]>;
            metadata?: unknown;
        };
    }) => Promise<unknown>;
}

export async function createApiKeyService(userId: string, name?: string, prefix?: string, expiresIn?: number, permissions?: Record<string, string[]>, metadata?: unknown) {
    try {
        const apiClient = auth.api as unknown as AuthApiClient;
        const result = await apiClient.createApiKey({
            body: {
                name: name || undefined,
                prefix: prefix || undefined,
                expiresIn,
                userId,
                permissions,
                metadata,
            },
        });
        return result;
    } catch (error) {
        throw new APIError("API_KEY_CREATION_FAILED", "Failed to create API key", "server", 500, error);
    }
}
