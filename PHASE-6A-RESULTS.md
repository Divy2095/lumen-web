# Phase 6A — Clerk static authentication compatibility POC

## Decision

Use `@clerk/react` 6.18.7 as a browser-only, route-scoped provider. Preserve React Router 8.5.1 framework mode, `ssr: false`, static prerendering and Vite's `/lumen-web/` base. The standalone SDK's declared peers accept the installed React/React DOM 19.3.1. One direct dependency was added (five installed packages including transitives); npm reported zero vulnerabilities at installation.

The isolated route is `/lumen-web/auth-poc/`. It is intentionally absent from product navigation and documentation search, and marked noindex. It uses existing layout, buttons and text/link styles. The React Router integration requiring runtime middleware/root authentication loaders is not used.

The provider is dynamically imported only after browser hydration and only with a publishable-key prefix. Build-time HTML contains a safe status message, never session data. A missing or clearly invalid key leaves the rest of the website functional and initiates no Clerk requests. Prefix checking is only a configuration guard; Clerk remains responsible for validating a real key. Render/import failures have a local error boundary; loading and action failures have readable feedback.

## Authentication path

The signed-out button calls Clerk's `redirectToSignIn`, using its hosted Account Portal. This keeps multistep authentication URLs on Clerk's host rather than requiring catch-all static files or a 404 rewrite on GitHub Pages. Both sign-in and sign-up force-return URLs are `/lumen-web/auth-poc/`; sign-out uses that same path. The Account Portal must permit account creation and be configured for the selected application.

After loading, the provider exposes signed-out or signed-in state. Signed-in users can request a token-availability check or sign out. The check calls `useAuth().getToken()` and reports only whether a token exists. It never displays, logs, persists or sends the token. Pending sessions are treated as signed out by the SDK default. A client UI state is not backend authorization.

No key was found in ignored local environment files or the shell during this task. No application or credentials were fabricated. Consequently all configured/session behavior is implemented and typechecked, but has not been exercised against Clerk.

## Required local configuration

Copy `.env.example` to ignored `.env.local`, then set:

```text
VITE_CLERK_PUBLISHABLE_KEY=<your actual Clerk development publishable key>
```

The angle-bracket value above is an instruction, not a usable key. Vite embeds the public identifier at build time; restart development or rebuild after changing it. No Clerk secret key is needed by this website. Never put `CLERK_SECRET_KEY`, OAuth client secrets, project API keys or other private credentials into `VITE_` variables.

For the no-key regression suite even after configuring a local key, use:

```bash
VITE_CLERK_PUBLISHABLE_KEY= npm run validate
```

The browser executable cache in this environment additionally requires `PLAYWRIGHT_BROWSERS_PATH=/tmp/lumen-web-playwright`. Live-session verification is a separate manual exercise and must use the configured build.

## Clerk dashboard setup

1. Create/select a development application; enable Google and GitHub social connections plus email verification codes for sign-up/sign-in. Disable unwanted methods if the intended experience is code-only email authentication.
2. Use its real publishable key. Confirm the hosted Account Portal is enabled and permits sign-up.
3. Configure application/home and post-auth return URLs consistently with the POC path. For local preview use `http://127.0.0.1:4173/lumen-web/auth-poc/`; development and deployed origins must be configured separately as applicable. Do not assume localhost and 127.0.0.1 are interchangeable.
4. Register the provider-specific OAuth callback URLs supplied by Clerk in Google/GitHub settings. Those callbacks are Clerk endpoints, not invented website `/api` routes. Verify the final return to the fixed website path for each method.
5. For production create a production instance, supply your own OAuth credentials, complete domain/DNS/certificate setup, and recheck settings that do not copy from development. Validate email delivery and account/session behavior with the real production instance.

## Hosting findings and blockers

Static HTML for the POC can be served directly and refreshed without a React Router server. The existing normalizer now explicitly checks this additional HTML file before moving output. The app keeps real 404 behavior, existing documentation routes and the repository base path. Hosted authentication is the smallest proposed way to avoid dynamic callback path enumeration; actual OAuth round trips remain unverified.

Clerk's standard production setup requires an owned domain and DNS control. The shared `divy2095.github.io` hostname does not provide that control. This is a production deployment blocker for the standard setup, not a reason to add a persistent React Router server. Use an owned custom domain with GitHub Pages, then verify its actual base path and Clerk configuration. Do not ship development keys as a substitute for production setup. No custom domain, Clerk application or deployment was created here.

## Future backend token boundary (design only)

For a future authorized integration, obtain a short-lived session token with `getToken()` immediately before an HTTPS API request, handle a null result as signed out, and send it in `Authorization: Bearer <token>`. Keep it out of URLs, logs and application localStorage. Let Clerk manage session refresh; reacquire tokens instead of retaining an indefinite copy.

The separate API must validate signature, issuer, expiry and appropriate authorized-party/audience constraints, map the verified subject to a user, and enforce project/resource permissions. Its CORS policy must permit the chosen frontend origin and Authorization header. A Clerk user token is not a Lumen project API key or upload token. Agree on claims/templates and contracts with the backend team before making any API call; no endpoint or backend support is assumed here.

## Verification

The production build runs without private credentials or a publishable key. TypeScript compiles the configured SDK branch even though the provider is never rendered during prerendering. Static output includes the POC route. Pagefind remains limited to 29 documentation pages.

Executed final command: `PLAYWRIGHT_BROWSERS_PATH=/tmp/lumen-web-playwright npm run validate`.

- Strict TypeScript and React Router type generation: passed.
- Production build, documentation integrity, Pagefind indexing: passed (29 indexed documentation pages).
- Node tests: 8 passed.
- Browser tests: 19 passed, including the new POC direct-request/refresh/public-navigation/no-external-request check and all existing theme, navigation, accessibility and documentation checks.
- Git whitespace check: passed.

The first run exposed an error in the new test's network-origin comparison against the initial `about:blank` page. It was corrected to use the static server response origin; no application behavior was changed to satisfy it.

Not verified: a real configured provider boot, signed-out Clerk response, Google/GitHub/email-code login, signup, session renewal/expiry, token retrieval, logout, OAuth callbacks, production-domain behavior or an actual Pages deployment. No fake-key/mock-session result is presented as live authentication evidence. Chromium coverage does not establish all-browser compatibility.

## Files

Added `.env.example`, `app/routes/auth-poc.tsx`, `app/auth/client.tsx`, `tests/auth-poc.spec.ts` and this report. Modified `app/routes.ts`, `scripts/finalize-static.ts`, `scripts/finalize-static.test.ts`, `package.json` and `package-lock.json`. Public shells, landing-page design and documentation content were not changed.

## Recommendation for Phase 6B

Approve a real development Clerk application and a production-domain plan, then validate all three sign-in methods, signup, cancellation, logout, session expiry, token availability, return paths and browser storage/network failure behavior. Keep backend calls and dashboard work outside that verification batch. Resolve the production domain before approving public authenticated deployment.

## Official references

- [React quickstart](https://clerk.com/docs/react/getting-started/quickstart)
- [Route-scoped ClerkProvider and redirect properties](https://clerk.com/docs/react/reference/components/clerk-provider)
- [useAuth session state and getToken](https://clerk.com/docs/react/reference/hooks/use-auth)
- [Authentication options and email codes](https://clerk.com/docs/guides/configure/auth-strategies/sign-up-sign-in-options)
- [Production requirements, DNS and OAuth credentials](https://clerk.com/docs/guides/development/deployment/production)
- [Clerk session architecture](https://clerk.com/docs/guides/how-clerk-works/overview)

No backend repository access or deployment occurred during the POC.

## Phase 6B checkpoint evidence

Subsequently, an ignored `.env.local` was configured with a development publishable key. The user explicitly confirmed seeing “Signed in to Clerk” and “Session token available” in their browser. These are manual observations, not automated provider-flow tests. The later checkpoint request contained a placeholder rather than additional manual results.

The full no-key regression suite was rerun: TypeScript, build, documentation validation, 29-page Pagefind indexing, 8 Node tests and 19 browser tests passed. A separate production build with the real development publishable key passed. A scan of 128 static artifact files found no secret-key, private-key or JWT signatures; this is a pattern scan, not a universal proof of absence. `.env.local` remains ignored and untracked.

The configured live-browser check was not executed because automatic approval review could not complete at that time. Provider-specific Google/GitHub/email-code flows, signed-in persistence across refresh, logout and completed auth redirects remain unverified. This checkpoint records a static authentication POC, not completion of all Phase 6B live checks. No backend was accessed.
