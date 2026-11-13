import { reactRouter } from "@react-router/dev/vite";
import mdx from "@mdx-js/rollup";
import rehypeShiki, { type RehypeShikiOptions } from "@shikijs/rehype";
import { defineConfig } from "vite";
import { basePath } from "./site.config.ts";
import tailwindcss from "@tailwindcss/vite";
import { remarkDocumentHeadings } from "./scripts/document-headings.ts";

const highlighting = {
  themes: { light: "github-light", dark: "github-dark" },
  langs: ["typescript", "bash", "json"],
  transformers: [{ pre(node) { node.properties["data-language"] = this.options.lang; } }],
} satisfies RehypeShikiOptions;

export default defineConfig({
  base: basePath,
  plugins: [
    tailwindcss(),
    { enforce: "pre", ...mdx({ remarkPlugins: [remarkDocumentHeadings], rehypePlugins: [[rehypeShiki, highlighting]] }) },
    reactRouter(),
  ],
});
