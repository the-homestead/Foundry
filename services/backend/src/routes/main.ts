import { createRouter } from "@foundry/backend/lib/create-app.js";
import { describeRoute, resolver, validator as zValidator } from "hono-openapi";
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

export default router;
