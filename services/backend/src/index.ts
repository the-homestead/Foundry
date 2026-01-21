import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { openAPIRouteHandler } from "hono-openapi";
import { rateLimiter } from "hono-rate-limiter";
import routes from "./routes";

const app = new Hono();

// This configuration limits each client to 100 requests per 15-minute window. When a client exceeds the limit, they receive a 429 Too Many Requests response.
app.use(
    rateLimiter({
        windowMs: 15 * 60 * 1000, // 15 minutes
        limit: 100, // Limit each client to 100 requests per window
        keyGenerator: (c) => c.req.header("x-forwarded-for") ?? "", // Use IP address as key
    })
);

app.get(
    "/openapi.json",
    openAPIRouteHandler(routes, {
        documentation: {
            info: {
                title: "Hono",
                version: "1.0.0",
                description: "API for greeting users",
            },
        },
    })
);

serve(
    {
        fetch: app.fetch,
        port: 3000,
    },
    (info) => {
        console.log(`Server is running on http://localhost:${info.port}`);
    }
);
