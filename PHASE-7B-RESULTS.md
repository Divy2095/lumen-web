# Phase 7B — Product presentation and account UX

## Outcome and review

Reviewed AGENTS.md, the product/design/architecture plans, Phase 7A and embedded-auth reports, existing landing/auth code, routes, styling, tests and current diff. Preserved all pre-existing uncommitted work. No backend repository access occurred.

The landing page now presents an illustrative output panel instead of the large processing simulation. The simulation is preserved in documentation. A single global Clerk provider now supplies the navbar, auth pages, POC and playground. The Clerk footer contrast defect is fixed through supported appearance customization. Embedded authentication remains a proof: working hosted actions are retained because real embedded authentication completion is still unverified.

## Product preview and technical preservation

Placement: hero/introduction → example outputs → capabilities → existing local video playground → API examples → architecture/getting started. The selector, provisional 25 MiB validation, local-only file handling and honest processing-unavailable behavior are preserved.

The compact panel shows `sample-video.mp4`, plausible 1920 × 1080 / H.264 / 24 fps / 12-second example metadata, an illustrative thumbnail frame and a separate renditions category. It is explicitly labeled Illustrative and Example output. The thumbnail is a code-native illustration, not a generated JPEG or a real upload result. Renditions are clearly marked In development and outside the currently documented API. No processing order, progress or completed background-work status is implied. The asset label says ingestion complete and explicitly limits that to an example asset state; the footer explains independent output states.

The original simulation component moved from `app/product/pipeline.tsx` to `app/docs/processing-pipeline.tsx`, with its styles extracted to `app/docs/processing-pipeline.css`. It is embedded in the existing processing-lifecycle MDX article under “Explore the flow.” Upload-token, database/outbox, queue/worker, independent job-state and retrieval explanations remain intact. Its existing play/pause/replay and reduced-motion tests now run on the documentation route with the same state assertions. The landing panel links directly to that article/anchor. The source-link validator now recognizes the actual preview/playground home anchors rather than the removed landing pipeline anchor.

## Global account behavior

`AuthProvider` is mounted once in `app/root.tsx`. Configured builds prerender the supported Clerk React provider without request-time auth loaders or a persistent React Router server. Unconfigured builds bypass the provider and omit navbar authentication actions. Initial account loading does not remount the site or discard the selected File.

The header shows a compact Sign in button after Clerk loads a signed-out session. It uses the working hosted sign-in flow with explicit base-prefixed return paths. Signed-in users receive Clerk's UserButton with its supported identity, Manage account and Sign out menu. Profile management uses Clerk's built-in modal, avoiding any new dynamic profile route. Provider-level afterSignOutUrl points to the valid static repository root. Navbar state is driven directly by the shared Clerk auth context; the app does not cache a separate signed-in flag.

The POC still offers its explicit token-availability check and return path. The playground does not request tokens or upload files. All route-scoped duplicate providers were removed. Appearance is shared globally, with theme-aware profile appearance passed to the UserButton modal. No avatars, dashboard, project/API-key screens or account-management forms were added.

## Embedded pages and contrast correction

The existing `/lumen-web/sign-in/` and `/lumen-web/sign-up/` pages remain. They use Clerk hash routing, fixed static HTML and client-only form mounting. Already-signed-in visitors get an account/return state. Missing configuration retains the explanatory fallback.

Both initial forms render with the real development instance; Google and GitHub buttons are visible. Their direct refreshes and keyboard tab behavior pass the configured checks. Verification-code screens, OAuth completion, authenticated persistence and logout have not been exercised in this phase. No provider is marked end-to-end verified.

The previous failing node was the visible “Secured by” paragraph, not a verification input. It inherited secondary text color (#52525b light / #a1a1aa dark) over a transparent region where Clerk's orange development decoration (#f36b16) was treated as the background. Measured failing ratios were 2.54:1 light and 1.18:1 dark. The supported `footerItem` appearance slot now gives its paragraphs explicit theme-aware surface and secondary-text colors. Attribution and Development mode text stay visible; no generated class is targeted, no node is hidden and no rule is disabled. `colorNeutral` also follows the foreground token for both themes.

Final real-form whole-page axe audits pass in both light and dark themes, including initial form labels, placeholders, links, buttons and footer. Error messages and email-verification inputs still require real interactive verification; the initial-form audit does not establish their correctness.

The playground's Create free account / Sign in actions and the navbar therefore continue using hosted authentication. Switching them to the local embedded pages remains gated on real completion evidence, as explicitly required by the brief. The file-reselection warning remains. No File object is persisted in storage or URLs.

## Validation evidence

Final no-key suite:

```bash
VITE_CLERK_PUBLISHABLE_KEY= PLAYWRIGHT_BROWSERS_PATH=/tmp/lumen-web-playwright npm run validate
```

| Check | Executed result |
| --- | --- |
| TypeScript / React Router type generation | Passed |
| Static production build and output normalization | Passed |
| Documentation source/output/links/anchors | Passed for all 29 pages |
| Pagefind | 29 pages, 1,308 indexed words |
| Node tests | 8 passed |
| Full Playwright | 29 passed |
| Documentation hydration regression | Passed, unchanged |
| Landing/playground/mobile/theme/axe regressions | Passed |
| Git whitespace | Passed |

The source-link anchor-list adjustment was additionally verified with source validation and all 6 documentation Node tests. No assertion was removed to accommodate the presentation change; pipeline tests moved with the preserved component. New tests verify illustrative labeling, the independent categories/development caveat, responsive rendering, the documentation link/simulation, and omission of broken navbar auth actions in unconfigured builds.

A separate configured `npm run typecheck` and `npm run build` passed. The repeatable configured check is:

```bash
# First build with the actual development publishable key in ignored .env.local.
# In one terminal:
npm run preview
# In another:
PLAYWRIGHT_BROWSERS_PATH=/tmp/lumen-web-playwright npm run check:clerk
```

`check:clerk` uses a fresh signed-out browser and passed 18 checks: configured navbar at desktop/tablet/320px, both embedded initial forms and provider buttons, light/dark whole-page axe, keyboard focus, direct refreshes, narrow-layout overflow, configured playground prompt and hosted sign-in return parameters. It does not enter identity information, submit codes, capture cookies or print tokens. Failures report only the completed check count, avoiding raw navigation errors that could contain Clerk development transport parameters.

The check initially expected return parameters in the normal query string. Inspection showed the installed SDK uses a hosted hash query. The final check requires both forced return parameters to target the local origin, `/lumen-web/` and `#playground`; Clerk's separate fallback redirect may use the valid site root. This verifies outgoing intent, not completed OAuth return.

The final configured artifact scan covered 142 files with no Clerk secret-key, private-key or JWT signatures. Source signature scanning also passed. `.env.local` is ignored and untracked; runtime build/server output is removed. Pattern scanning is not a universal proof of credential absence. Public publishable identifiers are expected in configured browser builds.

## Visual review

Reviewed desktop/mobile preview, dark preview, and the 320px configured header. The preview adapts to stacked categories on mobile. A narrow-header adjustment keeps Sign in, theme, search and menu on one row at 320px while retaining accessible control sizing and zoom/reflow coverage.

Temporary review artifacts:

- `/tmp/lumen-7b-preview-1440.png`, `/tmp/lumen-7b-preview-768.png`, `/tmp/lumen-7b-preview-320.png`
- `/tmp/lumen-7b-preview-dark.png`
- `/tmp/lumen-7b-header-1440.png`, `/tmp/lumen-7b-header-768.png`, `/tmp/lumen-7b-header-320.png`
- `/tmp/lumen-7b-sign-in-mobile.png`, `/tmp/lumen-7b-sign-up-mobile.png`

## Files in this increment

- Added `app/product/preview.tsx`.
- Moved `app/product/pipeline.tsx` to `app/docs/processing-pipeline.tsx`; added its extracted stylesheet.
- Updated `app/routes/home.tsx`, `app/product/landing.css`, `app/content/docs/processing.mdx` and its route module.
- Added `app/auth/account.tsx`, `app/auth/appearance.ts`; updated the existing uncommitted shared provider, embedded form and playground-auth modules, plus the committed POC client and its mount.
- Updated `app/root.tsx`, `app/site-shell.tsx`, `app/styles.css` and auth-page mount props.
- Added `tests/product-preview.spec.ts`; adapted `tests/landing.spec.ts` to the diagram's new location and panel's new semantics.
- Added `scripts/check-clerk.ts` and `check:clerk` package script; updated source home-anchor validation.
- Added this report. Earlier uncommitted playground/auth proof files and historical reports remain preserved. No dependencies were added or changed.

## Manual verification still required

No new manual authenticated results were supplied in this phase. Previous user confirmation of POC signed-in/token-available text does not verify this global navbar or embedded flow.

Before declaring account integration verified, use a real development session to check:

1. Navbar identity/avatar trigger, keyboard menu navigation, Escape and focus restoration.
2. Manage account modal, dismissal and theme consistency without making unintended account changes.
3. Sign out, return to the static root, signed-out navbar and signed-out state after refresh.
4. Embedded email-code and chosen provider flow, verification/errors and return to the playground.
5. Signed-in auth-page return state and refresh persistence.

These checks require the user's authenticated browser or manual interaction. No CAPTCHA/MFA bypass or mocked session was used. Provider-specific authentication remains unverified. Actual GitHub Pages publication and Clerk production custom-domain/DNS configuration are still separate approval gates.

## Checkpoint recommendation

Review the presentation and global account implementation now. Complete the manual authenticated checklist before treating Phase 7B as fully verified or switching hosted actions to embedded pages. A subsequent checkpoint may preserve this work with those limitations stated explicitly. No backend access, real uploads, processing, database writes, new dependencies, commits, pushes or deployment occurred.

Official references consulted: [UserButton and profile modal](https://clerk.com/docs/react/reference/components/user/user-button), [Clerk routing](https://clerk.com/docs/guides/how-clerk-works/routing), [appearance variables](https://clerk.com/docs/react/guides/customizing-clerk/appearance-prop/variables).

## Native authentication UI polish follow-up

Reviewed the uncommitted work and kept the product preview, selector and global account menu intact. The playground still calls `redirectToSignIn`/`redirectToSignUp`, so authentication initiated there goes to Clerk's hosted Account Portal. Clerk appearance props affect the local embedded components, not that hosted portal. No screenshot was attached to the follow-up request, so the specific purple-button image cannot be conclusively identified; the current code path and URL distinguish the two experiences.

The local pages remain `/lumen-web/sign-in/` and `/lumen-web/sign-up/`. This follow-up changes only `app/auth/appearance.ts`, the scoped embedded-auth styles in `app/styles.css`, the configured checks in `scripts/check-clerk.ts`, and this report. It adds Geist button typography, the semantic focus-ring color, supported element class hooks, a smaller form heading, flat accent-blue primary buttons, explicit input/social-button boundaries and readable placeholders. The controls retain at least 44px height. Clerk attribution and Development mode labels remain visible and are explicitly checked. No authentication, OAuth, verification, session or recovery logic was replaced.

A computed-style check discovered that Clerk's decorative button gradient was on `::after`, and that some default state styles won over initial appearance-object overrides. The final supported class hooks are scoped to `.auth-form`, with sufficient specificity to override those defaults without affecting the site, account menu, documentation or selector. The configured check now verifies the actual primary color, Geist family, no button shadow, no pseudo-element gradient, 20px form title, control borders and visible input outline. No generated internal class is targeted.

Validation is reported separately for the public no-key regression suite and the configured initial-form check. The former remains the complete 29-browser/8-Node suite. The latter groups 18 checks and includes real initial form rendering, enabled Google/GitHub button presence, light/dark whole-page axe, responsive layout, keyboard focus, direct refresh, attribution visibility, exact native styling and outgoing hosted return URLs. It does not submit identity information or verification codes and does not prove completed login or account recovery.

Temporary visual-review captures: `/tmp/lumen-native-sign-in-light.png`, `/tmp/lumen-native-sign-in-dark.png`, `/tmp/lumen-native-sign-up-light.png`, `/tmp/lumen-native-sign-up-dark.png`, plus the existing mobile captures produced by `check:clerk`.

The hosted playground actions have deliberately not been switched. No new manual embedded-auth completion results were supplied. Required manual evidence before switching:

1. Open the configured preview at `/lumen-web/sign-up/`, complete account creation/verification using an enabled method, and confirm return to `/lumen-web/#playground`.
2. Sign out, open `/lumen-web/sign-in/`, complete sign-in using the chosen provider or email method, and confirm the same return URL. Record which methods actually passed; visible provider buttons are not end-to-end verification.
3. Refresh and confirm session persistence, then sign out through the navbar and verify signed-out state after another refresh.
4. Exercise applicable account recovery and verification/error screens through Clerk's normal flow. Do not bypass CAPTCHA/MFA or share codes, credentials or tokens.
5. Confirm selecting a video again after navigation works; the file is intentionally not persisted.

These checks can be performed against a configured `npm run build` followed by `npm run preview`. No backend access, new dependencies, uploads, dashboard, commits, pushes or deployment were introduced. Review can proceed, but an embedded-flow switch still needs the manual evidence above.

Reference: [Clerk component appearance does not affect Account Portal pages](https://clerk.com/docs/react/reference/components/authentication/sign-in), [supported appearance variables](https://clerk.com/docs/react/guides/customizing-clerk/appearance-prop/variables).

Final follow-up execution: the complete no-key `npm run validate` passed (29 browser tests, 8 Node tests, TypeScript, build, static/documentation checks and Pagefind). The configured production build passed, followed by all 18 strengthened `check:clerk` groups. Computed checks include flat blue buttons, no pseudo-element gradient or shadow, Geist typography, 20px form heading, one-pixel input/social borders and visible focus. Light/dark whole-page axe checks passed. The final artifact scan passed across 142 files; `.env.local` remains ignored/untracked and no runtime server artifact remains. Git whitespace checks passed. These results do not include a real authenticated session or completed verification/recovery flow. No commit recommendation overrides the outstanding manual verification gate.
