# Phase 7A review — Embedded authentication proof

## Review and scope

Reviewed the existing uncommitted playground, shared provider, POC, static normalization and Phase 7A report. The selector retains local File references, explicit provisional validation, no upload behavior and honest processing-unavailable copy. No change to its selection or validation logic was needed. Existing playground work is preserved.

This increment is an isolated embedded-auth proof, not a completed replacement of hosted authentication. The user explicitly required proof and reporting before replacing the hosted flow if compatibility remains uncertain. Email verification, completed OAuth callbacks, session persistence and logout have not been confirmed on these new pages. The playground therefore retains its hosted actions. No extra provider is mounted alongside the playground or POC; each active route uses the shared AuthProvider.

## Compatibility findings

Installed `@clerk/react` remains 6.18.7; no dependencies added. Official React component documentation and installed TypeScript definitions support SignIn, SignUp, appearance and `routing="hash"`.

New fixed pages: `/lumen-web/sign-in/` and `/lumen-web/sign-up/`. The router uses its existing basename; Clerk cross-links and return URLs derive from `site.config.ts` basePath. Internal Clerk steps use URL fragments rather than nested HTTP paths. Site-wide React Router routing is unchanged. No server loader, middleware, catch-all path, fallback rewrite or persistent server was added.

Static files exist for both pages. Browser requests and refreshes work without SPA fallback. No-key tests also refresh a verification-shaped fragment; this proves HTTP fragment handling, not a live email verification screen. Successful auth is configured to return to `/lumen-web/#playground`, but completion has not been executed. Already-signed-in users get a return link instead of another form.

## Appearance

The pages use a narrow editorial column, Geist typography, warm surfaces and blue accents. Clerk owns the forms and authentication logic. Supported appearance variables/elements map to existing Lumen colors, borders, type and surfaces; no custom form logic or decorative illustration was introduced. Theme changes are observed on the existing root data-theme attribute.

Initial direct CSS-variable styling produced an incorrect dark form surface during visual review. Resolving root token values into Clerk appearance and refreshing them on theme changes corrected the observed surface/text mismatch. Focus-visible outlines are retained. The forms and actions fit at 320px.

A separate real-form dark-theme axe check still reports one `color-contrast` violation per page in a Clerk-generated `.cl-internal-560t1i` element (reported foreground #a1a1aa on #f36b16). It was not hidden or excluded. Further inspection with supported Clerk appearance hooks is required before an accessibility approval; unstable generated classes should not become styling dependencies.

## Files in this increment

Added `app/auth/page.tsx`, `app/auth/embedded.tsx`, `app/routes/sign-in.tsx`, `app/routes/sign-up.tsx`, `tests/auth-pages.spec.ts` and this report. Updated `app/routes.ts`, `app/styles.css`, `scripts/finalize-static.ts` and its existing regression fixture to include both static pages. All earlier uncommitted Phase 7A files remain present.

## Executed checks

`VITE_CLERK_PUBLISHABLE_KEY= PLAYWRIGHT_BROWSERS_PATH=/tmp/lumen-web-playwright npm run validate`

- TypeScript: passed, including installed Clerk appearance/component types.
- Production build and static documentation integrity: passed.
- Pagefind: 29 documentation pages indexed; auth pages excluded and marked noindex.
- Node tests: 8 passed.
- Full Playwright suite: 27 passed (all 25 existing tests retained, plus two auth-page static/fragment-refresh/navigation tests).
- Git whitespace: passed.
- Separate configured development `npm run build`: passed.
- Pattern scan of 139 configured static files: no secret-key, private-key or JWT signatures; ignored `.env.local` remains outside Git. This is a pattern scan, not a universal credential guarantee.

Real Clerk development-instance checks in a fresh browser, without submitting identity information:

| Check | Result |
| --- | --- |
| Embedded SignIn and SignUp inputs render | Passed for both |
| Google and GitHub buttons | Both visible on both pages; no provider login attempted |
| Direct refresh after SDK loading | Passed for both |
| Keyboard Tab from a form input | Focus remains within the form |
| 320px horizontal overflow | None observed on both pages |
| Light/dark screenshots | Reviewed; corrected surface mismatch |
| Dark-form axe | One color-contrast finding on each page; unresolved |
| Email-code verification screen | Not tested: requires an actual verification attempt |
| OAuth callback and successful return | Not tested |
| New-page session persistence/logout | Not tested |

Temporary screenshots: `/tmp/lumen-sign-in-light.png`, `/tmp/lumen-sign-in-dark.png`, `/tmp/lumen-sign-up-dark.png`. The configured checks are separate from the no-key regression suite. No mocked login or old POC manual observation is counted as verification of these new flows.

## Decision and next review

Keep hosted playground actions while the isolated pages are reviewed. Before switching actions to local SignIn/SignUp routes, complete real email-code and provider round trips, verify the fixed return path, refresh persistence and logout, and resolve or clearly scope the Clerk contrast finding. A request for manual flow evidence was sent; no results have been received in this turn. Production custom-domain/DNS requirements from Phase 6A remain.

Recommend checkpointing only after this review; do not label embedded integration complete yet. No backend access, uploads, processing, dashboard, persistence, commit, push or deployment occurred.

## Official references

- https://clerk.com/docs/guides/how-clerk-works/routing
- https://clerk.com/docs/react/reference/components/authentication/sign-in
- https://clerk.com/docs/react/guides/customizing-clerk/appearance-prop/variables
