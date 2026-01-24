import { createRouter } from "@foundry/backend/lib/create-app.js";
import { describeRoute, resolver, validator as zValidator } from "hono-openapi";
import { z } from "zod";
import { querySchema, responseSchema } from "../schemas/index.js";

const router = createRouter();

router.get(
    "/",
    describeRoute({
        responses: {
            200: {
                description: "Successful response",
                content: {
                    "application/json": {
                        schema: resolver(responseSchema),
                    },
                },
            },
        },
    }),
    zValidator("query", querySchema),
    (c) => {
        const query = c.req.valid("query");
        return c.text(`Hello ${query?.name ?? "Hono"}!`);
    }
);

router.get(
    "/health",
    describeRoute({
        responses: {
            200: {
                description: "Health check response",
                content: {
                    "application/json": {
                        schema: resolver(z.object({ status: z.string() })),
                    },
                },
            },
        },
    }),
    (c) => {
        return c.json({ status: "ok" });
    }
);

export default router;
