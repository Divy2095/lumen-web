import Content, { headings } from "../../content/docs/contributing.mdx";
import { documentationComponents } from "../../docs-components";
export const handle = { headings };
export function meta() { return [{ title: "Contributing | Lumen documentation" }, { name: "description", content: "Prepare a source-specific, sanitized report or proposal without assuming an unverified contribution policy." }]; }
export default function Document() { return <article data-pagefind-body><Content components={documentationComponents} /></article>; }
