import type { ComponentProps } from "react";
import { Link } from "react-router";
import { Link as LinkIcon } from "lucide-react";
import { ArticleTitle, CodeBlock, Callout } from "./components";
import { basePath } from "../site.config";

function Anchor({ href = "", children, ...props }: ComponentProps<"a">) {
  if (href.startsWith("/docs/")) return <Link to={href} {...props}>{children}</Link>;
  if (href.startsWith(basePath)) return <Link to={`/${href.slice(basePath.length)}`} {...props}>{children}</Link>;
  return <a href={href} {...props}>{children}</a>;
}
function SectionHeading({ id, children, level }: ComponentProps<"h2"> & { level: 2 | 3 }) {
  const Tag = level === 2 ? "h2" : "h3";
  return <Tag id={id} className="article-heading"><span className="heading-text">{children}</span><a href={`#${id}`} className="heading-anchor" aria-label={`Link to ${String(children)}`}><LinkIcon size={16} aria-hidden="true" /></a></Tag>;
}
export const documentationComponents = {
  h1: ArticleTitle,
  h2: (props: ComponentProps<"h2">) => <SectionHeading {...props} level={2} />,
  h3: (props: ComponentProps<"h3">) => <SectionHeading {...props} level={3} />,
  a: Anchor,
  pre: CodeBlock,
  table: (props: ComponentProps<"table">) => <div className="docs-table" tabIndex={0} role="region" aria-label="Scrollable reference table"><table {...props} /></div>,
  Callout,
};
