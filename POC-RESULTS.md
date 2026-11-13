# Static hosting compatibility POC

Executed: 2026-11-12. Scope: Phase 2 compatibility validation only.

**Result: local compatibility checks passed.** Recommend retaining React Router framework mode + Vite + build-time MDX/Shiki + Pagefind, with the small output normalization described below. The generated site uses no runtime application server, backend connection or secrets. This is not evidence of an actual GitHub Pages deployment; publishing requires separate approval.

The Phase 1 planning documents remain unchanged. This report records the authorized Phase 2 implementation and supersedes their “not yet tested” statements only for the checks explicitly recorded here. No final landing page, documentation design, processing simulation or live upload was implemented.

## Environment and dependency choices

Validated with Node **24.22.1**, npm **11.19.1**, Linux x64. `.node-version` and `package.json` record the tested Node line. Dependencies are exact-pinned and `package-lock.json` is present.

| Package | Version | Purpose |
| --- | --- | --- |
| React / React DOM | 19.3.1 | Rendering and hydration |
| React Router / `@react-router/dev` | 8.5.1 | Framework routing, type generation and static prerendering |
| Vite | 8.3.8 | Build integration |
| TypeScript | 7.0.2 | Strict typecheck |
| `@mdx-js/rollup` | 3.1.1 | Compile trusted MDX through Vite |
| `@shikijs/rehype` | 4.6.0 | Build-time code highlighting with light/dark styles |
| Pagefind | 1.6.0 | Static HTML indexing and browser search |
| isbot | 5.2.3 | Required by the router's default build-time server entry; not a hosted service |
| `@playwright/test` | 1.65.0 | Development-only Chromium compatibility tests |
| `@types/react` / `@types/react-dom` | 19.3.0 | React declarations |
| `@types/node` | 24.19.2 | Tooling declarations |
| `@types/mdx` | 2.0.14 | MDX imports/components declarations |

Version and peer/engine requirements were checked with npm metadata, then the installed packages were validated together. The router supports Vite 8 and the installed TypeScript line; Node 24.22.1 meets their requirements. No Tailwind, shadcn/ui, Lucide, Motion, React Bits, Magic UI, font package, hosted search or separate production server package was installed. Plain CSS and system fonts keep the proof focused.

Official references used:

- [React Router static prerendering](https://reactrouter.com/how-to/pre-rendering): `ssr: false` plus `prerender: true` supports static route generation without runtime SSR.
- [Router configuration](https://reactrouter.com/api/framework-conventions/react-router.config.ts): framework basename and output settings. Installed type declarations/source were also inspected for version-specific behavior.
- [MDX Vite integration](https://mdxjs.com/docs/getting-started/#vite): build-time MDX plugin; React is its default JSX target, so a provider package is unnecessary here.
- [Shiki rehype integration](https://shiki.style/packages/rehype): build-time token spans and dual-theme CSS variables.
- [Pagefind indexing configuration](https://pagefind.app/docs/config-options/): generated HTML input and article selection. The installed CLI help was checked for actual supported flags.
- [Vite GitHub Pages guidance](https://vite.dev/guide/static-deploy.html#github-pages): project deployment uses a repository base path.

UI/UX Pro Max's React semantic-navigation guidance informed the minimal links and controls. This was technical validation, not implementation of the final design system.

## Routes and generated artifact

| Browser URL | Final HTML file | Indexed marker |
| --- | --- | --- |
| `/lumen-web/` | `build/client/index.html` | Home intentionally excluded from docs search |
| `/lumen-web/docs/getting-started/installation/` | `build/client/docs/getting-started/installation/index.html` | `amberquartz` |
| `/lumen-web/docs/guides/processing/` | `build/client/docs/guides/processing/index.html` | `cobaltfinch` |

These are explicitly labeled fixtures, not installation instructions or final product documentation. Both MDX articles contain an actual React component rendered at build time. The installation fixture includes highlighted TypeScript, a copy button and `#static-check`; the processing fixture links back to that fragment.

Deployable directory, when deployment is separately approved: **`build/client/`**. It contains document indexes, assets, Pagefind files, `404.html` and `.nojekyll`. Do not upload a wrapping `lumen-web` directory. No `build/server` directory remains after the full build.

## Base-path findings and minimal adaptation

Both the Vite `base` and router `basename` must be **`/lumen-web/`**, including the trailing slash. With a slashless router basename, the installed router's internal Vite preview configuration check rejected the build before prerendering. Matching both values resolved that configuration failure.

Observed React Router 8.5.1 output before normalization:

```text
build/client/assets/…
build/client/lumen-web/index.html
build/client/lumen-web/docs/getting-started/installation/index.html
build/client/lumen-web/docs/guides/processing/index.html
build/client/index.html                    # generated SPA shell
build/server/…                            # build-time rendering intermediate
```

Pages itself mounts the artifact at the repository prefix. `scripts/finalize-static.ts` copies the generated prefixed document tree up one level, replaces the root SPA shell with the real prerendered home, removes the now-redundant document prefix and build-time server intermediate, checks the expected HTML files and writes `.nojekyll`. It changes filesystem placement only; HTML/JS URLs are not rewritten. Pagefind then indexes the final artifact.

This small adaptation is version-specific and tested. Future router upgrades must rerun the proof and inspect output before modifying it. The script fails if the expected prefixed home is absent. There is no hash router, custom React renderer, URL redirect script or fallback-to-SPA workaround.

The default build-time entry initially prompted an automatic isbot installation. It is now explicitly pinned before any router command, making clean `npm ci` repeatable and preventing that automatic dependency step on subsequent checks.

## Executed evidence

Final commands completed successfully:

```bash
npm ci --include=dev
PLAYWRIGHT_BROWSERS_PATH=/tmp/lumen-web-playwright npm run validate
```

`validate` runs type generation + `tsc --noEmit`, then the production build/normalization/Pagefind, then browser tests against `npm run preview`. The clean install audited 228 packages and reported zero known vulnerabilities at execution time; that is not a security certification.

Pagefind reported **2 indexed pages, 69 words, 1 language (en)**. Final Playwright run: **3 passed**, exit code 0, approximately 3.9 seconds. The three tests contain the following checks:

| Check | Observed result |
| --- | --- |
| Strict TypeScript | Passed, including tooling and test files |
| Production build | Passed; real document HTML emitted before browser execution |
| MDX/static React | Each article and its React note exist in HTML and remain readable with JavaScript disabled |
| Direct nested requests | Both article URLs return HTTP 200 on the file-only server |
| Refresh | Both documents refresh successfully; the fragment route also reloads successfully |
| Trailing slash | Both slashless article URLs return HTTP 301 to their directory URL |
| Static assets/links | Script, stylesheet/modulepreload and navigation URLs in both documents are base-prefixed and return HTTP 200 |
| Hydration | Client hydration marker appears; no page/console errors or HTTP error responses in the navigation check |
| MDX internal navigation | Client-side route transition preserves an in-memory browser marker, proving it did not fall back to a document reload |
| History/focus | Back/forward loads correct article; route transitions focus main content |
| Heading links | Direct-open, refresh and cross-article navigation to `#static-check` leave the heading in view |
| Shiki/copy | Tokenized dual-theme HTML present; computed code background changes with OS theme; clipboard receives raw code |
| Search | Each unique marker returns exactly one result with the correct `/lumen-web/docs/…/` URL; clicking opens the corresponding article |
| Search exclusion | `chromeonlymarker`, present in the shared header, returns zero results |
| No external service | Search test observed no off-origin requests or failed requests |
| Missing route | `/lumen-web/docs/missing/` returns HTTP 404 with “Page not found” content |
| Wrong asset root | `/assets/missing.js` returns HTTP 404, never HTML from a SPA rewrite |
| Static artifact | Final `build/` contains only `client`; backend/server runtime not needed |

Early test runs found an ambiguous status locator and a negative search term that also occurred in an article. The tests were corrected to scope search status and use a unique header-only marker. Both expected document search results already worked; the final full run above is the acceptance evidence.

## Repeatable commands

From this repository, using the tested Node version:

```bash
npm ci --include=dev

# Test-only browser download; no system package installation required here.
# Keep this environment variable for the subsequent validation command.
export PLAYWRIGHT_BROWSERS_PATH=/tmp/lumen-web-playwright
npx playwright install chromium

npm run validate
```

The browser cache path is optional; if omitted for both install and test, Playwright uses its normal default cache. This run used `/tmp` to keep browser artifacts outside the repository. On another OS, use a writable equivalent and follow Playwright's supported-platform requirements. The current Linux distribution was not officially supported by Playwright; its Ubuntu fallback Chromium build nevertheless executed all three tests successfully. No system packages were installed.

For manual production preview:

```bash
npm run build
npm run preview
# Open http://127.0.0.1:4173/lumen-web/
```

The Node preview is a local development/test tool, not a runtime hosting requirement. It serves files only below `/lumen-web/`, redirects existing directory paths to their slash form, sends missing requests as HTTP 404 using the custom error document, and never falls back to the home page. Port 4173 must be available for automated tests. Stop manual preview before `npm test`; tests manage their own server. `npm test` expects a completed production build. `npm run dev` is available for editing, but Pagefind is generated by the production build and dev-server success is not compatibility evidence.

## Missing routes and Pages limitations

All supported public routes must be prerendered. Direct visits to missing paths must stay HTTP 404 and show `public/404.html`, with a base-prefixed home link. GitHub documents [custom `404.html` support](https://docs.github.com/en/pages/getting-started-with-github-pages/creating-a-custom-404-page-for-your-github-pages-site); no rewrite to the SPA shell is planned. React Router's root error boundary handles client-side unknown-route navigation. The automated proof checks direct HTTP 404 behavior; the exact Pages error response/headers and client unknown-route interaction still need their final hosting acceptance check.

The artifact emits `.nojekyll` for static-file safety. No workflow or repository Pages settings were created. The Pages project URL, redirects, MIME types, caching, error page handling and search chunks must be smoke-tested after a separately approved deployment. Local preview models file/directory behavior; it does not reproduce every GitHub edge/CDN behavior.

## Recommendation and remaining gates

Proceed with this architecture after review, preserving the tested versions and normalization until upgrades are separately validated. Static search derives its base from the hosted Pagefind bundle location; browser tests confirmed the resulting repository-prefixed URLs without adding a CLI base-URL flag. Use route/metadata generation and content validation as the document set grows.

Remaining work requires a later phase: full landing/documentation implementation, final light-first theme controls (the POC only tests CSS OS-theme highlighting), search dialog, font/license decisions, meaningful content and accessibility review, build budgets, and authorized Pages deployment smoke tests. Browser coverage here is Chromium only; no full cross-browser, screen-reader, contrast or responsive conformance claim is made. The substantial framework client payload is observable in build logs; bundle optimization belongs to implementation review rather than hiding it in the POC.

Backend provisioning, publication revision, ignored storage-module reproducibility and license issues from PRODUCT.md remain unresolved and were not touched by this proof. No backend files/scripts/services were modified or executed. No commits, pushes or deployments were made.

## Created and modified files

Created for Phase 2:

- Project/toolchain: `.gitignore`, `.npmrc`, `.node-version`, `package.json`, `package-lock.json`, `tsconfig.json`.
- Build/routing: `site.config.ts`, `vite.config.ts`, `react-router.config.ts`, `app/routes.ts`.
- Minimal UI/MDX: `app/root.tsx`, `app/styles.css`, `app/search.tsx`, `app/components.tsx`, `app/routes/home.tsx`, `app/routes/installation.tsx`, `app/routes/processing.tsx`, `app/content/installation.mdx`, `app/content/processing.mdx`.
- Static hosting/checks: `public/404.html`, `scripts/finalize-static.ts`, `scripts/static-server.ts`, `playwright.config.ts`, `tests/static.spec.ts`.
- Evidence: `POC-RESULTS.md`.

No pre-existing files were modified. Existing `.agents/` and the four Phase 1 documents were preserved. Generated `node_modules/`, `build/`, `.react-router/` and test output are ignored; the lockfile is the repeatable dependency source.

Phase 2 complete. Stop for review before full website implementation.
