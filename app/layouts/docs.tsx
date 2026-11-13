import { useEffect, useRef, useState } from "react";
import { Link, NavLink, Outlet, useLocation, useMatches } from "react-router";
import { ArrowLeft, ArrowRight, ChevronRight, List } from "lucide-react";
import { documents, docsPath, githubUrl, backendRevision } from "../../site.config";
import { Button } from "../ui/button";
import { Modal } from "../ui/modal";
import { StatusBadge } from "../components";

function DocumentationNavigation({ onNavigate }: { onNavigate?: () => void }) {
  const navigation = useRef<HTMLElement>(null);
  const { pathname } = useLocation();
  const previousPath = useRef<string | null>(null);
  useEffect(() => {
    const nav = navigation.current;
    const mounting = previousPath.current === null;
    previousPath.current = pathname;
    // Preserve scrolling begun before hydration; moving links can cancel a pending click.
    if (mounting && nav && nav.scrollTop > 0) return;
    const current = nav?.querySelector<HTMLElement>("[aria-current='page']");
    if (nav && current) nav.scrollTop = Math.max(0, current.offsetTop - nav.clientHeight / 2);
  }, [pathname]);
  return <nav ref={navigation} aria-label="Documentation navigation" className="docs-navigation">
    <p className="nav-eyebrow">Documentation</p>
    {[...new Set(documents.map(doc => doc.group))].map(group => <div className="nav-group" key={group}>
      <h2>{group}</h2>{documents.filter(doc => doc.group === group).map(doc =>
        <NavLink to={`/${doc.path}/`} key={doc.path} end onClick={onNavigate}>{doc.title}</NavLink>)}
    </div>)}
    <p className="nav-footnote">Early development<br />Source-based documentation</p>
  </nav>;
}

export default function DocsLayout() {
  const { pathname } = useLocation();
  const position = documents.findIndex(doc => pathname.replace(/\/$/, "").endsWith(`/${doc.path}`));
  const doc = documents[position];
  const matches = useMatches();
  const headings = (matches.at(-1)?.handle as { headings?: readonly { id: string; title: string; level: number }[] } | undefined)?.headings ?? [];
  const [open, setOpen] = useState(false);
  useEffect(() => { setOpen(false); }, [pathname]);
  useEffect(() => {
    const media = matchMedia("(min-width: 1024px)");
    const close = () => { if (media.matches) setOpen(false); };
    media.addEventListener("change", close);
    return () => media.removeEventListener("change", close);
  }, []);
  if (!doc) return <Outlet />;
  const contents = <ul>{headings.map(heading => <li key={heading.id} className={heading.level === 3 ? "toc-nested" : undefined}><a href={`#${heading.id}`}>{heading.title}</a></li>)}</ul>;
  return <div className="docs-container">
    <div className="docs-mobile-bar"><Button variant="ghost" onClick={() => setOpen(true)} aria-haspopup="dialog" aria-expanded={open}><List size={16} aria-hidden="true" />Documentation menu</Button><span>{doc.group}</span></div>
    <div className="docs-grid">
      <aside className="docs-sidebar"><DocumentationNavigation /></aside>
      <div className="docs-content">
        <nav aria-label="Breadcrumb" className="breadcrumbs"><ol><li><Link to={docsPath}>Docs</Link></li><li><ChevronRight aria-hidden="true" size={12} /><span>{doc.group}</span></li><li><ChevronRight aria-hidden="true" size={12} /><span aria-current="page">{doc.title}</span></li></ol></nav>
        <div className="article-kicker"><span>Developer documentation</span><StatusBadge>Early development</StatusBadge></div>
        <Outlet context={{ headings }} />
        <section className="document-sources" data-pagefind-ignore aria-label="Source references"><p>Source baseline <code>{backendRevision.slice(0, 7)}</code> · Runtime not verified</p><ul>{doc.sources.map(source => <li key={source}><a href={`${githubUrl}/blob/${backendRevision}/${source}`}>{source}</a></li>)}</ul></section>
        <nav className="article-pagination" aria-label="Article pagination">
          {position > 0 ? <Link to={`/${documents[position - 1].path}/`}><span><ArrowLeft size={15} aria-hidden="true" />Previous</span>{documents[position - 1].title}</Link> : <span />}
          {position < documents.length - 1 && <Link to={`/${documents[position + 1].path}/`}><span>Next<ArrowRight size={15} aria-hidden="true" /></span>{documents[position + 1].title}</Link>}
        </nav>
      </div>
      <aside className="docs-toc"><nav aria-label="On this page"><h2>On this page</h2>{contents}</nav><p>Committed baseline<br />Runtime not verified</p></aside>
    </div>
    <Modal open={open} onClose={() => setOpen(false)} title="Documentation" className="navigation-modal"><DocumentationNavigation onNavigate={() => setOpen(false)} /></Modal>
  </div>;
}
