import { AccountControl } from "./auth/account";
import { useEffect, useRef, useState } from "react";
import { Link, NavLink, useLocation } from "react-router";
import { ArrowUpRight, Menu, Search as SearchIcon } from "lucide-react";
import { docsPath, githubUrl } from "../site.config";
import { Button } from "./ui/button";
import { Modal } from "./ui/modal";
import { ThemeControl } from "./theme";

export function Header({ onSearch }: { onSearch: () => void }) {
  const [open, setOpen] = useState(false);
  const header = useRef<HTMLElement>(null);
  const { pathname } = useLocation();
  useEffect(() => { setOpen(false); }, [pathname]);
  useEffect(() => {
    const observer = new ResizeObserver(([entry]) => {
      document.documentElement.style.setProperty("--header-offset", `${entry.target.getBoundingClientRect().height}px`);
    });
    observer.observe(header.current!);
    return () => observer.disconnect();
  }, []);
  useEffect(() => {
    const media = matchMedia("(min-width: 768px)");
    const close = () => { if (media.matches) setOpen(false); };
    media.addEventListener("change", close);
    return () => media.removeEventListener("change", close);
  }, []);
  const links = <>
    <NavLink to="/" end>Product</NavLink>
    <NavLink to={docsPath} className={() => pathname.includes("/docs/") ? "active" : ""}>Documentation</NavLink>
    <a href={githubUrl}>GitHub <ArrowUpRight size={14} aria-hidden="true" /></a>
  </>;
  return <header ref={header} className="site-header" data-pagefind-ignore><div className="header-inner">
    <Link to="/" className="wordmark" aria-label="Lumen home">Lumen<span className="wordmark-dot" aria-hidden="true">.</span></Link>
    <nav className="global-nav" aria-label="Global navigation">{links}</nav>
    <div className="header-controls">
      <Button className="search-trigger" variant="ghost" onClick={onSearch} aria-label="Search documentation" aria-haspopup="dialog"><SearchIcon size={17} aria-hidden="true" /><span>Search docs</span><kbd aria-hidden="true">⌘ / Ctrl K</kbd></Button>
      <ThemeControl />
      <AccountControl />
      <Button variant="ghost" className="icon-button mobile-menu-trigger" onClick={() => setOpen(true)} aria-label="Open navigation" aria-haspopup="dialog" aria-expanded={open}><Menu size={20} aria-hidden="true" /></Button>
    </div>
  </div>
    <Modal open={open} onClose={() => setOpen(false)} title="Navigation" className="navigation-modal">
      <nav aria-label="Mobile global navigation" className="mobile-nav" onClick={event => { if ((event.target as HTMLElement).closest("a")) setOpen(false); }}>{links}</nav>
    </Modal>
  </header>;
}

export function Footer() {
  return <footer className="site-footer" data-pagefind-ignore><div className="footer-inner">
    <div><Link to="/" className="footer-wordmark">Lumen</Link><p>Open-source media infrastructure.<br />Early development.</p></div>
    <nav aria-label="Footer navigation"><Link to={docsPath}>Documentation</Link><a href={githubUrl}>GitHub</a><a href="https://github.com/Divy2095/lumen-web">Website source</a></nav>
    <p className="footer-note">Early-development project.<br />Source-based documentation.<br />Backend package declares ISC.</p>
  </div></footer>;
}
