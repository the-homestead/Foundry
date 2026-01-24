import type { auth } from "@foundry/backend/lib/auth.js";
// biome-ignore lint/performance/noNamespaceImport: <Def>
import * as Sentry from "@sentry/node";
import { Hono } from "hono";
import { HTTPException } from "hono/http-exception";
import { handleError } from "./errors.js";

export interface AuthType {
    Variables: {
        user: typeof auth.$Infer.Session.user | null;
        session: typeof auth.$Infer.Session.session | null;
    };
}

export function createRouter() {
    return new Hono<AuthType>({
        strict: false,
    });
}

export default function createApp() {
    const app = createRouter();

    // Security middleware
    app.use("*", async (c, next) => {
        // Set security headers
        c.header("X-Content-Type-Options", "nosniff");
        c.header("X-Frame-Options", "DENY");
        c.header("X-XSS-Protection", "1; mode=block");
        c.header("Referrer-Policy", "strict-origin-when-cross-origin");
        await next();
    });

    // Error handling middleware
    app.onError((err, c) => {
        // Report _all_ unhandled errors.
        Sentry.captureException(err);
        if (err instanceof HTTPException) {
            return err.getResponse();
        }
        // Or just report errors which are not instances of HTTPException
        // Sentry.captureException(err);
        return handleError(c, err);
    });

    return app;
}
