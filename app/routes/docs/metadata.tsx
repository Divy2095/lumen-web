import Content, { headings } from "../../content/docs/metadata.mdx";
import { documentationComponents } from "../../docs-components";
export const handle = { headings };
export function meta() { return [{ title: "Metadata extraction | Lumen documentation" }, { name: "description", content: "FFprobe extracts metadata in a background job and the worker persists it internally." }]; }
export default function Document() { return <article data-pagefind-body><Content components={documentationComponents} /></article>; }
