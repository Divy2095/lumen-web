import {test,expect} from '@playwright/test';
import {basePath} from '../site.config';
test('preview is illustrative, separates states and preserves documentation simulation',async({page})=>{
 await page.goto(basePath);
 const panel=page.locator('#product-preview');await expect(panel.getByText('Illustrative',{exact:true})).toBeVisible();
 await expect(panel).toContainText('sample-video.mp4');await expect(panel).toContainText('No backend is connected.');await expect(panel).toContainText('Outside the currently documented API');
 for(const width of [320,768,1440]){await page.setViewportSize({width,height:900});expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);for(const name of ['Metadata','Thumbnail','Renditions'])await expect(panel.getByRole('heading',{name,exact:true})).toBeVisible();}
 await panel.getByRole('link',{name:'Explore the detailed processing flow'}).click();await expect(page).toHaveURL(basePath+'docs/guides/processing/#explore-the-flow');await expect(page.getByRole('button',{name:'Play simulation',exact:true})).toBeVisible();
});
test('unconfigured header omits account actions and leaves public navigation intact',async({page})=>{
 await page.goto(basePath);
 await expect(page.locator('.site-header .account-control')).toHaveCount(0);
 await expect(page.locator('.site-header').getByRole('button',{name:'Sign in',exact:true})).toHaveCount(0);
 await expect(page.locator('.site-header').getByRole('link',{name:'Sign in',exact:true})).toHaveCount(0);
 await expect(page.locator('.site-header').getByRole('button',{name:/user menu/i})).toHaveCount(0);
 await expect(page.getByRole('combobox',{name:'Theme'})).toBeVisible();
});
