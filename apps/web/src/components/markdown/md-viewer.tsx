import remarkDirectiveSugar, { rehypeCustomComments, remarkCodeFilename } from "@foundry/remark";
import remarkJoinHtmlComments from "@foundry/remark/src/join-html-comments";
import {
    type BundledLanguage,
    CodeBlock,
    CodeBlockBody,
    CodeBlockContent,
    CodeBlockHeader,
    CodeBlockItem,
    Glimpse,
    GlimpseContent,
    GlimpseDescription,
    GlimpseImage,
    GlimpseTitle,
    GlimpseTrigger,
} from "@foundry/ui/components";
import { Badge, type badgeVariants } from "@foundry/ui/primitives/badge";
import { BlockQuote, H1, H2, H3, H4, List, P } from "@foundry/ui/typography/index";
import type { VariantProps } from "class-variance-authority";
import Image from "next/image";
import type { ComponentProps, CSSProperties, JSX, ReactNode } from "react";
import ReactMarkdown from "react-markdown";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import rehypeUnwrapImages from "rehype-unwrap-images";
import remarkCapitalizeHeadings from "remark-capitalize-headings";
import remarkDirective from "remark-directive";
import remarkEmoji from "remark-emoji";
import remarkFlexibleCodeTitles from "remark-flexible-code-titles";
import remarkFlexibleContainers from "remark-flexible-containers";
import remarkFlexibleMarkers from "remark-flexible-markers";
import remarkFlexibleParagraphs from "remark-flexible-paragraphs";
import remarkFlexibleToc from "remark-flexible-toc";
import remarkFootnotesExtra from "remark-footnotes-extra";
import remarkGfm from "remark-gfm";

const LANGUAGE_REGEX = /language-([\w-]+)/;
const FILENAME_EXTENSION_REGEX = /\.(js|ts|tsx|jsx|json|md|css|scss|html|py|go|rs|java|c|cpp|sh|yml|yaml|toml|ini|txt)$/i;

interface SpanProps {
    className?: string;
    children?: ReactNode;
    // Add other allowed props here if needed
}

interface ImgProps {
    src?: string;
    alt?: string;
    height?: string | number;
    width?: string | number;
    // Add other allowed props here if needed
}

interface FigcaptionProps {
    children?: ReactNode;
    className?: string;
    id?: string;
    role?: string;
    style?: CSSProperties;
    tabIndex?: number;
    title?: string;
    ariaDescribedby?: string;
}

interface FigureProps {
    children?: ReactNode;
    className?: string;
    id?: string;
    role?: string;
    style?: CSSProperties;
    tabIndex?: number;
    title?: string;
    ariaDescribedby?: string;
    ariaLabel?: string;
    ariaLabelledby?: string;
}

interface GlimpseLinkProps {
    href: string;
    image?: string;
    text: string;
    linkType?: string;
    // Add other allowed props here if needed
}

// Preprocess markdown to replace HTML comments with a :comment[ ... ] directive
function preprocessComments(md: string): string {
    // Replace HTML comments with a custom directive :comment[...], always surrounded by blank lines
    return md.replace(/<!--([\s\S]*?)-->/g, (_, content) => {
        // Remove leading/trailing newlines and spaces for clean output
        const inner = content.replace(/^\s*\n?|\n?\s*$/g, "");
        // Escape any closing brackets inside the comment
        const safe = inner.replace(/\]/g, "\\]");
        // Ensure blank lines before and after for block parsing
        return `\n\n:comment[${safe}]\n\n`;
    });
}

export default function MarkdownViewer({ content }: { content: string }) {
    interface MarkdownComponentMap {
        h1: React.ComponentType<ComponentProps<typeof H1>>;
        h2: React.ComponentType<ComponentProps<typeof H2>>;
        h3: React.ComponentType<ComponentProps<typeof H3>>;
        h4: React.ComponentType<ComponentProps<typeof H4>>;
        p: React.ComponentType<ComponentProps<typeof P>>;
        blockquote: React.ComponentType<ComponentProps<typeof BlockQuote>>;
        ul: React.ComponentType<ComponentProps<typeof List>>;
        ol: React.ComponentType<ComponentProps<typeof List>>;
        li: React.ComponentType<ComponentProps<typeof List.Item>>;
        code: (props: { inline?: boolean; className?: string; children?: ReactNode; node?: unknown }) => JSX.Element;
        span: (props: SpanProps & { variant?: string }) => JSX.Element;
        img: (props: ImgProps) => JSX.Element;
        figcaption: (props: FigcaptionProps) => JSX.Element;
        figure: (props: FigureProps) => JSX.Element;
        "glimpse-link": (props: GlimpseLinkProps) => JSX.Element;
    }

    const components: MarkdownComponentMap & Record<string, unknown> = {
        // Custom renderer for :comment[ ... ] directive
        comment: ({ children }: { children?: ReactNode }) => {
            // Render all content as plain text, no markdown parsing
            let text = "";
            if (Array.isArray(children)) {
                text = children.join("");
            } else if (typeof children === "string") {
                text = children;
            }
            return (
                <div
                    className="my-4 rounded-md border border-muted bg-muted/50 px-4 py-2 font-mono text-muted-foreground text-sm italic"
                    data-md-comment
                    style={{ whiteSpace: "pre-wrap" }}
                >
                    <span className="mr-2 text-muted-foreground/60">#Comment</span>
                    {text}
                </div>
            );
        },
        h1: (props: React.ComponentProps<typeof H1>) => <H1 {...props} />,
        h2: (props: React.ComponentProps<typeof H2>) => <H2 {...props} />,
        h3: (props: React.ComponentProps<typeof H3>) => <H3 {...props} />,
        h4: (props: React.ComponentProps<typeof H4>) => <H4 {...props} />,
        p: (props: React.ComponentProps<typeof P>) => <P {...props} />,
        blockquote: (props: React.ComponentProps<typeof BlockQuote>) => <BlockQuote {...props} />,
        ul: (props: React.ComponentProps<typeof List>) => <List {...props} />,
        ol: (props: React.ComponentProps<typeof List>) => <List {...props} />,
        li: (props: React.ComponentProps<typeof List.Item>) => <List.Item {...props} />,
        // biome-ignore lint/complexity/noExcessiveCognitiveComplexity: <Def>
        code: ({ inline, className, children, node, ...props }) => {
            // Extract language and filename from info string
            let language: string | undefined;
            let filename: string | undefined;
            if (node && typeof node === "object") {
                // language from node.lang
                if (typeof (node as { lang?: unknown }).lang === "string") {
                    language = (node as { lang: string }).lang;
                }
                // filename from node.data.meta if present
                if (
                    typeof (node as { data?: { meta?: unknown } }).data === "object" &&
                    (node as { data?: { meta?: unknown } }).data &&
                    typeof (node as { data?: { meta?: unknown } }).data?.meta === "string"
                ) {
                    const meta = (node as { data: { meta: string } }).data.meta.trim();
                    if (FILENAME_EXTENSION_REGEX.test(meta)) {
                        filename = meta;
                    }
                } else if (typeof (node as { meta?: unknown }).meta === "string") {
                    // fallback: filename from node.meta if it looks like a filename
                    const meta = (node as { meta: string }).meta.trim();
                    if (FILENAME_EXTENSION_REGEX.test(meta)) {
                        filename = meta;
                    }
                }
            }
            // fallback: try to extract language from className
            if (!language && typeof className === "string") {
                const match = LANGUAGE_REGEX.exec(className);
                language = match?.[1] || undefined;
            }
            let codeString = "";
            if (Array.isArray(children)) {
                codeString = children.join("");
            } else if (typeof children === "string") {
                codeString = children;
            } else if (children == null) {
                codeString = "";
            }
            const codeData = {
                code: codeString.trimEnd(),
                language: (language as BundledLanguage) ?? undefined,
                filename: filename ?? "",
            };
            return (
                <CodeBlock data={[codeData]} defaultValue={language} {...props}>
                    <CodeBlockBody>
                        {(item) => (
                            <>
                                {(item.filename || item.language) && (
                                    <CodeBlockHeader>
                                        {item.filename && <span className="rounded bg-muted px-2 py-1 font-mono text-muted-foreground text-xs">{item.filename}</span>}
                                        {item.language && <span className="ml-auto rounded bg-muted px-2 py-1 font-mono text-muted-foreground text-xs">{item.language}</span>}
                                    </CodeBlockHeader>
                                )}
                                <CodeBlockItem key={item.language} value={item.language}>
                                    <CodeBlockContent language={item.language as BundledLanguage}>{item.code}</CodeBlockContent>
                                </CodeBlockItem>
                            </>
                        )}
                    </CodeBlockBody>
                </CodeBlock>
            );
        },
        span: ({ className, children, variant, ...props }: SpanProps & { variant?: string }) => {
            if (className?.includes("rds-badge")) {
                return (
                    <Badge className={className} variant={variant as VariantProps<typeof badgeVariants>["variant"]} {...props}>
                        {children}
                    </Badge>
                );
            }
            return (
                <span className={className} {...props}>
                    {children}
                </span>
            );
        },
        img: ({ src, alt, height, width, ...props }: ImgProps) => {
            const safeSrc = typeof src === "string" ? src : "";
            const safeHeight = typeof height === "string" ? Number.parseInt(height, 10) || 600 : (height ?? 600);
            const safeWidth = typeof width === "string" ? Number.parseInt(width, 10) || 800 : (width ?? 800);
            return <Image alt={alt ?? ""} height={safeHeight} src={safeSrc} style={{ maxWidth: "100%", height: "auto" }} width={safeWidth} {...props} />;
        },
        figcaption: ({ children, className, id, role, style, tabIndex, title, ariaDescribedby }: FigcaptionProps) => (
            <div
                aria-describedby={ariaDescribedby}
                className={["mt-2 text-center text-muted-foreground text-sm", className ?? ""].filter(Boolean).join(" ")}
                id={id}
                role={role}
                style={style}
                tabIndex={tabIndex}
                title={title}
            >
                {children}
            </div>
        ),
        figure: ({ children, className, id, role, style, tabIndex, title, ariaDescribedby, ariaLabel, ariaLabelledby }: FigureProps) => (
            <figure
                aria-describedby={ariaDescribedby}
                aria-label={ariaLabel}
                aria-labelledby={ariaLabelledby}
                className={["my-6 flex flex-col items-center", className ?? ""].filter(Boolean).join(" ")}
                id={id}
                role={role}
                style={style}
                tabIndex={tabIndex}
                title={title}
            >
                {children}
            </figure>
        ),
        "glimpse-link": ({ href, image, text }: GlimpseLinkProps) => {
            return (
                <Glimpse closeDelay={0} openDelay={0}>
                    <GlimpseTrigger asChild>
                        <a className="font-medium text-primary underline" href={href} rel="noopener" target="_blank">
                            {text}
                        </a>
                    </GlimpseTrigger>
                    <GlimpseContent className="w-80">
                        <GlimpseImage alt={text} src={image ?? ""} />
                        <GlimpseTitle>{text}</GlimpseTitle>
                        <GlimpseDescription>{href}</GlimpseDescription>
                    </GlimpseContent>
                </Glimpse>
            );
        },
    };

    const processedContent = preprocessComments(content);
    return (
        <ReactMarkdown
            components={components as import("react-markdown").Components}
            rehypePlugins={[rehypeCustomComments, rehypeUnwrapImages, rehypeAutolinkHeadings]}
            remarkPlugins={[
                remarkJoinHtmlComments,
                remarkCodeFilename,
                remarkGfm,
                [remarkEmoji, { accessible: true, emoticon: true }],
                remarkFlexibleContainers,
                remarkFlexibleMarkers,
                remarkFlexibleParagraphs,
                remarkFlexibleToc,
                remarkFootnotesExtra,
                remarkFlexibleCodeTitles,
                remarkCapitalizeHeadings,
                // remarkGithub,
                remarkDirective,
                [
                    remarkDirectiveSugar,
                    {
                        badge: {
                            presets: {
                                a: { text: "ARTICLE" },
                                v: { text: "VIDEO", props: { className: ["custom"] } },
                            },
                        },
                        comment: {},
                    },
                ],
            ]}
            skipHtml={false}
        >
            {processedContent}
        </ReactMarkdown>
    );
}
