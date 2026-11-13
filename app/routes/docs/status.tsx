import Content, { headings } from "../../content/docs/status.mdx";
import { documentationComponents } from "../../docs-components";
export const handle = { headings };
export function meta() { return [{ title: "Development status | Lumen documentation" }, { name: "description", content: "Separate committed implementation, local development, plans and runtime verification." }]; }
export default function Document() { return <article data-pagefind-body><Content components={documentationComponents} /></article>; }
