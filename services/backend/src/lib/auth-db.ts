import { execa } from "execa";
import fs from "fs-extra";
import MagicString from "magic-string";
import path from "pathe";

const IMPORT_FROM_TABLES_REGEX = /import\s*{\s*([^}]+)\s*}\s*from\s*["']\.\/tables["'];?/;

const configPath = path.resolve("./src/lib/auth.ts");

// IMPORTANT: make this relative, not absolute
const schemaPathRelative = path.join("..", "..", "packages", "database", "src", "schemas", "users", "tables.ts");

// For *your* fs work later, keep an absolute version
const schemaPathAbsolute = path.resolve(schemaPathRelative);

/* biome-ignore lint/complexity/noExcessiveCognitiveComplexity: <Def> */
async function extractAndMergeRelationBlocks(schemaPath: string, content: string) {
    const relationBlockRegex = /export const\s+\w+\s*=\s*relations\([\s\S]*?\}\s*\)\s*;?/g;
    const relationBlocks = Array.from(content.matchAll(relationBlockRegex)).map((m) => m[0]);
    if (relationBlocks.length === 0) {
        return content;
    }

    // Remove relation blocks from the tables content
    let modified = content.replace(relationBlockRegex, "");

    // Remove any trailing orphaned fragments after the last table closing `);`
    const lastCloseIdx = modified.lastIndexOf(");");
    if (lastCloseIdx !== -1) {
        const after = modified.slice(lastCloseIdx + 2);
        if (after.trim().length > 0) {
            modified = `${modified.slice(0, lastCloseIdx + 2)}\n`;
        }
    }

    const relationsPath = path.resolve(path.dirname(schemaPath), "relations.ts");

    // Collect table identifiers referenced in the relation blocks
    const usedNames = new Set<string>();
    const findNameRegexes = [/relations\(\s*([A-Za-z_]\w*)\s*,/g, /many\(\s*([A-Za-z_]\w*)\s*\)/g, /one\(\s*([A-Za-z_]\w*)\s*,/g, /\b([A-Za-z_]\w*)\s*\./g];

    for (const block of relationBlocks) {
        for (const rx of findNameRegexes) {
            for (const m of block.matchAll(rx)) {
                if (m[1]) {
                    usedNames.add(m[1]);
                }
            }
        }
    }

    if (await fs.pathExists(relationsPath)) {
        let relationsContent = await fs.readFile(relationsPath, "utf8");

        const importMatch = relationsContent.match(IMPORT_FROM_TABLES_REGEX);
        const existingImports = (importMatch?.[1] ?? "")
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean);
        const combined = new Set([...existingImports, ...Array.from(usedNames)]);
        const newImportLine = `import { ${Array.from(combined).join(", ")} } from "./tables";`;

        if (importMatch) {
            relationsContent = relationsContent.replace(importMatch[0], newImportLine);
        } else {
            relationsContent = `import { relations } from "drizzle-orm";\n${newImportLine}\n\n${relationsContent}`;
        }

        // Append new relation blocks, avoid duplicates by normalized comparison
        const normalize = (s: string) => s.replace(/\s+/g, " ").trim();
        const existingNormalized = new Set<string>();
        for (const m of relationsContent.matchAll(/export const\s+\w+\s*=\s*relations\([\s\S]*?\}\s*\)\s*;?/g)) {
            existingNormalized.add(normalize(m[0]));
        }
        for (const block of relationBlocks) {
            if (!existingNormalized.has(normalize(block))) {
                relationsContent = `${relationsContent.trimEnd()}\n\n${block}\n`;
            }
        }

        await fs.writeFile(relationsPath, relationsContent, "utf8");
        console.log("√ Merged generated relations into relations.ts");
    } else {
        const relationsContent = `import { relations } from "drizzle-orm";\nimport { ${Array.from(usedNames).join(", ")} } from "./tables";\n\n${relationBlocks.join("\n\n")}\n`;
        await fs.writeFile(relationsPath, relationsContent, "utf8");
        console.log("√ Created relations.ts from generated relation blocks");
    }

    return modified;
}

async function main() {
    await execa("npx", ["@better-auth/cli@latest", "generate", "--config", configPath, "--output", schemaPathRelative, "-y"], { stdio: "inherit" });

    const originalContent = await fs.readFile(schemaPathAbsolute, "utf8");
    const modifiedContent = await extractAndMergeRelationBlocks(schemaPathAbsolute, originalContent);
    const s = new MagicString(modifiedContent);

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
