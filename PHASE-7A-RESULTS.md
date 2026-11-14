# Phase 7A — Local video playground

## Outcome and placement

Added “Start with your video” after the processing pipeline and core capabilities, before the developer/API examples. The hero and existing product explanation remain first. Copy describes local selection and explicitly states that uploading and processing are not connected; it does not promise optimized outputs or immediate processing.

## Files and structure

- `app/product/playground.tsx`: reusable `VideoSelection`, section composition, configuration gate and existing Modal integration.
- `app/product/playground-auth.tsx`: lazily loaded Clerk session check and hosted authentication actions.
- `app/auth/provider.tsx`: shared provider configuration, reused by the playground and POC; only one provider is mounted on the active route. The playground mounts it only when the process dialog is open.
- `app/auth/client.tsx`: existing POC now uses the shared provider, retaining its return path and session-token check.
- `app/routes/home.tsx`: section placement.
- `app/product/landing.css`: restrained drop-zone feedback, native input styling, responsive actions and modal spacing using existing tokens.
- `tests/playground.spec.ts`: six browser tests.
- This report.

No dependencies or routes were added. No backend files were accessed.

## Selection and validation

Require exactly one nonempty file with a case-insensitive `.mp4` extension and a MIME hint of `video/mp4`, empty, or `application/octet-stream`. Accept at most 26,214,400 bytes (25 MiB), a conservative provisional client limit pending the future upload contract. Other combinations are rejected with a nearby announced error. A valid replacement clears stale errors; invalid replacement clears the previous selection. Picker cancellation preserves selection. Removal clears the input and returns keyboard focus to it.

The application holds only a browser File reference. It performs no FileReader, arrayBuffer, video decoding, metadata extraction, thumbnail generation, object-URL creation, upload or processing. Displayed KiB sizes round up; MiB sizes use one decimal. MIME/extension checks are hints, not trusted content validation.

Drag-over feedback is visible. Multiple-file and non-file drops are rejected. The intended drop prevents browser navigation; window-level handlers also prevent file drops outside the zone from opening a file while the component is mounted. These handlers are removed on unmount. Drag/drop requires JavaScript hydration; the native picker remains the accessible foundation.

## Process and authentication states

- No valid file: disabled Process video with explanatory text.
- Unconfigured Clerk: local selection works, and Process video opens a clear authentication-unavailable message with no Clerk requests.
- Configured: the existing SDK is imported after the user opens the dialog, never during static rendering. Loading and errors have text feedback.
- Signed out: Create free account and Sign in use Clerk's hosted redirects; Not now and Escape dismiss the dialog. Both return paths include `/lumen-web/#playground`.
- Signed in: the dialog says the file is ready but processing is unavailable until connected; it explicitly says nothing was uploaded. No token is requested by the playground.

The signed-out prompt warns that authentication redirects require selecting the file again. No File or file contents are written to browser storage, cookies or URL parameters. No mock processing or fabricated results appear.

## Accessibility and design

Ponytail guided the small dependency-free selector; UI/UX Pro Max guidance informed inline recovery messages and keyboard/focus handling. A visible native input label, description, aria-invalid state, alert region and selection status announcement support keyboard/screen-reader use. Replace and Remove are separate buttons, with no nested interactive drop-zone control. The existing dialog supplies focus containment, Escape and focus restoration. No decorative motion was added.

Reviewed screenshots of the desktop section, 320px section and configured mobile dialog:

- `/tmp/lumen-playground-desktop.png`
- `/tmp/lumen-playground-mobile.png`
- `/tmp/lumen-playground-dialog.png`

These are temporary local review artifacts. Both themes and reflow are covered by browser checks; no full screen-reader or cross-browser certification is claimed.

## Executed validation

`VITE_CLERK_PUBLISHABLE_KEY= PLAYWRIGHT_BROWSERS_PATH=/tmp/lumen-web-playwright npm run validate`

- Strict TypeScript: passed.
- Static production build and documentation validation: passed.
- Pagefind: indexed all 29 documentation pages; playground remains outside documentation search.
- Node tests: 8 passed.
- Playwright: 25 passed, including all 19 existing tests and the documentation hydration regression.
- Git whitespace check: passed.

New coverage: initial disabled state; native keyboard selection; valid selection; unsupported/empty/oversized rejection and recovery; replacement/removal; single/multiple drops; prevention of outside-drop navigation; unconfigured dialog; Escape/Not now/focus restoration; focus containment; 320/768/1440px reflow; automated accessibility in the dialog and dark playground.

The first synthetic drag test fired before React attached handlers. It now waits for the existing `data-hydrated` condition before dispatching a synthetic event; no sleep, increased timeout or weakened assertion was used. The final full suite passed.

A separate `npm run build` with the existing real development publishable key passed. A fresh automated browser loaded real Clerk and displayed both configured signed-out authentication buttons. No sign-in was attempted. The signed-in preview branch is typechecked and source-reviewed but was not exercised with a real signed-in session in this phase; no mocked identity is presented as real authentication evidence. Provider login, redirect completion, persistence and logout remain outside the evidence from this run.

## Limitations and next phase

File selection is intentionally ephemeral. Refresh, navigation away and hosted authentication can discard it. The client does not verify MP4 bytes, and the 25 MiB limit is not a confirmed backend contract. The configured SDK depends on network availability; loading/error messages allow dismissal and retry. Existing Clerk production-domain requirements still apply.

For future integration, agree separately on user-token authentication and resource ownership, browser-safe registration/upload-token issuance, CORS and raw-upload/Content-Length behavior, accepted content and limits, quotas/rate limits, consumed-token/error recovery, independent job states, and authorized output retrieval. These are required contracts, not assertions that endpoints exist. Do not put project API keys in the browser.

Recommended Phase 7B: verify the signed-in playground branch and all hosted-auth return paths with real development accounts, then review the browser upload contract and security limits before authorizing any backend connection. No dashboard, uploads, persistence, commit, push or deployment occurred in Phase 7A.
