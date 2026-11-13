# Lumen Web product plan

Status: Phase 1 planning, direction approved; implementation requires separate approval.
Evidence reviewed: 2026-11-12. Companion documents: [Design](DESIGN.md), [Architecture](ARCHITECTURE.md), [Agent instructions](AGENTS.md).

## Product and audience

Lumen is an API-first media processing platform in early development. Its committed backend accepts registered MP4 uploads, persists extracted metadata, and generates thumbnails through background workers. It runs on Node.js/TypeScript, Fastify, PostgreSQL, Redis/BullMQ, FFmpeg/FFprobe, and local filesystem storage. Developers operate the backend separately from this website.

Primary users are backend and full-stack developers integrating video ingestion and processing into an application. Secondary users are infrastructure engineers evaluating the processing model and contributors learning the system. Their end users should never receive the developer's project API key.

The first website release prioritizes a clear landing page and useful developer documentation, including API reference. A public live upload demo is outside scope. The processing illustration is a local simulation, never a connection to a deployed API.

## Evidence baseline and publication policy

Backend: `../Lumen`, independent repository at <https://github.com/Divy2095/Lumen>.
Inspected HEAD: `4899210e659864a2026b13b7d3c558e92da08780`.

The backend has pre-existing uncommitted edits. This plan compared relevant `git show HEAD:<path>` content with the working tree. A committed capability means it exists at that local HEAD, not that a release, remote branch, or deployed service was verified. Working-tree paths below can contain unpublished behavior; a link to GitHub HEAD is not evidence for those changes.

Use these independent evidence fields:

- **Committed implementation:** executable behavior at the inspected HEAD.
- **Local implementation:** modified/untracked behavior beyond that HEAD.
- **Test evidence:** relevant tests exist and were inspected; this does not establish passing tests or complete coverage.
- **Runtime verification:** only claim this after recording actual executed checks and their environment.
- **Partial/planned:** schema, declarations, stubs, and README intentions do not constitute a complete feature.

No backend tests or processing runs were executed in Phase 1. Runtime verification is **not performed for every row below**. No capability is certified production-ready. Before public content is finalized, select a committed backend revision, compare it again, and record that revision in documentation. Default first-release examples to committed behavior; present local additions only as explicitly labeled development work until they become part of the selected revision.

**Clean-checkout blocker:** `src/shared/storage/local-storage.service.ts` exists locally but is ignored by Git and absent from the inspected HEAD's tree. Committed routes and workers import it. Thus committed ingestion/processing code is not a self-contained runnable implementation at this revision. The matrix describes source behavior, not clean-checkout reproducibility. Do not publish a “working installation” claim until this dependency is included in an approved backend revision and the walkthrough is verified; resolving the backend is outside this repository's scope.

## Feature-status matrix

All source paths in this table are relative to `../Lumen/`.

| Capability | At inspected HEAD | Local additions / limitations | Existing test evidence |
| --- | --- | --- | --- |
| API-key authentication | Implemented: Bearer or `x-api-key`; hashed lookup, expiry/revocation and active-project checks | No public project/key creation endpoint found | `src/modules/media/media.test.ts`: authentication and ownership cases |
| Media registration | Implemented: filename, MP4 MIME type, declared size, single-use token | Local registration accepts transcoding configuration | `media.test.ts`; local configuration cases added |
| Streaming upload | Implemented: token auth, size/type checks, MP4 inspection, temporary file commit, timeouts | No resumable protocol | `media.test.ts`: upload and failure cases |
| Local filesystem storage | Partial: configuration and callers committed; imported storage implementation absent from HEAD | Implementation exists in an ignored local file; no implemented S3 adapter established | Media and FFmpeg test source references storage; no execution performed |
| Metadata extraction | Real FFprobe execution and database persistence | Local rotation handling extends metadata parsing; public asset response does not expose the full extracted metadata | `ffprobe.service.test.ts`: parsing, media rejection, worker persistence and failure cases; local edits |
| Thumbnails | Real FFmpeg JPEG generation, output records, authenticated stream | No public arbitrary thumbnail-generation endpoint found | `ffmpeg.service.test.ts`: generation, worker reliability and delivery |
| Durable scheduling | PostgreSQL transactional outbox, publisher, BullMQ workers | Separate API, publisher and worker processes | `outbox-publisher.test.ts`, `worker.test.ts` |
| Retries and worker ownership | Attempt limits, leases, fencing and idempotent handling in source | No operational reliability guarantee inferred | Worker/outbox tests include concurrent claims, expiry and duplicate delivery |
| Asset/thumbnail status | Asset retrieval and thumbnail readiness | No general `/jobs` API; asset `ready` means ingestion complete | Media and thumbnail tests |
| Transcoding | Partial: operation/schema/queue declarations and placeholder processor branch | Real processing, profile selection, scheduling, rendition response and stream route exist only in working tree | Untracked `transcoding-profiles.test.ts`, `transcoding-scheduling.test.ts`, `transcoding.service.test.ts`; modified media/schema tests |
| Health/readiness | `/health` liveness and `/ready` PostgreSQL check | Readiness does not assess Redis, workers, storage or FFmpeg | `src/modules/health/health.test.ts` |
| Webhooks | Partial: database tables | No delivery/signing/retry implementation found | No delivery test evidence established |
| API idempotency keys | Partial: schema table | Do not promise a public idempotency-header contract | No public contract test evidence established |
| HLS, tus resumable upload, SDKs, analytics, dashboard | Planned in README | No implementation established | None established |

Local transcoding dependencies include untracked `migrations/002_add_transcoding_config.sql`, `transcoding-profiles.ts` and `transcoding.service.ts`, plus changes to media routes/services/types, FFprobe and workers. These cannot be described as part of the inspected committed backend.

## Verified HTTP surface

| Method and path | Credentials | Evidence and response notes |
| --- | --- | --- |
| `GET /health` | None | `src/modules/health/health.route.ts`; liveness object |
| `GET /ready` | None | Same file; database readiness or 503 |
| `POST /v1/media` | Project API key | `src/modules/media/media.route.ts`, `media.service.ts`, `media.types.ts`; 201 registration object |
| `PUT /v1/media/:id/upload` | Issued upload token as Bearer | Same route/service; raw binary body, 200 public asset on success |
| `GET /v1/media/:id` | Project API key | Public asset and optional thumbnail state; local tree adds transcoding details |
| `GET /v1/media/:id/thumbnail` | Project API key | JPEG stream or 404; ownership enforced |
| `GET /v1/media/:id/renditions/:profile` | Project API key | **Local only**: MP4 stream, 409 while processing/failed, or 404 |

The committed registration body requires `original_filename`, `mime_type: "video/mp4"`, and positive integer `file_size_bytes`. The response includes `id`, `project_id`, `status`, filename/type/size, `uploaded_bytes`, `upload_token`, relative `upload_url`, `upload_expires_at`, and `created_at`. Use the selected revision's serializers for final examples, including omitted optional fields; do not fabricate full response schemas from interfaces alone.

Upload rules from `src/config/storage.ts` and the route:

- Maximum 104,857,600 bytes (100 MiB; source messages call it “100 MB”).
- Registration accepts MP4 only. Upload transport accepts `video/mp4` or `application/octet-stream`; this does not permit arbitrary media formats.
- `Content-Length` is required and must match the registered size.
- Token lifetime is one hour; token is consumed when the upload is claimed.
- Default maximum transfer duration is 15 minutes and inactivity timeout is 30 seconds.
- Project API keys and upload tokens are separate credentials. Output URLs require authenticated retrieval; they are not public share links.

Error documentation must distinguish registration validation from upload validation. Existing branches include 400 validation/content-length/media errors, 401 missing/invalid credentials, 403 expired upload token or inactive project, 404 unavailable/unauthorized assets, 408 timeout, 409 upload conflict, 411 missing length, 413 size limit, 415 content type, and sanitized 500 errors. HTTP errors commonly use `{ error, message }`; health/readiness has its own shape. Preserve route-specific error names rather than imposing an invented uniform contract.

## Lifecycle and architecture explanation

Registration creates an `uploading` asset and upload credentials. Successful ingestion sets the asset to `ready` and atomically creates metadata/thumbnail jobs and outbox events. The publisher dispatches events to BullMQ; workers claim PostgreSQL jobs with leases and fencing. Job states include `queued`, `processing`, `completed`, `failed`, and `cancelled`; a database state does not establish a public cancellation endpoint.

Thumbnail work can probe duration independently; do not draw it as necessarily waiting for metadata completion. In local transcoding work, metadata completion resolves eligible profiles and schedules rendition jobs. Profiles are bounding boxes (360p, 480p, 720p, 1080p), preserve aspect ratio and avoid upscaling; not every input produces all profiles. Keep this branch marked “In development” until the publication baseline includes it.

## Positioning and landing-page copy

Recommended headline: **Video processing, through an API.**

Committed-baseline supporting copy: “Register and upload MP4 video, then extract metadata and generate thumbnails with background workers.” Supporting explanation should state that metadata is persisted internally, avoiding an implied comprehensive metadata retrieval API.

Primary CTA: **Get Started** → installation/quickstart. Secondary CTA: **GitHub** → backend repository. A visible “Early development” link leads to a factual status page. Avoid uptime, throughput, customer counts, “production-ready,” and claims that developers no longer operate infrastructure.

Sections: purpose and CTAs → illustrative processing pipeline → ingestion/processing/retrieval capabilities → real API example → architecture → local getting started → project footer. Use editorial rows and technical examples rather than repeated feature cards. Transcoding may appear in a clearly separated development note; it must not silently enter the committed example flow.

Footer links: documentation, backend repository, website repository, development status, and project contribution guidance. Backend `package.json` declares ISC, but no standalone license file was found in the inspected tracked tree. Say “Package declares ISC” if needed; resolve licensing before publishing a stronger license statement. Website licensing is a separate unresolved decision.

## Documentation inventory and onboarding gaps

| Group | Planned articles |
| --- | --- |
| Introduction | What is Lumen; core concepts; short architecture overview |
| Getting started | Prerequisites; installation; environment configuration; running locally; credential provisioning; first request |
| Guides | Authentication; media registration; raw MP4 uploads; processing and output states; thumbnail retrieval; errors; troubleshooting |
| API reference | Authentication conventions; each committed route; request/response fields; per-route errors |
| Project | Detailed architecture; technology; development status; roadmap; contribution guidance |

Local transcoding belongs in a development-status section until a selected committed revision includes it. Do not create current-use webhook, HLS, SDK or resumable-upload guides. Keep the introductory architecture page brief and link to the detailed system explanation.

Verified prerequisites/configuration sources: `package.json`, `.env.example`, `compose.yaml`, `src/server.ts`, `src/database/pool.ts`, `src/config/redis.ts`, and `src/config/storage.ts`. Compose starts PostgreSQL and Redis, not the API or worker processes. Existing scripts include `dev`, `worker`, `outbox:publisher`, `db:migrate`, `typecheck`, and `test`. No end-to-end installation sequence was executed; final commands must be checked against the selected backend revision before publication. Never copy real `.env` values or incidental credentials from source comments into documentation.

Open issues: resolve the ignored storage implementation in a separately managed backend revision; establish a safe, supported local project/API-key provisioning procedure; select the published backend revision; verify prerequisites and first-request walkthrough in an authorized isolated environment; confirm license and contribution policy. Do not invent a registration/key-creation API or present test fixtures as supported onboarding.

## Source index

Paths resolve into the read-only sibling backend. Record the baseline above when using them; file links open the current working tree.

- [README](../Lumen/Readme.md): intent and roadmap; not implementation authority.
- [Package](../Lumen/package.json), [Compose](../Lumen/compose.yaml), [example configuration](../Lumen/.env.example): scripts and runtime setup.
- [Application](../Lumen/src/app.ts), [server](../Lumen/src/server.ts): route registration, parser, errors and startup.
- [Authentication plugin](../Lumen/src/plugins/authenticate.ts), [auth service](../Lumen/src/modules/auth/auth.service.ts): credentials and ownership context.
- [Media routes](../Lumen/src/modules/media/media.route.ts), [service](../Lumen/src/modules/media/media.service.ts), [types](../Lumen/src/modules/media/media.types.ts): HTTP behavior and serialization.
- [Storage configuration](../Lumen/src/config/storage.ts), [local storage](../Lumen/src/shared/storage/local-storage.service.ts): limits and files.
- [FFprobe](../Lumen/src/modules/media/ffprobe.service.ts), [FFmpeg](../Lumen/src/modules/media/ffmpeg.service.ts): metadata and thumbnails.
- [Queue](../Lumen/src/workers/queue.ts), [processor](../Lumen/src/workers/processor.ts), [worker](../Lumen/src/workers/worker.ts), [publisher](../Lumen/src/workers/outbox-publisher.ts): asynchronous processing.
- [Initial schema](../Lumen/migrations/001_initial_schema.sql): entities and constraints, including partial features.
- Local only: [transcoding migration](../Lumen/migrations/002_add_transcoding_config.sql), [profiles](../Lumen/src/modules/media/transcoding-profiles.ts), [transcoding service](../Lumen/src/modules/media/transcoding.service.ts).

## First-release acceptance

A visitor can identify the product and its development stage, understand the ingestion/processing distinction, find supported endpoints, and follow a source-checked local walkthrough. Every capability and example traces to the selected revision. Documentation and navigation work at the GitHub Pages project path. A live upload service is not required for this release.
