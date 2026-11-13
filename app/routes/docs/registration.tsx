import Content, { headings } from "../../content/docs/registration.mdx";
import { documentationComponents } from "../../docs-components";
export const handle = { headings };
export function meta() { return [{ title: "Media registration | Lumen documentation" }, { name: "description", content: "Register an upload intent before streaming bytes." }]; }
export default function Document() { return <article data-pagefind-body><Content components={documentationComponents} /></article>; }
