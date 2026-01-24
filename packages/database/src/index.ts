/** biome-ignore-all lint/performance/noNamespaceImport: Def */
import { drizzle } from "drizzle-orm/node-postgres";

// biome-ignore lint/performance/noBarrelFile: Def
export { eq, sql } from "drizzle-orm";

import { Pool } from "pg";
import * as schemaModules from "./schemas";
import { accountTable, apikeyTable, sessionTable, twoFactorTable, userTable, verificationTable } from "./schemas/users/tables";

export * from "./schemas";

const schema = {
    ...schemaModules,
    user: userTable,
    session: sessionTable,
    account: accountTable,
    verification: verificationTable,
    twofactor: twoFactorTable,
    apikey: apikeyTable,
    passkey: schemaModules.passkeyTable,
} as const;

export { schema };

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
