import type { BlockContent, DefinitionContent, Paragraph, PhrasingContent } from "mdast";
import type { Directives } from "mdast-util-directive";
import { EXIT, visit } from "unist-util-visit";
import type { ImageDirectiveConfig } from "../types.js";
import { createIfNeeded, mergeProps } from "../utils.js";

const validTags = new Set<string>(["figure", "a", "div", "span", "section", "article", "main", "aside", "header", "footer", "nav", "fieldset", "form"]);

/**
 * Handles the `image` directive.
 */
export function handleImageDirective(node: Directives, config: ImageDirectiveConfig, regex: RegExp) {
    if (node.type === "textDirective") {
        throw new Error("Unexpected text directive. Use three colons (`:::`) for an `image` container directive.");
    }
    if (node.type === "leafDirective") {
        throw new Error("Unexpected leaf directive. Use three colons (`:::`) for an `image` container directive.");
    }

    // At this point, node is a ContainerDirective
    const containerNode = node as import("mdast-util-directive").ContainerDirective;

    const { imgProps, figureProps, figcaptionProps, elementProps, stripParagraph = true } = config;
    if (!containerNode.data) {
        containerNode.data = {};
    }
    const data = containerNode.data;
    const attributes = containerNode.attributes || {};

    const matchTag = getValidTag(containerNode, regex);

    ensureImageExistsAndApplyProps(containerNode, imgProps);

    const children = normalizeChildren(containerNode, stripParagraph);

    if (matchTag === "figure") {
        handleFigureTag(children, containerNode, data, figureProps, figcaptionProps, attributes, stripParagraph);
    } else {
        handleOtherTag(containerNode, data, matchTag, elementProps, attributes);
    }
}

function getValidTag(node: Directives, regex: RegExp): string {
    const match = node.name.match(regex);
    if (match && typeof match[1] === "string" && validTags.has(match[1])) {
        return match[1];
    }
    throw new Error(
        "Invalid `image` directive. The directive failed to match a valid HTML tag. See https://github.com/lin-stephanie/remark-directive-sugar/blob/main/src/directives/image.ts#L14 for details."
    );
}

function ensureImageExistsAndApplyProps(node: Directives, imgProps: ImageDirectiveConfig["imgProps"]) {
    let hasImage = false;
    const imgProperties = createIfNeeded(imgProps, node as import("mdast-util-directive").ContainerDirective);
    visit(node, "image", (imageNode) => {
        if (imgProperties) {
            imageNode.data ||= {};
            // Assign hProperties to the generic data object for rehype compatibility
            (imageNode.data as Record<string, unknown>).hProperties = imgProperties;
        }
        hasImage = true;
        return EXIT;
    });
    if (!hasImage) {
        throw new Error("Invalid `image` directive. The image is missing.");
    }
}

function normalizeChildren(node: Directives, stripParagraph: boolean): Array<DefinitionContent | BlockContent | PhrasingContent> {
    const newChildren: Array<DefinitionContent | BlockContent | PhrasingContent> = [];
    for (const child of node.children) {
        if (stripParagraph && child.type === "paragraph" && child.children[0]?.type === "image") {
            newChildren.push(...child.children);
        } else {
            newChildren.push(child);
        }
    }
    // @ts-expect-error (Type '(ContainerDirective | LeafDirective | TextDirective | Blockquote | Code | Heading | Html | ... 16 more ... | Strong)[]' is not assignable to type '(BlockContent | DefinitionContent)[]'.)
    node.children = newChildren;
    return node.children as Array<DefinitionContent | BlockContent | PhrasingContent>;
}

function handleFigureTag(
    children: Array<DefinitionContent | BlockContent | PhrasingContent>,
    node: Directives,
    data: import("mdast-util-directive").ContainerDirectiveData,
    figureProps: ImageDirectiveConfig["figureProps"],
    figcaptionProps: ImageDirectiveConfig["figcaptionProps"],
    attributes: Record<string, unknown>,
    stripParagraph: boolean
) {
    let content: PhrasingContent[];
    if (children[0]?.type === "paragraph" && children[0].data?.directiveLabel && children[0].children[0]?.type === "text") {
        content = children[0].children;
        children.shift();
    } else if (stripParagraph && children[0]?.type === "image" && children[0].alt) {
        content = [{ type: "text", value: children[0].alt }];
    } else if (children[0]?.type === "paragraph" && children[0].children[0]?.type === "image" && children[0].children[0].alt) {
        content = [{ type: "text", value: children[0].children[0].alt }];
    } else {
        throw new Error("Invalid `image` directive. The figcaption text is missing. Specify it in the `[]` of `:::image-figure[]{}` or `![]()`.");
    }

    const figureProperties = createIfNeeded(figureProps, node as import("mdast-util-directive").ContainerDirective);
    const figcaptionProperties = createIfNeeded(figcaptionProps, node as import("mdast-util-directive").ContainerDirective);

    const figcaptionNode: Paragraph = {
        type: "paragraph",
        data: {
            hProperties: mergeProps(figcaptionProperties, null, attributes as Record<string, string | null | undefined>),
        } as Record<string, unknown>,
        children: content,
    };
    (figcaptionNode.data as Record<string, unknown>).hName = "figcaption";

    (data as Record<string, unknown>).hName = "figure";
    (data as Record<string, unknown>).hProperties = figureProperties ?? undefined;
    children.push(figcaptionNode);
}

function handleOtherTag(
    node: Directives,
    data: import("mdast-util-directive").ContainerDirectiveData,
    matchTag: string,
    elementProps: ImageDirectiveConfig["elementProps"],
    attributes: Record<string, unknown>
) {
    const elementProperties = createIfNeeded(elementProps, node as import("mdast-util-directive").ContainerDirective);
    (data as Record<string, unknown>).hName = matchTag;
    (data as Record<string, unknown>).hProperties = mergeProps(elementProperties, null, attributes as Record<string, string | null | undefined>);
}
