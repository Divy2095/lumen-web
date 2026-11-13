import Content, { headings } from "../../content/docs/architecture.mdx";
import { documentationComponents } from "../../docs-components";
export const handle = { headings };
export function meta() { return [{ title: "System architecture | Lumen documentation" }, { name: "description", content: "Follow the boundaries between HTTP ingestion, durable state and asynchronous execution." }]; }
export default function Document() { return <article data-pagefind-body><Content components={documentationComponents} /></article>; }
