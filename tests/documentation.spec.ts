import { test,expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { basePath,documents } from '../site.config';

test('Pagefind search covers every published documentation URL',async({page})=>{
 await page.goto(basePath+'docs/');
 const queries=documents.map(doc=>({title:doc.title,url:basePath+doc.path+'/'}));
 const coverage=await page.evaluate(async queries=>{
  const url='/lumen-web/pagefind/pagefind.js';
  const pagefind=await import(url);
  const missing:string[]=[];
  for(const query of queries){
   const response=await pagefind.search(query.title);
   const data=await Promise.all(response.results.map((result:{data:()=>Promise<{url:string;content:string}>})=>result.data()));
   if(!data.some((result:{url:string})=>result.url.split('#')[0]===query.url))missing.push(query.url);
   for(const result of data){if(result.content?.includes('Website source'))throw Error('Footer leaked into indexed content');}
  }
  return missing;
 },queries);
 expect(coverage).toEqual([]);
});

test('navigation, generated contents and previous/next match the manifest',async({page})=>{
 await page.goto(basePath+'docs/');
 const sidebar=page.locator('.docs-sidebar');
 await expect(sidebar.getByRole('link')).toHaveCount(documents.length);
 await sidebar.getByRole('link',{name:'POST media',exact:true}).click();
 await expect(page.locator('article h1')).toHaveText('POST media');
 await expect(sidebar.getByRole('link',{name:'POST media',exact:true})).toHaveAttribute('aria-current','page');
 await page.locator('.docs-toc').getByRole('link',{name:'Response fields',exact:true}).click();
 await expect(page.locator('#response-fields')).toBeInViewport();
 await expect(page.getByRole('navigation',{name:'Breadcrumb'})).toContainText('API reference');
 await page.getByRole('navigation',{name:'Article pagination'}).getByRole('link').last().click();
 await expect(page.locator('article h1')).toHaveText('PUT media upload');
 await page.reload();await expect(page.locator('article h1')).toHaveText('PUT media upload');
});

test('hydration preserves a sidebar link pressed before client initialization',async({page})=>{
 let release!:()=>void;
 const hydration=new Promise<void>(resolve=>{release=resolve;});
 await page.route('**/assets/*.js',async route=>{await hydration;await route.continue();});
 try {
  await page.goto(basePath+'docs/',{waitUntil:'commit'});
  const link=page.locator('.docs-sidebar').getByRole('link',{name:'POST media',exact:true});
  await link.scrollIntoViewIfNeeded();
  const box=await link.boundingBox();
  expect(box).not.toBeNull();
  await page.mouse.move(box!.x+box!.width/2,box!.y+box!.height/2);
  await page.mouse.down();
  release();
  await expect(page.locator('html')).toHaveAttribute('data-hydrated','true');
  await page.mouse.up();
  await expect(page).toHaveURL(basePath+'docs/api/register-media/');
  await expect(page.locator('article h1')).toHaveText('POST media');
  await page.goBack();
  await expect(page.locator('article h1')).toHaveText('Overview');
 } finally {release();}
});

test('reference tables and long documentation reflow on mobile and both themes',async({page})=>{
 await page.goto(basePath+'docs/api/register-media/');
 for(const width of [320,375,768,1440]){
  await page.setViewportSize({width,height:1000});
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
 }
 await page.setViewportSize({width:375,height:812});
 await page.getByRole('button',{name:'Documentation menu'}).click();
 const dialog=page.getByRole('dialog',{name:'Documentation',exact:true});
 await dialog.getByRole('link',{name:'Known limitations',exact:true}).click();
 await expect(page.locator('article h1')).toHaveText('Known limitations');
 await expect(page.locator('#missing-storage-implementation')).toBeVisible();
 await page.goto(basePath+'docs/api/register-media/');
 for(const theme of ['light','dark']){
  await page.getByRole('combobox',{name:'Theme'}).selectOption(theme);
  expect((await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa','wcag22aa']).analyze()).violations).toEqual([]);
 }
});
