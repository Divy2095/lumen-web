import Content, { headings } from "../../content/docs/ready.mdx";
import { documentationComponents } from "../../docs-components";
export const handle = { headings };
export function meta() { return [{ title: "GET ready | Lumen documentation" }, { name: "description", content: "GET /ready checks whether a bounded PostgreSQL query succeeds." }]; }
export default function Document() { return <article data-pagefind-body><Content components={documentationComponents} /></article>; }
