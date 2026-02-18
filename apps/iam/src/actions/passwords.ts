"use server";

import auth from "@foundry/iam/lib/auth";

/**
 * Server action to reset a user's password using a verification token.
 * Delegates to Better‑Auth's server API so the operation runs authoritatively on the server.
 */
export async function resetPasswordWithToken({ token, newPassword }: { token?: string; newPassword: string }): Promise<unknown> {
    if (!token) {
        throw new Error("token is required");
    }
    if (!newPassword) {
        throw new Error("newPassword is required");
    }

    try {
        // Better‑Auth client API expects request parts to be namespaced (body/query).
        // call shape: auth.api.resetPassword({ body: { newPassword, token } })
        const result = await auth.api.resetPassword({ body: { newPassword, token } });
        // forward SDK result so client can handle messages/errors
        return result as unknown;
    } catch (err) {
        console.error("resetPasswordWithToken failed:", err);
        throw err;
    }
}
