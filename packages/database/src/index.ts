import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
// biome-ignore lint/performance/noNamespaceImport: Needed for db
import * as schema from "./schemas";

// biome-ignore lint/performance/noBarrelFile: Needed for db
export * from "./schemas";

const { Dotenv } = require("dotenv-mono");
const dotenv = new Dotenv(/* config */);
dotenv.load();

// Ensure the database URL is set
if (!process.env.DATABASE_URL) {
    throw new Error("🔴 DATABASE_URL environment variable is not set");
}

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: true, // same as sslmode=verify-full
    },
});

function checkLogger(): boolean {
    const check = process.env.DEBUG && process.env.NODE_ENV !== "production";
    return check as boolean;
}

const result: boolean = checkLogger();

export const db = drizzle(pool, { schema, logger: result });
