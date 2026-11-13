import Content, { headings } from "../../content/docs/upload-media.mdx";
import { documentationComponents } from "../../docs-components";
export const handle = { headings };
export function meta() { return [{ title: "PUT media upload | Lumen documentation" }, { name: "description", content: "PUT /v1/media/:id/upload ingests raw MP4 bytes using the issued upload token." }]; }
export default function Document() { return <article data-pagefind-body><Content components={documentationComponents} /></article>; }
