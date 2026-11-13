import { test, expect } from '@playwright/test';
import { basePath } from '../site.config';

test('unconfigured auth POC is static, refreshable and leaves public pages usable',async({page,request})=>{
 const response=await request.get(basePath+'auth-poc/');
 expect(response.status()).toBe(200);
 expect(await response.text()).toContain('Authentication compatibility POC');
 const external:string[]=[];
 const origin=new URL(response.url()).origin;
 page.on('request',r=>{if(new URL(r.url()).origin!==origin)external.push(r.url());});
 await page.goto(basePath+'auth-poc/');
 await expect(page.getByText('Authentication is not configured. Public pages remain available.')).toBeVisible();
 await page.reload();
 await expect(page.getByRole('heading',{level:1})).toHaveText('Authentication compatibility POC');
 await page.getByRole('link',{name:'Return to documentation'}).click();
 await expect(page.locator('article h1')).toHaveText('Overview');
 expect(external).toEqual([]);
});
