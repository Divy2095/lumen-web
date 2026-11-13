import Content, { headings } from "../../content/docs/infrastructure.mdx";
import { documentationComponents } from "../../docs-components";
export const handle = { headings };
export function meta() { return [{ title: "Infrastructure and migrations | Lumen documentation" }, { name: "description", content: "Understand the supplied database and queue services and the migration entry points." }]; }
export default function Document() { return <article data-pagefind-body><Content components={documentationComponents} /></article>; }
