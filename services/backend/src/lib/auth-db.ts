import { dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { execa } from "execa";
import fs from "fs-extra";
import MagicString from "magic-string";
import path from "pathe";

// Derive __dirname for ESM environments
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const configPath = path.resolve(__dirname, "./auth.ts");
const schemaPath = path.resolve(__dirname, "../../../../packages/database/src/schemas/users/tables.ts");

async function main() {
    // Use execa with an argv array to avoid shell-specific quoting issues
    await execa("npx", ["@better-auth/cli@latest", "generate", "--config", configPath, "--output", schemaPath, "-y"], {
        stdio: "inherit",
    });

    const filePath = path.resolve(schemaPath);
    const originalContent = await fs.readFile(filePath, "utf8");

    const s = new MagicString(originalContent);

    // Saner notice header (no Bun mention)
    const notice = `/**
 * THIS FILE IS AUTO-GENERATED - DO NOT EDIT DIRECTLY
 *
 * To modify the schema, edit src/lib/auth.ts instead,
 * then run your project's regenerating script to regenerate this file.
 *
 * Any direct changes to this file will be overwritten.
 */

`;
    s.prepend(notice);

    s.replace(/export const (\w+) = pgTable/g, (_match: string, tableName: string) => {
        const finalName = tableName.endsWith("Table") ? tableName : `${tableName}Table`;
        return `export const ${finalName} = pgTable`;
    });

    const tableNames: string[] = [];
    const tableMatches = originalContent.matchAll(/export const (\w+) = pgTable/g);

    for (const match of tableMatches) {
        if (match[1]) {
            tableNames.push(match[1]);
        }
    }

    console.log("√ Ensured better-auth tables:", tableNames);

    for (const tableName of tableNames) {
        s.replace(new RegExp(`\\(\\)\\s*=>\\s*${tableName}\\s*\\.`, "g"), (match: string) => {
            return match.replace(tableName, `${tableName}Table`);
        });
    }

    await fs.writeFile(filePath, s.toString(), "utf8");
}

(async () => {
    try {
        await main();
    } catch (error) {
        console.error("Error:", error);
        process.exit(1);
    }
})();
