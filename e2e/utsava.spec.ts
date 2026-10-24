import { test, expect } from '@playwright/test';

test.describe('Utsava Event Planning Application Flow', () => {
  test('renders header, navigation tabs, and initial budget', async ({ page }) => {
    await page.goto('/');

    await expect(page).toHaveTitle(/Utsava - GenAI Event Planning Assistant/);
    const mainHeading = page.locator('h1');
    await expect(mainHeading).toContainText('Utsava:');

    // Verify Tablist exists
    const tablist = page.locator('[role="tablist"]');
    await expect(tablist).toBeVisible();

    // Verify budget panel is active by default
    const budgetPanel = page.locator('#panel-budget');
    await expect(budgetPanel).toBeVisible();
    await expect(budgetPanel).toContainText('Event Budget & Cost Allocation');
  });

  test('switches tabs and interacts with timeline', async ({ page }) => {
    await page.goto('/');

    // Click on Timeline tab
    await page.click('#tab-timeline');
    const timelinePanel = page.locator('#panel-timeline');
    await expect(timelinePanel).toBeVisible();
    await expect(timelinePanel).toContainText('Run of Show & Timeline');

    // Toggle milestone completion
    const toggleBtn = timelinePanel.locator('button[aria-label*="Mark"]').first();
    await toggleBtn.click();
  });

  test('adds an expense to the budget planner', async ({ page }) => {
    await page.goto('/');

    await page.fill('#budget-item-name', 'Drone Photography');
    await page.fill('#budget-item-cost', '1800');
    await page.click('#btn-add-budget-item');

    const table = page.locator('table');
    await expect(table).toContainText('Drone Photography');
  });

  test('switches to chat and applies action recommendation to plan', async ({ page }) => {
    await page.goto('/');

    await page.click('#tab-chat');
    const chatPanel = page.locator('#panel-chat');
    await expect(chatPanel).toBeVisible();

    // Click apply action proposal button
    const applyBtn = page.locator('#btn-apply-action-msg-init');
    await expect(applyBtn).toBeVisible();
    await applyBtn.click();
    await expect(applyBtn).toContainText('Applied to Plan');

    // Return to budget tab and verify contingency was added
    await page.click('#tab-budget');
    const table = page.locator('table');
    await expect(table).toContainText('Contingency Fund');
  });
});
