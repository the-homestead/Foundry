"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@foundry/ui/primitives/card";
import { Separator } from "@foundry/ui/primitives/separator";
import MarkdownViewer from "@foundry/web/components/markdown/md-viewer";

/**
 * MarkdownTab Component - Complete Documentation
 *
 * This is the definitive reference for the Foundry Markdown system.
 * Every feature, directive, plugin, and configuration option is documented here.
 */

export function MarkdownTab() {
    return (
        <div className="relative mx-auto max-w-[1400px] pb-16">
            <div className="flex gap-8">
                {/* Main Content */}
                <div className="min-w-0 flex-1 space-y-8">
                    {/* Hero */}
                    <div className="space-y-4">
                        <h1 className="font-bold text-4xl tracking-tight">Foundry Markdown System</h1>
                        <p className="text-lg text-muted-foreground">Complete documentation for the markdown rendering system. Built on remark-directive with custom extensions.</p>
                        <Separator />
                    </div>

                    {/* Core Concepts */}
                    <section className="space-y-6" id="core-concepts">
                        <div>
                            <h2 className="mb-2 font-semibold text-3xl tracking-tight">Core Concepts</h2>
                            <p className="text-muted-foreground">Understanding directive types</p>
                        </div>

                        <Card>
                            <CardHeader>
                                <CardTitle>Directive Types</CardTitle>
                                <CardDescription>Based on remark-directive syntax</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div>
                                    <h3 className="mb-2 font-semibold text-lg">Text Directive (Inline) - Single Colon :</h3>
                                    <p className="mb-3 text-muted-foreground text-sm">For inline elements that flow with text.</p>
                                    <div className="space-y-2 rounded-lg bg-muted p-4 font-mono text-sm">
                                        <div>
                                            <strong>Syntax:</strong>{" "}
                                            <code>
                                                :name[label]{"{"}attributes{"}"}
                                            </code>
                                        </div>
                                        <div>
                                            <strong>Examples:</strong>
                                        </div>
                                        <ul className="ml-4 list-disc space-y-1">
                                            <li>
                                                <code>
                                                    :badge[NEW]{"{"}variant="destructive"{"}"}
                                                </code>
                                            </li>
                                            <li>
                                                <code>:badge-a</code> (preset)
                                            </li>
                                            <li>
                                                <code>:comment[Note for editor]</code>
                                            </li>
                                        </ul>
                                    </div>
                                </div>

                                <Separator />

                                <div>
                                    <h3 className="mb-2 font-semibold text-lg">Leaf Directive (Block) - Double Colon ::</h3>
                                    <p className="mb-3 text-muted-foreground text-sm">For self-contained block elements without children.</p>
                                    <pre className="overflow-x-auto rounded-lg bg-muted p-4 font-mono text-sm">
                                        {`Syntax: ::name[label]{attributes}

Examples:
::video-youtube{#dQw4w9WgXcQ}
::video-vimeo[My Video]{id=123456789}`}
                                    </pre>
                                </div>

                                <Separator />

                                <div>
                                    <h3 className="mb-2 font-semibold text-lg">Container Directive (Block) - Triple Colon :::</h3>
                                    <p className="mb-3 text-muted-foreground text-sm">For block elements that contain other markdown content.</p>
                                    <pre className="overflow-x-auto rounded-lg bg-muted p-4 font-mono text-sm">
                                        {`Syntax:
:::name[label]{attributes}
Content goes here
:::

Examples:
:::note
This is important information.
:::

:::image-div{layout="row"}
![Image 1](url1.jpg)
![Image 2](url2.jpg)
:::`}
                                    </pre>
                                </div>
                            </CardContent>
                        </Card>
                    </section>

                    {/* Admonitions */}
                    <section className="space-y-6" id="admonitions">
                        <div>
                            <h2 className="mb-2 font-semibold text-3xl tracking-tight">Admonitions</h2>
                            <p className="text-muted-foreground">Callout blocks for important information</p>
                        </div>

                        <Card>
                            <CardHeader>
                                <CardTitle>Container Directive</CardTitle>
                                <CardDescription>
                                    Type: <code>:::</code> • File: <code>@foundry/remark/src/directives/admonition.ts</code>
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div>
                                    <h3 className="mb-3 font-semibold text-lg">Syntax</h3>
                                    <pre className="overflow-x-auto rounded-lg bg-muted p-4 font-mono text-sm">
                                        {`:::type
Content goes here
:::

:::type{title="Custom Title"}
Content with custom title
:::`}
                                    </pre>
                                </div>

                                <Separator />

                                <div>
                                    <h3 className="mb-3 font-semibold text-lg">Available Types</h3>
                                    <div className="space-y-2 text-sm">
                                        <div className="grid grid-cols-[100px_1fr] gap-2">
                                            <code>note</code>
                                            <span className="text-muted-foreground">Blue • Info icon • General information</span>
                                        </div>
                                        <div className="grid grid-cols-[100px_1fr] gap-2">
                                            <code>tip</code>
                                            <span className="text-muted-foreground">Yellow • Lightbulb icon • Helpful suggestions</span>
                                        </div>
                                        <div className="grid grid-cols-[100px_1fr] gap-2">
                                            <code>warning</code>
                                            <span className="text-muted-foreground">Orange • Alert icon • Caution, potential issues</span>
                                        </div>
                                        <div className="grid grid-cols-[100px_1fr] gap-2">
                                            <code>danger</code>
                                            <span className="text-muted-foreground">Red • Flame icon • Critical warnings</span>
                                        </div>
                                    </div>
                                </div>

                                <Separator />

                                <div>
                                    <h3 className="mb-3 font-semibold text-lg">Live Examples</h3>
                                    <MarkdownViewer
                                        content={`:::note
This is a standard note. It provides supplementary information.
:::

:::tip{title="Pro Tip"}
You can customize the title of any admonition.
:::

:::warning
Be careful when modifying production databases.
:::

:::danger{title="Critical"}
This operation cannot be undone!
:::`}
                                    />
                                </div>
                            </CardContent>
                        </Card>
                    </section>

                    {/* Badges */}
                    <section className="space-y-6" id="badges">
                        <div>
                            <h2 className="mb-2 font-semibold text-3xl tracking-tight">Badges</h2>
                            <p className="text-muted-foreground">Inline status labels and tags</p>
                        </div>

                        <Card>
                            <CardHeader>
                                <CardTitle>Text Directive</CardTitle>
                                <CardDescription>
                                    Type: <code>:</code> • File: <code>@foundry/remark/src/directives/badge.ts</code>
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div>
                                    <h3 className="mb-3 font-semibold text-lg">Syntax</h3>
                                    <pre className="overflow-x-auto rounded-lg bg-muted p-4 font-mono text-sm">
                                        {`:badge[Label]
:badge[Label]{variant="secondary"}
:badge-preset`}
                                    </pre>
                                </div>

                                <Separator />

                                <div>
                                    <h3 className="mb-3 font-semibold text-lg">Variants</h3>
                                    <p className="mb-3 text-muted-foreground text-sm">Based on Shadcn UI Badge:</p>
                                    <div className="mb-3">
                                        <MarkdownViewer
                                            content={`:badge[Default] :badge[Secondary]{variant="secondary"} :badge[Destructive]{variant="destructive"} :badge[Outline]{variant="outline"}`}
                                        />
                                    </div>
                                    <pre className="overflow-x-auto rounded-lg bg-muted p-4 font-mono text-sm">
                                        {`:badge[Default]
:badge[Secondary]{variant="secondary"}
:badge[Destructive]{variant="destructive"}
:badge[Outline]{variant="outline"}`}
                                    </pre>
                                </div>

                                <Separator />

                                <div>
                                    <h3 className="mb-3 font-semibold text-lg">Presets</h3>
                                    <p className="mb-3 text-muted-foreground text-sm">Pre-configured badge types:</p>
                                    <div className="space-y-3">
                                        <div className="flex items-center gap-3">
                                            <code className="text-sm">:badge-a</code>
                                            <span className="text-muted-foreground">→</span>
                                            <MarkdownViewer content={":badge-a"} />
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <code className="text-sm">:badge-v</code>
                                            <span className="text-muted-foreground">→</span>
                                            <MarkdownViewer content={":badge-v"} />
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <code className="text-sm">:badge-c</code>
                                            <span className="text-muted-foreground">→</span>
                                            <MarkdownViewer content={":badge-c"} />
                                        </div>
                                    </div>
                                </div>

                                <Separator />

                                <div>
                                    <h3 className="mb-3 font-semibold text-lg">Custom Styling</h3>
                                    <div className="mb-3">
                                        <MarkdownViewer
                                            content={`:badge[React]{style="background: #61DAFB; color: black;"} :badge[TypeScript]{style="background: #3178C6; color: white;"}`}
                                        />
                                    </div>
                                    <pre className="overflow-x-auto rounded-lg bg-muted p-4 font-mono text-sm">
                                        {`:badge[React]{style="background: #61DAFB; color: black;"}
:badge[TypeScript]{style="background: #3178C6; color: white;"}`}
                                    </pre>
                                </div>
                            </CardContent>
                        </Card>
                    </section>

                    {/* Videos */}
                    <section className="space-y-6" id="videos">
                        <div>
                            <h2 className="mb-2 font-semibold text-3xl tracking-tight">Video Embeds</h2>
                            <p className="text-muted-foreground">YouTube, Vimeo, and Bilibili support</p>
                        </div>

                        <Card>
                            <CardHeader>
                                <CardTitle>Leaf Directive</CardTitle>
                                <CardDescription>
                                    Type: <code>::</code> • File: <code>@foundry/remark/src/directives/video.ts</code>
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div>
                                    <h3 className="mb-3 font-semibold text-lg">Supported Platforms</h3>
                                    <div className="space-y-2 text-sm">
                                        <div>
                                            <strong>YouTube:</strong>{" "}
                                            <code className="ml-2">
                                                ::video-youtube{"{"}#dQw4w9WgXcQ{"}"}
                                            </code>
                                        </div>
                                        <div>
                                            <strong>Vimeo:</strong>{" "}
                                            <code className="ml-2">
                                                ::video-vimeo{"{"}id=912831806{"}"}
                                            </code>
                                        </div>
                                        <div>
                                            <strong>Bilibili:</strong>{" "}
                                            <code className="ml-2">
                                                ::video-bilibili{"{"}id=BV1xx411c7mD{"}"}
                                            </code>
                                        </div>
                                        <div>
                                            <strong>Custom:</strong>{" "}
                                            <code className="ml-2">
                                                ::video{"{"}id=https://...{"}"}
                                            </code>
                                        </div>
                                    </div>
                                </div>

                                <Separator />

                                <div>
                                    <h3 className="mb-3 font-semibold text-lg">Syntax Examples</h3>
                                    <pre className="overflow-x-auto rounded-lg bg-muted p-4 font-mono text-sm">
                                        {`::video-youtube{#dQw4w9WgXcQ}

::video-vimeo[My Video Title]{id=912831806}

::video-youtube{#ID width="100%" height="500"}`}
                                    </pre>
                                </div>

                                <Separator />

                                <div>
                                    <h3 className="mb-3 font-semibold text-lg">Live Example</h3>
                                    <MarkdownViewer content="::video-youtube{#gxBkghlglTg}" />
                                </div>
                            </CardContent>
                        </Card>
                    </section>

                    {/* Image Layouts */}
                    <section className="space-y-6" id="images">
                        <div>
                            <h2 className="mb-2 font-semibold text-3xl tracking-tight">Image Layouts</h2>
                            <p className="text-muted-foreground">Advanced image placement with responsive layouts</p>
                        </div>

                        <Card>
                            <CardHeader>
                                <CardTitle>Container Directive</CardTitle>
                                <CardDescription>
                                    Type: <code>:::</code> • File: <code>@foundry/remark/src/directives/image.ts</code>
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div>
                                    <h3 className="mb-3 font-semibold text-lg">Syntax</h3>
                                    <pre className="overflow-x-auto rounded-lg bg-muted p-4 font-mono text-sm">
                                        {`:::image-{tag}{attributes}
![Alt text](image.jpg)
:::

Layout options:
- row: 2-column grid
- inline: Flexbox wrap
- stack: Vertical (default)`}
                                    </pre>
                                </div>

                                <Separator />

                                <div>
                                    <h3 className="mb-3 font-semibold text-lg">Examples</h3>
                                    <pre className="overflow-x-auto rounded-lg bg-muted p-4 font-mono text-sm">
                                        {`:::image-div{layout="row"}
![Image 1](url1.jpg)
![Image 2](url2.jpg)
:::

:::image-figure
![Sunset](image.jpg)
:::

:::image-a{href="https://example.com"}
![Product](product.jpg)
:::`}
                                    </pre>
                                </div>

                                <Separator />

                                <div>
                                    <h3 className="mb-3 font-semibold text-lg">Live Example - Row Layout</h3>
                                    <MarkdownViewer
                                        content={`:::image-div{layout="row"}
![Mountain](https://images.pexels.com/photos/237273/pexels-photo-237273.jpeg?auto=compress&cs=tinysrgb&w=800)
![Ocean](https://images.pexels.com/photos/326055/pexels-photo-326055.jpeg?auto=compress&cs=tinysrgb&w=800)
:::`}
                                    />
                                </div>
                            </CardContent>
                        </Card>
                    </section>

                    {/* Glimpse Links */}
                    <section className="space-y-6" id="glimpse">
                        <div>
                            <h2 className="mb-2 font-semibold text-3xl tracking-tight">Glimpse Links</h2>
                            <p className="text-muted-foreground">Interactive link previews with hover cards</p>
                        </div>

                        <Card>
                            <CardHeader>
                                <CardTitle>Text Directive</CardTitle>
                                <CardDescription>
                                    Type: <code>:</code> • File: <code>@foundry/remark/src/directives/link.ts</code>
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div>
                                    <h3 className="mb-3 font-semibold text-lg">Syntax</h3>
                                    <pre className="overflow-x-auto rounded-lg bg-muted p-4 font-mono text-sm">{`:glimpse-link{text="Display Text" href="URL"}`}</pre>
                                    <div className="mt-3 space-y-1 text-sm">
                                        <p>
                                            <strong>Required attributes:</strong>
                                        </p>
                                        <ul className="ml-6 list-disc space-y-1 text-muted-foreground">
                                            <li>
                                                <code>text</code> - Display text for the link
                                            </li>
                                            <li>
                                                <code>href</code> - URL to fetch metadata from (GitHub, npm, or any URL with Open Graph tags)
                                            </li>
                                        </ul>
                                        <p className="mt-3">
                                            <strong>How it works:</strong> The component automatically fetches metadata (title, description, image) from the URL using Open Graph
                                            tags.
                                        </p>
                                    </div>
                                </div>

                                <Separator />

                                <div>
                                    <h3 className="mb-3 font-semibold text-lg">Supported URL Patterns</h3>
                                    <div className="space-y-3 text-sm">
                                        <div>
                                            <strong className="mb-1 block">GitHub Repositories:</strong>
                                            <code className="text-xs">https://github.com/owner/repo</code>
                                            <p className="mt-1 text-muted-foreground">Fetches repo name, description, and owner avatar</p>
                                        </div>
                                        <div>
                                            <strong className="mb-1 block">GitHub Users:</strong>
                                            <code className="text-xs">https://github.com/username</code>
                                            <p className="mt-1 text-muted-foreground">Fetches user profile with avatar</p>
                                        </div>
                                        <div>
                                            <strong className="mb-1 block">npm Packages:</strong>
                                            <code className="text-xs">https://www.npmjs.com/package/name</code>
                                            <p className="mt-1 text-muted-foreground">Fetches package info and description</p>
                                        </div>
                                        <div>
                                            <strong className="mb-1 block">Any URL with Open Graph:</strong>
                                            <code className="text-xs">https://example.com/article</code>
                                            <p className="mt-1 text-muted-foreground">Extracts og:title, og:description, og:image meta tags</p>
                                        </div>
                                    </div>
                                </div>

                                <Separator />

                                <div>
                                    <h3 className="mb-3 font-semibold text-lg">Live Examples</h3>
                                    <p className="mb-4 text-muted-foreground text-sm">Hover over any link to see the preview card with dynamically fetched metadata:</p>

                                    <div className="space-y-4">
                                        <div>
                                            <h4 className="mb-2 font-medium text-sm">GitHub Repository</h4>
                                            <MarkdownViewer content={`:glimpse-link{text="Next.js Framework" href="https://github.com/vercel/next.js"}`} />
                                        </div>

                                        <div>
                                            <h4 className="mb-2 font-medium text-sm">GitHub User Profile</h4>
                                            <MarkdownViewer content={`:glimpse-link{text="Vercel" href="https://github.com/vercel"}`} />
                                        </div>

                                        <div>
                                            <h4 className="mb-2 font-medium text-sm">npm Package</h4>
                                            <MarkdownViewer content={`:glimpse-link{text="React" href="https://www.npmjs.com/package/react"}`} />
                                        </div>

                                        <div>
                                            <h4 className="mb-2 font-medium text-sm">Documentation Site</h4>
                                            <MarkdownViewer content={`:glimpse-link{text="TypeScript Docs" href="https://www.typescriptlang.org/"}`} />
                                        </div>

                                        <div>
                                            <h4 className="mb-2 font-medium text-sm">Multiple Links in Text</h4>
                                            <MarkdownViewer
                                                content={`Check out :glimpse-link{text="React" href="https://github.com/facebook/react"} and :glimpse-link{text="Vue" href="https://github.com/vuejs/core"} for modern UI frameworks.`}
                                            />
                                        </div>
                                    </div>
                                </div>

                                <Separator />

                                <div>
                                    <h3 className="mb-3 font-semibold text-lg">Implementation Details</h3>
                                    <div className="space-y-2 text-muted-foreground text-sm">
                                        <p>
                                            <strong>Metadata Extraction:</strong> The glimpse component fetches the target URL server-side via <code>/api/glimpse</code> and
                                            extracts:
                                        </p>
                                        <ul className="ml-6 list-disc space-y-1">
                                            <li>
                                                Title from <code>&lt;title&gt;</code> or <code>og:title</code>
                                            </li>
                                            <li>
                                                Description from <code>og:description</code> or <code>meta[name="description"]</code>
                                            </li>
                                            <li>
                                                Image from <code>og:image</code>
                                            </li>
                                        </ul>
                                        <p className="mt-3">
                                            <strong>Loading States:</strong> Shows "Loading..." while fetching, then displays the rich preview card on hover.
                                        </p>
                                        <p className="mt-3">
                                            <strong>Error Handling:</strong> Falls back to simple link if metadata cannot be fetched.
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </section>

                    {/* Comments */}
                    <section className="space-y-6" id="comments">
                        <div>
                            <h2 className="mb-2 font-semibold text-3xl tracking-tight">Comments</h2>
                            <p className="text-muted-foreground">Visible editor notes and annotations</p>
                        </div>

                        <Card>
                            <CardHeader>
                                <CardTitle>Text Directive or HTML</CardTitle>
                                <CardDescription>
                                    Type: <code>:</code> or HTML • File: <code>@foundry/remark/src/directives/comment.ts</code>
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div>
                                    <h3 className="mb-3 font-semibold text-lg">Syntax</h3>
                                    <pre className="overflow-x-auto rounded-lg bg-muted p-4 font-mono text-sm">
                                        {`:comment[This is a visible comment]

<!-- HTML comments are auto-converted to visible blocks -->`}
                                    </pre>
                                </div>

                                <Separator />

                                <div>
                                    <h3 className="mb-3 font-semibold text-lg">Live Examples</h3>
                                    <MarkdownViewer
                                        content={`:comment[TODO: Update this section with new API examples]

<!-- This HTML comment is also visible -->`}
                                    />
                                </div>
                            </CardContent>
                        </Card>
                    </section>

                    {/* Code Blocks */}
                    <section className="space-y-6" id="code">
                        <div>
                            <h2 className="mb-2 font-semibold text-3xl tracking-tight">Code Blocks</h2>
                            <p className="text-muted-foreground">Syntax highlighting with Shiki</p>
                        </div>

                        <Card>
                            <CardHeader>
                                <CardTitle>Standard Markdown</CardTitle>
                                <CardDescription>Powered by Shiki (same engine as VS Code)</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div>
                                    <h3 className="mb-3 font-semibold text-lg">Syntax</h3>
                                    <pre className="overflow-x-auto rounded-lg bg-muted p-4 font-mono text-sm">
                                        {`\`\`\`language filename.ext
code here
\`\`\`

Features:
- Syntax highlighting for 100+ languages
- Optional filename in header
- Copy button
- Language badge`}
                                    </pre>
                                </div>

                                <Separator />

                                <div>
                                    <h3 className="mb-3 font-semibold text-lg">With Filename</h3>
                                    <MarkdownViewer
                                        content={`\`\`\`typescript components/button.tsx
interface ButtonProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary';
}

export function Button({ children, variant = 'primary' }: ButtonProps) {
  return <button className={\`btn btn-\${variant}\`}>{children}</button>;
}
\`\`\``}
                                    />
                                </div>

                                <Separator />

                                <div>
                                    <h3 className="mb-3 font-semibold text-lg">Without Filename</h3>
                                    <MarkdownViewer
                                        content={`\`\`\`bash
pnpm install @foundry/ui
pnpm run dev
\`\`\``}
                                    />
                                </div>
                            </CardContent>
                        </Card>
                    </section>

                    {/* Standard Markdown */}
                    <section className="space-y-6" id="standard">
                        <div>
                            <h2 className="mb-2 font-semibold text-3xl tracking-tight">Standard Markdown</h2>
                            <p className="text-muted-foreground">GFM and extended features</p>
                        </div>

                        <Card>
                            <CardHeader>
                                <CardTitle>Typography & Lists</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div>
                                    <h3 className="mb-3 font-semibold text-lg">Headings</h3>
                                    <p className="mb-3 text-muted-foreground text-sm">Six levels of headings available:</p>
                                    <pre className="overflow-x-auto rounded-lg bg-muted p-4 font-mono text-sm">
                                        {`# Heading 1
## Heading 2
### Heading 3
#### Heading 4
##### Heading 5
###### Heading 6`}
                                    </pre>
                                    <div className="mt-3 space-y-1 text-sm">
                                        <p className="text-muted-foreground">
                                            <strong>Note:</strong> Headings automatically get anchor links for easy navigation.
                                        </p>
                                    </div>
                                </div>

                                <Separator />

                                <div>
                                    <h3 className="mb-3 font-semibold text-lg">Text Formatting</h3>
                                    <MarkdownViewer
                                        content={`**Bold** *Italic* ~~Strikethrough~~ \`inline code\` ==Highlight==

> This is a blockquote.
> It can span multiple lines.`}
                                    />
                                </div>

                                <Separator />

                                <div>
                                    <h3 className="mb-3 font-semibold text-lg">Links</h3>
                                    <p className="mb-3 text-muted-foreground text-sm">Standard markdown links:</p>
                                    <MarkdownViewer
                                        content={`[Inline link](https://example.com)

[Link with title](https://example.com "Hover text")

<https://example.com> (Auto-linked URL)

[Reference link][ref]

[ref]: https://example.com "Reference definition"`}
                                    />
                                    <div className="mt-3 space-y-1 text-sm">
                                        <p className="text-muted-foreground">
                                            <strong>Note:</strong> External links automatically open in new tabs with <code>rel="noopener"</code> for security.
                                        </p>
                                    </div>
                                </div>

                                <Separator />

                                <div>
                                    <h3 className="mb-3 font-semibold text-lg">Lists</h3>
                                    <MarkdownViewer
                                        content={`- Item 1
- Item 2
  - Nested 2.1
  - Nested 2.2

1. First
2. Second
   1. Nested

- [x] Completed
- [ ] Incomplete`}
                                    />
                                </div>

                                <Separator />

                                <div>
                                    <h3 className="mb-3 font-semibold text-lg">Tables</h3>
                                    <MarkdownViewer
                                        content={`| Feature | Supported | Notes |
|---------|-----------|-------|
| Syntax Highlighting | ✅ | Shiki |
| Directives | ✅ | Custom |
| Tables | ✅ | GFM |`}
                                    />
                                </div>

                                <Separator />

                                <div>
                                    <h3 className="mb-3 font-semibold text-lg">Emoji</h3>
                                    <p className="mb-3 text-muted-foreground text-sm">Use emoji shortcodes or emoticons:</p>
                                    <MarkdownViewer
                                        content={`:smile: :heart: :rocket: :+1:

:) :D :P :'( <3`}
                                    />
                                    <div className="mt-3 space-y-1 text-sm">
                                        <p className="text-muted-foreground">
                                            <strong>Tip:</strong> Emoticons like <code>:)</code> and <code>&lt;3</code> are automatically converted to emoji.
                                        </p>
                                    </div>
                                </div>

                                <Separator />

                                <div>
                                    <h3 className="mb-3 font-semibold text-lg">Images</h3>
                                    <p className="mb-3 text-muted-foreground text-sm">Basic image syntax:</p>
                                    <pre className="overflow-x-auto rounded-lg bg-muted p-4 font-mono text-sm">
                                        {`![Alt text](image.jpg)

![Image with title](image.jpg "Hover title")

[![Linked image](image.jpg)](https://example.com)`}
                                    </pre>
                                    <div className="mt-3 space-y-1 text-sm">
                                        <p className="text-muted-foreground">
                                            <strong>Note:</strong> Images are automatically optimized and responsive. For advanced layouts, see the Image Layouts section above.
                                        </p>
                                    </div>
                                </div>

                                <Separator />

                                <div>
                                    <h3 className="mb-3 font-semibold text-lg">Horizontal Rules</h3>
                                    <p className="mb-3 text-muted-foreground text-sm">Create dividers with three or more dashes, asterisks, or underscores:</p>
                                    <MarkdownViewer
                                        content={`Content above

---

Content below

***

More content`}
                                    />
                                </div>

                                <Separator />

                                <div>
                                    <h3 className="mb-3 font-semibold text-lg">Line Breaks</h3>
                                    <p className="mb-3 text-muted-foreground text-sm">Two spaces at end of line creates a line break:</p>
                                    <pre className="overflow-x-auto rounded-lg bg-muted p-4 font-mono text-sm">
                                        {`Line 1··
Line 2

(·· represents two spaces)`}
                                    </pre>
                                    <p className="mt-2 text-muted-foreground text-sm">Or use a blank line for paragraph break:</p>
                                    <MarkdownViewer
                                        content={`First paragraph

Second paragraph`}
                                    />
                                </div>

                                <Separator />

                                <div>
                                    <h3 className="mb-3 font-semibold text-lg">Escaping Characters</h3>
                                    <p className="mb-3 text-muted-foreground text-sm">Use backslash to escape special characters:</p>
                                    <pre className="overflow-x-auto rounded-lg bg-muted p-4 font-mono text-sm">
                                        {`\\*Not italic\\* \\[Not a link\\]

Escaped: \\\\ \\* \\_ \\[ \\] \\( \\) \\# \\+ \\- \\. \\!`}
                                    </pre>
                                </div>

                                <Separator />

                                <div>
                                    <h3 className="mb-3 font-semibold text-lg">Footnotes</h3>
                                    <p className="mb-3 text-muted-foreground text-sm">Add footnotes with references:</p>
                                    <pre className="overflow-x-auto rounded-lg bg-muted p-4 font-mono text-sm">
                                        {`Here's a sentence with a footnote[^1].

Another reference[^note].

[^1]: This is the first footnote.
[^note]: Named footnotes are also supported.`}
                                    </pre>
                                    <p className="mt-3 text-muted-foreground text-sm">
                                        <strong>Note:</strong> Footnotes are automatically collected and rendered at the bottom of the document.
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    </section>

                    {/* Footer */}
                    <Card className="border-primary/20 bg-primary/5">
                        <CardContent className="pt-6">
                            <div className="space-y-4">
                                <h3 className="font-semibold text-lg">Resources</h3>
                                <ul className="space-y-2 text-sm">
                                    <li>
                                        <a className="text-primary underline" href="https://github.com/remarkjs/remark-directive" rel="noopener" target="_blank">
                                            remark-directive
                                        </a>
                                    </li>
                                    <li>
                                        <a className="text-primary underline" href="https://github.com/remarkjs/react-markdown" rel="noopener" target="_blank">
                                            React Markdown
                                        </a>
                                    </li>
                                    <li>
                                        <a className="text-primary underline" href="https://github.github.com/gfm/" rel="noopener" target="_blank">
                                            GitHub Flavored Markdown
                                        </a>
                                    </li>
                                    <li>
                                        <a className="text-primary underline" href="https://shiki.matsu.io/" rel="noopener" target="_blank">
                                            Shiki
                                        </a>
                                    </li>
                                </ul>
                                <p className="text-muted-foreground text-sm">
                                    <strong>Package:</strong> <code>@foundry/remark</code> - <code>packages/remark/src/</code>
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Sidebar TOC */}
                <aside className="sticky top-4 hidden h-fit w-64 shrink-0 xl:block">
                    <Card className="border-primary/20 bg-primary/5">
                        <CardHeader className="pb-3">
                            <CardTitle className="text-base">Table of Contents</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <nav className="space-y-1 text-sm">
                                <a className="block rounded-md px-2 py-1.5 text-muted-foreground transition-colors hover:bg-primary/10 hover:text-foreground" href="#core-concepts">
                                    Core Concepts
                                </a>
                                <a className="block rounded-md px-2 py-1.5 text-muted-foreground transition-colors hover:bg-primary/10 hover:text-foreground" href="#admonitions">
                                    Admonitions
                                </a>
                                <a className="block rounded-md px-2 py-1.5 text-muted-foreground transition-colors hover:bg-primary/10 hover:text-foreground" href="#badges">
                                    Badges
                                </a>
                                <a className="block rounded-md px-2 py-1.5 text-muted-foreground transition-colors hover:bg-primary/10 hover:text-foreground" href="#videos">
                                    Video Embeds
                                </a>
                                <a className="block rounded-md px-2 py-1.5 text-muted-foreground transition-colors hover:bg-primary/10 hover:text-foreground" href="#images">
                                    Image Layouts
                                </a>
                                <a className="block rounded-md px-2 py-1.5 text-muted-foreground transition-colors hover:bg-primary/10 hover:text-foreground" href="#glimpse">
                                    Glimpse Links
                                </a>
                                <a className="block rounded-md px-2 py-1.5 text-muted-foreground transition-colors hover:bg-primary/10 hover:text-foreground" href="#comments">
                                    Comments
                                </a>
                                <a className="block rounded-md px-2 py-1.5 text-muted-foreground transition-colors hover:bg-primary/10 hover:text-foreground" href="#code">
                                    Code Blocks
                                </a>
                                <a className="block rounded-md px-2 py-1.5 text-muted-foreground transition-colors hover:bg-primary/10 hover:text-foreground" href="#standard">
                                    Standard Markdown
                                </a>
                            </nav>
                        </CardContent>
                    </Card>
                </aside>
            </div>
        </div>
    );
}
