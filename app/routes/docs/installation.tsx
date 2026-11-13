import Content, { headings } from "../../content/docs/installation.mdx";
import { documentationComponents } from "../../docs-components";
export const handle = { headings };
export function meta() { return [{ title: "Installation and configuration | Lumen documentation" }, { name: "description", content: "Inspect and configure the selected backend revision without assuming that a clean checkout can run." }]; }
export default function Document() { return <article data-pagefind-body><Content components={documentationComponents} /></article>; }
