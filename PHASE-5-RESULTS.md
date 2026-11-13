# Phase 5 — Developer documentation

Completed 2026-11-12. The temporary documentation fixtures have been replaced with 29 source-based MDX pages. The landing page, static-hosting architecture and existing design system are preserved. No dependencies were added, and the backend was read only.

## Published inventory

| Group | Pages |
| --- | --- |
| Introduction (3) | Overview; core concepts; system architecture |
| Getting started (6) | Prerequisites; installation and configuration; infrastructure and migrations; running the API and workers; credential provisioning limitations; first registration and upload |
| Guides (9) | API-key authentication; media registration; upload-token authentication; streaming MP4 uploads; processing lifecycle; metadata extraction; thumbnail generation and retrieval; error handling; troubleshooting |
| API reference (6) | GET health; GET ready; POST media; PUT media upload; GET media; GET media thumbnail |
| Project (5) | Development status; roadmap; contributing; technology stack; known limitations |

[The ordered manifest](app/content/manifest.ts) defines every title, route, group, description and backend source reference. It drives routing, sidebar navigation, breadcrumbs, previous/next links and integrity checks. The overview remains at `/lumen-web/docs/`; other articles have explicit nested URLs.

## Source verification and API baseline

The baseline is local backend commit `4899210e659864a2026b13b7d3c558e92da08780`. Committed files were read through Git rather than treating the dirty working tree as released functionality. Remote publication of this commit was not independently verified. Backend services, migrations and tests were not executed.

Evidence cross-checked includes:

- `src/modules/media/media.route.ts`, `media.service.ts`, `media.types.ts` and `media.test.ts`: schemas, serializers, upload claiming, transaction handling, retrieval and errors.
- `src/plugins/authenticate.ts` and `src/modules/auth/auth.service.ts`: project-key lookup, header handling, ownership and inactive projects.
- `src/modules/health/health.route.ts`, `health.test.ts` and `src/app.ts`: health/readiness status, cache headers and shared error responses.
- `src/config/storage.ts`, `src/config/redis.ts`, `src/database/pool.ts`, `.env.example` and `src/server.ts`: configuration and limits.
- `src/workers/processor.ts`, `worker.ts`, `queue.ts` and `outbox-publisher.ts`: independent jobs, durable outbox, queue delivery, leases and retry behavior.
- `src/modules/media/ffprobe.service.ts`, `ffmpeg.service.ts` and their tests: metadata and JPEG generation behavior.
- `migrations/001_initial_schema.sql`, `package.json`, `compose.yaml`, backend `AGENTS.md` and `Readme.md`: schema, actual commands, infrastructure and development context.

Each article lists relevant committed-file references beneath its content. Test files are evidence of test coverage in source, not a claim that backend tests passed in this phase.

| Endpoint | Documented behavior |
| --- | --- |
| `GET /health` | Unauthenticated liveness JSON, 200, no-cache headers |
| `GET /ready` | Unauthenticated bounded PostgreSQL check, 200 or 503; does not establish worker/Redis/storage readiness |
| `POST /v1/media` | Project API key; MP4 registration fields and constraints; 201 serialized asset and single-use upload credentials |
| `PUT /v1/media/:id/upload` | Issued Bearer upload token; raw bytes with exact Content-Length; MP4 validation, limits, 200 response and route-specific failures |
| `GET /v1/media/:id` | Project API key; owned asset and optional thumbnail availability; no public full metadata/job-list/rendition response |
| `GET /v1/media/:id/thumbnail` | Project API key; JPEG stream and cache/length headers; unavailable thumbnail returns 404 |

Request examples use placeholders and a separately operated local API origin. Response examples illustrate committed serializers; they are not captured runtime results. Registration and upload authentication are kept distinct. Upload tokens are claimed before transfer and are not presented as safely reusable. Asset `ready` is ingestion state, not proof that all background jobs completed. Transcoding and rendition delivery remain unreleased local development, outside the current API reference.

## Documentation experience

- Authored MDX is statically imported by small route modules, retaining route-level code splitting and meaningful prerendered HTML.
- A build-time heading plugin generates matching heading IDs and table-of-contents metadata. Source validation rejects duplicate heading IDs.
- Internal documentation links use the router and preserve `/lumen-web/`; active navigation, breadcrumbs and previous/next links follow the same manifest.
- The long desktop sidebar scrolls its active entry into view without moving the article. Mobile retains the documentation menu and collapsible table of contents.
- Code remains Shiki-highlighted, selectable, keyboard-scrollable and copyable. Wide API tables scroll inside labeled regions instead of overflowing the page.
- Pagefind indexes only article content. Navigation and source-reference chrome remain outside the indexed body. Search uses real document groups and links to valid base-prefixed routes.
- Existing light/dark/system themes, skip link, dialogs and keyboard navigation remain. A queued native-dialog close race exposed by Escape followed immediately by Ctrl+K was corrected in the shared modal.
- UI/UX Pro Max documentation-readability and keyboard/focus guidance informed the work; no new visual system or UI library was introduced.

## Integrity checks and validation evidence

Run the complete repeatable check with:

```bash
npm run validate
```

This runs TypeScript, the production build, static output normalization, Pagefind indexing, documentation validation, Node regression tests and Playwright. In this environment Chromium was already available in the temporary browser cache, so the executed command was:

```bash
PLAYWRIGHT_BROWSERS_PATH=/tmp/lumen-web-playwright npm run validate
```

For an existing build, rerun documentation integrity with `npm run check:docs`. Use `npm run preview` for the local production static server.

| Check | Executed result |
| --- | --- |
| React Router type generation and strict TypeScript | Passed |
| Production prerender/build | Passed; 29 documentation pages plus home and 404 HTML |
| Static documentation content | All 29 outputs contain article content, title and description |
| Pagefind 1.6.0 | Indexed all 29 documentation pages; reported 1,296 indexed words |
| Search completeness | Browser queried every document title and found its expected URL |
| Node regression tests | 8 passed: 2 output-normalization tests and 6 documentation tests |
| Playwright | 17 passed, including existing landing, static-hosting and foundation coverage |
| Nested URLs and assets | Production static-server tests passed under `/lumen-web/`, including direct navigation/refresh and real missing-route 404 |
| JavaScript-independent content | Representative installation and processing articles checked with JavaScript disabled |
| Responsive documentation | Tested at 320, 375, 768 and 1440px; tables/code stay within their own scroll regions |
| Accessibility and themes | Automated axe checks passed on tested documentation pages in light/dark; keyboard navigation, search and copy interactions passed |

The source validator checks complete content/route/navigation inventory, unique slugs and paths, required titles/descriptions/source metadata, six expected endpoint declarations, incorrect API route references, authored internal links and heading anchors. Output validation checks rendered headings/links, HTML assets and Pagefind page count. Negative tests demonstrate that duplicate metadata, omitted navigation, unsupported API references and broken links/anchors fail validation. After the full suite, the additional rendered-description assertion was separately rechecked with `npm run check:docs` and the six documentation Node tests; both passed.

These checks validate the authored Markdown/link conventions and static output. They are not a runtime API contract test or a general-purpose parser for arbitrary future MDX expressions.

## Visual inspection

Reviewed desktop API and mobile installation/API captures, including the dark theme. Corrected heading-anchor wrapping and narrow-table identifier wrapping, then regenerated screenshots. Final desktop inspection confirmed the active API sidebar entry remains visible. Captures are temporary local review artifacts, not deployed assets:

- `/tmp/lumen-phase5-api-desktop.png`
- `/tmp/lumen-phase5-api-desktop-viewport.png`
- `/tmp/lumen-phase5-installation-desktop.png`
- `/tmp/lumen-phase5-installation-mobile.png`
- `/tmp/lumen-phase5-api-mobile.png`
- `/tmp/lumen-phase5-api-mobile-dark.png`

## Files created and changed

- Added 29 MDX articles in `app/content/docs/`, their 29 route modules in `app/routes/docs/`, and the centralized `app/content/manifest.ts`.
- Added `app/docs-components.tsx`, `app/mdx-custom.d.ts`, `scripts/document-headings.ts`, `scripts/validate-docs.ts`, `scripts/documentation.test.ts`, `tests/documentation.spec.ts` and this report.
- Updated `site.config.ts`, `vite.config.ts` and package scripts for the inventory, heading pipeline and validation. Package dependency versions and lockfile were not changed.
- Updated the shared documentation layout, search, article components, modal and prose styling; updated existing browser tests for real content. Landing/footer edits only remove stale fixture-era wording.
- Removed the two old content fixtures (`app/content/installation.mdx`, `app/content/processing.mdx`) and their old route modules (`app/routes/installation.tsx`, `app/routes/processing.tsx`).

## Limitations and review boundary

1. The committed backend imports `src/shared/storage/local-storage.service.ts`, which is absent from the inspected commit. An ignored local file does not establish a reproducible clean checkout. Onboarding explicitly stops short of claiming a verified runnable installation.
2. Active-project/API-key provisioning has no verified public endpoint or complete supported procedure. Documentation explains the prerequisite without inventing SQL or bypass commands.
3. No backend runtime behavior, API request or end-to-end onboarding was verified here. Local-only transcoding changes were neither published as current functionality nor modified.
4. Browser evidence covers Chromium and the exercised paths. Screen-reader review and additional browser coverage remain final-QA work; automated axe results do not constitute complete WCAG certification.
5. GitHub Pages itself has not been deployed or tested in this phase. Static compatibility is validated locally without a server-side application or SPA fallback. The existing generated 404 strategy remains intact.
6. No secrets, live upload integration, dependency installation, backend changes, commits, pushes or deployment were introduced.

Phase 5 is complete for review. After approval, the next phase can perform final content/accessibility/cross-browser QA and separately review deployment readiness. Publishing and backend onboarding remediation require their own authorization.
