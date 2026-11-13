# Phase 3 — Design system and shared foundation

Date: 2026-11-12. Scope: shared UI foundation only; fixtures retained.

## Outcome

Implemented the light-first visual system, responsive global shell, shared documentation layout and core controls while preserving the Phase 2 static build. No final product hero/sections, processing simulation, full documentation, live uploads or API integration were added. The backend was not accessed or modified for this phase. No commits, pushes or deployment were performed.

Existing planning documents and POC-RESULTS.md remain unchanged as historical planning/validation records; this report describes the current foundation.

## Design system and dependencies

- Tailwind CSS **4.3.5** and `@tailwindcss/vite` **4.3.5**, using the supported Vite plugin, CSS import, `@theme inline` and a data-attribute dark variant. No legacy Tailwind configuration file or PostCSS stack.
- `@fontsource-variable/geist` and `@fontsource-variable/geist-mono` **5.3.0**, build-only dependencies providing self-hosted WOFF2 assets. Both carry SIL OFL-1.1; license notices are retained in `public/fonts/Geist-OFL.txt` and `Geist-Mono-OFL.txt`.
- Lucide React **1.72.0**, named imports for functional search/menu/copy/link/navigation icons. Decorative icons are hidden from assistive technology.
- `@axe-core/playwright` **4.14.0**, development-only automated accessibility checks. Existing framework, MDX, Pagefind, Shiki, TypeScript and browser-test versions were preserved.

No shadcn/ui/Radix installation was necessary: native select/dialog controls cover this foundation with small owned components. Native dialogs provide top-layer rendering and background inertness; explicit Tab wrapping keeps focus inside the interface, with Escape, close controls, backdrop dismissal and focus restoration. This choice still needs Safari/Firefox and assistive-technology validation before release. No animation, effects, global state, class-variant or font-runtime library was added.

UI/UX Pro Max's installed SKILL.md and design-system workflow were used, with focused keyboard-focus and text-reflow searches. Its generic dark-first/green recommendations were not adopted; the approved warm-neutral/blue direction remains authoritative. Ponytail guidance informed keeping components and dependencies limited to the foundation.

Official references checked: [Tailwind Vite installation](https://tailwindcss.com/docs/installation/using-vite), [Tailwind theme variables](https://tailwindcss.com/docs/theme), [Geist source](https://github.com/vercel/geist-font), and [native dialog behavior](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/dialog). Installed package metadata and font license files were also inspected.

## Tokens, typography and layout

`app/styles.css` defines semantic background/foreground, surface/muted, secondary text, accent/hover/on-accent/subtle, divider/control border, focus ring, status colors and overlay scrim for both themes. It also defines spacing, type roles, font stacks, radii, header/overlay layers and restrained transition durations. Tailwind's available color utilities map to these roles rather than an unrestricted decorative palette. Source scanning is restricted to application files, excluding planning documents and skill examples.

Geist Sans serves interface/prose; Geist Mono serves code and technical labels. Only normal Latin variable subsets are emitted, approximately **29.4 kB + 23.1 kB**. Other glyphs/styles fall back through system fonts; broader language coverage should be reviewed if content expands. Sans alone is preloaded; both use `font-display: swap`. Arial fallback size/vertical metrics were calibrated from representative text in the test browser; monospace falls back to Courier New/system monospace. The metric adjustment is an approximation, not a universal typography guarantee.

Main page widths: 1200px product container; 1440px documentation shell. Wide documentation uses a 248px navigation column, up to 740px article and 176px contents rail, with neutral dividers and generous spacing. At 1024–1279px it becomes two columns; below 1024px the sidebar becomes a modal documentation menu. Global navigation becomes a modal menu below 768px. The contents rail becomes an article-top disclosure below 1280px.

Article titles scale from 40px to 32px; body text is 17px desktop/16px mobile. Technical labels stay subordinate. Radii are 4–8px and normal surfaces have no shadows; only dialogs use a restrained overlay shadow. No decorative background or scroll-reveal behavior was introduced.

## Shared functionality

| Area | Implemented behavior |
| --- | --- |
| Global header | Text wordmark, Product/Documentation/GitHub links, search trigger, visible theme choice, mobile menu; sticky height measured for correct anchor offsets when text wraps |
| Footer | Documentation and repository links; factual early-development/foundation status |
| Main layout | Semantic main landmark, skip link, route focus, existing history/scroll restoration |
| Documentation navigation | Grouped fixture routes, active-page indication, desktop sidebar and mobile dialog |
| Article layout | Breadcrumbs, fixture label, constrained reading width, anchored headings, contents navigation and previous/next links |
| Theme | Light default regardless of OS; explicit Light/Dark/System options; local persistence; System listens to OS changes; usable when storage is blocked |
| Early theme application | Small head script applies preference before styling/hydration; blocked storage falls back to light; no hydration error observed |
| Search | Lazy-loaded Pagefind dialog, labeled input, submit/Retry controls, result title/context/excerpt, no-results/loading/failure states, browse links on failure |
| Search keyboard behavior | Visible trigger plus Ctrl/Cmd+K convenience; shortcut avoids editable fields and already-open dialogs; Escape and focus restoration |
| Code blocks | Build-time dual-theme Shiki output, language supplied by the highlighter, contained keyboard scrolling, raw clipboard copy, visible and announced success/error feedback |
| Components | Button variants, link/navigation styles, native modal wrapper, theme control, code block, status badge, basic callout and heading anchor |

The two MDX articles retain their original fixture prose and unique search terms. Their explicit heading text/IDs and contents links now share metadata in `site.config.ts`, avoiding mismatched anchor definitions for the fixture set. This is a foundation, not a generic full-document heading extraction system; future content authoring may justify build-time heading extraction. No fake API examples or unsupported onboarding were added.

The home route remains a small foundation/compatibility introduction linking into fixtures. It is not the final landing page. Search results explicitly identify the current documents as fixtures. Footer/status wording does not imply a deployed backend or production readiness.

## Static-hosting preservation and regression coverage

Router/Vite base remains `/lumen-web/`, framework mode remains `ssr: false` with prerendering. The two article bodies remain in real HTML before JavaScript. Pagefind runs after normalization and indexes article bodies only; mobile contents and repeated chrome are excluded.

The existing normalization step was extracted into a testable function, with all expected prefixed documents checked before mutation. Its behavior remains: move the generated document tree up once, replace the SPA shell with the prerendered home, preserve client assets and `404.html`, discard the build-time server, and emit `.nojekyll`. It does not rewrite URLs or add a SPA fallback.

Two isolated temporary-directory tests verify replacement of the SPA shell, nested document placement, asset/404 preservation, removal of only the generated prefix/server tree, and failure before modifying existing files if expected input is absent. A server-only JavaScript fixture is explicitly checked not to appear in the client artifact. Font MIME types were added to the local static preview server.

## Validation evidence

Executed after a clean installation from the updated lockfile, on Node **24.22.1** / npm **11.19.1**, Linux x64:

```bash
npm ci --include=dev
PLAYWRIGHT_BROWSERS_PATH=/tmp/lumen-web-playwright npm run validate
```

The browser cache was installed in `/tmp` during Phase 2. On a fresh environment, install it first with the same path, or consistently omit the variable for the default cache:

```bash
export PLAYWRIGHT_BROWSERS_PATH=/tmp/lumen-web-playwright
npx playwright install chromium
npm run validate
```

`validate` performs strict type generation/typechecking, production build/normalization/Pagefind, the two Node regression cases, and Playwright against the fallback-disabled static preview. `npm test` expects an existing production build; `npm run preview` opens the artifact at `http://127.0.0.1:4173/lumen-web/`. Automated tests start/stop their own preview server; stop any manual preview before running them.

Final results:

- Strict TypeScript and production build: **passed**.
- Normalization tests: **2 passed**.
- Playwright: **9 passed**, including the three updated Phase 2 compatibility tests.
- Pagefind: **2 pages, 69 words, English**, with both unique article terms returning the expected base-prefixed result.
- Automated axe checks: **no violations reported** for the tested WCAG A/AA tags in light/dark article states, search dialog, and mobile global/documentation dialogs.
- No-JavaScript article rendering, nested direct requests/refresh, assets, fragment links, real 404s, hydration, clipboard, history and client-side navigation: passed.
- Responsive widths 320/375/768/1024/1440px, doubled root text at 320px, reduced motion, and a narrow search dialog: passed the tested reflow assertions.
- Theme persistence, early application without application JS, OS changes in System mode, explicit theme stability and blocked local storage: passed.
- Keyboard dialog focus loop, Escape/return focus, mobile menu selection, result navigation and unavailable-index browse fallback: passed.

Manual browser inspection covered desktop light, desktop dark, mobile article, mobile search results and doubled-text reflow. It found and corrected mobile dialog heading scaling. Browser automation found and drove fixes for modal focus wrapping and narrow header/control reflow. The first theme checks used an overly strict label locator; the suite now queries the correctly named combobox by role.

Additional instrumented browser observations:

- Both actual WOFF2 resources loaded from `/lumen-web/assets/` and the browser reported Sans/Mono ready.
- A desktop fixture load with font responses deliberately delayed by 350ms recorded approximately **0.00032 CLS**. This is one controlled sample, not a field-performance or Lighthouse claim.
- Measured rendered contrast ratios (normal-text threshold 4.5:1):

| Pair | Light | Dark |
| --- | --- | --- |
| Secondary article text / page | 7.40 | 7.36 |
| Active navigation / selected surface | 6.16 | 8.75 |
| Badge text / muted surface | 7.03 | 6.34 |
| Primary button text / accent | 6.70 | 10.46 |
| Lowest sampled code-token contrast | 4.57 | 5.52 |

The clean installation audited 250 packages and reported zero known vulnerabilities at execution time; this is not a security certification. The final foundation CSS is roughly 25.6 kB uncompressed / 5.65 kB gzip; the existing framework/runtime payload remains material and has not been presented as a performance score.

## Files changed

New: `app/ui/button.tsx`, `app/ui/modal.tsx`, `app/theme.tsx`, `app/site-shell.tsx`, `app/layouts/docs.tsx`, both font-license notices under `public/fonts/`, `scripts/finalize-static.test.ts`, `tests/foundation.spec.ts`, and this report.

Updated: package manifest/lockfile; Vite configuration; shared route metadata and route registration; root shell; styles; components; search; home fixture; both documentation route wrappers; heading markup/imports in both MDX fixtures; static normalization/preview scripts; existing static Playwright checks.

No backend files, original planning documents, deployment workflow or repository history were modified. Build output, installed packages and browser/test artifacts remain outside tracked source per the existing ignore rules.

## Known limits and next review

- No actual Pages deployment was authorized. Final project-host behavior, caching, CDN responses and custom 404 handling remain a later hosting smoke test.
- Browser automation used Chromium only. Firefox, Safari/WebKit, real mobile devices and manual screen-reader testing remain necessary before claiming WCAG conformance.
- Reflow testing includes narrow viewport and doubled root text, not a comprehensive native browser-zoom matrix or every long-content case. The documents are still short fixtures.
- The native dialog and native select strategy intentionally targets modern browsers. No legacy dialog polyfill was installed.
- Normal Latin font files are self-hosted; italic and broader-script font coverage are deferred. Fallback metrics were measured on this environment and may differ elsewhere.
- Search uses explicit submission and up to ten results; it does not yet provide a full search-ranking/content taxonomy review. Search requires the production index; the dev server alone does not generate it.
- Metadata currently covers the two fixtures. Automatic heading extraction and richer navigation/content validation should be evaluated alongside real documentation, without duplicating route metadata.
- Backend publication, credential provisioning, clean-checkout storage dependency and license questions in PRODUCT.md remain unresolved; this UI work makes no backend readiness claims.

Recommended next phase, after review: implement the approved product landing sections and source-backed documentation in small phases using this foundation. Keep the live upload demo out of scope. Stop here until that implementation is explicitly approved.
