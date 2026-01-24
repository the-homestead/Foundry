// biome-ignore lint/performance/noNamespaceImport: <Def>
import * as Sentry from "@sentry/node";

// import { nodeProfilingIntegration } from "@sentry/profiling-node";

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
Sentry.captureMessage("Backend service started");
