import { test, expect } from "@playwright/test";
import { readFile, readdir } from "node:fs/promises";
import { basePath, documents } from "../site.config";
const installation = documents.find(doc => doc.slug === 'installation')!;
const processing = documents.find(doc => doc.slug === 'processing')!;
const path = (doc: typeof installation) => `${basePath}${doc.path}/`;

test("all documents have static HTML and representative routes refresh without JS", async ({ request, browser }) => {
  for (const doc of documents) {
    const html=await readFile(`build/client/${doc.path}/index.html`,'utf8');
    expect(html).toContain(doc.title);
    expect((await request.get(path(doc))).status()).toBe(200);
  }
  const context=await browser.newContext({javaScriptEnabled:false});
  const page=await context.newPage();
  for(const doc of [installation,processing]) {
    await page.goto(`http://127.0.0.1:4173${path(doc)}`);
    await expect(page.locator('article h1')).toHaveText(doc.title);
    expect((await page.reload())?.status()).toBe(200);
    for(const element of await page.locator('[src],link[href],nav a').all()) {
      const url=await element.getAttribute('src')??await element.getAttribute('href');
      if(!url||url.startsWith('https://github.com/'))continue;
      if(url.startsWith('#')){expect(await page.locator(url).count()).toBeGreaterThan(0);continue;}
      expect(url).toMatch(/^\/lumen-web\//);
      expect((await request.get(url)).status(),url).toBe(200);
    }
    const redirect=await request.get(path(doc).slice(0,-1),{maxRedirects:0});
    expect(redirect.status()).toBe(301);
  }
  expect((await request.get(`${basePath}docs/missing/`)).status()).toBe(404);
  expect((await request.get('/assets/missing.js')).status()).toBe(404);
  expect((await readdir('build')).sort()).toEqual(['client']);
  await context.close();
});

test("MDX hydrates with copy, highlighting, anchors, history and client navigation",async({page,context})=>{
  const errors:string[]=[];
  page.on('pageerror',error=>errors.push(error.message));
  page.on('console',message=>{if(message.type()==='error')errors.push(message.text());});
  page.on('response',response=>{if(response.status()>=400)errors.push(`${response.status()} ${response.url()}`);});
  await context.grantPermissions(['clipboard-read','clipboard-write']);
  await page.goto(`${path(installation)}#prepare-the-environment`);
  await expect(page.locator('html')).toHaveAttribute('data-hydrated','true');
  await expect(page.locator('#prepare-the-environment')).toBeInViewport();
  expect((await page.reload())?.status()).toBe(200);
  await page.getByRole('button',{name:'Copy code',exact:true}).first().click();
  await expect(page.getByRole('status').first()).toHaveText('Copied');
  expect(await page.evaluate(()=>navigator.clipboard.readText())).toContain('npm ci');
  const light=await page.locator('pre.shiki').first().evaluate(el=>getComputedStyle(el).backgroundColor);
  await page.getByRole('combobox',{name:'Theme',exact:true}).selectOption('dark');
  const dark=await page.locator('pre.shiki').first().evaluate(el=>getComputedStyle(el).backgroundColor);
  expect(dark).not.toBe(light);
  await page.evaluate(()=>{(window as Window & {marker?:boolean}).marker=true;});
  await page.locator('.docs-sidebar').getByRole('link',{name:processing.title,exact:true}).click();
  await expect(page).toHaveURL(path(processing));
  expect(await page.evaluate(()=>(window as Window & {marker?:boolean}).marker)).toBe(true);
  await expect(page.locator('main')).toBeFocused();
  await page.goBack();await expect(page.locator('article h1')).toHaveText(installation.title);
  await page.goForward();await expect(page.locator('article h1')).toHaveText(processing.title);
  expect(errors).toEqual([]);
});

test("Pagefind returns real documentation and excludes site chrome",async({page})=>{
  const failures:string[]=[];
  page.on('pageerror',error=>failures.push(error.message));
  page.on('requestfailed',request=>failures.push(request.url()));
  await page.goto(basePath);
  await page.getByRole('button',{name:'Search documentation',exact:true}).click();
  const dialog=page.getByRole('dialog',{name:'Search documentation'});
  await dialog.getByRole('searchbox').fill('Content-Length');
  await dialog.getByRole('searchbox').press('Enter');
  await expect(dialog.locator('li a').first()).toBeVisible();
  for(const link of await dialog.locator('li a').all())await expect(link).toHaveAttribute('href',/^\/lumen-web\/docs\//);
  const firstResult=dialog.locator('li a').first();
  await firstResult.focus();
  await expect(firstResult).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(page.locator('article')).toContainText('Content-Length');
  await page.getByRole('button',{name:'Search documentation',exact:true}).click();
  await dialog.getByRole('searchbox').fill('"Website source"');
  await dialog.getByRole('button',{name:'Search',exact:true}).click();
  await expect(dialog.getByRole('status')).toHaveText('No results. Try another term.');
  expect(failures).toEqual([]);
});
