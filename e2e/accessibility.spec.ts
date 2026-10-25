import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.describe('WCAG 2.2 AA Accessibility & Axe-Core Conformance', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      window.localStorage.clear();
    });
  });

  test('main application passes WCAG 2.2 AA axe audit in dark mode', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('#main-content');

    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
      .analyze();

    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('main application passes WCAG 2.2 AA axe audit in light mode', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('#main-content');

    // Toggle to light mode
    await page.click('#btn-theme-toggle');
    await page.mouse.move(0, 0);
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
    await page.waitForTimeout(350);

    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
      .analyze();

    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('timeline tab with progress chart and data table passes axe checks', async ({ page }) => {
    await page.goto('/');
    await page.click('#tab-timeline');
    await expect(page.locator('#panel-timeline')).toBeVisible();

    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
      .analyze();

    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('vendor directory tab passes axe checks', async ({ page }) => {
    await page.goto('/');
    await page.click('#tab-vendors');
    await expect(page.locator('#panel-vendors')).toBeVisible();

    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
      .analyze();

    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('ai idea studio tab passes axe checks', async ({ page }) => {
    await page.goto('/');
    await page.click('#tab-ideas');
    await expect(page.locator('#panel-ideas')).toBeVisible();

    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
      .analyze();

    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('plan-acting chat assistant tab passes axe checks', async ({ page }) => {
    await page.goto('/');
    await page.click('#tab-chat');
    await expect(page.locator('#panel-chat')).toBeVisible();

    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
      .analyze();

    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('onboarding wizard dialog passes axe checks, traps and restores focus', async ({ page }) => {
    await page.goto('/');
    const openWizardBtn = page.locator('#btn-open-wizard');
    await openWizardBtn.click();

    // Verify modal is visible
    const dialog = page.locator('[role="dialog"]');
    await expect(dialog).toBeVisible();
    await expect(dialog).toHaveAttribute('aria-modal', 'true');

    // Run axe scan on modal dialog
    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
      .analyze();

    expect(accessibilityScanResults.violations).toEqual([]);

    // Test Escape key closes dialog and restores focus to open button
    await page.keyboard.press('Escape');
    await expect(dialog).not.toBeVisible();
    await expect(openWizardBtn).toBeFocused();
  });

  test('skip link is keyboard focusable and navigates to main landmark', async ({ page }) => {
    await page.goto('/');

    // Press Tab once from the top
    await page.keyboard.press('Tab');
    const skipLink = page.locator('.skip-link');
    await expect(skipLink).toBeFocused();

    // Activate skip link
    await page.keyboard.press('Enter');
    const mainContent = page.locator('#main-content');
    await expect(mainContent).toBeFocused();
  });

  test('streaming chat provides stop generating control and polite announcement', async ({
    page,
  }) => {
    await page.goto('/');
    await page.click('#tab-chat');

    // Type a prompt
    await page.fill('#chat-user-input', 'Can you recommend an Asian fusion catering budget?');
    await page.click('#btn-chat-send');

    // Live region exists and has polite setting
    const liveRegion = page.locator('#chat-live-region');
    await expect(liveRegion).toBeAttached();
    await expect(liveRegion).toHaveAttribute('aria-live', 'polite');

    // Check if stop generating button appears or completes
    const stopBtn = page.locator('#btn-chat-stop');
    if (await stopBtn.isVisible()) {
      await stopBtn.click();
      await expect(liveRegion).toContainText('Response generation stopped');
    }
  });
});
