import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const path = require("node:path");

require("dotenv-mono").load({
    path: "./.env",
});
const nextConfig: NextConfig = {
    pageExtensions: ["ts", "tsx", "mdx"],
    typedRoutes: true,
    poweredByHeader: false,
    crossOrigin: "use-credentials",
    turbopack: {
        root: path.join(__dirname, "..", ".."),
    },
    logging: {
        fetches: {
            fullUrl: true,
            hmrRefreshes: true,
        },
    },
    experimental: {
        inlineCss: true,
        typedEnv: true,
        mdxRs: true,
    },
    images: {
        // loader: "custom",
        // loaderFile: "./scripts/image-loader.ts",
        formats: ["image/avif", "image/webp"],
        remotePatterns: [
            { hostname: "**.githubassets.com", protocol: "https" },
            { hostname: "**.github.com", protocol: "https" },
            { hostname: "github.com", protocol: "https" },
            { hostname: "icons.duckduckgo.com", protocol: "https" },
            { hostname: "images.pexels.com", protocol: "https" },
            { hostname: "**.githubusercontent.com", protocol: "https" },
            { hostname: "**.googleusercontent.com", protocol: "https" },
            { hostname: "**.ufs.sh", protocol: "https" },
            { hostname: "**.unsplash.com", protocol: "https" },
            { hostname: "api.github.com", protocol: "https" },
            { hostname: "utfs.io", protocol: "https" },
            { hostname: "i.imgur.com", protocol: "https" },
            { hostname: "picsum.photos", protocol: "https" },
            { hostname: "cdn.discordapp.com", protocol: "https" },
            { hostname: "i.pravatar.cc", protocol: "https" },
        ],
    },
};

const withNextIntl = createNextIntlPlugin();
export default withNextIntl(nextConfig);

// export default withSentryConfig(nextConfig, {
//     // For all available options, see:
//     // https://www.npmjs.com/package/@sentry/webpack-plugin#options

//     org: "sentry",

//     project: "foundry-web",
//     sentryUrl: "https://sentry.myhm.space/",

//     // Only print logs for uploading source maps in CI
//     silent: !process.env.CI,

//     // For all available options, see:
//     // https://docs.sentry.io/platforms/javascript/guides/nextjs/manual-setup/

//     // Upload a larger set of source maps for prettier stack traces (increases build time)
//     widenClientFileUpload: true,

//     // Route browser requests to Sentry through a Next.js rewrite to circumvent ad-blockers.
//     // This can increase your server load as well as your hosting bill.
//     // Note: Check that the configured route will not match with your Next.js middleware, otherwise reporting of client-
//     // side errors will fail.
//     //   tunnelRoute: "/monitoring",

//     webpack: {
//         // Enables automatic instrumentation of Vercel Cron Monitors. (Does not yet work with App Router route handlers.)
//         // See the following for more information:
//         // https://docs.sentry.io/product/crons/
//         // https://vercel.com/docs/cron-jobs
//         automaticVercelMonitors: true,

//         // Tree-shaking options for reducing bundle size
//         treeshake: {
//             // Automatically tree-shake Sentry logger statements to reduce bundle size
//             removeDebugLogging: true,
//         },
//     },
// });
