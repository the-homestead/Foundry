import { execa } from "execa";
import fs from "fs-extra";
import MagicString from "magic-string";
import path from "pathe";

const configPath = path.resolve("./src/lib/auth.ts");

// IMPORTANT: make this relative, not absolute
const schemaPathRelative = path.join("..", "..", "packages", "database", "src", "schemas", "users", "tables.ts");

// For *your* fs work later, keep an absolute version
const schemaPathAbsolute = path.resolve(schemaPathRelative);

async function main() {
    await execa("npx", ["@better-auth/cli@latest", "generate", "--config", configPath, "--output", schemaPathRelative, "-y"], { stdio: "inherit" });

    const originalContent = await fs.readFile(schemaPathAbsolute, "utf8");
    const s = new MagicString(originalContent);

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

    s.replace(/export const (\w+) = pgTable/g, (_match, tableName) => {
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
        s.replace(new RegExp(`\\(\\)\\s*=>\\s*${tableName}\\s*\\.`, "g"), (match) => match.replace(tableName, `${tableName}Table`));
    }
    const relationsPath = path.resolve(path.dirname(schemaPathAbsolute), "relations.ts");

    if (await fs.pathExists(relationsPath)) {
        const relationsContent = await fs.readFile(relationsPath, "utf8");
        const r = new MagicString(relationsContent);

        // 1) Fix imports from ./tables
        r.replace(/import\s*{\s*([^}]+)\s*}\s*from\s*["']\.\/tables["'];?/g, (_match, imports) => {
            const fixed = imports
                .split(",")
                .map((s: string) => s.trim())
                .map((name: string) => (name.endsWith("Table") ? name : `${name}Table`))
                .join(", ");
            return `import { ${fixed} } from "./tables";`;
        });

        // 2) Fix all bare table identifiers
        for (const tableName of tableNames) {
            const tableTable = `${tableName}Table`;

            // relations(user, ...) → relations(userTable, ...)
            r.replace(new RegExp(`relations\\(\\s*${tableName}\\s*,`, "g"), `relations(${tableTable},`);

            // many(session) → many(sessionTable)
            r.replace(new RegExp(`many\\(\\s*${tableName}\\s*\\)`, "g"), `many(${tableTable})`);

            // one(user, ...) → one(userTable, ...)
            r.replace(new RegExp(`one\\(\\s*${tableName}\\s*,`, "g"), `one(${tableTable},`);

            // session.userId → sessionTable.userId
            r.replace(new RegExp(`\\b${tableName}\\.`, "g"), `${tableTable}.`);
        }

        await fs.writeFile(relationsPath, r.toString(), "utf8");
        console.log("√ Rewrote relations.ts to use *Table symbols");
    } else {
        console.warn("⚠ relations.ts not found, skipping relation rewrite");
    }
    await fs.writeFile(schemaPathAbsolute, s.toString(), "utf8");
}

(async () => {
    try {
        await main();
    } catch (error) {
        console.error("Error:", error);
        process.exit(1);
    }
})();
