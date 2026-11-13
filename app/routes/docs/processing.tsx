import Content, { headings } from "../../content/docs/processing.mdx";
import { documentationComponents } from "../../docs-components";
export const handle = { headings };
export function meta() { return [{ title: "Processing lifecycle | Lumen documentation" }, { name: "description", content: "Treat ingestion, metadata and thumbnail state as independent concerns." }]; }
export default function Document() { return <article data-pagefind-body><Content components={documentationComponents} /></article>; }
