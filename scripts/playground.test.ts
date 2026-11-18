import { test } from 'node:test';
import assert from 'node:assert/strict';
import { PlaygroundApi, PlaygroundError, apiOrigin, assetUrl, safeError, validateVideo, maxVideoBytes, type MediaStatus } from '../app/product/playground-api.ts';
import { pollMedia, ThumbnailUrl, formatMetadata } from '../app/product/playground-flow.ts';

const origin = 'http://127.0.0.1:3000';
const id = '01900000-0000-7000-8000-000000000001';
const signal = () => new AbortController().signal;
const file = () => new File(['actual file bytes'], 'clip.mp4', { type: 'video/mp4' });
const data = (): MediaStatus => ({
  id, status: 'ready', original_filename: 'clip.mp4', file_size_bytes: 1048576, uploaded_bytes: 1048576,
  technical: { duration_seconds: 1.25, width: 640, height: 360, video_codec: 'h264', audio_codec: null, bitrate: 500000, frame_rate: 29.97 },
  thumbnail: { status: 'ready', url: `/v1/browser/media/${id}/thumbnail` },
  processing: [{ operation: 'extract_metadata', status: 'completed' }, { operation: 'generate_thumbnail', status: 'completed' }],
});
const json = (value: unknown, status = 200) => new Response(JSON.stringify(value), { status, headers: { 'Content-Type': 'application/json' } });
const registration = () => ({ id, upload_url: `/v1/media/${id}/upload`, upload_token: 'test-upload-capability',
  upload_expires_at: new Date(Date.now() + 60000).toISOString() });

test('validates MP4 extension, MIME, empty files, filename and 25 MiB limit', () => {
  assert.equal(validateVideo(file()), '');
  assert.equal(validateVideo({ name: 'clip.MP4', type: '', size: maxVideoBytes }), '');
  for (const f of [
    { name: 'clip.mov', type: 'video/mp4', size: 1 }, { name: 'clip.mp4', type: 'text/plain', size: 1 },
    { name: 'clip.mp4', type: 'video/mp4', size: 0 }, { name: 'clip.mp4', type: 'video/mp4', size: maxVideoBytes + 1 },
    { name: 'a'.repeat(256) + '.mp4', type: 'video/mp4', size: 1 },
  ]) assert.notEqual(validateVideo(f), '');
});

test('validates the configured API origin and exact same-origin asset routes', () => {
  assert.equal(apiOrigin(origin + '/'), origin);
  for (const raw of [undefined, '', 'file:///tmp/api', 'http://example.com', origin + '/v1', 'https://user:secret@example.com']) {
    assert.throws(() => apiOrigin(raw), PlaygroundError);
  }
  for (const raw of [`https://evil.test/v1/media/${id}/upload`, `//evil.test/v1/media/${id}/upload`,
    `/v1/media/${id}/upload?token=secret`, `${origin}/other`, `/v1/media/${id}/a/../upload`]) {
    assert.throws(() => assetUrl(origin, id, raw, 'upload'), /unsafe/);
  }
  assert.equal(assetUrl(origin, id, registration().upload_url, 'upload'), origin + registration().upload_url);
  assert.throws(() => assetUrl(origin, 'not-an-id', '/upload', 'upload'));
});

test('acquires fresh Clerk tokens, checks project, registers without authority IDs and uploads exact File bytes', async () => {
  const calls: { url: string; init: RequestInit }[] = [];
  let tokens = 0;
  const f = file();
  const api = new PlaygroundApi(origin, async options => {
    assert.deepEqual(options, { skipCache: true }); return `test-session-${++tokens}`;
  }, async (url, init) => {
    calls.push({ url: String(url), init: init! });
    return calls.length === 1 ? json({ id: 'project', name: 'Playground' }) : calls.length === 2 ? json(registration(), 201) : json({});
  });
  assert.deepEqual(await api.project(signal()), { id: 'project', name: 'Playground' });
  const registered = await api.register(f, signal());
  await api.upload(f, registered, signal());
  assert.equal(tokens, 2); // Upload uses its capability, not a Clerk JWT.
  assert.equal(calls[0].url, origin + '/v1/browser/project');
  assert.equal(calls[1].url, origin + '/v1/browser/media');
  assert.deepEqual(JSON.parse(String(calls[1].init.body)), {
    original_filename: 'clip.mp4', mime_type: 'video/mp4', file_size_bytes: f.size, transcoding: { enabled: false },
  });
  assert.equal(calls[2].init.method, 'PUT');
  assert.equal(calls[2].init.body, f);
  const headers = new Headers(calls[2].init.headers);
  assert.equal(headers.get('authorization'), 'Bearer test-upload-capability');
  assert.equal(headers.get('content-type'), 'video/mp4');
  assert.equal(headers.has('content-length'), false); // Browser owns this forbidden header.
  for (const c of calls) {
    assert.equal(c.init.credentials, 'omit'); assert.equal(c.init.redirect, 'error');
    assert.equal(c.init.referrerPolicy, 'no-referrer'); assert.equal(c.init.cache, 'no-store');
  }
});

test('null or rejected Clerk sessions never make API requests', async () => {
  for (const getToken of [async () => null, async (): Promise<string> => { throw new Error('private session'); }]) {
    const api = new PlaygroundApi(origin, getToken, async () => { assert.fail('No unauthenticated request'); });
    await assert.rejects(api.project(signal()), /session has expired/);
  }
});

test('cancellation interrupts stalled Clerk token acquisition before any network request', async () => {
  const controller = new AbortController();
  const api = new PlaygroundApi(origin, () => new Promise(() => {}), async () => { assert.fail('No request after cancellation'); });
  const pending = api.project(controller.signal);
  controller.abort();
  await assert.rejects(pending, { name: 'AbortError' });
});

test('unsafe registration and thumbnail URLs cannot exfiltrate either credential', async () => {
  let requests = 0;
  const api = new PlaygroundApi(origin, async () => 'session', async () => {
    requests++; return json({ ...registration(), upload_url: 'https://evil.test/upload' });
  });
  await assert.rejects(api.register(file(), signal()), /unsafe/);
  await assert.rejects(api.thumbnail(id, 'https://evil.test/thumb.jpg', signal()), /unsafe/);
  assert.equal(requests, 1);
});

test('expired upload capabilities fail before network I/O', async () => {
  const api = new PlaygroundApi(origin, async () => 'session', async () => { assert.fail('No expired upload'); });
  await assert.rejects(api.upload(file(), { id, url: registration().upload_url, token: 'test', expiresAt: 0 }, signal()), /expired/);
});

test('curates status fields and fetches JPEGs with a fresh Clerk token', async () => {
  let calls = 0;
  const api = new PlaygroundApi(origin, async () => 'fresh-session', async (url, init) => {
    calls++;
    assert.equal(new Headers(init!.headers).get('authorization'), 'Bearer fresh-session');
    if (calls === 1) return json({ ...data(), metadata: { secret: true }, storage_key: '/private', account_id: 'private' });
    assert.equal(String(url), origin + `/v1/browser/media/${id}/thumbnail`);
    return new Response(new Uint8Array([255, 216, 255, 217]), { headers: { 'content-type': 'image/jpeg' } });
  });
  const status = await api.status(id, signal());
  assert.deepEqual(status, data());
  assert.equal((await api.thumbnail(id, status.thumbnail.url!, signal())).type, 'image/jpeg');
});

test('malformed status or a non-JPEG thumbnail is rejected without exposing raw response details', async () => {
  const api = new PlaygroundApi(origin, async () => 'session', async () => json({ secret: 'private' }));
  await assert.rejects(api.status(id, signal()), PlaygroundError);
  await assert.rejects(api.thumbnail(id, `/v1/browser/media/${id}/thumbnail`, signal()), PlaygroundError);
  assert.doesNotMatch(safeError(new Error('private token')), /private token/);
});

for (const [status, code, message] of [
  [401, 'unauthorized', /session has expired/],
  [403, 'account_not_linked', /not linked/],
  [403, 'no_active_project', /No active project/],
  [409, 'project_selection_ambiguous', /More than one active/],
  [503, 'authentication_unavailable', /temporarily unavailable/],
] as const) {
  test(`sanitizes API error ${status} ${code}`, async () => {
    const api = new PlaygroundApi(origin, async () => 'session', async () => json({ error: code, message: 'private raw error' }, status));
    await assert.rejects(api.project(signal()), message);
  });
}

test('network/CORS and browser upload-length failures have actionable, non-secret messages', async () => {
  const api = new PlaygroundApi(origin, async () => 'session', async () => { throw new Error('private URL and token'); });
  await assert.rejects(api.project(signal()), /CORS/);
  const uploadApi = new PlaygroundApi(origin, async () => 'session', async () => json({ error: 'length_required' }, 411));
  await assert.rejects(uploadApi.upload(file(), { id, url: registration().upload_url, token: 'secret', expiresAt: Date.now() + 1000 }, signal()), /browser-generated upload length/);
});

test('polling does not confuse upload ready with processing completion or overlap requests', async () => {
  let calls = 0, active = 0, maxActive = 0;
  const result = await pollMedia({ status: async () => {
    maxActive = Math.max(maxActive, ++active);
    const status = data();
    if (++calls === 1) status.processing[1].status = 'processing';
    await Promise.resolve(); active--; return status;
  } }, id, signal(), () => {}, { intervalMs: 1, timeoutMs: 1000 });
  assert.equal(calls, 2); assert.equal(maxActive, 1);
  assert.equal(result.processing[1].status, 'completed');
});

test('polling stops on terminal failures and retries bounded transient read failures', async () => {
  let calls = 0;
  await pollMedia({ status: async () => {
    if (++calls < 3) throw new PlaygroundError('temporary', true);
    return data();
  } }, id, signal(), () => {}, { intervalMs: 1, timeoutMs: 1000 });
  assert.equal(calls, 3);
  await assert.rejects(pollMedia({ status: async () => {
    const status = data(); status.processing[0].status = 'failed'; return status;
  } }, id, signal(), () => {}), /processing failed/);
});

test('abort stops waiting/in-flight polling without stale results; deadline is bounded', async () => {
  const controller = new AbortController();
  let reads = 0;
  const polling = pollMedia({ status: async () => {
    reads++; const status = data(); status.processing = []; return status;
  } }, id, controller.signal, () => { controller.abort(); }, { intervalMs: 1 });
  await assert.rejects(polling, { name: 'AbortError' });
  assert.equal(reads, 1);
  let emitted = 0;
  const second = new AbortController();
  await assert.rejects(pollMedia({ status: async () => {
    second.abort(); return data();
  } }, id, second.signal, () => { emitted++; }), { name: 'AbortError' });
  assert.equal(emitted, 0);
  await assert.rejects(pollMedia({ status: async () => ({ ...data(), processing: [] }) },
    id, signal(), () => {}, { intervalMs: 1, timeoutMs: 5 }), /not been confirmed/);
});

test('thumbnail object URLs are revoked on replacement/cleanup and never created after cancellation', () => {
  const urls = new ThumbnailUrl();
  const blob = new Blob(['jpeg'], { type: 'image/jpeg' });
  const create = URL.createObjectURL, revoke = URL.revokeObjectURL;
  const revoked: string[] = []; let count = 0;
  URL.createObjectURL = () => `blob:test-${++count}`; URL.revokeObjectURL = url => { revoked.push(url); };
  try {
    assert.equal(urls.replace(blob, signal()), 'blob:test-1');
    urls.replace(blob, signal()); urls.clear(); urls.clear();
    assert.deepEqual(revoked, ['blob:test-1', 'blob:test-2']);
    assert.throws(() => urls.replace(blob, AbortSignal.abort()), { name: 'AbortError' });
    assert.equal(count, 2);
  } finally { URL.createObjectURL = create; URL.revokeObjectURL = revoke; }
});

test('formats available metadata with units and honest missing-value placeholders', () => {
  const fields = formatMetadata(data());
  assert.equal(fields.find(f => f.label === 'Resolution')!.value, '640 × 360');
  assert.equal(fields.find(f => f.label === 'Bitrate')!.value, '500 kb/s');
  assert.equal(fields.find(f => f.label === 'Audio codec')!.value, 'Not available');
  assert.equal(fields.find(f => f.label === 'Duration')!.value, '1.25 s');
});
