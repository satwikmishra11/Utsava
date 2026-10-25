import { test, expect } from '@playwright/test';

test.describe('E2E Scenarios Suite', () => {
  test('Wedding Happy Path: completes wizard and verifies multi-tab plan', async ({ page }) => {
    await page.goto('/');

    // Open Wizard
    await page.click('#btn-open-wizard');
    await expect(page.locator('#wizard-type-wedding')).toBeVisible();

    // Step 1: Celebration type (Wedding)
    await page.click('#wizard-type-wedding');
    await page.click('#btn-wizard-next');

    // Step 2: Title and Date
    await page.fill('#wizard-title', 'Aria & Liam Royal Wedding');
    await page.fill('#wizard-date', '2026-11-20');
    await page.fill('#wizard-location', 'Napa Valley, CA');
    await page.click('#btn-wizard-next');

    // Step 3: Guests
    await page.fill('#wizard-guests', '180');
    await page.click('#btn-wizard-next');

    // Step 4: Budget
    await page.fill('#wizard-budget', '50000');
    await page.click('#btn-wizard-next');

    // Step 5: Preferences
    await page.fill('#wizard-culture', 'Modern Garden Chic');
    await page.click('button:has-text("Vegetarian")');
    await page.click('button:has-text("Wheelchair Ramp")');

    // Submit Wizard
    await page.click('#btn-wizard-next');

    // Verify Dashboard Title updated
    const heading = page.locator('h1');
    await expect(heading).toContainText('Aria & Liam Royal Wedding');

    // Verify Budget Panel reflects target budget
    const budgetPanel = page.locator('#panel-budget');
    await expect(budgetPanel).toContainText('INR 50,000');

    // Switch to Timeline Tab
    await page.click('#tab-timeline');
    const timelinePanel = page.locator('#panel-timeline');
    await expect(timelinePanel).toBeVisible();
    await expect(timelinePanel).toContainText('Run of Show & Timeline');

    // Switch to Vendors Tab
    await page.click('#tab-vendors');
    const vendorPanel = page.locator('#panel-vendors');
    await expect(vendorPanel).toBeVisible();

    // Switch to Ideas Tab
    await page.click('#tab-ideas');
    const ideasPanel = page.locator('#panel-ideas');
    await expect(ideasPanel).toBeVisible();
  });

  test('Birthday Happy Path: creates birthday celebration and adds custom expense', async ({
    page,
  }) => {
    await page.goto('/');

    await page.click('#btn-open-wizard');
    await page.click('#wizard-type-birthday');
    await page.click('#btn-wizard-next');

    // Step 2
    await page.fill('#wizard-title', "Maya's 30th Rooftop Birthday");
    await page.fill('#wizard-date', '2026-08-15');
    await page.fill('#wizard-location', 'New York, NY');
    await page.click('#btn-wizard-next');

    // Step 3
    await page.fill('#wizard-guests', '60');
    await page.click('#btn-wizard-next');

    // Step 4
    await page.fill('#wizard-budget', '6000');
    await page.click('#btn-wizard-next');

    // Step 5
    await page.fill('#wizard-culture', 'Retro Disco');
    await page.click('#btn-wizard-next');

    // Verify Title
    await expect(page.locator('h1')).toContainText("Maya's 30th Rooftop Birthday");

    // Add a custom birthday expense
    await page.fill('#budget-item-name', 'Live Acoustic Musician');
    await page.fill('#budget-item-cost', '850');
    await page.selectOption('#budget-item-category', 'entertainment');
    await page.click('#btn-add-budget-item');

    // Verify item appears in table
    const table = page.locator('table');
    await expect(table).toContainText('Live Acoustic Musician');
    await expect(table).toContainText('INR 850');
  });

  test('Community Event Happy Path: creates festival plan and interacts with timeline and chat', async ({
    page,
  }) => {
    await page.goto('/');

    await page.click('#btn-open-wizard');
    await page.click('#wizard-type-community');
    await page.click('#btn-wizard-next');

    // Step 2
    await page.fill('#wizard-title', 'Midtown Annual Summer Festival');
    await page.fill('#wizard-date', '2026-07-04');
    await page.fill('#wizard-location', 'Central Park Lawn');
    await page.click('#btn-wizard-next');

    // Step 3
    await page.fill('#wizard-guests', '450');
    await page.click('#btn-wizard-next');

    // Step 4
    await page.fill('#wizard-budget', '15000');
    await page.click('#btn-wizard-next');

    // Step 5
    await page.fill('#wizard-culture', 'Diverse Multi-Cultural');
    await page.click('#btn-wizard-next');

    // Verify Dashboard
    await expect(page.locator('h1')).toContainText('Midtown Annual Summer Festival');

    // Timeline interaction
    await page.click('#tab-timeline');
    await page.fill('#timeline-item-title', 'Festival Opening Ceremony');
    await page.click('#btn-add-timeline-item');
    await expect(page.locator('#panel-timeline')).toContainText('Festival Opening Ceremony');

    const firstTaskToggle = page
      .locator('#panel-timeline button[aria-label*="Toggle completion"]')
      .first();
    await firstTaskToggle.click();

    // Chat interaction
    await page.click('#tab-chat');
    const chatInput = page.locator('#chat-user-input');
    await chatInput.fill('Can you suggest local food truck vendors?');
    await page.click('#btn-chat-send');

    // Verify user message appears in chat
    const chatPanel = page.locator('#panel-chat');
    await expect(chatPanel).toContainText('Can you suggest local food truck vendors?');
  });

  test('Keyboard-Only Run: operates entire dashboard without a mouse click', async ({ page }) => {
    await page.goto('/');

    // Start from top of document
    await page.keyboard.press('Tab'); // Focus skip link
    const skipLink = page.locator('.skip-link');
    await expect(skipLink).toBeFocused();

    // Press enter on skip link to navigate to main content
    await page.keyboard.press('Enter');

    // Focus Timeline tab via keyboard
    const timelineTab = page.locator('#tab-timeline');
    await timelineTab.focus();
    await expect(timelineTab).toBeFocused();
    await page.keyboard.press('Enter');
    await expect(page.locator('#panel-timeline')).toBeVisible();

    // Focus Chat tab via keyboard
    const chatTab = page.locator('#tab-chat');
    await chatTab.focus();
    await expect(chatTab).toBeFocused();
    await page.keyboard.press('Enter');
    await expect(page.locator('#panel-chat')).toBeVisible();

    // Return to Budget tab via keyboard
    const budgetTab = page.locator('#tab-budget');
    await budgetTab.focus();
    await expect(budgetTab).toBeFocused();
    await page.keyboard.press('Enter');
    await expect(page.locator('#panel-budget')).toBeVisible();

    // Focus into budget add form
    const nameInput = page.locator('#budget-item-name');
    await nameInput.focus();
    await page.keyboard.type('Keyboard Accessible Cake Deposit');

    await page.keyboard.press('Tab'); // Move to category select
    await page.keyboard.press('Tab'); // Move to amount input
    const costInput = page.locator('#budget-item-cost');
    await expect(costInput).toBeFocused();
    await page.keyboard.type('450');

    await page.keyboard.press('Tab'); // Move to submit button
    const submitBtn = page.locator('#btn-add-budget-item');
    await expect(submitBtn).toBeFocused();
    await page.keyboard.press('Enter');

    // Verify item was added via keyboard action
    const table = page.locator('table');
    await expect(table).toContainText('Keyboard Accessible Cake Deposit');
  });

  test('Mobile Viewport Run: verifies responsive layout and zero horizontal overflow on iPhone SE', async ({
    page,
  }) => {
    // iPhone SE screen dimensions
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');

    // Verify Title fits
    const heading = page.locator('h1');
    await expect(heading).toBeVisible();

    // Check no horizontal scrollbar on document
    const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
    const clientWidth = await page.evaluate(() => document.documentElement.clientWidth);
    expect(scrollWidth).toBeLessThanOrEqual(clientWidth);

    // Verify Navigation tabs are visible and accessible on mobile
    const tablist = page.locator('[role="tablist"]');
    await expect(tablist).toBeVisible();

    // Switch tabs on mobile
    await page.click('#tab-timeline');
    await expect(page.locator('#panel-timeline')).toBeVisible();

    // Re-verify zero horizontal overflow after tab switch
    const scrollWidthAfter = await page.evaluate(() => document.documentElement.scrollWidth);
    const clientWidthAfter = await page.evaluate(() => document.documentElement.clientWidth);
    expect(scrollWidthAfter).toBeLessThanOrEqual(clientWidthAfter);

    // Open wizard dialog on mobile
    await page.click('#btn-open-wizard');
    const dialog = page.locator('[role="dialog"]');
    await expect(dialog).toBeVisible();

    // Verify dialog width fits within 375px viewport
    const dialogBox = await dialog.boundingBox();
    expect(dialogBox?.width).toBeLessThanOrEqual(375);

    // Close wizard
    const closeBtn = dialog.locator('button[aria-label="Close dialog"]');
    await closeBtn.click();
    await expect(dialog).not.toBeVisible();
  });
});
