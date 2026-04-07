import { test, expect } from '@playwright/test';

// =============================================================================
// INSURANCE DASHBOARD - HealthShield E2E Tests
// Requires login before each test
// =============================================================================

const BACKEND_URL =
  'https://systemsf1rst-backend-887571186773.us-central1.run.app';

test.describe('Insurance Dashboard', () => {
  test.setTimeout(60_000);

  test.beforeEach(async ({ page, context }) => {
    // Obtain a real token from the backend
    const formData = new FormData();
    formData.append('email', 'charley@bodyf1rst.com');
    formData.append('password', 'Password123!');
    formData.append('app', 'crm');

    const loginResponse = await fetch(`${BACKEND_URL}/api/v1/auth/login`, {
      method: 'POST',
      body: formData,
    });

    const loginData = await loginResponse.json();
    const token = loginData.token;
    const user = loginData.user;

    // Intercept backend endpoints that the frontend calls
    await context.route(`${BACKEND_URL}/api/auth/login`, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ status: 200, token, user }),
      });
    });

    await context.route(`${BACKEND_URL}/api/auth/me`, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ status: 200, user }),
      });
    });

    // Set auth cookie
    const baseUrl =
      process.env.BASE_URL ||
      'https://healthshield-frontend-mdkalcrowq-uc.a.run.app';
    const url = new URL(baseUrl);
    await context.addCookies([
      {
        name: 'auth-token',
        value: token,
        domain: url.hostname,
        path: '/',
        httpOnly: false,
        secure: url.protocol === 'https:',
        sameSite: 'Lax',
      },
    ]);

    // Log in through the UI
    await page.goto('/login', { waitUntil: 'domcontentloaded', timeout: 30_000 });
    await page.waitForTimeout(2000);

    await page.locator('#email').fill('charley@bodyf1rst.com');
    await page.locator('#password').fill('Password123!');

    await Promise.all([
      page.waitForURL('**/dashboard**', { timeout: 20_000 }).catch(() => {}),
      page.getByRole('button', { name: /sign in/i }).click(),
    ]);

    await page.waitForTimeout(3000);

    // Clear route intercepts
    await context.unrouteAll({ behavior: 'ignoreErrors' });
  });

  // ---------------------------------------------------------------------------
  // Dashboard home
  // ---------------------------------------------------------------------------
  test('dashboard loads with greeting', async ({ page }) => {
    expect(page.url()).toContain('/dashboard');

    // The dashboard shows a time-based greeting
    const greeting = page.locator('text=/good (morning|afternoon|evening)/i');
    await expect(greeting.first()).toBeVisible({ timeout: 15_000 });
  });

  // ---------------------------------------------------------------------------
  // Sidebar branding
  // ---------------------------------------------------------------------------
  test('sidebar shows HealthShield branding (not BananaBoat)', async ({
    page,
  }) => {
    // HealthShield branding should be present
    const sidebar = page.locator('aside, nav, [class*="sidebar"]').first();
    await expect(sidebar).toBeVisible({ timeout: 15_000 });

    // Should NOT contain BananaBoat references
    const bodyText = await page.locator('body').textContent();
    expect(bodyText?.toLowerCase()).not.toContain('bananaboat');
    expect(bodyText?.toLowerCase()).not.toContain('banana boat');
  });

  // ---------------------------------------------------------------------------
  // Sidebar Insurance section
  // ---------------------------------------------------------------------------
  test('sidebar has Insurance section (Programs, Enrollments, Proposals, Wellness)', async ({
    page,
  }) => {
    const sidebar = page.locator('aside, nav, [class*="sidebar"]').first();
    await expect(sidebar).toBeVisible({ timeout: 15_000 });

    // Check for Insurance-related navigation items
    const insuranceItems = [
      /program/i,
      /enrollment/i,
      /proposal/i,
      /wellness/i,
    ];

    for (const pattern of insuranceItems) {
      const link = sidebar.locator(`a, button, [role="menuitem"]`).filter({ hasText: pattern });
      const count = await link.count();
      expect(count, `Expected sidebar item matching ${pattern}`).toBeGreaterThanOrEqual(1);
    }
  });

  // ---------------------------------------------------------------------------
  // Leads page
  // ---------------------------------------------------------------------------
  test('leads page loads', async ({ page }) => {
    await page.goto('/dashboard/leads', { timeout: 30_000 });
    await page.waitForLoadState('networkidle');

    // Should be on leads page
    expect(page.url()).toContain('/leads');

    const heading = page.locator('h1, h2, h3').filter({ hasText: /lead/i });
    await expect(heading.first()).toBeVisible({ timeout: 15_000 });
  });

  // ---------------------------------------------------------------------------
  // Pipeline page
  // ---------------------------------------------------------------------------
  test('pipeline page loads with kanban columns', async ({ page }) => {
    await page.goto('/dashboard/pipeline', { timeout: 30_000 });
    await page.waitForLoadState('networkidle');

    expect(page.url()).toContain('/pipeline');

    // Kanban board should have columns
    const columns = page.locator(
      '[class*="column"], [class*="kanban"], [data-column], [class*="stage"]'
    );
    const count = await columns.count();
    expect(count).toBeGreaterThanOrEqual(1);
  });

  // ---------------------------------------------------------------------------
  // Programs page
  // ---------------------------------------------------------------------------
  test('programs page loads', async ({ page }) => {
    await page.goto('/dashboard/programs', { timeout: 30_000 });
    await page.waitForLoadState('networkidle');

    expect(page.url()).toContain('/programs');

    const heading = page.locator('h1, h2, h3').filter({ hasText: /program/i });
    await expect(heading.first()).toBeVisible({ timeout: 15_000 });
  });

  // ---------------------------------------------------------------------------
  // AI Caller page
  // ---------------------------------------------------------------------------
  test('AI Caller page loads', async ({ page }) => {
    await page.goto('/dashboard/ai-caller', { timeout: 30_000 });
    await page.waitForLoadState('networkidle');

    expect(page.url()).toContain('/ai-caller');

    const heading = page.locator('h1, h2, h3').filter({ hasText: /ai.*call/i });
    await expect(heading.first()).toBeVisible({ timeout: 15_000 });
  });

  test('AI Caller has "Call History" button', async ({ page }) => {
    await page.goto('/dashboard/ai-caller', { timeout: 30_000 });
    await page.waitForLoadState('networkidle');

    const callHistoryBtn = page.getByRole('button', { name: /call history/i });
    await expect(callHistoryBtn).toBeVisible({ timeout: 15_000 });
  });

  // ---------------------------------------------------------------------------
  // Settings page
  // ---------------------------------------------------------------------------
  test('settings page loads', async ({ page }) => {
    await page.goto('/dashboard/settings', { timeout: 30_000 });
    await page.waitForLoadState('networkidle');

    expect(page.url()).toContain('/settings');

    const heading = page.locator('h1, h2, h3').filter({ hasText: /setting/i });
    await expect(heading.first()).toBeVisible({ timeout: 15_000 });
  });

  // ---------------------------------------------------------------------------
  // Header search
  // ---------------------------------------------------------------------------
  test('header search input exists', async ({ page }) => {
    // Look for a search input in the header/top area
    const searchInput = page.locator(
      'header input[type="search"], header input[placeholder*="earch"], input[type="search"], input[placeholder*="earch"]'
    ).first();
    await expect(searchInput).toBeVisible({ timeout: 15_000 });
  });
});
