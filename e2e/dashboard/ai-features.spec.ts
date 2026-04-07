import { test, expect } from '@playwright/test';

test.describe('AI Features Pages', () => {
  test('AI caller page loads or redirects to login', async ({ page }) => {
    await page.goto('/dashboard/ai-caller');
    const url = page.url();
    expect(url.includes('/dashboard/ai-caller') || url.includes('/login')).toBeTruthy();
  });

  test('AI agents page loads or redirects to login', async ({ page }) => {
    await page.goto('/dashboard/ai-agents');
    const url = page.url();
    expect(url.includes('/dashboard/ai-agents') || url.includes('/login')).toBeTruthy();
  });

  test('boat analytics page loads or redirects to login', async ({ page }) => {
    await page.goto('/dashboard/boat-analytics');
    const url = page.url();
    expect(url.includes('/dashboard/boat-analytics') || url.includes('/login')).toBeTruthy();
  });

  test('projects page loads or redirects to login', async ({ page }) => {
    await page.goto('/dashboard/projects');
    const url = page.url();
    expect(url.includes('/dashboard/projects') || url.includes('/login')).toBeTruthy();
  });
});
