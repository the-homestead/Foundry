import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const nextConfig: NextConfig = {
    pageExtensions: ["ts", "tsx", "mdx"],
    typedRoutes: true,
    poweredByHeader: false,
    // Ensure cross-origin requests include credentials where needed (cookies)
    crossOrigin: "use-credentials",
    allowedDevOrigins: ["auth.homestead.systems", "*.homestead.systems"],
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
    // Cache lifetime profiles for Next.js v16 cache APIs (revalidateTag / cacheLife)
    // Profiles are in seconds — use these in components/server-actions via revalidateTag()
    cacheLife: {
        default: { expire: 60 }, // conservative default (1 minute)
        short: { expire: 10 }, // small, frequently-changing bits
        medium: { expire: 300 }, // 5 minutes
        long: { expire: 3600 }, // 1 hour
        max: { expire: 86_400 }, // 1 day
    },
};

const withNextIntl = createNextIntlPlugin();
export default withNextIntl(nextConfig);
