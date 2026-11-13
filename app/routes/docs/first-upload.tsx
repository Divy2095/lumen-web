import Content, { headings } from "../../content/docs/first-upload.mdx";
import { documentationComponents } from "../../docs-components";
export const handle = { headings };
export function meta() { return [{ title: "First registration and upload | Lumen documentation" }, { name: "description", content: "A conditional walkthrough for developers who already have a working backend and an active project API key." }]; }
export default function Document() { return <article data-pagefind-body><Content components={documentationComponents} /></article>; }
