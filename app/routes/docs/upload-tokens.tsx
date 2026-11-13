import Content, { headings } from "../../content/docs/upload-tokens.mdx";
import { documentationComponents } from "../../docs-components";
export const handle = { headings };
export function meta() { return [{ title: "Upload-token authentication | Lumen documentation" }, { name: "description", content: "Use the issued credential only for the matching asset upload." }]; }
export default function Document() { return <article data-pagefind-body><Content components={documentationComponents} /></article>; }
