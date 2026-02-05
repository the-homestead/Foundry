import fs from "node:fs/promises";
import path from "node:path";

const messagesDir = path.resolve(process.cwd(), "messages");
const sourceFile = path.join(messagesDir, "en.json");

const colors = {
    reset: "\x1b[0m",
    green: "\x1b[32m",
    yellow: "\x1b[33m",
    red: "\x1b[31m",
    gray: "\x1b[90m",
};

const icons = {
    updated: "✔",
    skipped: "•",
    error: "✖",
};

async function readJson(file) {
    const content = await fs.readFile(file, "utf8");
    return JSON.parse(content);
}

function isPlainObject(value) {
    return typeof value === "object" && value !== null && !Array.isArray(value);
}

function fillMissing(source, target) {
    let changed = false;

    for (const key of Object.keys(source)) {
        const sVal = source[key];
        const tVal = target[key];

        if (tVal === undefined || tVal === null || tVal === "") {
            target[key] = sVal;
            changed = true;
        } else if (isPlainObject(sVal) && isPlainObject(tVal)) {
            const subChanged = fillMissing(sVal, tVal);
            if (subChanged) {
                changed = true;
            }
        }
    }

    return changed;
}

function formatRow(icon, color, label, file) {
    const paddedLabel = label.padEnd(10, " ");
    return `${color}${icon} ${paddedLabel}${colors.reset} ${file}`;
}

async function main() {
    console.log("\n🌐 Syncing locale files\n");

    const en = await readJson(sourceFile);
    const files = await fs.readdir(messagesDir);

    let updatedCount = 0;
    let skippedCount = 0;

    for (const file of files) {
        if (!file.endsWith(".json") || file === "en.json") {
            continue;
        }

        const filePath = path.join(messagesDir, file);
        const data = await readJson(filePath);

        const changed = fillMissing(en, data);

        if (changed) {
            await fs.writeFile(filePath, `${JSON.stringify(data, null, 4)}\n`, "utf8");
            console.log(formatRow(icons.updated, colors.green, "updated", file));
            updatedCount++;
        } else {
            console.log(formatRow(icons.skipped, colors.gray, "no change", file));
            skippedCount++;
        }
    }

    console.log("\n──────── Summary ────────");
    console.log(`${colors.green}${icons.updated} Updated:${colors.reset} ${updatedCount}`);
    console.log(`${colors.gray}${icons.skipped} Skipped:${colors.reset} ${skippedCount}`);
    console.log("─────────────────────────\n");
}

main().catch((err) => {
    console.error(`${colors.red}${icons.error} Error:${colors.reset}`, err.message);
    process.exit(1);
});
