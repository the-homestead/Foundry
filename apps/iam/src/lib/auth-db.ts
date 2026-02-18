import { execa } from "execa";
import fs from "fs-extra";
import MagicString from "magic-string";
import path from "pathe";

/* -------------------------------------------------------------------------- */
/*                                   CONFIG                                   */
/* -------------------------------------------------------------------------- */

const CONFIG = {
    authConfigPath: "./src/lib/auth.tsx",
    schemaPathRelative: path.join("..", "..", "packages", "database", "src", "schemas", "users", "tables.ts"),
};

const schemaPathAbsolute = path.resolve(CONFIG.schemaPathRelative);

/* -------------------------------------------------------------------------- */
/*                                   LOGGING                                  */
/* -------------------------------------------------------------------------- */

const log = {
    step: (m: string) => console.log(`├─ ${m}`),
    ok: (m: string) => console.log(`│  ✔ ${m}`),
    warn: (m: string) => console.log(`│  ⚠ ${m}`),
};

/* -------------------------------------------------------------------------- */
/*                               TABLE HELPERS                                */
/* -------------------------------------------------------------------------- */

function extractTableNames(content: string): string[] {
    return Array.from(content.matchAll(/export const (\w+) = pgTable/g)).map((m) => m[1]);
}

function renameTableExports(content: string): string {
    return content.replace(/export const (\w+) = pgTable/g, (_m, n) => `export const ${n.endsWith("Table") ? n : `${n}Table`} = pgTable`);
}

/* -------------------------------------------------------------------------- */
/*                      RELATION BLOCK PARSER (SAFE)                          */
/* -------------------------------------------------------------------------- */

/**
 * Extracts full relation exports safely using parenthesis depth.
 */
function extractRelations(content: string): {
    stripped: string;
    blocks: string[];
} {
    const blocks: string[] = [];
    let stripped = "";
    let i = 0;

    while (i < content.length) {
        const exportIdx = content.indexOf("export const", i);

        if (exportIdx === -1) {
            stripped += content.slice(i);
            break;
        }

        stripped += content.slice(i, exportIdx);

        const relIdx = content.indexOf("relations(", exportIdx);

        // not a relation export
        if (relIdx === -1 || relIdx > content.indexOf("\n", exportIdx) + 200) {
            stripped += "export const";
            i = exportIdx + "export const".length;
            continue;
        }

        let pos = relIdx + "relations(".length;
        let depth = 1;

        while (pos < content.length && depth > 0) {
            const ch = content[pos];
            if (ch === "(") {
                depth++;
            } else if (ch === ")") {
                depth--;
            }
            pos++;
        }

        while (/\s/.test(content[pos] ?? "")) {
            pos++;
        }
        if (content[pos] === ";") {
            pos++;
        }

        const block = content.slice(exportIdx, pos);

        if (block.includes("=>")) {
            blocks.push(block.trim());
        }

        i = pos;
    }

    return { stripped, blocks };
}

/* -------------------------------------------------------------------------- */
/*                        RELATION EXPORT UTILITIES                            */
/* -------------------------------------------------------------------------- */

function getRelationExportName(block: string): string | null {
    const m = block.match(/export const (\w+)/);
    return m?.[1] ?? null;
}

/**
 * Build a clean relations.ts every run.
 */
async function rebuildRelationsFile(schemaDir: string, relationBlocks: string[]) {
    const relationsPath = path.resolve(schemaDir, "relations.ts");

    // dedupe by export name
    const map = new Map<string, string>();

    for (const block of relationBlocks) {
        const name = getRelationExportName(block);
        if (!name) {
            continue;
        }
        map.set(name, block);
    }

    // collect table symbols used
    const usedTables = new Set<string>();
    const tableRefRegex = /\b([A-Za-z_]\w*)Table\b/g;

    for (const block of map.values()) {
        for (const m of block.matchAll(tableRefRegex)) {
            usedTables.add(`${m[1]}Table`);
        }
    }

    const imports = Array.from(usedTables).sort().join(", ");

    const file = `import { relations } from "drizzle-orm";
import { ${imports} } from "./tables";

${Array.from(map.values()).join("\n\n")}
`;

    await fs.writeFile(relationsPath, file);
    log.ok("Rebuilt relations.ts cleanly");
}

/* -------------------------------------------------------------------------- */
/*                         RELATION SYMBOL REWRITE                            */
/* -------------------------------------------------------------------------- */

function rewriteRelationSymbols(block: string, tableNames: string[]): string {
    const s = new MagicString(block);

    for (const name of tableNames) {
        const table = `${name}Table`;

        s.replace(new RegExp(`relations\\(\\s*${name}\\s*,`, "g"), `relations(${table},`);
        s.replace(new RegExp(`many\\(\\s*${name}\\s*\\)`, "g"), `many(${table})`);
        s.replace(new RegExp(`one\\(\\s*${name}\\s*,`, "g"), `one(${table},`);
        s.replace(new RegExp(`\\b${name}\\.`, "g"), `${table}.`);
    }

    return s.toString();
}

/* -------------------------------------------------------------------------- */
/*                                    MAIN                                    */
/* -------------------------------------------------------------------------- */

async function main() {
    console.log("\n┌─ Better Auth Schema Generator");

    log.step("Generating schema...");
    await execa("npx", ["@better-auth/cli@latest", "generate", "--config", CONFIG.authConfigPath, "--output", CONFIG.schemaPathRelative, "-y"], { stdio: "inherit" });
    log.ok("CLI generation complete");

    const original = await fs.readFile(schemaPathAbsolute, "utf8");

    const tableNames = extractTableNames(original);

    const { stripped, blocks } = extractRelations(original);

    // rewrite relation symbols BEFORE writing relations.ts
    const rewrittenBlocks = blocks.map((b) => rewriteRelationSymbols(b, tableNames));

    await rebuildRelationsFile(path.dirname(schemaPathAbsolute), rewrittenBlocks);

    const renamedTables = renameTableExports(stripped);

    const s = new MagicString(renamedTables);

    for (const table of tableNames) {
        s.replace(new RegExp(`\\(\\)\\s*=>\\s*${table}\\s*\\.`, "g"), (m) => m.replace(table, `${table}Table`));
    }

    await fs.writeFile(schemaPathAbsolute, s.toString());

    log.ok(`Processed ${tableNames.length} tables`);
    console.log("└─ Done\n");
}

/* -------------------------------------------------------------------------- */
/*                                   RUNNER                                   */
/* -------------------------------------------------------------------------- */

(async () => {
    try {
        await main();
    } catch (e) {
        console.error("\n✖ Generator failed:", e);
        process.exit(1);
    }
})();
