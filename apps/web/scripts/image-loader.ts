export default function cloudflareLoader({ src, width, quality }) {
    const params = [`width=${width}`, `quality=${quality || 75}`, "format=auto"];
    return `https://homestead.systems/cdn-cgi/image/${params.join(",")}/${src}`;
}
