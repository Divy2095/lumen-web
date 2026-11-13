import Content, { headings } from "../../content/docs/errors.mdx";
import { documentationComponents } from "../../docs-components";
export const handle = { headings };
export function meta() { return [{ title: "Error handling | Lumen documentation" }, { name: "description", content: "Handle route-specific errors and uncertain outcomes rather than assuming every failure is retryable." }]; }
export default function Document() { return <article data-pagefind-body><Content components={documentationComponents} /></article>; }
