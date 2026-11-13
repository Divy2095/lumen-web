import Content, { headings } from "../../content/docs/overview.mdx";
import { documentationComponents } from "../../docs-components";
export const handle = { headings };
export function meta() { return [{ title: "Overview | Lumen documentation" }, { name: "description", content: "Lumen is an early-development, API-first video-processing platform that you operate alongside your application." }]; }
export default function Document() { return <article data-pagefind-body><Content components={documentationComponents} /></article>; }
