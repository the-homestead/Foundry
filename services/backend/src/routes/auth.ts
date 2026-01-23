import { auth } from "@foundry/backend/lib/auth.js";
import { createRouter } from "@foundry/backend/lib/create-app.js";

const router = createRouter();

router.on(["POST", "GET"], "/auth/**", (c) => {
    return auth.handler(c.req.raw);
});

export default router;
