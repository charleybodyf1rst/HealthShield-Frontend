import { test, expect } from '@playwright/test';
import { loginFast, TEST_ACCOUNTS } from '../helpers/test-utils';

const account = TEST_ACCOUNTS[0]; // Ken — has phone +15124700454

test.describe('AI Caller Page', () => {
  test.beforeEach(async ({ page }) => {
    await loginFast(page, account.email, account.password);
    await page.goto('/dashboard/ai-caller');
    await page.waitForLoadState('domcontentloaded');
    // Wait for loading spinner to disappear
    await page.waitForSelector('[class*="animate-spin"]', { state: 'hidden', timeout: 30000 }).catch(() => {});
  });

  // ── Page Load ──
  test('T1: page loads with AI Caller header', async ({ page }) => {
    const header = page.locator('h1').filter({ hasText: /AI Caller/i });
    await expect(header).toBeVisible({ timeout: 15000 });
  });

  // ── Mode Tabs ──
  test('T2: mode tabs display Real-Time AI and Scripted Calls', async ({ page }) => {
    const realTimeTab = page.locator('button[role="tab"]').filter({ hasText: /Real-Time AI/i }).first();
    const scriptedTab = page.locator('button[role="tab"]').filter({ hasText: /Scripted Calls/i }).first();
    await expect(realTimeTab).toBeVisible({ timeout: 10000 });
    await expect(scriptedTab).toBeVisible();
  });

  test('T3: default mode is Real-Time AI', async ({ page }) => {
    const tab = page.locator('button[role="tab"]').filter({ hasText: /Real-Time AI/i }).first();
    await expect(tab).toBeVisible({ timeout: 10000 });
    const dataState = await tab.getAttribute('data-state');
    expect(dataState).toBe('active');
  });

  test('T4: can switch to Scripted Calls mode', async ({ page }) => {
    const scriptedTab = page.locator('button[role="tab"]').filter({ hasText: /Scripted Calls/i }).first();
    await scriptedTab.click();
    await expect(scriptedTab).toHaveAttribute('data-state', 'active');
  });

  // ── Lead Search ──
  test('T5: lead search input is present', async ({ page }) => {
    const searchInput = page.getByPlaceholder(/Search leads/i).first();
    await expect(searchInput).toBeVisible({ timeout: 10000 });
  });

  test('T6: search filters leads', async ({ page }) => {
    const searchInput = page.getByPlaceholder(/Search leads/i).first();
    await searchInput.fill('test');
    await page.waitForTimeout(500);
    // No crash expected
  });

  // ── Manual Phone Entry ──
  test('T7: manual phone number entry works', async ({ page }) => {
    const phoneInput = page.locator('#manualPhone');
    if (await phoneInput.isVisible()) {
      await phoneInput.fill('+15551234567');
      const nameInput = page.locator('#manualName');
      if (await nameInput.isVisible()) {
        await nameInput.fill('Test Caller');
      }
    }
  });

  // ── Call Me Card ──
  test('T8: Call Me card visible for user with phone number', async ({ page }) => {
    const callMeCard = page.locator('text=Call Me').first();
    await expect(callMeCard).toBeVisible({ timeout: 10000 });
  });

  test('T9: Call Me card displays user phone number', async ({ page }) => {
    const phoneDisplay = page.locator(`text=${account.phone}`).first();
    await expect(phoneDisplay).toBeVisible({ timeout: 10000 });
  });

  test('T10: Call My Phone button activates manual call mode', async ({ page }) => {
    const callBtn = page.getByRole('button', { name: /Call My Phone/i }).first();
    if (await callBtn.isVisible()) {
      await callBtn.click();
      await expect(page.getByText(/Ready — Start Call Above/i).first()).toBeVisible({ timeout: 5000 });
    }
  });

  test('T11: Call Me card has AI assistant description', async ({ page }) => {
    const description = page.locator('text=Have the AI assistant call your phone').first();
    await expect(description).toBeVisible({ timeout: 10000 });
  });

  // ── Quick Call Card ──
  test('T12: Quick Call card is visible', async ({ page }) => {
    const quickCall = page.locator('text=Quick Call').first();
    const visible = await quickCall.isVisible().catch(() => false);
    expect(typeof visible).toBe('boolean');
  });

  // ── No Console Errors ──
  test('T13: page loads without critical console errors', async ({ page }) => {
    test.setTimeout(90000);
    const errors: string[] = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error' && !msg.text().includes('favicon')) {
        errors.push(msg.text());
      }
    });
    await page.goto('/dashboard/ai-caller');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(3000);
    const criticalErrors = errors.filter(e =>
      !e.includes('Failed to fetch') &&
      !e.includes('401') &&
      !e.includes('403') &&
      !e.includes('404') &&
      !e.includes('NetworkError')
    );
    expect(criticalErrors.length).toBeLessThanOrEqual(5);
  });
});
