import type { Directives } from "mdast-util-directive";
import type { VideoDirectiveConfig } from "../types.js";
import { createIfNeeded, mergeProps } from "../utils.js";

const customUrlRegex = /^(?:https?:\/\/)?(?:[\w-]+\.)+[a-z]{2,}(?:\/\S*)?$/;

const defaultPlatforms = {
    youtube: "https://www.youtube-nocookie.com/embed/{id}",
    bilibili: "https://player.bilibili.com/player.html?bvid={id}",
    vimeo: "https://player.vimeo.com/video/{id}",
};

/**
 * Handles the `video` directive.
 */
function validateVideoDirectiveNode(node: Directives) {
    if (node.type === "textDirective") {
        throw new Error("Unexpected text directive. Use double colons (`::`) for a `video` leaf directive.");
    }
    if (node.type === "containerDirective") {
        throw new Error("Unexpected container directive. Use double colons (`::`) for a `video` leaf directive.");
    }
}

function validatePlatforms(platforms: Record<string, string> | undefined) {
    if (platforms && "url" in platforms) {
        throw new Error("Invalid `video` directive config. The `url` is reserved.");
    }
}

function getVideoType(node: Directives, regex: RegExp, expandedPlatforms: Record<string, string>, id: string): string {
    const match = node.name.match(regex);
    if (match?.[1]) {
        if (match[1] in expandedPlatforms) {
            return match[1];
        }
        throw new Error("Invalid `video` directive. The directive failed to match a valid video platform.");
    }
    if (match && !match[1] && customUrlRegex.test(id)) {
        return "url";
    }
    throw new Error("Invalid `video` directive. Ensure a valid URL is passed via `id` instead of `#`.");
}

function getVideoSrc(videoType: string, expandedPlatforms: Record<string, string>, id: string): string {
    if (videoType === "url") {
        return id;
    }
    if (videoType && expandedPlatforms[videoType]) {
        const template = expandedPlatforms[videoType] ?? "";
        return template.replace("{id}", id);
    }
    throw new Error("Invalid `video` directive. Unable to resolve video source URL.");
}

function getVideoTitle(children: Directives["children"]): string {
    return children.length > 0 && children[0] && children[0].type === "text" ? children[0].value : "Video Player";
}

/**
 * Handles the `video` directive.
 */
export function handleVideoDirective(node: Directives, config: VideoDirectiveConfig, regex: RegExp) {
    validateVideoDirectiveNode(node);

    const defaultIframeProps = { className: ["rds-video"] };
    const { iframeProps, platforms } = config;
    const expandedPlatforms: Record<string, string> = {
        ...defaultPlatforms,
        ...platforms,
    };

    if (!node.data) {
        node.data = {};
    }
    const data = node.data;
    const attributes = node.attributes || {};
    const { children } = node;

    const { id, ...attrs } = attributes;

    validatePlatforms(platforms);

    if (!id) {
        throw new Error("Invalid `video` directive. The `id` is missing.");
    }

    const videoType = getVideoType(node, regex, expandedPlatforms, id);
    const src = getVideoSrc(videoType, expandedPlatforms, id);
    const title = getVideoTitle(children);

    const iframeProperties = createIfNeeded(iframeProps, node as import("mdast-util-directive").LeafDirective);
    const iframeNewProperties = mergeProps({ ...defaultIframeProps, ...iframeProperties }, { "data-video": videoType }, attrs);

    (data as Record<string, unknown>).hName = "iframe";
    (data as Record<string, unknown>).hProperties = { src, title, ...iframeNewProperties };
    (data as Record<string, unknown>).hChildren = [];
}
