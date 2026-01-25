import type { Content, HTML, Root } from "mdast";

/**
 * remarkJoinHtmlComments
 * Joins consecutive HTML comment nodes (<!-- ... -->) into a single node, so multi-line comments are not split.
 * Should be run before any plugin that transforms HTML comments to custom nodes.
 */
export default function remarkJoinHtmlComments() {
    return (tree: Root) => {
        let i = 0;
        while (i < tree.children.length) {
            const node = tree.children[i] as Content;
            if (node.type === "html" && typeof (node as HTML).value === "string" && (node as HTML).value.trim().startsWith("<!--")) {
                let commentContent = (node as HTML).value.trim();
                let j = i + 1;
                // Join all consecutive html nodes that are part of the same comment
                while (
                    j < tree.children.length &&
                    tree.children[j] !== undefined &&
                    tree.children[j]?.type === "html" &&
                    typeof (tree.children[j] as HTML).value === "string" &&
                    !(tree.children[j] as HTML).value.trim().startsWith("<!--") &&
                    !(tree.children[j] as HTML).value.trim().endsWith("-->")
                ) {
                    commentContent += `\n${(tree.children[j] as HTML).value}`;
                    j++;
                }
                // If the last node ends with -->, include it
                if (
                    j < tree.children.length &&
                    tree.children[j] !== undefined &&
                    tree.children[j]?.type === "html" &&
                    typeof (tree.children[j] as HTML).value === "string" &&
                    (tree.children[j] as HTML).value.trim().endsWith("-->")
                ) {
                    commentContent += `\n${(tree.children[j] as HTML).value}`;
                    j++;
                }
                // Replace all these nodes with a single html node
                if (j > i + 1) {
                    tree.children.splice(i, j - i, {
                        type: "html",
                        value: commentContent,
                    } as HTML);
                }
            }
            i++;
        }
    };
}
