import { dotenvLoad } from "dotenv-mono";
import type { Config } from "drizzle-kit";

const dotenv = dotenvLoad();

export default {
    schema: "./src/schemas/index.ts",
    out: "./src/migrations",
    dialect: "postgresql",
    dbCredentials: {
        url: dotenv.env.DATABASE_URL || "",
    },
} satisfies Config;
