export const maxVideoBytes = 25 * 1024 * 1024;
export function validateVideo(file: Pick<File, 'name' | 'type' | 'size'>): string {
  if (!/\.mp4$/i.test(file.name) || !['', 'video/mp4', 'application/octet-stream'].includes(file.type)) return 'Choose an MP4 video (.mp4).';
  if (file.size === 0) return 'This file is empty. Choose a video with content.';
  if (file.size > maxVideoBytes) return 'Choose a video no larger than 25 MiB.';
  if (file.name.length > 255) return 'Choose a filename no longer than 255 characters.';
  return '';
}

export type JobState = 'queued' | 'processing' | 'completed' | 'failed' | 'cancelled';
export interface MediaStatus {
  id: string;
  status: 'uploading' | 'ready' | 'failed' | 'deleting' | 'deleted';
  original_filename: string;
  file_size_bytes: number;
  uploaded_bytes: number;
  technical: {
    duration_seconds: number | null; width: number | null; height: number | null;
    video_codec: string | null; audio_codec: string | null; bitrate: number | null; frame_rate: number | null;
  };
  thumbnail: { status: JobState | 'ready' | 'not_found'; url?: string };
  processing: { operation: 'extract_metadata' | 'generate_thumbnail' | 'transcode'; status: JobState }[];
}
export type GetSessionToken = (options: { skipCache: true }) => Promise<string | null>;
export class PlaygroundError extends Error {
  readonly retryable: boolean;
  constructor(message: string, retryable = false) { super(message); this.retryable = retryable; }
}
const sessionError = () => new PlaygroundError('Your Clerk session has expired or is unavailable. Sign in again.');
const invalidResponse = () => new PlaygroundError('The API returned an unexpected response. Check that the Phase 8C backend is running.');
const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const object = (value: unknown): Record<string, unknown> => {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw invalidResponse();
  return value as Record<string, unknown>;
};
const text = (value: unknown): string => { if (typeof value !== 'string') throw invalidResponse(); return value; };
const numeric = (value: unknown): number => {
  if (typeof value !== 'number' || !Number.isFinite(value) || value < 0) throw invalidResponse();
  return value;
};
const nullableNumber = (value: unknown) => value === null ? null : numeric(value);
const nullableText = (value: unknown) => value === null ? null : text(value);
function member<T extends string>(value: unknown, values: readonly T[]): T {
  if (typeof value !== 'string' || !values.includes(value as T)) throw invalidResponse();
  return value as T;
}
const jobStates = ['queued', 'processing', 'completed', 'failed', 'cancelled'] as const;

function cancellable<T>(work: Promise<T>, signal: AbortSignal): Promise<T> {
  signal.throwIfAborted();
  return new Promise((resolve, reject) => {
    const abort = () => reject(new DOMException('Stopped', 'AbortError'));
    signal.addEventListener('abort', abort, { once: true });
    work.then(resolve, reject).finally(() => signal.removeEventListener('abort', abort));
  });
}

export function apiOrigin(raw: string | undefined): string {
  if (!raw?.trim()) throw new PlaygroundError('The local Lumen API is not configured. Set VITE_LUMEN_API_BASE_URL and rebuild.');
  let url: URL;
  try { url = new URL(raw); } catch { throw new PlaygroundError('The Lumen API base URL must be a valid HTTP(S) origin.'); }
  if (url.username || url.password || url.search || url.hash || url.pathname !== '/' ||
      !['http:', 'https:'].includes(url.protocol) ||
      (url.protocol === 'http:' && !['localhost', '127.0.0.1', '[::1]'].includes(url.hostname))) {
    throw new PlaygroundError('Use an HTTPS API origin, or HTTP on localhost/127.0.0.1 for the local demo. Do not include paths or credentials.');
  }
  return url.origin;
}

export function assetUrl(origin: string, id: string, raw: string, kind: 'upload' | 'thumbnail'): string {
  if (!uuid.test(id)) throw invalidResponse();
  const path = kind === 'upload' ? `/v1/media/${id}/upload` : `/v1/browser/media/${id}/thumbnail`;
  const expected = `${origin}${path}`;
  // No normalization, redirects, query credentials, protocol-relative or arbitrary server URLs.
  if (raw !== path && raw !== expected) throw new PlaygroundError('The API returned an unsafe asset URL. No credentials were sent to it.');
  return expected;
}

function httpError(status: number, code: unknown, upload: boolean): PlaygroundError {
  if (upload) {
    if (status === 411 || code === 'content_length_mismatch') return new PlaygroundError('The API could not accept the browser-generated upload length. Browser upload compatibility needs investigation; validation was not bypassed.');
    if (status === 403) return new PlaygroundError('The upload token expired. Do not retry this single-use upload; check its status.');
    if (status === 409) return new PlaygroundError('This upload token is already used or an upload is in progress. Check status instead of uploading again.');
    return new PlaygroundError('The upload could not be confirmed. It may have consumed its single-use token. Check status; do not retry the upload blindly.');
  }
  if (status === 401) return sessionError();
  const messages: Record<string, string> = {
    account_not_linked: 'Your Clerk account is not linked to Lumen. Ask the operator to link your Clerk identity.',
    no_active_project: 'No active project is available. Ask the operator to check your project.',
    project_selection_ambiguous: 'More than one active project is linked. Ask the operator to resolve the project selection.',
  };
  if (typeof code === 'string' && Object.hasOwn(messages, code)) return new PlaygroundError(messages[code]);
  if (status === 404) return new PlaygroundError('This media or thumbnail is unavailable to the current account.');
  if (status === 429 || status >= 500) return new PlaygroundError('The API or authentication provider is temporarily unavailable. Check the local API and try checking status again.', true);
  return new PlaygroundError('The API rejected the request. Check the selected file and local API configuration.');
}

export class PlaygroundApi {
  readonly origin: string;
  private readonly getToken: GetSessionToken;
  private readonly fetcher: typeof fetch;
  constructor(rawOrigin: string | undefined, getToken: GetSessionToken,
    fetcher: typeof fetch = (input, init) => globalThis.fetch(input, init)) {
    this.origin = apiOrigin(rawOrigin); this.getToken = getToken; this.fetcher = fetcher;
  }

  private async request(path: string, signal: AbortSignal, init: RequestInit = {}, uploadToken?: string): Promise<Response> {
    signal.throwIfAborted();
    const requestSignal = AbortSignal.any([signal, AbortSignal.timeout(uploadToken ? 15 * 60_000 : 15_000)]);
    let token = uploadToken;
    if (!token) {
      try { token = await cancellable(this.getToken({ skipCache: true }), requestSignal) ?? undefined; }
      catch { signal.throwIfAborted(); throw sessionError(); }
      if (!token) throw sessionError();
    }
    signal.throwIfAborted();
    try {
      const response = await this.fetcher(`${this.origin}${path}`, {
        ...init, headers: { ...init.headers, Authorization: `Bearer ${token}` },
        signal: requestSignal,
        credentials: 'omit', redirect: 'error', cache: 'no-store', referrerPolicy: 'no-referrer',
      });
      if (!response.ok) {
        let code: unknown;
        try { code = object(await response.json()).error; } catch { /* Ignore untrusted response bodies. */ }
        throw httpError(response.status, code, Boolean(uploadToken));
      }
      return response;
    } catch (error) {
      signal.throwIfAborted();
      if (error instanceof PlaygroundError) throw error;
      throw new PlaygroundError(uploadToken
        ? 'The upload was interrupted or blocked by CORS. Its outcome is uncertain. Check status; do not resend the single-use token.'
        : 'Cannot reach the Lumen API. Check that it is running and that CORS allows this exact website origin.', !uploadToken);
    }
  }

  async project(signal: AbortSignal) {
    const data = object(await (await this.request('/v1/browser/project', signal)).json());
    return { id: text(data.id), name: text(data.name) };
  }

  async register(file: File, signal: AbortSignal) {
    const problem = validateVideo(file);
    if (problem) throw new PlaygroundError(problem);
    const response = await this.request('/v1/browser/media', signal, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ original_filename: file.name, mime_type: 'video/mp4',
        file_size_bytes: file.size, transcoding: { enabled: false } }),
    });
    const data = object(await response.json());
    const id = text(data.id), url = text(data.upload_url), token = text(data.upload_token);
    assetUrl(this.origin, id, url, 'upload');
    if (!token || /\s/.test(token) || !Number.isFinite(Date.parse(text(data.upload_expires_at)))) throw invalidResponse();
    return { id, url, token, expiresAt: Date.parse(data.upload_expires_at as string) };
  }

  async upload(file: File, registration: Awaited<ReturnType<PlaygroundApi['register']>>, signal: AbortSignal) {
    const url = assetUrl(this.origin, registration.id, registration.url, 'upload');
    if (registration.expiresAt <= Date.now()) throw new PlaygroundError('The upload token expired before upload. Check status before registering another upload.');
    // File/Blob bodies have known length; the browser, never JavaScript, sets Content-Length.
    await this.request(url.slice(this.origin.length), signal, {
      method: 'PUT', headers: { 'Content-Type': 'video/mp4' }, body: file,
    }, registration.token);
  }

  async status(id: string, signal: AbortSignal): Promise<MediaStatus> {
    if (!uuid.test(id)) throw invalidResponse();
    const d = object(await (await this.request(`/v1/browser/media/${id}`, signal)).json());
    if (d.id !== id || !Array.isArray(d.processing)) throw invalidResponse();
    const t = object(d.technical), thumb = object(d.thumbnail);
    const thumbnail: MediaStatus['thumbnail'] = { status: member(thumb.status, [...jobStates, 'ready', 'not_found']) };
    if (thumbnail.status === 'ready') {
      thumbnail.url = text(thumb.url);
      assetUrl(this.origin, id, thumbnail.url, 'thumbnail');
    }
    return {
      id, status: member(d.status, ['uploading', 'ready', 'failed', 'deleting', 'deleted']),
      original_filename: text(d.original_filename), file_size_bytes: numeric(d.file_size_bytes), uploaded_bytes: numeric(d.uploaded_bytes),
      technical: {
        duration_seconds: nullableNumber(t.duration_seconds), width: nullableNumber(t.width), height: nullableNumber(t.height),
        video_codec: nullableText(t.video_codec), audio_codec: nullableText(t.audio_codec),
        bitrate: nullableNumber(t.bitrate), frame_rate: nullableNumber(t.frame_rate),
      },
      thumbnail,
      processing: d.processing.map(value => {
        const job = object(value);
        return { operation: member(job.operation, ['extract_metadata', 'generate_thumbnail', 'transcode']), status: member(job.status, jobStates) };
      }),
    };
  }

  async thumbnail(id: string, rawUrl: string, signal: AbortSignal): Promise<Blob> {
    const url = assetUrl(this.origin, id, rawUrl, 'thumbnail');
    const response = await this.request(url.slice(this.origin.length), signal);
    if (response.headers.get('content-type')?.split(';')[0] !== 'image/jpeg') throw invalidResponse();
    const blob = await response.blob();
    if (!blob.size) throw invalidResponse();
    return blob;
  }
}

export function safeError(error: unknown): string {
  return error instanceof PlaygroundError ? error.message : 'The API response could not be read. Check your connection and API version; do not blindly retry a registration or upload.';
}
