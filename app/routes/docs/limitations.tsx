import Content, { headings } from "../../content/docs/limitations.mdx";
import { documentationComponents } from "../../docs-components";
export const handle = { headings };
export function meta() { return [{ title: "Known limitations | Lumen documentation" }, { name: "description", content: "Read these constraints before attempting onboarding or relying on an API capability." }]; }
export default function Document() { return <article data-pagefind-body><Content components={documentationComponents} /></article>; }
