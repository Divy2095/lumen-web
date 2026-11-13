import Content, { headings } from "../../content/docs/api-keys.mdx";
import { documentationComponents } from "../../docs-components";
export const handle = { headings };
export function meta() { return [{ title: "API-key authentication | Lumen documentation" }, { name: "description", content: "Authenticate server-side registration and retrieval requests using a project-owned secret." }]; }
export default function Document() { return <article data-pagefind-body><Content components={documentationComponents} /></article>; }
