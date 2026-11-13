import Content, { headings } from "../../content/docs/prerequisites.mdx";
import { documentationComponents } from "../../docs-components";
export const handle = { headings };
export function meta() { return [{ title: "Prerequisites | Lumen documentation" }, { name: "description", content: "Prepare an isolated development environment, but review the onboarding blockers before running the backend." }]; }
export default function Document() { return <article data-pagefind-body><Content components={documentationComponents} /></article>; }
