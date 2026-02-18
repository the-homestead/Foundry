// import { execa } from "execa";
// import fs from "fs-extra";
// import MagicString from "magic-string";
// import path from "pathe";

// /* -------------------------------------------------------------------------- */
// /*                                   CONFIG                                   */
// /* -------------------------------------------------------------------------- */

// /**
//  * Central configuration for the auth schema generator.
//  *
//  * Keep paths here so the rest of the file stays logic-only.
//  */
// const CONFIG = {
//     authConfigPath: "./src/lib/auth.tsx",

//     /**
//      * Must remain RELATIVE for better-auth CLI.
//      */
//     schemaPathRelative: path.join("..", "..", "packages", "database", "src", "schemas", "users", "tables.ts"),
// };

// const schemaPathAbsolute = path.resolve(CONFIG.schemaPathRelative);

// /* -------------------------------------------------------------------------- */
// /*                                   LOGGING                                  */
// /* -------------------------------------------------------------------------- */

// const log = {
//     header(title: string) {
//         console.log(`\n┌─ ${title}`);
//     },
//     step(msg: string) {
//         console.log(`├─ ${msg}`);
//     },
//     ok(msg: string) {
//         console.log(`│  ✔ ${msg}`);
//     },
//     warn(msg: string) {
//         console.log(`│  ⚠ ${msg}`);
//     },
//     done() {
//         console.log("└─ Done\n");
//     },
// };

// /* -------------------------------------------------------------------------- */
// /*                                   REGEXES                                  */
// /* -------------------------------------------------------------------------- */

// const IMPORT_FROM_TABLES_REGEX = /import\s*{\s*([^}]+)\s*}\s*from\s*["']\.\/tables["'];?/;

// /* -------------------------------------------------------------------------- */
// /*                              GENERAL HELPERS                               */
// /* -------------------------------------------------------------------------- */

// /** Normalize whitespace for safe comparison */
// function normalizeCode(input: string): string {
//     return input.replace(/\s+/g, " ").trim();
// }

// /** Extract table export names from generated schema */
// function extractTableNames(content: string): string[] {
//     return Array.from(content.matchAll(/export const (\w+) = pgTable/g)).map((m) => m[1]);
// }

// /** Ensure all table exports end in `Table` */
// function renameTableExports(content: string): string {
//     return content.replace(/export const (\w+) = pgTable/g, (_m, name) => `export const ${name.endsWith("Table") ? name : `${name}Table`} = pgTable`);
// }

// /* -------------------------------------------------------------------------- */
// /*                        RELATION BLOCK EXTRACTION                           */
// /* -------------------------------------------------------------------------- */

// /**
//  * Safely extracts full:
//  *
//  * `export const X = relations(...)`
//  *
//  * blocks by walking parentheses depth.
//  *
//  * WHY:
//  * Regex cannot safely parse nested function bodies.
//  */
// function extractRelationBlocks(content: string): {
//     blocks: string[];
//     stripped: string;
// } {
//     const blocks: string[] = [];
//     let stripped = "";
//     let i = 0;

//     while (i < content.length) {
//         const exportIdx = content.indexOf("export const", i);

//         if (exportIdx === -1) {
//             stripped += content.slice(i);
//             break;
//         }

//         stripped += content.slice(i, exportIdx);

//         const relIdx = content.indexOf("relations(", exportIdx);
//         if (relIdx === -1) {
//             stripped += content.slice(exportIdx);
//             break;
//         }

//         // Ensure this export actually contains relations(...)
//         const lineEnd = content.indexOf("\n", exportIdx);
//         if (lineEnd !== -1 && relIdx > lineEnd + 200) {
//             stripped += "export const";
//             i = exportIdx + "export const".length;
//             continue;
//         }

//         // walk parentheses
//         let pos = relIdx + "relations(".length;
//         let depth = 1;

//         while (pos < content.length && depth > 0) {
//             const ch = content[pos];

//             if (ch === "(") depth++;
//             else if (ch === ")") depth--;

//             pos++;
//         }

//         // consume trailing whitespace + semicolon
//         while (/\s/.test(content[pos] ?? "")) pos++;
//         if (content[pos] === ";") pos++;

//         const block = content.slice(exportIdx, pos);
//         blocks.push(block);

//         i = pos;
//     }

//     return { blocks, stripped };
// }

// /* -------------------------------------------------------------------------- */
// /*                             RELATION MERGING                               */
// /* -------------------------------------------------------------------------- */

// /**
//  * Extract relations from tables.ts and merge them into relations.ts.
//  */
// async function extractAndMergeRelations(schemaPath: string, content: string): Promise<string> {
//     const { blocks: relationBlocks, stripped } = extractRelationBlocks(content);

//     if (!relationBlocks.length) return content;

//     const relationsPath = path.resolve(path.dirname(schemaPath), "relations.ts");

//     // determine table names referenced
//     const usedNames = new Set<string>();
//     const refs = [/relations\(\s*([A-Za-z_]\w*)\s*,/g, /many\(\s*([A-Za-z_]\w*)\s*\)/g, /one\(\s*([A-Za-z_]\w*)\s*,/g, /\b([A-Za-z_]\w*)\s*\./g];

//     for (const block of relationBlocks) {
//         for (const rx of refs) {
//             for (const m of block.matchAll(rx)) {
//                 if (m[1]) usedNames.add(m[1]);
//             }
//         }
//     }

//     let relationsContent = "";

//     if (await fs.pathExists(relationsPath)) {
//         relationsContent = await fs.readFile(relationsPath, "utf8");
//     } else {
//         relationsContent = `import { relations } from "drizzle-orm";\n`;
//     }

//     // merge imports
//     const importMatch = relationsContent.match(IMPORT_FROM_TABLES_REGEX);
//     const existing = (importMatch?.[1] ?? "")
//         .split(",")
//         .map((s) => s.trim())
//         .filter(Boolean);

//     const mergedImports = Array.from(new Set([...existing, ...usedNames])).join(", ");

//     const newImport = `import { ${mergedImports} } from "./tables";`;

//     if (importMatch) {
//         relationsContent = relationsContent.replace(importMatch[0], newImport);
//     } else {
//         relationsContent += `${newImport}\n\n`;
//     }

//     // avoid duplicate blocks
//     const existingNormalized = new Set(Array.from(relationsContent.matchAll(/export const[\s\S]*?;\s*/g)).map((m) => normalizeCode(m[0])));

//     for (const block of relationBlocks) {
//         if (!existingNormalized.has(normalizeCode(block))) {
//             relationsContent += `\n${block}\n`;
//         }
//     }

//     await fs.writeFile(relationsPath, relationsContent.trimEnd() + "\n");
//     log.ok("Merged relations into relations.ts");

//     return stripped;
// }

// /* -------------------------------------------------------------------------- */
// /*                        RELATION FILE REWRITES                              */
// /* -------------------------------------------------------------------------- */

// /**
//  * Rewrite relations.ts so all table symbols use *Table naming.
//  */
// async function rewriteRelationsFile(schemaDir: string, tableNames: string[]) {
//     const relationsPath = path.resolve(schemaDir, "relations.ts");

//     if (!(await fs.pathExists(relationsPath))) {
//         log.warn("relations.ts not found — skipping rewrite");
//         return;
//     }

//     const content = await fs.readFile(relationsPath, "utf8");
//     const s = new MagicString(content);

//     // fix imports
//     s.replace(IMPORT_FROM_TABLES_REGEX, (_m, imports) => {
//         const fixed = imports
//             .split(",")
//             .map((x: string) => (x.trim().endsWith("Table") ? x.trim() : `${x.trim()}Table`))
//             .join(", ");
//         return `import { ${fixed} } from "./tables";`;
//     });

//     for (const name of tableNames) {
//         const table = `${name}Table`;

//         s.replace(new RegExp(`relations\\(\\s*${name}\\s*,`, "g"), `relations(${table},`);
//         s.replace(new RegExp(`many\\(\\s*${name}\\s*\\)`, "g"), `many(${table})`);
//         s.replace(new RegExp(`one\\(\\s*${name}\\s*,`, "g"), `one(${table},`);
//         s.replace(new RegExp(`\\b${name}\\.`, "g"), `${table}.`);
//     }

//     await fs.writeFile(relationsPath, s.toString(), "utf8");
//     log.ok("Rewrote relations.ts symbols");
// }

// /* -------------------------------------------------------------------------- */
// /*                                    MAIN                                    */
// /* -------------------------------------------------------------------------- */

// async function main() {
//     log.header("Better Auth Schema Generator");

//     log.step("Generating schema via better-auth CLI…");
//     await execa("npx", ["@better-auth/cli@latest", "generate", "--config", CONFIG.authConfigPath, "--output", CONFIG.schemaPathRelative, "-y"], { stdio: "inherit" });
//     log.ok("CLI generation complete");

//     log.step("Processing tables…");

//     const original = await fs.readFile(schemaPathAbsolute, "utf8");

//     const stripped = await extractAndMergeRelations(schemaPathAbsolute, original);

//     const renamed = renameTableExports(stripped);

//     const s = new MagicString(renamed);

//     const tableNames = extractTableNames(original);

//     // fix references in tables file
//     for (const tableName of tableNames) {
//         s.replace(new RegExp(`\\(\\)\\s*=>\\s*${tableName}\\s*\\.`, "g"), (m) => m.replace(tableName, `${tableName}Table`));
//     }

//     await fs.writeFile(schemaPathAbsolute, s.toString(), "utf8");

//     await rewriteRelationsFile(path.dirname(schemaPathAbsolute), tableNames);

//     log.ok(`Processed ${tableNames.length} tables`);
//     log.done();
// }

// /* -------------------------------------------------------------------------- */
// /*                                   RUNNER                                   */
// /* -------------------------------------------------------------------------- */

// (async () => {
//     try {
//         await main();
//     } catch (err) {
//         console.error("\n✖ Generator failed:", err);
//         process.exit(1);
//     }
// })();
