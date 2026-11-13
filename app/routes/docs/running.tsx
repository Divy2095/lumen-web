import Content, { headings } from "../../content/docs/running.mdx";
import { documentationComponents } from "../../docs-components";
export const handle = { headings };
export function meta() { return [{ title: "Running the API and workers | Lumen documentation" }, { name: "description", content: "Run three separate processes only after storage, schema and configuration prerequisites are satisfied." }]; }
export default function Document() { return <article data-pagefind-body><Content components={documentationComponents} /></article>; }
