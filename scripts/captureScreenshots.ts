import { chromium, Page } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';

const TABS = ['budget', 'timeline', 'vendors', 'ideas', 'chat'] as const;

async function preparePage(page: Page): Promise<void> {
  await page.goto('http://localhost:3000');
  await page.evaluate(() => window.localStorage.clear());
  await page.reload();
  await page.waitForSelector('#main-content');
  await page.addStyleTag({
    content:
      '*, *::before, *::after { animation: none !important; transition: none !important; caret-color: transparent !important; }',
  });
}

async function captureTab(page: Page, tab: string, theme: string, outDir: string): Promise<void> {
  await page.click(`#tab-${tab}`);
  await page.waitForSelector(`#panel-${tab}`, { state: 'visible' });
  await page.waitForTimeout(100);
  await page.screenshot({
    path: path.join(outDir, `${tab}-${theme}.png`),
    animations: 'disabled',
  });
}

async function captureModals(page: Page, theme: string, outDir: string): Promise<void> {
  const tokenBtn = page.locator('button[title*="Token Tracker"]');
  if (await tokenBtn.isVisible()) {
    await tokenBtn.click();
    await page.waitForSelector('aside[aria-label="Developer Token Usage Panel"]');
    await page.waitForTimeout(100);
    await page.screenshot({
      path: path.join(outDir, `devtoken-${theme}.png`),
      animations: 'disabled',
    });
    await page.keyboard.press('Escape');
    await page.waitForTimeout(100);
  }

  await page.click('#btn-open-wizard');
  await page.waitForSelector('[role="dialog"]', { state: 'visible' });
  await page.waitForTimeout(100);
  await page.screenshot({
    path: path.join(outDir, `wizard-${theme}.png`),
    animations: 'disabled',
  });
  await page.keyboard.press('Escape');
  await page.waitForTimeout(100);
}

async function captureThemeScreenshots(
  page: Page,
  theme: 'dark' | 'light',
  outDir: string
): Promise<void> {
  await preparePage(page);
  if (theme === 'light') {
    await page.click('#btn-theme-toggle');
    await page.waitForSelector('html[data-theme="light"]');
    await page.waitForTimeout(100);
  }

  for (const tab of TABS) {
    await captureTab(page, tab, theme, outDir);
  }
  await captureModals(page, theme, outDir);
}

async function run(): Promise<void> {
  const target = process.argv[2] || 'baseline';
  const outDir = path.join(process.cwd(), '.screenshots', target);
  fs.mkdirSync(outDir, { recursive: true });

  const browser = await chromium.launch();
  const context = await browser.newContext({
    viewport: { width: 1280, height: 800 },
    deviceScaleFactor: 1,
  });
  const page = await context.newPage();

  try {
    await captureThemeScreenshots(page, 'dark', outDir);
    await captureThemeScreenshots(page, 'light', outDir);
    console.log(`Successfully captured ${target} screenshots in ${outDir}`);
  } finally {
    await browser.close();
  }
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
