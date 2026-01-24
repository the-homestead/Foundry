import { auth } from "@foundry/backend/lib/auth.js";
import { createRouter } from "@foundry/backend/lib/create-app.js";
import { accountTable, db, eq, sql, userTable, verificationTable } from "@foundry/database";
import bcrypt from "bcryptjs";
import { v4 as uuidv4 } from "uuid";
import { sendResetEmail } from "../lib/mailer.js";

const router = createRouter();

// Explicit forgot-password handler: create verification token and email the user
router.post("/forgot", async (c) => {
    try {
        const body = await c.req.json().catch(() => ({}));
        const email = String(body?.email ?? "")
            .toLowerCase()
            .trim();
        // Always return 200 to avoid leaking user existence
        if (!email) {
            return c.json({ ok: true });
        }

        // find user by email
        const user = await db.query.userTable.findFirst({ where: eq(userTable.email, email) });
        if (!user) {
            return c.json({ ok: true });
        }

        const token = uuidv4();
        const expires = new Date(Date.now() + 1000 * 60 * 60); // 1 hour

        await db.insert(verificationTable).values({ id: uuidv4(), identifier: email, value: token, expiresAt: expires }).execute();

        await sendResetEmail(email, token);

        return c.json({ ok: true });
    } catch (err) {
        console.error("forgot handler error", err);
        return c.json({ ok: true });
    }
});

// Explicit reset-password handler: validate token and update the user's password
router.post("/reset", async (c) => {
    try {
        const body = await c.req.json().catch(() => ({}));
        const token = String(body?.token ?? "").trim();
        const password = String(body?.password ?? "");
        if (!(token && password)) {
            return c.json({ ok: false, error: "invalid" }, 400);
        }

        const now = new Date();
        const verification = await db.query.verificationTable.findFirst({ where: sql`value = ${token} AND expires_at > ${now}` });
        if (!verification) {
            return c.json({ ok: false, error: "invalid_or_expired" }, 400);
        }

        const email = verification.identifier;
        const user = await db.query.userTable.findFirst({ where: eq(userTable.email, email) });
        if (!user) {
            return c.json({ ok: false, error: "user_not_found" }, 400);
        }

        // Hash password and update account row(s) for this user that hold passwords
        const hashed = await bcrypt.hash(password, 10);
        await db.update(accountTable).set({ password: hashed }).where(eq(accountTable.userId, user.id)).execute();

        // Delete the verification row
        await db.delete(verificationTable).where(eq(verificationTable.value, token)).execute();

        return c.json({ ok: true });
    } catch (err) {
        console.error("reset handler error", err);
        return c.json({ ok: false, error: "server_error" }, 500);
    }
});

// Fallback: let better-auth handle all other auth routes
router.on(["POST", "GET"], "/*", (c) => {
    return auth.handler(c.req.raw);
});

export default router;
