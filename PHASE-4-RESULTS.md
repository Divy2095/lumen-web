# Phase 4 — Product landing page

Date: 2026-11-12. Scope: landing page only; documentation fixtures and the shared foundation are retained.

## Implemented

The home route now presents the complete product landing page using the existing Geist typography, warm-neutral surfaces, blue accent, semantic tokens and light/dark/System themes.

- Hero: **Video processing, through an API.**, concise MP4/metadata/JPEG description, early-development link, Get Started/GitHub actions and a static processing schematic.
- Processing flow: registration, token issuance, validation/storage, atomic job/outbox creation, dispatch, independent workers and authenticated retrieval.
- Capabilities: three editorial rows covering project authentication/upload tokens, MP4 ingestion and background metadata/thumbnail work. No repetitive feature-card grid.
- Developer experience: two copyable shell examples and an expandable registration response, highlighted at build time with the existing Shiki integration.
- Architecture: Fastify → PostgreSQL → outbox publisher / Redis-BullMQ → workers, with FFprobe metadata persistence and FFmpeg JPEG storage/output records.
- Getting started: documentation/repository links plus explicit setup and verification limitations.
- Shared footer: retained navigation and project status; accurately says the backend package declares ISC, without asserting a standalone license file exists.

No dependencies were installed or upgraded. No animation library, upload control, public API connection, fake dashboard, testimonials or metrics were added. The API examples are an MDX fragment used only by the landing route, not new documentation pages. The original planning documents and Phase 2/3 reports remain unchanged as historical records.

## Product evidence and limits on claims

The read-only backend inspection still found HEAD **`4899210e659864a2026b13b7d3c558e92da08780`**, with pre-existing modified/untracked transcoding work. The page uses committed source behavior, not that local work. The commit was inspected locally; remote publication and deployment of that revision were not established.

| Page claim/example | Committed source inspected |
| --- | --- |
| Registration path, required filename/MIME/size, 201 response | `src/modules/media/media.route.ts`, `media.service.ts`, `media.types.ts` |
| Bearer project API key versus issued upload token | `src/plugins/authenticate.ts`, `src/modules/media/media.route.ts` |
| Single-use token, MP4 transport and matching Content-Length | `src/modules/media/media.route.ts`, `media.service.ts` |
| 100 MiB maximum and one-hour token lifetime | `src/config/storage.ts` |
| Asset ready + metadata/thumbnail jobs + outbox in one transaction | `src/modules/media/media.service.ts` |
| Metadata persistence and real JPEG worker branch | `src/workers/processor.ts`, FFprobe/FFmpeg services |
| Authenticated thumbnail stream / asset and thumbnail state | `src/modules/media/media.route.ts`, `media.service.ts`, `media.types.ts` |
| Queue, publisher and execution components | `src/workers/queue.ts`, `outbox-publisher.ts`, `worker.ts` |
| ISC package declaration | `package.json` |

Relevant committed media tests were read for registration and upload assertions. No backend tests, migrations, servers or processing commands were executed. Backend files, dependencies, data and Git history were not modified.

The existing reproducibility blocker remains: the imported `src/shared/storage/local-storage.service.ts` exists locally but is ignored and absent from the inspected commit. The getting-started status panel states this, the missing supported credential-provisioning walkthrough, and the fact that documentation currently contains fixtures. It does not promise a verified clean-checkout installation.

Transcoding is described only as development work outside the committed flow. No rendition endpoint, webhook integration, public job-management endpoint or comprehensive public metadata response is invented. Metadata is explicitly described as persisted internally. Asset `ready` is never used as a synonym for all jobs complete.

## API example details

The registration example uses `POST /v1/media`, `Authorization: Bearer $LUMEN_API_KEY`, JSON content type and the exact committed request keys. It calculates the local MP4 byte count for registration rather than asking readers to copy a fabricated file size.

The displayed 201 response includes exactly the committed serializer fields: `id`, `project_id`, `status`, `original_filename`, `mime_type`, `file_size_bytes`, `uploaded_bytes`, `upload_token`, `upload_url`, `upload_expires_at`, `created_at`. Placeholder IDs/token and illustrative size/timestamps are explicitly labeled. The sample is not a captured runtime response.

The second command uses the returned relative `upload_url` and issued `upload_token`, `PUT`, `video/mp4`, matching Content-Length and raw bytes. The explanatory copy keeps the project key on the application server and distinguishes it from the upload credential. `http://localhost:3000` describes the backend's local default, not an API hosted by GitHub Pages. Nothing executes these commands in the browser.

These requests/schemas were source-checked, not exercised against a running backend. Clipboard tests confirm the example text is copyable; they do not certify end-to-end onboarding.

## Pipeline interaction

The pipeline is explicitly labeled **Illustrative simulation — No files are uploaded and no backend is connected.** It never auto-starts. Play advances a finite local state sequence; Pause/Resume, Reset and Replay remain user-controlled. No percentage, benchmark, running-backend event feed or file picker is shown.

The fixed example sequence shows:

1. Asset registration and token issuance with ingestion `uploading`.
2. MP4 ingestion and the transaction setting the asset `ready` while jobs remain `queued`.
3. Background dispatch and two processing jobs.
4. Metadata `completed` while thumbnail remains `processing`.
5. Both jobs complete and authenticated thumbnail retrieval.

The metadata-first completion order is explicitly illustrative, not guaranteed. Branch descriptions and all stage explanations remain visible without playing. Reduced-motion preferences replace playback with a static overview; switching that preference during playback stops/reset the example. The full flow remains in prerendered HTML without JavaScript.

Playback is local React state with a cleaned-up timeout per step; timing has no relationship to backend performance. The live region announces user actions and completion rather than reading every visual update. State words accompany visual emphasis, and buttons support keyboard activation.

## Validation

Executed on the existing Node **24.22.1**, npm **11.19.1** toolchain and pinned Phase 3 dependencies:

```bash
PLAYWRIGHT_BROWSERS_PATH=/tmp/lumen-web-playwright npm run validate
```

Result: **strict TypeScript passed; production build passed; 2 normalization regressions passed; 14 Playwright tests passed** (final browser run approximately 18.2 seconds). Pagefind indexed **2 documentation pages / 69 words**; the landing page is intentionally excluded from documentation search.

Existing Phase 2/3 tests continue to cover nested HTML, direct requests/refresh, real 404s, base-prefixed assets, MDX hydration, clipboard, history, heading fragments, Pagefind, themes, storage failure, search/mobile dialogs, responsive reflow and keyboard focus.

Five new landing tests cover:

- Prerendered hero/sections, readable static pipeline and source-aligned request/response structures with JavaScript disabled.
- Play/Pause/Resume/Replay/Reset and independent asset/job states using a virtual browser clock; no off-origin/API requests during simulation.
- Reduced-motion static mode, preference changes during playback and keyboard activation.
- Copyable registration command, both themes, widths 320/375/768/1024/1440px and doubled root text at 320px without page overflow.
- Automated axe WCAG A/AA checks at desktop/mobile widths in both themes, with the sample JSON response expanded. No violations were reported in the final tested states.

The first build caught and resolved an MDX disclosure-formatting error. Browser validation also caught low intermediate contrast caused by shared primary-button color interpolation while themes changed. Buttons now switch foreground/fill colors immediately and retain restrained border feedback. The final accessibility run passes without hiding or excluding those controls from checks.

No-JavaScript checks assert the actual visible stage and worker descriptions rather than relying on the browser test harness's handling of `<noscript>` text. No backend runtime or production-readiness claim is derived from these website tests.

Static output remains `build/client/`, with physical nested documents, existing output normalization, `.nojekyll`, Pagefind assets and `404.html`. No SPA rewrite or runtime server was introduced. Additional Bash/JSON grammars run through the existing build-time highlighter; no highlighter is added to the browser runtime. Landing route code is approximately **37.7 kB / 7.36 kB gzip**, plus **19.7 kB / 3.16 kB gzip** route CSS; the existing framework payload remains additional to this.

## Screenshots reviewed

Inspected production renders at 1440px desktop and 375px mobile, in light and dark themes. Reviewed full-page hierarchy, hero composition, pipeline labels/controls, API command layout and architecture reflow. Registration JSON formatting was expanded over multiple lines to improve code readability; long shell paths remain in contained, keyboard-scrollable code blocks.

Review artifacts are temporary local screenshots, not repository assets:

- [Desktop hero](/tmp/lumen-phase4-hero-desktop.png)
- [Mobile hero](/tmp/lumen-phase4-hero-mobile.png)
- [Dark hero](/tmp/lumen-phase4-hero-dark.png)
- [Full desktop page](/tmp/lumen-phase4-desktop.png)
- [Full mobile page](/tmp/lumen-phase4-mobile.png)
- [Mobile pipeline viewport](/tmp/lumen-phase4-pipeline-mobile-viewport.png)
- [Mobile API viewport](/tmp/lumen-phase4-api-mobile-viewport.png)

Mobile capture measured page width 375px at a 375px viewport. Separate automated checks cover 320px and doubled text. Element-only tall screenshots can capture sticky-header artifacts; normal viewport/full-page captures were used to distinguish capture effects from interface defects.

## Files created or modified

Created: `app/product/pipeline.tsx`, `app/product/architecture.tsx`, `app/product/api-example.mdx`, `app/product/landing.css`, `tests/landing.spec.ts`, and this report.

Modified: `app/routes/home.tsx` (complete landing composition), `app/site-shell.tsx` (footer status/license wording), `app/styles.css` (accessible button color changes), and `vite.config.ts` (Bash/JSON highlighting).

Package manifest/lockfile, documentation fixture content, routing strategy, hosting scripts and deployment configuration were not changed in Phase 4. Existing unrelated/untracked work was preserved. No commits, pushes or deployment were performed.

## Limitations and next step

Actual GitHub Pages deployment remains untested because publication was not authorized. Local static checks do not establish CDN behavior. Browser coverage is Chromium; Safari/Firefox, real-device and manual screen-reader acceptance remain future work, so this is not a full WCAG conformance certification.

The landing page is complete within this phase's scope. Documentation remains fixtures, backend onboarding is not runtime-verified, and the known provisioning/reproducibility issues remain visible. The live upload demo remains excluded.

Next, after review and separate approval: implement the real documentation and API reference against an explicitly selected backend revision, resolving the onboarding gaps before presenting a complete getting-started walkthrough. Stop here for review.
