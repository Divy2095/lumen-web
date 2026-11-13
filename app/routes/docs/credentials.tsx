import Content, { headings } from "../../content/docs/credentials.mdx";
import { documentationComponents } from "../../docs-components";
export const handle = { headings };
export function meta() { return [{ title: "Credential provisioning limitations | Lumen documentation" }, { name: "description", content: "An active project and usable API key are required, but their creation is not a verified public API." }]; }
export default function Document() { return <article data-pagefind-body><Content components={documentationComponents} /></article>; }
