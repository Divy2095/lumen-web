import Content, { headings } from "../../content/docs/register-media.mdx";
import { documentationComponents } from "../../docs-components";
export const handle = { headings };
export function meta() { return [{ title: "POST media | Lumen documentation" }, { name: "description", content: "POST /v1/media creates a project-owned MP4 upload intent and returns its single-use upload credentials." }]; }
export default function Document() { return <article data-pagefind-body><Content components={documentationComponents} /></article>; }
