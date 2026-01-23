import type { auth } from "@foundry/backend/lib/auth.js";
import { Hono } from "hono";

export interface AuthType {
    Variables: {
        user: typeof auth.$Infer.Session.user | null;
        session: typeof auth.$Infer.Session.session | null;
    };
}

export function createRouter() {
    return new Hono<{ Bindings: AuthType }>({
        strict: false,
    });
}

export default function createApp() {
    const app = createRouter();

    return app;
}
