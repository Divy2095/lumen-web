import Content, { headings } from "../../content/docs/health.mdx";
import { documentationComponents } from "../../docs-components";
export const handle = { headings };
export function meta() { return [{ title: "GET health | Lumen documentation" }, { name: "description", content: "GET /health reports application liveness without authenticating the caller." }]; }
export default function Document() { return <article data-pagefind-body><Content components={documentationComponents} /></article>; }
