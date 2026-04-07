import { test, expect } from '@playwright/test';

const BASE_URL =
  process.env.BASE_URL ||
  'https://healthshield-frontend-mdkalcrowq-uc.a.run.app';

test.describe('HealthShield Authentication', () => {
  test.setTimeout(60_000);

  test.beforeEach(async ({ page }) => {
    await page.context().clearCookies();
  });

  test('login page loads with HealthShield branding', async ({ page }) => {
    const response = await page.goto('/login');
    expect(response?.status()).toBeLessThan(400);

    // Verify HealthShield branding elements
    await expect(page.getByText('Welcome back')).toBeVisible({ timeout: 15_000 });
    await expect(page.getByText('Sign in to your account')).toBeVisible();

    // HealthShield logo or brand link
    const homeLink = page.locator('a[href="/"]').first();
    await expect(homeLink).toBeVisible();
  });

  test('can type email and password', async ({ page }) => {
    await page.goto('/login');
    await expect(page.locator('#email')).toBeVisible({ timeout: 15_000 });

    await page.locator('#email').fill('test@example.com');
    await page.locator('#password').fill('SomePassword123');

    await expect(page.locator('#email')).toHaveValue('test@example.com');
    await expect(page.locator('#password')).toHaveValue('SomePassword123');
  });

  test('shows error on invalid credentials', async ({ page }) => {
    await page.goto('/login');
    await expect(page.locator('#email')).toBeVisible({ timeout: 15_000 });

    await page.locator('#email').fill('invalid@test.com');
    await page.locator('#password').fill('wrongpassword');
    await page.getByRole('button', { name: /sign in/i }).click();

    // Should show an error message
    await expect(
      page.locator('.bg-destructive\\/10, [role="alert"]').first()
    ).toBeVisible({ timeout: 15_000 });
  });

  test('successful login redirects to /dashboard', async ({ page }) => {
    await page.goto('/login');
    await expect(page.locator('#email')).toBeVisible({ timeout: 15_000 });

    await page.locator('#email').fill('charley@bodyf1rst.com');
    await page.locator('#password').fill('Password123!');
    await page.getByRole('button', { name: /sign in/i }).click();

    await page.waitForURL(/\/dashboard/, { timeout: 30_000 });
    expect(page.url()).toContain('/dashboard');
  });
});
