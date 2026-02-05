"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@foundry/ui/primitives/card";
import MarkdownViewer from "@foundry/web/components/markdown/md-viewer";

const md = `
# 📝 Markdown Preview Demo

<!--
This markdown demonstrates:
- Emojis
- Badges (inline and block)
- Code blocks with language and filename
- Links (custom directive and standard)
- Video embeds (YouTube, Bilibili, Vimeo, custom)
- Images (figure, caption, link, div)
- Comments for documentation
-->

## 🎉 Emojis

:dog: :+1: :) :'( :heart: :tada: :rocket: :sparkles:

---

## 🏷️ Badges

<!-- Inline badge -->
:badge[New]

<!-- Preset badge (article) -->
:badge-a

<!-- Preset badge (video) -->
:badge-v

<!-- Custom styled badge -->
:badge[Success]{style="color: white; background-color: #aaf233"}

### Variants

:badge[Default]{variant="default"}
:badge[Secondary]{variant="secondary"}
:badge[Destructive]{variant="destructive"}
:badge[Outline]{variant="outline"}

---

## 💻 Code Blocks

<!-- Code block with language only -->
\`\`\`md
:badge[Outline]{variant="outline"}
\`\`\`

<!-- Code block with language and filename -->
\`\`\`tsx BadgeTest.tsx
:badge[Outline]{variant="outline"}
\`\`\`

<!-- Code block with language, filename, and meta (line highlight, showLineNumbers) -->
\`\`\`js example.js {1,3-4} showLineNumbers
console.log("Line 1");
console.log("Line 2");
console.log("Line 3");
console.log("Line 4");
\`\`\`

---

## 🔗 Links

<!-- Custom link directive examples -->
- :link{#@lin-stephanie}
- :link[Vite]{id=@vitejs}
- :link[Astro]{id=withastro/astro}
- :link{id=https://developer.mozilla.org/en-US/docs/Web/JavaScript}
- :link[Google]{id=https://www.google.com/}
- :link[Vite]{id=@vitejs url=https://vite.dev/}
- :link[Vite]{id=@vitejs img=https://vitejs.dev/logo.svg}

---

## 🎬 Video Embeds

<!-- Embed a YouTube video -->
- ::video-youtube{#gxBkghlglTg}

<!-- Embed a Bilibili video -->
- ::video-bilibili{id=BV1MC4y1c7Kv}

<!-- Embed a Vimeo video with a custom title -->
- ::video-vimeo[Custom Title]{id=912831806}

<!-- Embed a custom video URL (must use 'id', not '#') -->
- ::video{id=https://www.youtube-nocookie.com/embed/gxBkghlglTg}

---

## 🖼️ Images

<!-- Figure with caption -->
:::image-figure[Figcaption text]
![Alt text](https://images.pexels.com/photos/237273/pexels-photo-237273.jpeg)
:::

<!-- Figure with custom style -->
:::image-figure{style="text-align:center; color:orange"}
![Text for both alt and figcaption](https://images.pexels.com/photos/237273/pexels-photo-237273.jpeg)
:::

<!-- Image wrapped in a link -->
:::image-a{href="https://github.com/lin-stephanie/remark-directive-sugar"}
![](https://images.pexels.com/photos/237273/pexels-photo-237273.jpeg)
:::

<!-- Image in a div container -->
:::image-div
![](https://images.pexels.com/photos/237273/pexels-photo-237273.jpeg)
:::

---

<!--
You can add more sections below to demonstrate tables, lists, blockquotes, etc.
-->
`;

export function MarkdownTab() {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Description</CardTitle>
                <CardDescription>Project details and overview.</CardDescription>
            </CardHeader>
            <CardContent className="prose center max-w-none justify-center space-y-6">
                <MarkdownViewer content={md} />
            </CardContent>
        </Card>
    );
}
