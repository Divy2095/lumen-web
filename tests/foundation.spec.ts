import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { basePath, documents } from "../site.config";

const installation = `${basePath}${documents.find(doc => doc.slug === "installation")!.path}/`;
const processing = `${basePath}${documents.find(doc => doc.slug === "processing")!.path}/`;

async function noOverflow(page: import('@playwright/test').Page) {
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
}

test("light-first theme, persistence, System updates and pre-hydration preference", async ({ page }) => {
  await page.emulateMedia({ colorScheme: "dark" });
  await page.goto(installation);
  const root = page.locator("html");
  const theme = page.getByRole("combobox", { name: "Theme", exact: true });
  await expect(root).toHaveAttribute("data-hydrated", "true");
  await expect(root).toHaveAttribute("data-theme", "light");
  await theme.selectOption("dark");
  await expect(root).toHaveAttribute("data-theme", "dark");
  await page.reload();
  await expect(theme).toHaveValue("dark");
  await page.locator(".docs-sidebar").getByRole("link", { name: "Processing lifecycle", exact: true }).click();
  await expect(root).toHaveAttribute("data-theme", "dark");
  await theme.selectOption("system");
  await page.emulateMedia({ colorScheme: "light" });
  await expect(root).toHaveAttribute("data-theme", "light");
  await page.emulateMedia({ colorScheme: "dark" });
  await expect(root).toHaveAttribute("data-theme", "dark");
  await theme.selectOption("light");
  await page.emulateMedia({ colorScheme: "light" });
  await page.emulateMedia({ colorScheme: "dark" });
  await expect(root).toHaveAttribute("data-theme", "light");

  // Hold all application modules to verify the early script works before React.
  await page.route('**/assets/*.js', route => route.abort());
  await page.reload();
  await expect(root).toHaveAttribute("data-theme", "light");
  expect(await root.getAttribute("data-hydrated")).toBeNull();
});

test("theme remains usable with unavailable local storage", async ({ page }) => {
  await page.addInitScript(() => Object.defineProperty(window, "localStorage", { get() { throw new DOMException("Storage blocked", "SecurityError"); } }));
  const errors: string[] = [];
  page.on("pageerror", error => errors.push(error.message));
  await page.goto(installation);
  await expect(page.locator("html")).toHaveAttribute("data-hydrated", "true");
  await page.getByRole("combobox", { name: "Theme", exact: true }).selectOption("dark");
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  expect(errors).toEqual([]);
});

test("search dialog supports keyboard, trapping, Escape and index failure recovery", async ({ page }) => {
  await page.goto(installation);
  const trigger = page.getByRole("button", { name: "Search documentation", exact: true });
  await trigger.focus();
  await page.keyboard.press("Enter");
  const dialog = page.getByRole("dialog", { name: "Search documentation" });
  await expect(dialog).toBeVisible();
  await expect(dialog.getByRole("searchbox")).toBeFocused();
  for (let index = 0; index < 7; index++) {
    await page.keyboard.press("Tab");
    expect(await page.evaluate(() => !!document.activeElement?.closest("dialog"))).toBe(true);
  }
  await page.keyboard.press("Escape");
  await expect(dialog).not.toBeVisible();
  await expect(trigger).toBeFocused();
  await page.keyboard.press("Control+k");
  await expect(dialog).toBeVisible();
  await page.route("**/pagefind/**", route => route.abort());
  await dialog.getByRole("searchbox").fill("single-use");
  await dialog.getByRole("button", { name: "Search", exact: true }).click();
  await expect(dialog.getByRole("status")).toContainText("temporarily unavailable");
  await expect(dialog.getByRole("button", { name: "Retry" })).toBeVisible();
  await dialog.getByRole("navigation", { name: "Browse documentation" }).getByRole("link", { name: "Processing lifecycle" }).click();
  await expect(page).toHaveURL(processing);
  await expect(dialog).not.toBeVisible();
});

test("mobile global and documentation menus close, restore focus and navigate", async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto(installation);
  const globalTrigger = page.getByRole("button", { name: "Open navigation" });
  await globalTrigger.click();
  const globalDialog = page.getByRole("dialog", { name: "Navigation", exact: true });
  await expect(globalDialog).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(globalTrigger).toBeFocused();
  const docsTrigger = page.getByRole("button", { name: "Documentation menu" });
  await docsTrigger.click();
  const docsDialog = page.getByRole("dialog", { name: "Documentation", exact: true });
  await expect(docsDialog.getByRole("link", { name: "Installation and configuration" })).toHaveAttribute("aria-current", "page");
  await docsDialog.getByRole("link", { name: "Processing lifecycle" }).click();
  await expect(page).toHaveURL(processing);
  await expect(docsDialog).not.toBeVisible();
  await expect(page.locator("main")).toBeFocused();
  await docsTrigger.click();
  await page.keyboard.press("Escape");
  await expect(docsTrigger).toBeFocused();
  await globalTrigger.click();
  await globalDialog.getByRole("link", { name: "Product", exact: true }).click();
  await expect(page).toHaveURL(basePath);
  await expect(globalDialog).not.toBeVisible();
  await noOverflow(page);
});

test("responsive shells reflow, contents links and reduced motion remain usable", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto(installation);
  for (const width of [320, 375, 768, 1024, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    await noOverflow(page);
  }
  await page.setViewportSize({ width: 320, height: 812 });
  await page.locator(".mobile-contents summary").click();
  await page.locator(".mobile-contents").getByRole("link", { name: "Prepare the environment" }).click();
  await expect(page).toHaveURL(`${installation}#prepare-the-environment`);
  await expect(page.locator("#prepare-the-environment")).toBeInViewport();
  expect(await page.getByRole("button", { name: "Copy code" }).first().evaluate(el => getComputedStyle(el).transitionDuration)).toBe("0s");
  // Text-only zoom proxy: catches clipping and rigid columns at doubled root size.
  await page.addStyleTag({ content: "html { font-size: 200%; }" });
  await noOverflow(page);
  await page.getByRole("button", { name: "Search documentation", exact: true }).click();
  const dialog = page.getByRole("dialog", { name: "Search documentation" });
  expect(await dialog.evaluate(el => el.scrollWidth <= el.clientWidth)).toBe(true);
  expect((await dialog.getByRole("searchbox").boundingBox())!.width).toBeGreaterThan(80);
});

test("WCAG automated checks in both themes, mobile menus and search", async ({ page }) => {
  await page.goto(installation);
  for (const theme of ["light", "dark"]) {
    await page.getByRole("combobox", { name: "Theme", exact: true }).selectOption(theme);
    const result = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"]).analyze();
    expect(result.violations).toEqual([]);
  }
  await page.getByRole("button", { name: "Search documentation", exact: true }).click();
  expect((await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"]).analyze()).violations).toEqual([]);
  await page.keyboard.press("Escape");
  await page.setViewportSize({ width: 375, height: 812 });
  for (const name of ["Open navigation", "Documentation menu"]) {
    await page.getByRole("button", { name }).click();
    expect((await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"]).analyze()).violations).toEqual([]);
    await page.keyboard.press("Escape");
  }
});
