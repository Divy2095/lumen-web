import Content, { headings } from "../../content/docs/thumbnails.mdx";
import { documentationComponents } from "../../docs-components";
export const handle = { headings };
export function meta() { return [{ title: "Thumbnail generation and retrieval | Lumen documentation" }, { name: "description", content: "Background FFmpeg work creates a JPEG; authenticated retrieval serves the current output." }]; }
export default function Document() { return <article data-pagefind-body><Content components={documentationComponents} /></article>; }
