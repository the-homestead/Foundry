import type { NextConfig } from "next";

const path = require("node:path");

require("dotenv-mono").load({
    path: "./.env",
});
const nextConfig: NextConfig = {
    pageExtensions: ["ts", "tsx", "mdx"],
    typedRoutes: true,
    poweredByHeader: false,
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
        loader: "custom",
        loaderFile: "./scripts/image-loader.ts",
        formats: ["image/avif", "image/webp"],
        remotePatterns: [
            { hostname: "**.githubassets.com", protocol: "https" },
            { hostname: "**.githubusercontent.com", protocol: "https" },
            { hostname: "**.googleusercontent.com", protocol: "https" },
            { hostname: "**.ufs.sh", protocol: "https" },
            { hostname: "**.unsplash.com", protocol: "https" },
            { hostname: "api.github.com", protocol: "https" },
            { hostname: "utfs.io", protocol: "https" },
        ],
    },
};

export default nextConfig;
