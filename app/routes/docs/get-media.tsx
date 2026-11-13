import Content, { headings } from "../../content/docs/get-media.mdx";
import { documentationComponents } from "../../docs-components";
export const handle = { headings };
export function meta() { return [{ title: "GET media | Lumen documentation" }, { name: "description", content: "GET /v1/media/:id returns the project-owned asset and optional thumbnail availability." }]; }
export default function Document() { return <article data-pagefind-body><Content components={documentationComponents} /></article>; }
