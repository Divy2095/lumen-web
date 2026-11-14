import {test,expect} from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import {basePath} from '../site.config';
const mp4={name:'clip.mp4',mimeType:'video/mp4',buffer:Buffer.from('selection fixture, not real video')};
test.beforeEach(async({page})=>{await page.goto(basePath);});
test('selection, replacement, removal and honest unconfigured prompt',async({page})=>{
 const section=page.locator('#playground');const input=section.getByLabel('Choose an MP4 video');const process=section.getByRole('button',{name:'Process video'});
 await expect(process).toBeDisabled();await input.setInputFiles(mp4);await expect(section.getByText(/clip.mp4 ·/)).toBeVisible();await expect(process).toBeEnabled();
 await process.click();const dialog=page.getByRole('dialog',{name:'Ready to process your video?'});await expect(dialog).toBeVisible();await expect(dialog.getByText(/Clerk is not configured/)).toBeVisible();
 await page.keyboard.press('Escape');await expect(dialog).not.toBeVisible();await expect(process).toBeFocused();
 await process.click();await dialog.getByRole('button',{name:'Not now'}).click();await expect(process).toBeFocused();
 const picker=page.waitForEvent('filechooser');await section.getByRole('button',{name:'Replace video'}).click();await (await picker).setFiles({...mp4,name:'replacement.mp4'});await expect(section.getByText(/replacement.mp4 ·/)).toBeVisible();
 await section.getByRole('button',{name:'Remove video'}).click();await expect(process).toBeDisabled();await expect(input).toBeFocused();
 const keyboardPicker=page.waitForEvent('filechooser');await page.keyboard.press('Enter');await (await keyboardPicker).setFiles(mp4);await expect(process).toBeEnabled();
});
for(const [name,file,message] of [
 ['unsupported',{...mp4,name:'clip.mov',mimeType:'video/quicktime'},'Choose an MP4'],
 ['empty',{...mp4,buffer:Buffer.alloc(0)},'file is empty'],
 ['oversized',{...mp4,buffer:Buffer.alloc(25*1024*1024+1)},'no larger than 25 MiB']
] as const){test(`${name} file rejected and valid replacement clears error`,async({page})=>{
 const input=page.getByLabel('Choose an MP4 video');await input.setInputFiles(file);await expect(page.locator('#video-error')).toContainText(message);await expect(page.getByRole('button',{name:'Process video'})).toBeDisabled();await input.setInputFiles(mp4);await expect(page.locator('#video-error')).toBeEmpty();await expect(page.getByRole('button',{name:'Process video'})).toBeEnabled();
});}
test('drop accepts one file, rejects multiple, and prevents outside navigation',async({page})=>{
 await expect(page.locator('html')).toHaveAttribute('data-hydrated','true');
 const transfer=await page.evaluateHandle(()=>{const data=new DataTransfer();data.items.add(new File(['x'],'drop.mp4',{type:'video/mp4'}));return data;});
 const zone=page.locator('.video-selection');await zone.dispatchEvent('dragover',{dataTransfer:transfer});await expect(zone).toHaveAttribute('data-dragging','true');await zone.dispatchEvent('drop',{dataTransfer:transfer});await expect(page.getByText(/drop.mp4 ·/)).toBeVisible();
 await page.evaluate(data=>data.items.add(new File(['y'],'second.mp4',{type:'video/mp4'})),transfer);await zone.dispatchEvent('drop',{dataTransfer:transfer});await expect(page.locator('#video-error')).toContainText('one MP4');
 expect(await page.evaluate(data=>!document.body.dispatchEvent(new DragEvent('drop',{dataTransfer:data,bubbles:true,cancelable:true})),transfer)).toBe(true);await expect(page).toHaveURL(basePath);
});
test('playground reflows and supports theme, focus trap and accessibility',async({page})=>{
 for(const width of [320,768,1440]){await page.setViewportSize({width,height:900});expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);}
 await page.getByLabel('Choose an MP4 video').setInputFiles(mp4);await page.getByRole('button',{name:'Process video'}).click();
 const dialog=page.getByRole('dialog',{name:'Ready to process your video?'});await dialog.getByRole('button',{name:'Not now'}).focus();await page.keyboard.press('Tab');await expect(dialog.getByRole('button',{name:'Close ready to process your video?'})).toBeFocused();
 expect((await new AxeBuilder({page}).analyze()).violations).toEqual([]);await page.keyboard.press('Escape');
 await page.getByRole('combobox',{name:'Theme'}).selectOption('dark');expect((await new AxeBuilder({page}).include('#playground').analyze()).violations).toEqual([]);
});
