import createApp from "@foundry/backend/lib/create-app.js";
import auth from "@foundry/backend/routes/auth.js";
import main from "@foundry/backend/routes/main.js";
import { serve } from "@hono/node-server";
import { openAPIRouteHandler } from "hono-openapi";
import { rateLimiter } from "hono-rate-limiter";

const app = createApp();

const routes = [
    { prefix: "/", router: main },
    { prefix: "/api/auth", router: auth },
];

// const mainRoutes = [main] as const;
// const authRoutes = [auth] as const;
app.basePath("/");
for (const route of routes) {
    app.route(route.prefix, route.router);
}

// for (const route of mainRoutes) {
//     app.basePath("/").route("/", route);
// }

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
        port: 3100,
    },
    (info) => {
        console.log(`Server is running on http://localhost:${info.port}`);
    }
);
