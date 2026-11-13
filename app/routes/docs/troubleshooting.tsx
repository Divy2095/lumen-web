import Content, { headings } from "../../content/docs/troubleshooting.mdx";
import { documentationComponents } from "../../docs-components";
export const handle = { headings };
export function meta() { return [{ title: "Troubleshooting | Lumen documentation" }, { name: "description", content: "Start with the failing boundary and keep credentials and internal paths out of public reports." }]; }
export default function Document() { return <article data-pagefind-body><Content components={documentationComponents} /></article>; }
