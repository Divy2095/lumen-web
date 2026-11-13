import Content, { headings } from "../../content/docs/concepts.mdx";
import { documentationComponents } from "../../docs-components";
export const handle = { headings };
export function meta() { return [{ title: "Core concepts | Lumen documentation" }, { name: "description", content: "Separate ownership, ingestion and processing before integrating with the API." }]; }
export default function Document() { return <article data-pagefind-body><Content components={documentationComponents} /></article>; }
