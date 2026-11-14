import { useEffect, useRef, useState, type FormEvent } from "react";
import { Link } from "react-router";
import { ArrowUpRight, Search as SearchIcon } from "lucide-react";
import { basePath, documents } from "../site.config";
import { Button } from "./ui/button";
import { Modal } from "./ui/modal";

type Result = { url: string; meta: { title?: string }; excerpt: string };
type Pagefind = { search: (query: string) => Promise<{ results: { data: () => Promise<Result> }[] }> };
const plainExcerpt = (value: string) => value.replace(/<[^>]*>/g, "");

export function Search({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [results, setResults] = useState<Result[]>([]);
  const [status, setStatus] = useState("Search across Lumen documentation.");
  const [busy, setBusy] = useState(false);
  const [query, setQuery] = useState("");
  const [failed, setFailed] = useState(false);
  const generation = useRef(0);
  const input = useRef<HTMLInputElement>(null);
  useEffect(() => {
    if (open) input.current?.focus();
    else { generation.current++; setBusy(false); }
  }, [open]);
  function updateQuery(value: string) {
    setQuery(value);
    if (value.trim()) return;
    generation.current++;
    setResults([]);
    setFailed(false);
    setBusy(false);
    setStatus("Search across Lumen documentation.");
  }
  async function search(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const term = query.trim();
    const request = ++generation.current;
    setResults([]);
    setFailed(false);
    if (!term) { setStatus("Enter a search term."); return; }
    setBusy(true);
    setStatus("Searching…");
    try {
      const url = `${import.meta.env.BASE_URL}pagefind/pagefind.js`;
      const pagefind = await import(/* @vite-ignore */ url) as Pagefind;
      const response = await pagefind.search(term);
      const matches = await Promise.all(response.results.slice(0, 10).map(result => result.data()));
      if (request !== generation.current) return;
      setResults(matches);
      setStatus(matches.length === 0 ? "No results. Try another term." : `${matches.length} result${matches.length === 1 ? "" : "s"}`);
    } catch {
      if (request !== generation.current) return;
      setFailed(true);
      setStatus("Search is temporarily unavailable. Try again or browse the documentation below.");
    } finally { if (request === generation.current) setBusy(false); }
  }
  return <Modal open={open} onClose={onClose} title="Search documentation" className="search-modal">
    <form onSubmit={search} className="search-form" role="search">
      <label htmlFor="query" className="sr-only">Search documentation</label>
      <SearchIcon aria-hidden="true" size={18} />
      <input ref={input} id="query" name="query" type="search" placeholder="Search guides, APIs, and more..." value={query} onChange={event => updateQuery(event.target.value)} autoComplete="off" enterKeyHint="search" required />
      <Button type="submit" disabled={busy} variant="ghost" className="search-submit">{failed ? "Retry" : "Search"}</Button>
    </form>
    <div className="search-summary">
      <p role="status" className="search-status">{status}</p>
      {!query.trim() && !results.length && !failed && !busy && <p className="search-hint">Start typing to find guides and API references.</p>}
    </div>
    <ul className="search-results">{results.map(result => <li key={result.url}>
      <Link to={result.url.startsWith(basePath) ? `/${result.url.slice(basePath.length)}` : result.url} onClick={() => {
        onClose();
        requestAnimationFrame(() => document.querySelector<HTMLElement>("main")?.focus({ preventScroll: true }));
      }}><div><strong>{result.meta.title ?? result.url}</strong><span className="search-result-tag">{documents.find(doc => result.url.split("#")[0] === `${basePath}${doc.path}/`)?.group ?? "Documentation"}</span></div>
        <p>{plainExcerpt(result.excerpt)}</p><ArrowUpRight size={16} aria-hidden="true" />
      </Link>
    </li>)}</ul>
    {failed && <nav aria-label="Browse documentation" className="search-fallback">{documents.map(doc => <Link key={doc.path} to={`/${doc.path}/`} onClick={onClose}>{doc.title}</Link>)}</nav>}
    <div className="search-footer"><span>Powered by Pagefind</span><span><kbd>Esc</kbd> to close</span></div>
  </Modal>;
}
