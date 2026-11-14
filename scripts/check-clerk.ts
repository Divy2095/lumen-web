// Run against a configured production build served by `npm run preview`.
// No credentials, verification codes, cookies or session tokens are collected.
import { chromium, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { basePath } from '../site.config.ts';
const origin='http://127.0.0.1:4173';
const browser=await chromium.launch();
const context=await browser.newContext({viewport:{width:1440,height:1000}});
const page=await context.newPage();
let pageErrors=0;page.on('pageerror',()=>pageErrors++);
const externalNavigations:string[]=[];
page.on('framenavigated',frame=>{if(frame===page.mainFrame()&&new URL(frame.url()).origin!==origin)externalNavigations.push(frame.url());});
let checks=0;
try{
 await page.goto(origin+basePath);
 const signIn=page.locator('.site-header').getByRole('link',{name:'Sign in',exact:true});
 await expect(signIn).toBeVisible();checks++;
 await expect(signIn).toHaveAttribute('href',`${basePath}sign-in/`);checks++;
 for(const width of [320,768,1440]){
  await page.setViewportSize({width,height:1000});
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
  await expect(signIn).toBeVisible();checks++;
 }
 for(const route of ['sign-in','sign-up']){
  await page.goto(`${origin}${basePath}${route}/`);
  await expect(page.locator('.cl-rootBox input').first()).toBeVisible({timeout:30000});
  await expect(page.getByRole('button',{name:/Google/i})).toBeVisible();
  await expect(page.getByRole('button',{name:/GitHub/i})).toBeVisible();checks++;
  for(const theme of ['light','dark']){
   await page.getByRole('combobox',{name:'Theme'}).selectOption(theme);
   await expect(page.locator('.cl-card').first()).toHaveCSS('background-color',theme==='dark'?'rgb(24, 24, 27)':'rgb(255, 255, 255)');
   const primary=page.locator('.cl-formButtonPrimary').first();
   await expect(primary).toHaveCSS('background-color',theme==='dark'?'rgb(147, 197, 253)':'rgb(29, 78, 216)');
   await expect(primary).toHaveCSS('background-image','none');
   await expect(primary).toHaveCSS('box-shadow','none');
   expect(await primary.evaluate(element=>getComputedStyle(element,'::after').backgroundImage)).toBe('none');
   await expect(page.locator('.cl-headerTitle')).toHaveCSS('font-size','20px');
   await expect(primary).toHaveCSS('font-family',/Geist/);
   await expect(page.locator('.cl-formFieldInput').first()).toHaveCSS('border-color','rgb(113, 113, 122)');
   await expect(page.locator('.cl-formFieldInput').first()).toHaveCSS('border-width','1px');
   await expect(page.getByRole('button',{name:/Google/i})).toHaveCSS('border-width','1px');
   await expect(page.getByText('Secured by',{exact:true})).toBeVisible();
   await expect(page.getByText('Development mode',{exact:true})).toBeVisible();
   const audit=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa','wcag22aa']).analyze();
   // Log rule IDs only on failure, never account or form contents.
   expect(audit.violations.map(violation=>violation.id)).toEqual([]);
   await page.locator('.auth-page').screenshot({path:`/tmp/lumen-native-${route}-${theme}.png`});checks++;
  }
  const input=page.locator('.cl-rootBox input').first();await input.focus();
  await expect(input).toHaveCSS('outline-style','solid');
  await page.keyboard.press('Tab');
  expect(await page.evaluate(()=>Boolean(document.activeElement?.closest('.cl-rootBox')))).toBe(true);checks++;
  await page.reload();await expect(page.locator('.cl-rootBox input').first()).toBeVisible({timeout:30000});checks++;
  await page.setViewportSize({width:320,height:900});expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);checks++;
  await page.locator('.auth-page').screenshot({path:`/tmp/lumen-7b-${route}-mobile.png`});
  await page.setViewportSize({width:1440,height:1000});
 }
 await page.goto(origin+basePath);
 await page.getByLabel('Choose an MP4 video').setInputFiles({name:'selection.mp4',mimeType:'video/mp4',buffer:Buffer.from('local selection fixture')});
 await page.getByRole('button',{name:'Process video'}).click();
 await expect(page.getByRole('button',{name:'Create free account',exact:true})).toBeVisible({timeout:30000});checks++;
 await page.keyboard.press('Escape');
 const localSignIn=`${origin}${basePath}sign-in/`;
 await signIn.focus();
 await expect(signIn).toBeFocused();
 await Promise.all([page.waitForURL(localSignIn,{timeout:30000}),page.keyboard.press('Enter')]);
 const destination=new URL(page.url());
 expect(destination.origin).toBe(origin);
 expect(destination.pathname).toBe(`${basePath}sign-in/`);
 await expect(page.getByRole('heading',{level:1,name:'Welcome back.'})).toBeVisible();checks++;
 await expect(page.locator('.cl-rootBox input').first()).toBeVisible({timeout:30000});checks++;
 expect(externalNavigations).toEqual([]);checks++;
 await page.reload();
 await expect(page.getByRole('heading',{level:1,name:'Welcome back.'})).toBeVisible();
 await expect(page.locator('.cl-rootBox input').first()).toBeVisible({timeout:30000});checks++;
 expect(externalNavigations).toEqual([]);checks++;
 expect(pageErrors).toBe(0);
 console.log(`Configured Clerk checks passed: ${checks}. Navbar sign-in stayed on the local embedded route. No sign-in, verification-code submission or authenticated session was attempted.`);
}catch{
 // Clerk's development redirect can contain a session transport parameter.
 // Report only the completed check count, never raw navigation URLs/errors.
 console.error(`Configured Clerk check failed after ${checks} completed checks; inspect the visible UI without recording credentials or redirect values.`);
 process.exitCode=1;
}finally{await context.close();await browser.close();}
