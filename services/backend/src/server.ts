/** biome-ignore-all lint/performance/noNamespaceImport: <Def> */

import createApp from "@foundry/backend/lib/create-app.js";
import apiKeys from "@foundry/backend/routes/api-keys.js";
import auth from "@foundry/backend/routes/auth.js";
import main from "@foundry/backend/routes/main.js";
import { serve } from "@hono/node-server";
import { swaggerUI } from "@hono/swagger-ui";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { prettyJSON } from "hono/pretty-json";
import { openAPIRouteHandler } from "hono-openapi";
import { rateLimiter } from "hono-rate-limiter";

const app = createApp();

app.use(logger());
app.use(
    prettyJSON({
        space: 4,
    })
);
app.use(
    "/api/auth/*",
    cors({
        origin: process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
        allowHeaders: ["Content-Type", "Authorization"],
        allowMethods: ["POST", "GET", "OPTIONS"],
        exposeHeaders: ["Content-Length"],
        maxAge: 600,
        credentials: true,
    })
);

app.use(
    "/api/keys/*",
    cors({
        origin: process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
        allowHeaders: ["Content-Type", "Authorization"],
        allowMethods: ["POST", "GET", "OPTIONS"],
        exposeHeaders: ["Content-Length"],
        maxAge: 600,
        credentials: true,
    })
);

const routes = [
    { prefix: "/v0", router: main },
    { prefix: "/v0/api/keys", router: apiKeys },
    { prefix: "/api/auth", router: auth },
];

app.basePath("/");
for (const route of routes) {
    app.route(route.prefix, route.router);
}

app.get("/docs", swaggerUI({ url: "/openapi.json" }));

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
    openAPIRouteHandler(app, {
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
        hostname: "0.0.0.0",
        port: Number(process.env.BACKEND_PORT) || 3300,
    },
    (info) => {
        console.log(`Server is running on http://localhost:${info.port}`);
    }
);
