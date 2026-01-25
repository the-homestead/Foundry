import type { Directives } from "mdast-util-directive";
import type { LinkDirectiveConfig } from "../types.js";
import { processUrl } from "../utils.js";

const customUrlRegex = /^(?:https?:\/\/)?(?:[\w-]+\.)+[a-z]{2,}(?:\/\S*)?$/;
const githubAcctRegex = /^@[a-zA-Z\d](?!.*--)[\w-]{0,37}[a-zA-Z\d]$/;
const githubRepoRegex = /^([a-zA-Z\d](?!.*--)[\w-]{0,37}[a-zA-Z\d])\/.*$/;
const npmPkgRegex = /^(?=.{1,214}$)(?:@[a-z\d][a-z\d._-]*\/)?[a-z\d][a-z\d._-]*$/;

const tabOrgRegex = /^org-(\w+)$/;
const githubTab = new Set([
    "repositories",
    "projects",
    "packages",
    "stars",
    "sponsoring",
    "sponsors",
    "org-repositories",
    "org-projects",
    "org-packages",
    "org-sponsoring",
    "org-people",
]);
const npmTab = new Set(["readme", "code", "dependencies", "dependents", "versions"]);

/**
 * Handles the `link` directive.
 * Inspired by {@link https://github.com/antfu/markdown-it-magic-link markdown-it-magic-link}.
 */
export function handleLinkDirective(node: Directives, config: LinkDirectiveConfig) {
    if (node.type === "leafDirective") {
        throw new Error("Unexpected leaf directive. Use single colon (`:`) for a `link` text directive.");
    }

    if (node.type === "containerDirective") {
        throw new Error("Unexpected container directive. Use single colon (`:`) for a `link` text directive.");
    }

    const { faviconSourceUrl } = config;
    const faviconUrl = faviconSourceUrl ?? "https://icons.duckduckgo.com/ip3/{domain}.ico";

    if (!node.data) {
        node.data = {};
    }
    // Type assertion to allow custom properties for mdast-util-to-hast
    const data = node.data as Record<string, unknown>;
    const attributes = node.attributes || {};
    const { children } = node;

    // Ensure url is never null, only string or undefined
    const { id, url: rawUrl, img: rawImg, tab: rawTab, ...attrs } = attributes;
    const url = rawUrl === null ? undefined : rawUrl;
    const img = rawImg === null ? undefined : rawImg;
    const tab = rawTab === null ? undefined : rawTab;

    if (typeof id !== "string") {
        throw new Error("Invalid `link` directive. The `id` is missing or not a string.");
    }

    const linkType = getLinkType(id);
    const { isGithubOrg, resolvedTab } = getTabInfo(tab);
    const resolvedText = getResolvedText(children, id, linkType);
    const { resolvedUrl, resolvedImg } = getUrlAndImg({
        id,
        url,
        img,
        tab,
        resolvedTab,
        isGithubOrg,
        linkType,
        faviconUrl,
    });

    // Instead of <a> with <img>, output a custom <glimpse-link> node
    data.hName = "glimpse-link";
    data.hProperties = {
        href: resolvedUrl,
        image: resolvedImg,
        text: resolvedText,
        linkType,
        ...attrs,
    };
    data.hChildren = [];
}

function getLinkType(id: unknown): "github-acct" | "github-repo" | "npm-pkg" | "custom-url" {
    if (!id || typeof id !== "string") {
        throw new Error("Invalid `link` directive. The `id` is missing.");
    }
    if (githubAcctRegex.test(id)) {
        return "github-acct";
    }
    if (githubRepoRegex.test(id)) {
        return "github-repo";
    }
    if (npmPkgRegex.test(id)) {
        return "npm-pkg";
    }
    if (customUrlRegex.test(id)) {
        return "custom-url";
    }
    throw new Error("Invalid `link` directive. The `id` is invalid.");
}

function getTabInfo(tab: unknown): { isGithubOrg: boolean; resolvedTab: string } {
    if (!tab) {
        return { isGithubOrg: false, resolvedTab: "" };
    }
    if (githubTab.has(tab as string) || npmTab.has(tab as string)) {
        const match = tabOrgRegex.exec(tab as string);
        return {
            isGithubOrg: Boolean(match),
            resolvedTab: match?.[1] ?? (tab as string),
        };
    }
    throw new Error("Invalid `link` directive. The `tab` is invalid.");
}

function getResolvedText(children: unknown[], id: string, linkType: "github-acct" | "github-repo" | "npm-pkg" | "custom-url"): string {
    if (
        Array.isArray(children) &&
        children.length > 0 &&
        typeof children[0] === "object" &&
        children[0] !== null &&
        "type" in children[0] &&
        (children[0] as { type?: unknown }).type === "text"
    ) {
        return (children[0] as { value?: string }).value ?? "";
    }
    if (linkType === "github-acct") {
        return id.slice(1);
    }
    if (linkType === "custom-url") {
        return processUrl(id);
    }
    return id;
}

function getUrlAndImg({
    id,
    url,
    img,
    tab,
    resolvedTab,
    isGithubOrg,
    linkType,
    faviconUrl,
}: {
    id: string;
    url: string | undefined;
    img: string | undefined;
    tab: string | undefined;
    resolvedTab: string;
    isGithubOrg: boolean;
    linkType: "github-acct" | "github-repo" | "npm-pkg" | "custom-url";
    faviconUrl: string;
}): { resolvedUrl: string; resolvedImg: string } {
    if (linkType === "github-acct") {
        const acct = id.slice(1);
        let githubAcctUrl = `https://github.com/${acct}`;
        if (tab) {
            if (isGithubOrg) {
                githubAcctUrl = `https://github.com/orgs/${acct}/${resolvedTab}`;
            } else {
                githubAcctUrl = `https://github.com/${acct}?tab=${resolvedTab}`;
            }
        }
        return {
            resolvedUrl: url ?? githubAcctUrl,
            resolvedImg: img || `https://github.com/${acct}.png`,
        };
    }
    if (linkType === "github-repo") {
        const match = githubRepoRegex.exec(id);
        return {
            resolvedUrl: url || `https://github.com/${id}`,
            resolvedImg: img || `https://github.com/${match?.[1]}.png`,
        };
    }
    if (linkType === "npm-pkg") {
        return {
            resolvedUrl: url || (tab ? `https://www.npmjs.com/package/${id}?activeTab=${resolvedTab}` : `https://www.npmjs.com/package/${id}`),
            resolvedImg: img || faviconUrl.replace("{domain}", new URL("https://www.npmjs.com").hostname),
        };
    }
    // custom-url
    const resolvedUrl = url || id;
    return {
        resolvedUrl,
        resolvedImg: img || faviconUrl.replace("{domain}", new URL(resolvedUrl).hostname),
    };
}
