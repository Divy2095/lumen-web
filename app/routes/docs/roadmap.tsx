import Content, { headings } from "../../content/docs/roadmap.mdx";
import { documentationComponents } from "../../docs-components";
export const handle = { headings };
export function meta() { return [{ title: "Roadmap | Lumen documentation" }, { name: "description", content: "Future directions are not current API capabilities or delivery commitments." }]; }
export default function Document() { return <article data-pagefind-body><Content components={documentationComponents} /></article>; }
