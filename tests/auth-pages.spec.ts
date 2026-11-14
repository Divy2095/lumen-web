import {test,expect} from '@playwright/test';
import {basePath} from '../site.config';
for(const [path,title] of [['sign-in','Welcome back.'],['sign-up','Start with Lumen.']]){
 test(`${path} static page and fragment refresh preserve public navigation`,async({page,request})=>{
  const url=`${basePath}${path}/`;
  const response=await request.get(url);expect(response.status()).toBe(200);expect(await response.text()).toContain(title);
  await page.goto(url+'#verify-email-address');await expect(page.getByRole('heading',{level:1})).toHaveText(title);
  await expect(page.getByText('Authentication is not configured. Public pages remain available.')).toBeVisible();
  await page.reload();await expect(page.getByRole('heading',{level:1})).toHaveText(title);
  await page.getByRole('link',{name:'Back to the playground'}).click();await expect(page).toHaveURL(basePath+'#playground');await expect(page.getByRole('button',{name:'Process video'})).toBeDisabled();
 });
}
