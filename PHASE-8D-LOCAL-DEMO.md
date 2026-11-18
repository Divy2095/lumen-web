# Phase 8D local browser playground

This connects the existing playground to the **local Phase 8C working tree** in
`../Lumen`, inspected at committed HEAD
`ed6e48321daf0ead8171817a529a71c262301bbb` plus uncommitted Phase 8C changes.
Those browser routes are not part of that commit or an established deployed API.
The older landing-page API examples/documentation retain their recorded baseline.

## Configuration

Use Node 24.22.1 (the repository requires Node >=24.22.1 and <25).
In your ignored frontend `.env.local`, supply your own public Clerk identifier
and the local API **origin**:

```dotenv
VITE_CLERK_PUBLISHABLE_KEY=pk_test_YOUR_PUBLIC_IDENTIFIER
VITE_LUMEN_API_BASE_URL=http://127.0.0.1:3000
```

These are public build-time configuration values. Never put a Clerk secret key,
database/Redis credentials, project API key, or upload token in a `VITE_` variable.
Restart the frontend after changes; static previews need a rebuild.
Do not include `/lumen-web/` or `/v1` in the API origin. The website retains its
existing `/lumen-web/` router/asset base independently.

The separately operated backend must allow the exact frontend origin in both
its CORS and Clerk authorized-party allowlists. `http://127.0.0.1:5173` differs
from `http://localhost:5173` and from preview port 4173. An operator must link the
signed-in Clerk subject to an existing account with exactly one active project.
The API, publisher and worker must be running with their existing shared storage.
This frontend does not start them or create accounts/projects.

Keep this configuration local. GitHub Pages cannot provide a backend, and
`localhost` in a visitor's browser refers to **that visitor's computer**.
Do not publish a locally configured demo build as a hosted processing service.
Public pages still prerender without an API URL.

## Contracts and workflow

1. Process video opens the existing accessible dialog. Signed-out users must sign
   in and reselect the file after the authentication redirect.
2. Each protected request obtains a current Clerk session JWT with
   `getToken({ skipCache: true })`; cookies are omitted.
3. `GET /v1/browser/project` resolves `{ id, name }`. No client selection of
   account/project authority is sent.
4. The picker and API client validate `.mp4`, MIME hints, non-empty content, and
   the 25 MiB playground limit. This does not replace server byte validation.
5. `POST /v1/browser/media` sends filename, `mime_type: "video/mp4"`, exact file
   size, and `transcoding: { enabled: false }`. No playback is requested.
6. The registration response provides UUID `id`, `upload_token`, `upload_url`,
   and `upload_expires_at`. Upload URLs must exactly match the configured origin
   and `/v1/media/:id/upload`, with no query/fragment/credentials or redirects.
7. PUT the **File itself**, not JSON/FormData, with its upload token and
   `Content-Type: video/mp4`. JavaScript never sets `Content-Length`; the browser
   must generate the registered byte count. A 411/length mismatch is reported as
   a compatibility problem, never worked around by relaxing backend checks.
8. Poll `GET /v1/browser/media/:id` sequentially at two-second intervals, bounded
   to three minutes per polling run. Up to three consecutive transient read
   errors are retried. `ready` means upload completion, not processing completion;
   both metadata and thumbnail jobs must complete. Failure/cancellation stops
   polling, retaining already available metadata. No percentages are fabricated.
9. Technical fields come from the curated `technical` object. Only duration,
   dimensions, codecs, bitrate, frame rate and file size are displayed.
10. Fetch the ready thumbnail's exact `/v1/browser/media/:id/thumbnail` URL with a
    fresh Clerk JWT. Require a nonempty `image/jpeg` response, then display a
    browser object URL. Revoke it on replacement, stop, close, account/session
    change, or unmount. No unauthenticated image request is used.

Uploads and registration are **never retried automatically**. A failed response
can have an uncertain committed outcome. When an asset ID is known, “Check status
again” performs only reads and starts a new bounded polling run. Closing/stopping
requests does not cancel backend work or refund/renew the one-time token.
If registration failed before its ID was received, ask the operator to check
before blindly registering again. No tokens are logged, stored or sent to
analytics; redirect following is disabled on API calls.

## Verification boundary

`npm run test:playground` uses deterministic network mocks and a headless Chromium
File-upload request check, with no server listener or live Clerk/backend.
Interception can precede transport-generated headers, so this does **not** prove
wire-level Content-Length or a real browser upload against Fastify. `npm test` additionally starts
the existing temporary static preview server for the site's Playwright suite;
that requires authorization when service startup is prohibited.

Phase 8E must explicitly authorize starting the separately configured services
and frontend test/preview server, sign in through real Clerk, select a valid
short MP4, inspect browser-generated Content-Length/CORS, and verify real
metadata/JPEG results, cancellation, expired sessions and responsive/keyboard
behavior. Do not infer this browser acceptance from backend integration results
or mocked frontend tests. Publication/deployment remains separate approval.
