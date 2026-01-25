import type { Code as BaseCode, Root } from "mdast";
import type { Plugin } from "unified";
import { visit } from "unist-util-visit";

// Regex to match common code file extensions
const CODE_FILENAME_REGEX = /\.(js|ts|tsx|jsx|json|md|css|scss|html|py|go|rs|java|c|cpp|sh|yml|yaml|toml|ini|txt)$/i;

// Regex to extract language, filename, and meta from info string (e.g., "js example.js {1,3-4} showLineNumbers")
const INFO_FILENAME_META_REGEX = /^(\w+)(?:[\s:]+([\w.-]+))?(?:\s+(.+))?$/;

// Extend the Code node type to include an optional filename property
type Code = BaseCode & { filename?: string };

/**
 * remarkCodeFilename
 * Attaches `filename` and `meta` properties to code block nodes if present in the info string.
 * Example: ```js example.js {1,3-4} showLineNumbers
 *   node.lang = 'js', node.filename = 'example.js', node.meta = '{1,3-4} showLineNumbers'
 */
const remarkCodeFilename: Plugin<[], Root> = () => (tree) => {
    visit(tree, "code", (node) => {
        handleCodeNode(node as Code);
    });

    /**
     * Extracts and assigns lang, filename, and meta properties to a code node.
     */

    // biome-ignore lint/complexity/noExcessiveCognitiveComplexity: <Def>
    function handleCodeNode(codeNode: Code): void {
        // Type guard for node.data as a record
        let info = "";
        const data = (codeNode.data ?? {}) as Record<string, unknown>;
        if (typeof data._originalInfo === "string") {
            info = data._originalInfo;
        } else if (typeof codeNode.lang === "string" && typeof codeNode.meta === "string") {
            info = `${codeNode.lang} ${codeNode.meta}`.trim();
        } else if (typeof codeNode.lang === "string") {
            info = codeNode.lang;
        }
        if (info) {
            const match = info.match(INFO_FILENAME_META_REGEX);
            if (match) {
                codeNode.lang = match[1];
                if (match[2] && CODE_FILENAME_REGEX.test(match[2])) {
                    codeNode.filename = match[2];
                }
                if (match[3]) {
                    codeNode.meta = match[3].trim();
                }
            }
        }
        // Fallback: check meta for filename
        if (!codeNode.filename && typeof codeNode.meta === "string") {
            const meta = codeNode.meta.trim();
            if (CODE_FILENAME_REGEX.test(meta)) {
                codeNode.filename = meta;
            }
        }
    }
};

export default remarkCodeFilename;
