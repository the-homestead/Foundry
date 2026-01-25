import type { HTML, Root } from "mdast";
import { visit } from "unist-util-visit";

// Local type for our custom commentDirective node
interface CommentDirective {
    type: "commentDirective";
    value: string;
    data?: Record<string, unknown>;
}

/**
 * remark plugin to convert HTML comments (<!-- ... -->) to custom commentDirective nodes
 */
export default function remarkCommentDirectives() {
    return (tree: Root) => {
        visit(tree, "html", (node: HTML, index, parent) => {
            if (!parent || typeof index !== "number") {
                return;
            }
            const value = node.value.trim();
            // Only match HTML comments
            if (!(value.startsWith("<!--") && value.endsWith("-->"))) {
                return;
            }
            // Extract comment content
            const commentContent = value.slice(4, -3).trim();
            // Replace with a custom node (type-safe at assignment only)
            const commentNode: CommentDirective = {
                type: "commentDirective",
                value: commentContent,
                data: {},
            };
            (parent.children as unknown[])[index] = commentNode;
        });
    };
}
