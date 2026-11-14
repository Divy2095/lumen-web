import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { readFile } from "node:fs/promises";
import { basePath, docsPath } from "../site.config";

const home = 'http://127.0.0.1:4173' + basePath;

test("landing content and verified examples are prerendered and readable without JS", async ({ browser }) => {
  const html = await readFile('build/client/index.html', 'utf8');
  expect(html).toContain('Video processing,');
  expect(html).toContain('sample-video.mp4');
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  await page.goto(home);
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Video processing,through an API.');
  for (const id of ['product-preview','capabilities','developer-experience','architecture','getting-started']) await expect(page.locator(`#${id}`)).toBeVisible();
  await expect(page.getByRole('link', { name: 'Get Started', exact: true })).toHaveAttribute('href', `${basePath}${docsPath.slice(1)}`);
  await expect(page.locator('#project-status')).toContainText('absent from the inspected commit');
  await expect(page.locator('#project-status')).toContainText('not yet runtime-verified');
  await page.getByText('201 response · illustrative values', { exact: true }).click();
  const responseText = await page.locator('.api-response pre').textContent();
  const response = JSON.parse(responseText!);
  expect(Object.keys(response).sort()).toEqual(['id','project_id','status','original_filename','mime_type','file_size_bytes','uploaded_bytes','upload_token','upload_url','upload_expires_at','created_at'].sort());
  expect(response.status).toBe('uploading');
  expect(response.uploaded_bytes).toBe(0);
  expect(response.upload_url).toBe('/v1/media/<asset-id>/upload');
  const requests = await page.locator('.api-step-code > .code-block pre').allTextContents();
  expect(requests[0]).toContain('$LUMEN_ORIGIN/v1/media');
  expect(requests[0]).toContain('Authorization: Bearer $LUMEN_API_KEY');
  expect(requests[0]).toContain('file_size_bytes');
  expect(requests[1]).toContain('Authorization: Bearer $UPLOAD_TOKEN');
  expect(requests[1]).toContain('Content-Length: $FILE_SIZE');
  expect(requests[1]).toContain('--data-binary "@$FILE"');
  await expect(page.locator('#product-preview')).toContainText('Ingestion complete does not mean processing is finished.');
  await expect(page.locator('#product-preview')).toContainText('In development');
  for(const name of ['Metadata','Thumbnail','Renditions']) await expect(page.locator('#product-preview').getByRole('heading',{name,exact:true})).toBeVisible();
  await expect(page.getByRole('button',{name:'Play simulation'})).toHaveCount(0);
  await context.close();
});

test("pipeline play/pause/replay preserves independent states and never calls an API", async ({ page }) => {
  await page.clock.install();
  const unexpected: string[] = [];
  page.on('request', req => { if (!req.url().startsWith(home) || /\/v1\//.test(req.url())) unexpected.push(req.url()); });
  await page.goto(basePath+'docs/guides/processing/');
  const pipeline = page.locator('#pipeline');
  const values = pipeline.locator('.pipeline-states strong');
  await pipeline.getByRole('button', { name: 'Play simulation', exact: true }).click();
  await expect(values).toHaveText(['uploading','not queued','not queued']);
  for (let step=0;step<3;step++) await page.clock.runFor(1200);
  await expect(values).toHaveText(['ready','queued','queued']);
  await pipeline.getByRole('button', { name: 'Pause simulation' }).click();
  await page.clock.fastForward(8000);
  await expect(values).toHaveText(['ready','queued','queued']);
  await expect(pipeline.getByRole('status')).toContainText('paused');
  await pipeline.getByRole('button', { name: 'Resume simulation' }).click();
  for (let step=0;step<3;step++) await page.clock.runFor(1200);
  await expect(values).toHaveText(['ready','completed','processing']);
  for (let step=0;step<2;step++) await page.clock.runFor(1200);
  await expect(values).toHaveText(['ready','completed','completed']);
  await expect(pipeline.getByRole('button', { name: 'Replay simulation' })).toBeVisible();
  await expect(pipeline.getByRole('status')).toContainText('Simulation complete');
  await pipeline.getByRole('button', { name: 'Replay simulation' }).click();
  await expect(values).toHaveText(['uploading','not queued','not queued']);
  await pipeline.getByRole('button', { name: 'Reset simulation' }).click();
  await expect(values).toHaveText(['ready','independent','independent']);
  expect(unexpected).toEqual([]);
});

test("reduced motion offers the complete static flow and keyboard activation works", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto(basePath+'docs/guides/processing/');
  const pipeline = page.locator('#pipeline');
  await expect(pipeline).toContainText('Reduced motion: static overview.');
  await expect(pipeline.getByRole('button', { name: 'Play simulation' })).toHaveCount(0);
  await expect(pipeline.getByRole('heading', { name: 'Extract metadata', exact: true })).toBeVisible();
  await expect(pipeline.getByRole('heading', { name: 'Generate thumbnail', exact: true })).toBeVisible();
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  const play = pipeline.getByRole('button', { name: 'Play simulation' });
  await play.focus();
  await page.keyboard.press('Enter');
  await expect(pipeline.getByRole('button', { name: 'Pause simulation' })).toBeFocused();
  await page.keyboard.press('Space');
  await expect(pipeline.getByRole('button', { name: 'Resume simulation' })).toBeFocused();
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await expect(pipeline).toContainText('Reduced motion: static overview.');
  await expect(pipeline.locator('.pipeline-states strong')).toHaveText(['ready','independent','independent']);
});

test("landing reflows, supports both themes and copyable API commands", async ({ page, context }) => {
  await context.grantPermissions(['clipboard-read','clipboard-write']);
  const errors: string[] = [];
  page.on('pageerror', error=>errors.push(error.message));
  await page.goto(basePath);
  await page.locator('.api-step-code').first().getByRole('button',{name:'Copy code'}).click();
  expect(await page.evaluate(()=>navigator.clipboard.readText())).toContain('Authorization: Bearer $LUMEN_API_KEY');
  for (const width of [320,375,768,1024,1440]) {
    await page.setViewportSize({ width, height:900 });
    expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
  }
  for (const theme of ['light','dark']) {
    await page.getByRole('combobox',{name:'Theme'}).selectOption(theme);
    await expect(page.locator('html')).toHaveAttribute('data-theme',theme);
  }
  await page.setViewportSize({width:320,height:812});
  await page.addStyleTag({ content: 'html {font-size:200%}' });
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
  expect(errors).toEqual([]);
});

test("landing has no automated accessibility violations on desktop/mobile in both themes", async ({ page }) => {
  await page.goto(basePath);
  await page.getByText('201 response · illustrative values', { exact:true }).click();
  for (const width of [1440,375]) {
    await page.setViewportSize({width,height:1000});
    for (const theme of ['light','dark']) {
      await page.getByRole('combobox',{name:'Theme'}).selectOption(theme);
      expect((await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa','wcag22aa']).analyze()).violations).toEqual([]);
    }
  }
});
