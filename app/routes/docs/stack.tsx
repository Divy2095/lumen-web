import Content, { headings } from "../../content/docs/stack.mdx";
import { documentationComponents } from "../../docs-components";
export const handle = { headings };
export function meta() { return [{ title: "Technology stack | Lumen documentation" }, { name: "description", content: "Understand each component\u2019s responsibility instead of treating a dependency list as a feature list." }]; }
export default function Document() { return <article data-pagefind-body><Content components={documentationComponents} /></article>; }
