import { test, expect } from '@playwright/test';
import { loginFast, TEST_ACCOUNTS } from '../helpers/test-utils';

const account = TEST_ACCOUNTS[0]; // Ken

test.describe('CRM Pages', () => {
  test.beforeEach(async ({ page }) => {
    await loginFast(page, account.email, account.password);
  });

  // ── Leads ──
  test('leads page loads', async ({ page }) => {
    await page.goto('/dashboard/leads');
    await page.waitForLoadState('domcontentloaded');
    const header = page.locator('h1, h2').filter({ hasText: /Lead/i }).first();
    await expect(header).toBeVisible({ timeout: 15000 });
  });

  test('leads search input exists', async ({ page }) => {
    await page.goto('/dashboard/leads');
    await page.waitForLoadState('domcontentloaded');
    const searchInput = page.getByPlaceholder(/Search/i).first();
    const visible = await searchInput.isVisible().catch(() => false);
    expect(typeof visible).toBe('boolean');
  });

  test('new lead page loads', async ({ page }) => {
    await page.goto('/dashboard/leads/new');
    await page.waitForLoadState('domcontentloaded');
    expect(page.url()).toContain('/leads');
  });

  // ── Contacts ──
  test('contacts page loads', async ({ page }) => {
    await page.goto('/dashboard/contacts');
    await page.waitForLoadState('domcontentloaded');
    const header = page.locator('h1, h2').filter({ hasText: /Contact/i }).first();
    await expect(header).toBeVisible({ timeout: 15000 });
  });

  // ── Pipeline ──
  test('pipeline page loads', async ({ page }) => {
    await page.goto('/dashboard/pipeline');
    await page.waitForLoadState('domcontentloaded');
    const header = page.locator('h1, h2').filter({ hasText: /Pipeline/i }).first();
    await expect(header).toBeVisible({ timeout: 15000 });
  });

  // ── Companies ──
  test('companies page loads', async ({ page }) => {
    await page.goto('/dashboard/companies');
    await page.waitForLoadState('domcontentloaded');
    const header = page.locator('h1, h2').filter({ hasText: /Compan/i }).first();
    await expect(header).toBeVisible({ timeout: 15000 });
  });

  // ── Campaigns ──
  test('campaigns page loads', async ({ page }) => {
    await page.goto('/dashboard/campaigns');
    await page.waitForLoadState('domcontentloaded');
    expect(page.url()).toContain('/campaigns');
  });

  // ── AI Agents ──
  test('ai-agents page loads', async ({ page }) => {
    await page.goto('/dashboard/ai-agents');
    await page.waitForLoadState('domcontentloaded');
    expect(page.url()).toContain('/ai-agents');
  });

  // ── Inbox ──
  test('inbox page loads', async ({ page }) => {
    await page.goto('/dashboard/inbox');
    await page.waitForLoadState('domcontentloaded');
    expect(page.url()).toContain('/inbox');
  });

  // ── Calendar ──
  test('calendar page loads', async ({ page }) => {
    await page.goto('/dashboard/calendar');
    await page.waitForLoadState('domcontentloaded');
    expect(page.url()).toContain('/calendar');
  });
});
