import Content, { headings } from "../../content/docs/uploads.mdx";
import { documentationComponents } from "../../docs-components";
export const handle = { headings };
export function meta() { return [{ title: "Streaming MP4 uploads | Lumen documentation" }, { name: "description", content: "Send raw MP4 bytes with the exact declared length, not a multipart body." }]; }
export default function Document() { return <article data-pagefind-body><Content components={documentationComponents} /></article>; }
