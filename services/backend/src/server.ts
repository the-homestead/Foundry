/** biome-ignore-all lint/performance/noNamespaceImport: <Def> */

import createApp from "@foundry/backend/lib/create-app.js";
import apiKeys from "@foundry/backend/routes/api-keys.js";
import auth from "@foundry/backend/routes/auth.js";
import main from "@foundry/backend/routes/main.js";
import { serve } from "@hono/node-server";
import { swaggerUI } from "@hono/swagger-ui";
import * as Sentry from "@sentry/node";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { prettyJSON } from "hono/pretty-json";
import { openAPIRouteHandler } from "hono-openapi";
import { rateLimiter } from "hono-rate-limiter";

const app = createApp();
Sentry.init({
    dsn: "https://c1dbd93c9567243b7f35fedd7681f587@sentry.myhm.space/11",

    // Adds request headers and IP for users, for more info visit:
    // https://docs.sentry.io/platforms/javascript/guides/hono/configuration/options/#sendDefaultPii
    sendDefaultPii: true,
    // integrations: [
    //     // Add our Profiling integration
    //     nodeProfilingIntegration(),
    // ],
    // Set tracesSampleRate to 1.0 to capture 100%
    // of transactions for tracing.
    // We recommend adjusting this value in production
    // Learn more at
    // https://docs.sentry.io/platforms/javascript/guides/hono/configuration/options/#tracesSampleRate
    tracesSampleRate: 1.0,
    // Set profilesSampleRate to 1.0 to profile 100%
    // of sampled transactions.
    // This is relative to tracesSampleRate
    // Learn more at
    // https://docs.sentry.io/platforms/javascript/guides/hono/configuration/options/#profilesSampleRate
    profilesSampleRate: 1.0,
    // Enable logs to be sent to Sentry
    enableLogs: true,
});
interface SessionData {
    user?: {
        email?: string | null;
    };
    projectId?: number | string | null;
}

app.use(logger());
app.use(
    prettyJSON({
        space: 4,
    })
);
app.use(
    "/v0/api/auth/*",
    cors({
        origin: [`${process.env.NEXT_PUBLIC_APP_URL}`, "http://localhost:3000", `${process.env.NEXT_PUBLIC_SERVER_APP_URL}/`],
        allowHeaders: ["Content-Type", "Authorization"],
        allowMethods: ["POST", "GET", "OPTIONS"],
        exposeHeaders: ["Content-Length"],
        maxAge: 600,
        credentials: true,
    })
);

app.use(
    "/v0/api/keys/*",
    cors({
        origin: [`${process.env.NEXT_PUBLIC_APP_URL}`, "http://localhost:3000", `${process.env.NEXT_PUBLIC_SERVER_APP_URL}/`],
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
    { prefix: "/v0/api/auth", router: auth },
];

app.basePath("/");
for (const route of routes) {
    app.route(route.prefix, route.router);
}

// Sentry context middleware (after routes to access session)
app.use("*", (c, next) => {
    // Only set user context if session exists and has user data
    const session = c.get("session") as SessionData | undefined;
    if (session?.user?.email) {
        Sentry.setUser({
            email: session.user.email,
        });
    }

    // Only set project tag if session has project data
    if (session?.projectId !== undefined && session?.projectId !== null) {
        Sentry.setTag("project_id", session.projectId);
    }

    return next();
});

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
        port: Number(process.env.BACKEND_PORT) || 3100,
    },
    (info) => {
        console.log(`Server is running on http://localhost:${info.port}`);
    }
);

// process.on("SIGINT", () => {
//     server.close();
//     process.exit(0);
// });
// process.on("SIGTERM", () => {
//     server.close((err) => {
//         if (err) {
//             console.error(err);
//             process.exit(1);
//         }
//         process.exit(0);
//     });
// });
