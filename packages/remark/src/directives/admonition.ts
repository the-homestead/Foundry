import { h } from "hastscript";
import type { ContainerDirective } from "mdast-util-directive";

export function handleAdmonitionDirective(node: ContainerDirective) {
    if (!node.data) {
        node.data = {};
    }
    const data = node.data;
    const attributes = node.attributes || {};

    // Check for title in attributes or label (if we implemented label extraction)
    // For now, assume title comes from attributes: :::note{title="My Title"}

    const tagName = "admonition";

    const props = {
        ...attributes,
        type: node.name,
    };

    const hast = h(tagName, props);
    data.hName = hast.tagName;
    data.hProperties = hast.properties;
}
