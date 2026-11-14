import { AuthProvider } from "./auth/provider";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { isRouteErrorResponse, Link, Links, Meta, Outlet, Scripts, ScrollRestoration, useLocation } from "react-router";
import sansUrl from "@fontsource-variable/geist/files/geist-latin-wght-normal.woff2?url";
import { Search } from "./search";
import { Header, Footer } from "./site-shell";
import { themeBootstrap } from "./theme";
import "./styles.css";

export function Layout({ children }: { children: ReactNode }) {
  return <html lang="en" suppressHydrationWarning><head>
    <meta charSet="utf-8" /><meta name="viewport" content="width=device-width, initial-scale=1" />
    <script dangerouslySetInnerHTML={{ __html: themeBootstrap }} />
    <link rel="preload" href={sansUrl} as="font" type="font/woff2" crossOrigin="anonymous" />
    <Meta /><Links />
  </head><body>{children}<ScrollRestoration /><Scripts /></body></html>;
}

export default function App(){return <AuthProvider><Site/></AuthProvider>;}

function Site() {
  const { pathname } = useLocation();
  const main = useRef<HTMLElement>(null);
  const previous = useRef(pathname);
  const [searchOpen, setSearchOpen] = useState(false);
  useEffect(() => {
    if (previous.current !== pathname) main.current?.focus({ preventScroll: true });
    previous.current = pathname;
    document.documentElement.dataset.hydrated = "true";
  }, [pathname]);
  useEffect(() => {
    function shortcut(event: KeyboardEvent) {
      const target = event.target as HTMLElement;
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k" && !event.altKey &&
          !target.closest("input, textarea, select, [contenteditable=true]") && !document.querySelector("dialog[open]")) {
        event.preventDefault(); setSearchOpen(true);
      }
    }
    window.addEventListener("keydown", shortcut);
    return () => window.removeEventListener("keydown", shortcut);
  }, []);
  return <>
    <a href="#main" className="skip-link">Skip to content</a>
    <Header onSearch={() => setSearchOpen(true)} />
    <main id="main" tabIndex={-1} ref={main}><Outlet /></main>
    <Footer />
    <Search open={searchOpen} onClose={() => setSearchOpen(false)} />
  </>;
}

export function ErrorBoundary({ error }: { error: unknown }) {
  return <main className="home-content"><h1>{isRouteErrorResponse(error) && error.status === 404 ? "Page not found" : "Page could not load"}</h1>
    <Link to="/" className="text-link">Return to Lumen home</Link></main>;
}
