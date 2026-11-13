// Ordered content inventory: routes, navigation, source provenance and checks.
export type DocumentEntry = {
  slug: string; path: string; file: string; title: string; group: string;
  description: string; sources: readonly string[]; endpoint?: string;
};
export const backendRevision = "4899210e659864a2026b13b7d3c558e92da08780";
export const documents: readonly DocumentEntry[] = [
  {
    "slug": "overview",
    "path": "docs",
    "file": "routes/docs/overview.tsx",
    "title": "Overview",
    "group": "Introduction",
    "description": "Lumen is an early-development, API-first video-processing platform that you operate alongside your application.",
    "sources": [
      "src/modules/media/media.route.ts",
      "src/modules/media/media.service.ts",
      "src/modules/media/media.types.ts",
      "src/workers/processor.ts",
      "src/workers/outbox-publisher.ts",
      "src/workers/queue.ts"
    ]
  },
  {
    "slug": "concepts",
    "path": "docs/introduction/core-concepts",
    "file": "routes/docs/concepts.tsx",
    "title": "Core concepts",
    "group": "Introduction",
    "description": "Separate ownership, ingestion and processing before integrating with the API.",
    "sources": [
      "src/modules/media/media.route.ts",
      "src/modules/media/media.service.ts",
      "src/modules/media/media.types.ts",
      "src/plugins/authenticate.ts",
      "src/modules/auth/auth.service.ts",
      "migrations/001_initial_schema.sql"
    ]
  },
  {
    "slug": "architecture",
    "path": "docs/introduction/architecture",
    "file": "routes/docs/architecture.tsx",
    "title": "System architecture",
    "group": "Introduction",
    "description": "Follow the boundaries between HTTP ingestion, durable state and asynchronous execution.",
    "sources": [
      "src/modules/media/media.route.ts",
      "src/modules/media/media.service.ts",
      "src/modules/media/media.types.ts",
      "src/workers/processor.ts",
      "src/workers/outbox-publisher.ts",
      "src/workers/queue.ts",
      "src/workers/worker.ts",
      "compose.yaml"
    ]
  },
  {
    "slug": "prerequisites",
    "path": "docs/getting-started/prerequisites",
    "file": "routes/docs/prerequisites.tsx",
    "title": "Prerequisites",
    "group": "Getting started",
    "description": "Prepare an isolated development environment, but review the onboarding blockers before running the backend.",
    "sources": [
      "AGENTS.md",
      "package.json",
      "compose.yaml",
      "src/config/storage.ts"
    ]
  },
  {
    "slug": "installation",
    "path": "docs/getting-started/installation",
    "file": "routes/docs/installation.tsx",
    "title": "Installation and configuration",
    "group": "Getting started",
    "description": "Inspect and configure the selected backend revision without assuming that a clean checkout can run.",
    "sources": [
      "package.json",
      ".env.example",
      "src/server.ts",
      "src/database/pool.ts",
      "src/config/redis.ts",
      "src/config/storage.ts"
    ]
  },
  {
    "slug": "infrastructure",
    "path": "docs/getting-started/infrastructure",
    "file": "routes/docs/infrastructure.tsx",
    "title": "Infrastructure and migrations",
    "group": "Getting started",
    "description": "Understand the supplied database and queue services and the migration entry points.",
    "sources": [
      "compose.yaml",
      "package.json",
      "src/database/migrate-status.ts",
      "migrations/001_initial_schema.sql"
    ]
  },
  {
    "slug": "running",
    "path": "docs/getting-started/running",
    "file": "routes/docs/running.tsx",
    "title": "Running the API and workers",
    "group": "Getting started",
    "description": "Run three separate processes only after storage, schema and configuration prerequisites are satisfied.",
    "sources": [
      "package.json",
      "src/server.ts",
      "src/workers/index.ts",
      "src/workers/worker.ts",
      "src/workers/outbox-publisher.ts"
    ]
  },
  {
    "slug": "credentials",
    "path": "docs/getting-started/credentials",
    "file": "routes/docs/credentials.tsx",
    "title": "Credential provisioning limitations",
    "group": "Getting started",
    "description": "An active project and usable API key are required, but their creation is not a verified public API.",
    "sources": [
      "migrations/001_initial_schema.sql",
      "src/plugins/authenticate.ts",
      "src/modules/auth/auth.service.ts",
      "src/modules/media/media.test.ts"
    ]
  },
  {
    "slug": "first-upload",
    "path": "docs/getting-started/first-upload",
    "file": "routes/docs/first-upload.tsx",
    "title": "First registration and upload",
    "group": "Getting started",
    "description": "A conditional walkthrough for developers who already have a working backend and an active project API key.",
    "sources": [
      "src/modules/media/media.route.ts",
      "src/modules/media/media.service.ts",
      "src/modules/media/media.types.ts",
      "src/plugins/authenticate.ts",
      "src/modules/auth/auth.service.ts",
      "src/config/storage.ts"
    ]
  },
  {
    "slug": "api-keys",
    "path": "docs/guides/api-key-authentication",
    "file": "routes/docs/api-keys.tsx",
    "title": "API-key authentication",
    "group": "Guides",
    "description": "Authenticate server-side registration and retrieval requests using a project-owned secret.",
    "sources": [
      "src/plugins/authenticate.ts",
      "src/modules/auth/auth.service.ts",
      "src/modules/media/media.route.ts"
    ]
  },
  {
    "slug": "registration",
    "path": "docs/guides/media-registration",
    "file": "routes/docs/registration.tsx",
    "title": "Media registration",
    "group": "Guides",
    "description": "Register an upload intent before streaming bytes.",
    "sources": [
      "src/modules/media/media.route.ts",
      "src/modules/media/media.service.ts",
      "src/modules/media/media.types.ts",
      "src/config/storage.ts",
      "src/modules/media/media.test.ts"
    ]
  },
  {
    "slug": "upload-tokens",
    "path": "docs/guides/upload-token-authentication",
    "file": "routes/docs/upload-tokens.tsx",
    "title": "Upload-token authentication",
    "group": "Guides",
    "description": "Use the issued credential only for the matching asset upload.",
    "sources": [
      "src/modules/media/media.route.ts",
      "src/modules/media/media.service.ts",
      "src/modules/media/media.types.ts",
      "src/shared/crypto.ts",
      "src/config/storage.ts"
    ]
  },
  {
    "slug": "uploads",
    "path": "docs/guides/streaming-mp4-uploads",
    "file": "routes/docs/uploads.tsx",
    "title": "Streaming MP4 uploads",
    "group": "Guides",
    "description": "Send raw MP4 bytes with the exact declared length, not a multipart body.",
    "sources": [
      "src/modules/media/media.route.ts",
      "src/modules/media/media.service.ts",
      "src/modules/media/media.types.ts",
      "src/modules/media/mp4-validator.ts",
      "src/config/storage.ts",
      "src/modules/media/media.test.ts"
    ]
  },
  {
    "slug": "processing",
    "path": "docs/guides/processing",
    "file": "routes/docs/processing.tsx",
    "title": "Processing lifecycle",
    "group": "Guides",
    "description": "Treat ingestion, metadata and thumbnail state as independent concerns.",
    "sources": [
      "src/modules/media/media.route.ts",
      "src/modules/media/media.service.ts",
      "src/modules/media/media.types.ts",
      "src/workers/processor.ts",
      "src/workers/outbox-publisher.ts",
      "src/workers/queue.ts",
      "migrations/001_initial_schema.sql"
    ]
  },
  {
    "slug": "metadata",
    "path": "docs/guides/metadata-extraction",
    "file": "routes/docs/metadata.tsx",
    "title": "Metadata extraction",
    "group": "Guides",
    "description": "FFprobe extracts metadata in a background job and the worker persists it internally.",
    "sources": [
      "src/modules/media/ffprobe.service.ts",
      "src/modules/media/ffprobe.service.test.ts",
      "src/workers/processor.ts",
      "src/modules/media/media.service.ts"
    ]
  },
  {
    "slug": "thumbnails",
    "path": "docs/guides/thumbnails",
    "file": "routes/docs/thumbnails.tsx",
    "title": "Thumbnail generation and retrieval",
    "group": "Guides",
    "description": "Background FFmpeg work creates a JPEG; authenticated retrieval serves the current output.",
    "sources": [
      "src/modules/media/media.route.ts",
      "src/modules/media/media.service.ts",
      "src/modules/media/media.types.ts",
      "src/modules/media/ffmpeg.service.ts",
      "src/modules/media/ffmpeg.service.test.ts",
      "src/workers/processor.ts"
    ]
  },
  {
    "slug": "errors",
    "path": "docs/guides/error-handling",
    "file": "routes/docs/errors.tsx",
    "title": "Error handling",
    "group": "Guides",
    "description": "Handle route-specific errors and uncertain outcomes rather than assuming every failure is retryable.",
    "sources": [
      "src/app.ts",
      "src/modules/media/media.route.ts",
      "src/modules/media/media.service.ts",
      "src/modules/media/media.types.ts",
      "src/plugins/authenticate.ts",
      "src/modules/auth/auth.service.ts"
    ]
  },
  {
    "slug": "troubleshooting",
    "path": "docs/guides/troubleshooting",
    "file": "routes/docs/troubleshooting.tsx",
    "title": "Troubleshooting",
    "group": "Guides",
    "description": "Start with the failing boundary and keep credentials and internal paths out of public reports.",
    "sources": [
      "src/modules/media/media.route.ts",
      "src/modules/media/media.service.ts",
      "src/modules/media/media.types.ts",
      "src/workers/processor.ts",
      "src/workers/outbox-publisher.ts",
      "src/workers/queue.ts",
      "src/config/storage.ts",
      "src/modules/health/health.route.ts"
    ]
  },
  {
    "slug": "health",
    "path": "docs/api/health",
    "file": "routes/docs/health.tsx",
    "title": "GET health",
    "group": "API reference",
    "description": "GET /health reports application liveness without authenticating the caller.",
    "sources": [
      "src/modules/health/health.route.ts",
      "src/modules/health/health.test.ts",
      "src/app.ts"
    ],
    "endpoint": "GET /health"
  },
  {
    "slug": "ready",
    "path": "docs/api/ready",
    "file": "routes/docs/ready.tsx",
    "title": "GET ready",
    "group": "API reference",
    "description": "GET /ready checks whether a bounded PostgreSQL query succeeds.",
    "sources": [
      "src/modules/health/health.route.ts",
      "src/modules/health/health.test.ts",
      "src/app.ts"
    ],
    "endpoint": "GET /ready"
  },
  {
    "slug": "register-media",
    "path": "docs/api/register-media",
    "file": "routes/docs/register-media.tsx",
    "title": "POST media",
    "group": "API reference",
    "description": "POST /v1/media creates a project-owned MP4 upload intent and returns its single-use upload credentials.",
    "sources": [
      "src/modules/media/media.route.ts",
      "src/modules/media/media.service.ts",
      "src/modules/media/media.types.ts",
      "src/plugins/authenticate.ts",
      "src/modules/auth/auth.service.ts",
      "src/config/storage.ts",
      "src/modules/media/media.test.ts",
      "src/app.ts"
    ],
    "endpoint": "POST /v1/media"
  },
  {
    "slug": "upload-media",
    "path": "docs/api/upload-media",
    "file": "routes/docs/upload-media.tsx",
    "title": "PUT media upload",
    "group": "API reference",
    "description": "PUT /v1/media/:id/upload ingests raw MP4 bytes using the issued upload token.",
    "sources": [
      "src/modules/media/media.route.ts",
      "src/modules/media/media.service.ts",
      "src/modules/media/media.types.ts",
      "src/config/storage.ts",
      "src/modules/media/mp4-validator.ts",
      "src/modules/media/media.test.ts",
      "src/app.ts"
    ],
    "endpoint": "PUT /v1/media/:id/upload"
  },
  {
    "slug": "get-media",
    "path": "docs/api/get-media",
    "file": "routes/docs/get-media.tsx",
    "title": "GET media",
    "group": "API reference",
    "description": "GET /v1/media/:id returns the project-owned asset and optional thumbnail availability.",
    "sources": [
      "src/modules/media/media.route.ts",
      "src/modules/media/media.service.ts",
      "src/modules/media/media.types.ts",
      "src/plugins/authenticate.ts",
      "src/modules/auth/auth.service.ts",
      "src/modules/media/media.test.ts",
      "src/modules/media/ffmpeg.service.test.ts"
    ],
    "endpoint": "GET /v1/media/:id"
  },
  {
    "slug": "get-thumbnail",
    "path": "docs/api/get-thumbnail",
    "file": "routes/docs/get-thumbnail.tsx",
    "title": "GET media thumbnail",
    "group": "API reference",
    "description": "GET /v1/media/:id/thumbnail streams the current JPEG to an authenticated project caller.",
    "sources": [
      "src/modules/media/media.route.ts",
      "src/modules/media/media.service.ts",
      "src/modules/media/media.types.ts",
      "src/plugins/authenticate.ts",
      "src/modules/auth/auth.service.ts",
      "src/modules/media/ffmpeg.service.test.ts"
    ],
    "endpoint": "GET /v1/media/:id/thumbnail"
  },
  {
    "slug": "status",
    "path": "docs/project/development-status",
    "file": "routes/docs/status.tsx",
    "title": "Development status",
    "group": "Project",
    "description": "Separate committed implementation, local development, plans and runtime verification.",
    "sources": [
      "src/modules/media/media.route.ts",
      "src/modules/media/media.service.ts",
      "src/modules/media/media.types.ts",
      "src/workers/processor.ts",
      "src/workers/outbox-publisher.ts",
      "src/workers/queue.ts",
      "Readme.md",
      "migrations/001_initial_schema.sql"
    ]
  },
  {
    "slug": "roadmap",
    "path": "docs/project/roadmap",
    "file": "routes/docs/roadmap.tsx",
    "title": "Roadmap",
    "group": "Project",
    "description": "Future directions are not current API capabilities or delivery commitments.",
    "sources": [
      "Readme.md",
      "src/workers/processor.ts",
      "migrations/001_initial_schema.sql"
    ]
  },
  {
    "slug": "contributing",
    "path": "docs/project/contributing",
    "file": "routes/docs/contributing.tsx",
    "title": "Contributing",
    "group": "Project",
    "description": "Prepare a source-specific, sanitized report or proposal without assuming an unverified contribution policy.",
    "sources": [
      "AGENTS.md",
      "package.json",
      "src/test/db-guard.ts"
    ]
  },
  {
    "slug": "stack",
    "path": "docs/project/technology-stack",
    "file": "routes/docs/stack.tsx",
    "title": "Technology stack",
    "group": "Project",
    "description": "Understand each component\u2019s responsibility instead of treating a dependency list as a feature list.",
    "sources": [
      "package.json",
      "compose.yaml",
      "src/app.ts",
      "src/workers/processor.ts",
      "src/workers/outbox-publisher.ts",
      "src/workers/queue.ts"
    ]
  },
  {
    "slug": "limitations",
    "path": "docs/project/known-limitations",
    "file": "routes/docs/limitations.tsx",
    "title": "Known limitations",
    "group": "Project",
    "description": "Read these constraints before attempting onboarding or relying on an API capability.",
    "sources": [
      "src/modules/media/media.route.ts",
      "src/modules/media/media.service.ts",
      "src/modules/media/media.types.ts",
      "package.json",
      "Readme.md",
      "src/modules/health/health.route.ts"
    ]
  }
];
