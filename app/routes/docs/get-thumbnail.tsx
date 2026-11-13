import Content, { headings } from "../../content/docs/get-thumbnail.mdx";
import { documentationComponents } from "../../docs-components";
export const handle = { headings };
export function meta() { return [{ title: "GET media thumbnail | Lumen documentation" }, { name: "description", content: "GET /v1/media/:id/thumbnail streams the current JPEG to an authenticated project caller." }]; }
export default function Document() { return <article data-pagefind-body><Content components={documentationComponents} /></article>; }
