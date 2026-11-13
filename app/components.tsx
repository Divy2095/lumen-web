import { useRef, useState, type ComponentProps, type ReactNode } from "react";
import { Copy, Info, Link as LinkIcon } from "lucide-react";
import { Button } from "./ui/button";
import { useOutletContext } from "react-router";

export function ArticleTitle({ children }: { children?: ReactNode }) {
  const { headings } = useOutletContext<{ headings: readonly { id: string; title: string }[] }>();
  return <><h1 data-pagefind-meta="title">{children}</h1><details className="mobile-contents" data-pagefind-ignore><summary>On this page</summary><ul>{headings.map(heading => <li key={heading.id}><a href={`#${heading.id}`}>{heading.title}</a></li>)}</ul></details></>;
}

export function StatusBadge({ children }: { children: ReactNode }) { return <span className="status-badge">{children}</span>; }

export function Callout({ title, children }: { title: string; children: ReactNode }) {
  return <aside className="callout"><Info size={17} aria-hidden="true" /><div><p className="callout-title">{title}</p><div>{children}</div></div></aside>;
}

export function Heading({ id, title }: { id: string; title: string }) {
  return <h2 id={id} className="article-heading">{title}<a href={`#${id}`} className="heading-anchor" aria-label={`Link to ${title}`}><LinkIcon size={16} aria-hidden="true" /></a></h2>;
}

export function CodeBlock({ children, "data-language": syntax = "text", ...props }: ComponentProps<"pre"> & { "data-language"?: string }) {
  const pre = useRef<HTMLPreElement>(null);
  const [status, setStatus] = useState("");
  const language = syntax === "typescript" ? "TypeScript" : syntax;
  async function copy() {
    try { await navigator.clipboard.writeText(pre.current?.textContent ?? ""); setStatus("Copied"); }
    catch { setStatus("Copy failed. Select and copy the code manually."); }
  }
  return <div className="code-block"><div className="code-toolbar" data-pagefind-ignore><span>{language}</span>
    <Button variant="ghost" onClick={copy} aria-label="Copy code"><Copy size={14} aria-hidden="true" />{status === "Copied" ? "Copied" : "Copy"}</Button></div>
    <pre {...props} ref={pre} tabIndex={0} aria-label={`${language} code`}>{children}</pre>
    <span role="status" className={status.startsWith("Copy failed") ? "copy-error" : "sr-only"} data-pagefind-ignore>{status}</span></div>;
}
