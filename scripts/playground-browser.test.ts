import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { stripTypeScriptTypes } from 'node:module';
import { chromium } from '@playwright/test';
import { build } from 'vite';

const id = '01900000-0000-7000-8000-000000000001';
const origin = 'http://127.0.0.1:3000';
const website = 'http://127.0.0.1:4173';

declare global {
  interface Window { playgroundUrls: { created: string[]; revoked: string[] } }
}

async function uiFixture(options: { pending?: boolean; denied?: boolean; uploadFailure?: boolean } = {}) {
  const result = await build({
    configFile: false, logLevel: 'silent',
    define: { 'import.meta.env.VITE_LUMEN_API_BASE_URL': JSON.stringify(origin), 'process.env.NODE_ENV': '"production"' },
    build: { write: false, lib: { entry: 'scripts/fixtures/playground-harness.tsx', formats: ['es'] }, minify: false },
  });
  const bundle = Array.isArray(result) ? result[0] : result;
  if (!('output' in bundle)) throw new Error('Unexpected watcher');
  const output = bundle.output;
  const chunk = output.find(entry => entry.type === 'chunk' && entry.isEntry);
  if (!chunk || chunk.type !== 'chunk') throw new Error('Missing test bundle');
  const browser = await chromium.launch();
  const page = await browser.newPage();
  page.setDefaultTimeout(5000);
  page.on('pageerror', error => console.error('Offline harness error:', error.message));
  const jpeg = await page.evaluate(() => {
    const canvas = document.createElement('canvas'); canvas.width = 2; canvas.height = 2;
    return canvas.toDataURL('image/jpeg').split(',')[1];
  });
  const calls: { method: string; path: string; authorization: string | undefined }[] = [];
  await page.addInitScript(() => {
    window.playgroundUrls = { created: [], revoked: [] };
    const create = URL.createObjectURL, revoke = URL.revokeObjectURL;
    URL.createObjectURL = blob => { const url = create(blob); window.playgroundUrls.created.push(url); return url; };
    URL.revokeObjectURL = url => { window.playgroundUrls.revoked.push(url); revoke(url); };
  });
  await page.route('**/*', async route => {
    const request = route.request(), url = new URL(request.url());
    if (url.origin === website && url.pathname === '/') return route.fulfill({
      contentType: 'text/html', body: '<!doctype html><title>Offline UI</title><div id="root"></div><script type="module" src="/harness.js"></script>',
    });
    if (url.origin === website && url.pathname === '/harness.js') return route.fulfill({ contentType: 'text/javascript', body: chunk.code });
    if (url.origin !== origin) return route.abort();
    const headers = { 'access-control-allow-origin': website, 'access-control-allow-methods': 'GET,POST,PUT',
      'access-control-allow-headers': 'authorization,content-type' };
    if (request.method() === 'OPTIONS') return route.fulfill({ status: 204, headers });
    calls.push({ method: request.method(), path: url.pathname, authorization: (await request.allHeaders()).authorization });
    if (options.denied) return route.fulfill({ status: 401, headers, json: { error: 'unauthorized', message: 'private raw details' } });
    if (url.pathname === '/v1/browser/project') return route.fulfill({ headers, json: { id: 'project', name: 'Demo project' } });
    if (url.pathname === '/v1/browser/media') return route.fulfill({ status: 201, headers, json: {
      id, upload_url: `/v1/media/${id}/upload`, upload_token: 'test-upload-capability', upload_expires_at: new Date(Date.now() + 60000).toISOString(),
    } });
    if (url.pathname.endsWith('/upload')) return route.fulfill({ status: options.uploadFailure ? 409 : 200, headers, json: {} });
    if (url.pathname.endsWith('/thumbnail')) return route.fulfill({ headers: { ...headers, 'content-type': 'image/jpeg' },
      body: Buffer.from(jpeg, 'base64') });
    return route.fulfill({ headers, json: {
      id, status: 'ready', original_filename: 'clip.mp4', file_size_bytes: 10, uploaded_bytes: 10,
      technical: { duration_seconds: 2, width: 640, height: 360, video_codec: 'h264', audio_codec: null, bitrate: 500000, frame_rate: 30 },
      thumbnail: { status: options.pending ? 'processing' : 'ready', url: `/v1/browser/media/${id}/thumbnail` },
      processing: [{ operation: 'extract_metadata', status: 'completed' },
        { operation: 'generate_thumbnail', status: options.pending ? 'processing' : 'completed' }],
    } });
  });
  await page.goto(website);
  return { page, browser, calls };
}

test('Chromium sends the raw File and upload capability through mocked transport, without a server listener', { timeout: 30000 }, async () => {
  const module = stripTypeScriptTypes(await readFile('app/product/playground-api.ts', 'utf8'));
  const browser = await chromium.launch();
  try {
    const page = await browser.newPage();
    const id = '01900000-0000-7000-8000-000000000001';
    const origin = 'http://127.0.0.1:3000';
    const website = 'http://127.0.0.1:4173';
    let uploadLength: string | undefined;
    let uploaded: Buffer | null = null;
    let authorization = '';
    await page.route('**/*', async route => {
      const request = route.request(), url = request.url();
      if (url === website + '/') return route.fulfill({ contentType: 'text/html', body: '<!doctype html><title>Offline upload check</title>' });
      if (url === website + '/api.js') return route.fulfill({ contentType: 'text/javascript', body: module });
      const headers = { 'access-control-allow-origin': website,
        'access-control-allow-methods': 'POST,PUT,GET', 'access-control-allow-headers': 'authorization,content-type' };
      if (request.method() === 'OPTIONS') return route.fulfill({ status: 204, headers });
      if (url === origin + '/v1/browser/media') return route.fulfill({
        status: 201, headers, json: { id, upload_token: 'test-upload-capability', upload_url: `/v1/media/${id}/upload`,
          upload_expires_at: new Date(Date.now() + 60000).toISOString() },
      });
      if (url === origin + `/v1/media/${id}/upload`) {
        const all = await request.allHeaders();
        uploadLength = all['content-length']; authorization = all.authorization;
        uploaded = request.postDataBuffer();
        return route.fulfill({ status: 200, headers, json: {} });
      }
      return route.abort();
    });
    await page.goto(website);
    const length = await page.evaluate(async ({ website, origin }) => {
      const { PlaygroundApi } = await import(website + '/api.js');
      const api = new PlaygroundApi(origin, async () => 'test-session');
      const file = new File([new Uint8Array([0, 0, 0, 16, 102, 116, 121, 112, 105, 115, 111, 109, 0, 0, 0, 0])],
        'clip.mp4', { type: 'video/mp4' });
      const signal = new AbortController().signal;
      const registered = await api.register(file, signal);
      await api.upload(file, registered, signal);
      return file.size;
    }, { website, origin });
    // Interception can precede transport-generated headers. This is NOT a wire-level length proof.
    if (uploadLength !== undefined) assert.equal(Number(uploadLength), length);
    assert.equal((uploaded as Buffer | null)?.length, length);
    assert.equal(authorization, 'Bearer test-upload-capability');
  } finally { await browser.close(); }
});

test('offline UI displays real DTO fields and authenticated blob URLs, then revokes on unmount', { timeout: 30000 }, async () => {
  const f = await uiFixture();
  try {
    await f.page.getByRole('heading', { name: 'Video results' }).waitFor();
    await f.page.getByText('Metadata and thumbnail jobs completed.', { exact: true }).waitFor();
    assert.equal(await f.page.getByText('640 × 360', { exact: true }).count(), 1);
    assert.equal(await f.page.getByText('Not available', { exact: true }).count(), 1);
    assert.match(await f.page.locator('img').getAttribute('src') ?? '', /^blob:/);
    await f.page.waitForFunction(() => (document.querySelector('img')?.naturalWidth ?? 0) > 0);
    assert.equal(f.calls.find(c => c.path.endsWith('/thumbnail'))?.authorization, 'Bearer test-session');
    await f.page.getByRole('button', { name: 'Unmount playground' }).click();
    const urls = await f.page.evaluate(() => window.playgroundUrls);
    assert.equal(urls.created.length, 1); assert.deepEqual(urls.revoked, urls.created);
  } finally { await f.browser.close(); }
});

test('offline UI cancels polling on stop and file replacement without stale requests', { timeout: 30000 }, async () => {
  const f = await uiFixture({ pending: true });
  try {
    await f.page.getByRole('heading', { name: 'Video results' }).waitFor();
    await f.page.getByRole('button', { name: 'Stop waiting' }).click();
    await f.page.getByText(/Stopped waiting in this browser/).waitFor();
    const reads = f.calls.filter(c => c.path === `/v1/browser/media/${id}`).length;
    await f.page.waitForTimeout(2200);
    assert.equal(f.calls.filter(c => c.path === `/v1/browser/media/${id}`).length, reads);
    await f.page.getByRole('button', { name: 'Check status again' }).click();
    await f.page.getByRole('button', { name: 'New file' }).click();
    await f.page.waitForFunction(() => document.body.textContent?.includes('Upload received.'));
    await f.page.getByRole('button', { name: 'Unmount playground' }).click();
    const all = f.calls.length;
    await f.page.waitForTimeout(2200);
    assert.equal(f.calls.length, all);
  } finally { await f.browser.close(); }
});

test('offline UI handles expired sessions and never retries a failed one-time upload', { timeout: 30000 }, async () => {
  const denied = await uiFixture({ denied: true });
  try {
    await denied.page.getByRole('alert').getByText(/session has expired/).waitFor();
    assert.equal(denied.calls.length, 1);
    assert.doesNotMatch(await denied.page.locator('body').innerText(), /private raw details|test-session/);
  } finally { await denied.browser.close(); }
  const f = await uiFixture({ uploadFailure: true });
  try {
    await f.page.getByRole('alert').getByText(/token is already used/).waitFor();
    await f.page.getByRole('button', { name: 'Check status again' }).click();
    await f.page.getByText('Metadata and thumbnail jobs completed.', { exact: true }).waitFor();
    assert.equal(f.calls.filter(c => c.method === 'POST').length, 1);
    assert.equal(f.calls.filter(c => c.method === 'PUT').length, 1);
  } finally { await f.browser.close(); }
});
