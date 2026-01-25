import type { Properties } from "hast";
import type { Directives, TextDirective } from "mdast-util-directive";
import type { BadgeDirectiveConfig } from "../types.js";
import { createIfNeeded, mergeProps } from "../utils.js";

type AllowedProperty = string | number | boolean | (string | number)[] | null | undefined;
type AllowedProps = Record<string, AllowedProperty>;

function resolveBadgeType(node: Directives, presets: BadgeDirectiveConfig["presets"], regex: RegExp): string | undefined {
    const match = node.name.match(regex);
    if (match && !match[1]) {
        return undefined;
    }
    if (match?.[1] && presets && Object.hasOwn(presets, match[1])) {
        return match[1];
    }
    throw new Error("Invalid `badge` directive. The directive failed to match a valid badge type. Please check the `presets` option in the `badge` config.");
}

function resolveBadgeText(badgeType: string | undefined, presets: BadgeDirectiveConfig["presets"], children: Directives["children"]): string | undefined {
    if (badgeType) {
        if (presets && Object.hasOwn(presets, badgeType) && typeof presets[badgeType]?.text === "string") {
            return presets[badgeType]?.text;
        }
        return undefined;
    }
    if (Array.isArray(children) && children.length > 0 && children[0]?.type === "text") {
        return children[0]?.value;
    }
    return undefined;
}

function getPresetProps(badgeType: string | undefined, presets: BadgeDirectiveConfig["presets"], node: Directives): AllowedProps {
    if (badgeType && presets && Object.hasOwn(presets, badgeType)) {
        const base: AllowedProps = { "data-badge": badgeType };
        const preset = presets[badgeType];
        if (typeof preset?.props !== "undefined" && preset?.props) {
            return { ...base, ...createIfNeeded(preset.props, node as TextDirective) };
        }
        return base;
    }
    return {};
}

/**
 * Handles the `badge` directive.
 */
export function handleBadgeDirective(node: Directives, config: BadgeDirectiveConfig, regex: RegExp) {
    if (node.type === "leafDirective") {
        throw new Error("Unexpected leaf directive. Use single colon (`:`) for a `badge` text directive.");
    }
    if (node.type === "containerDirective") {
        throw new Error("Unexpected container directive. Use single colon (`:`) for a `badge` text directive.");
    }

    const defaultSpanProps: AllowedProps = { className: ["rds-badge"] };
    const { spanProps, presets } = config;

    if (!node.data) {
        node.data = {};
    }
    // Allow arbitrary properties on data for hast compatibility
    const data = node.data as Record<string, unknown>;
    const attributes = node.attributes || {};
    const { children } = node;

    // Support :badge-a and :badge-v syntax
    let badgeType = resolveBadgeType(node, presets, regex);
    // If not found, try extracting preset from name suffix
    if (!badgeType && node.name.startsWith("badge-") && presets) {
        const presetKey = node.name.slice("badge-".length);
        if (Object.hasOwn(presets, presetKey)) {
            badgeType = presetKey;
        }
    }
    let resolvedText = resolveBadgeText(badgeType, presets, children);
    // If no children and badgeType is present, inject preset text
    if (!resolvedText && badgeType && presets && Object.hasOwn(presets, badgeType)) {
        const preset = presets[badgeType];
        if (typeof preset?.text === "string") {
            resolvedText = preset.text;
        }
    }
    if (!resolvedText) {
        throw new Error(
            "Invalid `badge` directive. The text is missing. Specify it in the `[]` of `:badge[]{}` or in the `text` field of the `presets` option in the `badge` config."
        );
    }

    // handle props
    // All attributes (including variant) are merged and passed to the Badge component
    const spanProperties = createIfNeeded(spanProps, node) as AllowedProps;
    const presetProps = getPresetProps(badgeType, presets, node);
    const spanNewProperties = mergeProps({ ...defaultSpanProps, ...spanProperties }, presetProps as Properties | null | undefined, attributes);

    // update node
    data.hName = "span";
    data.hProperties = spanNewProperties;
    // Always set a text child node for preset badges
    const textNode = { type: "text", value: resolvedText };
    data.children = [textNode];
    data.hChildren = [textNode];
}
