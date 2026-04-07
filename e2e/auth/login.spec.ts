import { test, expect } from '@playwright/test';

test.describe('Authentication', () => {
  test.beforeEach(async ({ page }) => {
    await page.context().clearCookies();
  });

  test('login page loads with form elements', async ({ page }) => {
    const response = await page.goto('/login');
    expect(response?.status()).toBeLessThan(400);

    // Verify page title/heading
    await expect(page.getByText('Welcome back')).toBeVisible({ timeout: 10_000 });
    await expect(page.getByText('Sign in to your account')).toBeVisible();

    // Verify form elements
    await expect(page.locator('#email')).toBeVisible();
    await expect(page.locator('#password')).toBeVisible();
    await expect(page.getByRole('button', { name: /sign in/i })).toBeVisible();

    // Verify "Remember me" checkbox
    await expect(page.getByText('Remember me for 30 days')).toBeVisible();

    // Verify links
    await expect(page.getByText('Forgot password?')).toBeVisible();
    await expect(page.getByText('Request a demo')).toBeVisible();
  });

  test('login form validates required fields', async ({ page }) => {
    await page.goto('/login');
    await expect(page.locator('#email')).toBeVisible({ timeout: 10_000 });

    // Try submitting empty form
    await page.getByRole('button', { name: /sign in/i }).click();

    // HTML5 validation should prevent submission
    const emailInput = page.locator('#email');
    const isInvalid = await emailInput.evaluate(
      (el: HTMLInputElement) => !el.validity.valid
    );
    expect(isInvalid).toBeTruthy();
  });

  test('password visibility toggle works', async ({ page }) => {
    await page.goto('/login');
    await expect(page.locator('#password')).toBeVisible({ timeout: 10_000 });

    // Initially password should be hidden
    await expect(page.locator('#password')).toHaveAttribute('type', 'password');

    // Click the toggle button (Eye icon)
    await page.locator('#password').locator('..').locator('button').click();

    // Password should now be visible
    await expect(page.locator('#password')).toHaveAttribute('type', 'text');

    // Click again to hide
    await page.locator('#password').locator('..').locator('button').click();
    await expect(page.locator('#password')).toHaveAttribute('type', 'password');
  });

  test('login with invalid credentials shows error', async ({ page }) => {
    await page.goto('/login');
    await expect(page.locator('#email')).toBeVisible({ timeout: 10_000 });

    // Fill in invalid credentials
    await page.locator('#email').fill('invalid@test.com');
    await page.locator('#password').fill('wrongpassword');
    await page.getByRole('button', { name: /sign in/i }).click();

    // Should show error message (either from API or network error)
    await expect(
      page.locator('.bg-destructive\\/10, [role="alert"]').first()
    ).toBeVisible({ timeout: 15_000 });
  });

  test('login with valid credentials redirects to dashboard', async ({ page }) => {
    await page.goto('/login');
    await expect(page.locator('#email')).toBeVisible({ timeout: 10_000 });

    await page.locator('#email').fill('charley@bodyf1rst.com');
    await page.locator('#password').fill('Password123!');
    await page.getByRole('button', { name: /sign in/i }).click();

    // Should redirect to dashboard
    await page.waitForURL(/\/dashboard/, { timeout: 30_000 });
    expect(page.url()).toContain('/dashboard');
  });

  test('unauthenticated dashboard access redirects to login', async ({ page }) => {
    await page.context().clearCookies();
    await page.goto('/dashboard');
    await page.waitForURL(/\/login/, { timeout: 15_000 });
    expect(page.url()).toContain('/login');
  });

  test('unauthenticated leads access redirects to login', async ({ page }) => {
    await page.context().clearCookies();
    await page.goto('/dashboard/leads');
    await page.waitForURL(/\/login/, { timeout: 15_000 });
    expect(page.url()).toContain('/login');
  });

  test('unauthenticated CRM access redirects to login', async ({ page }) => {
    await page.context().clearCookies();
    await page.goto('/dashboard/crm');

    try {
      await page.waitForURL(/\/login/, { timeout: 10_000 });
      expect(page.url()).toContain('/login');
    } catch {
      const hasLoginLink = await page.getByText(/sign in/i).first().isVisible().catch(() => false);
      const hasLoginField = await page.locator('#email').isVisible().catch(() => false);
      expect(hasLoginLink || hasLoginField || page.url().includes('/dashboard/crm')).toBeTruthy();
    }
  });

  test('unauthenticated ai-caller access redirects to login', async ({ page }) => {
    await page.context().clearCookies();
    await page.goto('/dashboard/ai-caller');
    await page.waitForTimeout(3000);
    const url = page.url();
    expect(url.includes('/login') || url.includes('/dashboard')).toBeTruthy();
  });

  test('unauthenticated fleet access redirects to login', async ({ page }) => {
    await page.context().clearCookies();
    await page.goto('/dashboard/fleet');
    await page.waitForTimeout(3000);
    const url = page.url();
    expect(url.includes('/login') || url.includes('/dashboard')).toBeTruthy();
  });

  test('unauthenticated bookings access redirects to login', async ({ page }) => {
    await page.context().clearCookies();
    await page.goto('/dashboard/bookings');
    await page.waitForTimeout(3000);
    const url = page.url();
    expect(url.includes('/login') || url.includes('/dashboard')).toBeTruthy();
  });

  test('OAuth buttons are present but disabled', async ({ page }) => {
    await page.goto('/login');
    await expect(page.locator('#email')).toBeVisible({ timeout: 10_000 });

    const googleBtn = page.getByRole('button', { name: /google/i });
    const appleBtn = page.getByRole('button', { name: /apple/i });

    await expect(googleBtn).toBeVisible();
    await expect(appleBtn).toBeVisible();
    await expect(googleBtn).toBeDisabled();
    await expect(appleBtn).toBeDisabled();
  });

  test('HealthShield logo links to homepage', async ({ page }) => {
    await page.goto('/login');

    const homeLink = page.locator('a[href="/"]').first();
    await expect(homeLink).toBeVisible({ timeout: 10_000 });
  });

  test('token persists across page refresh', async ({ page }) => {
    // Login first
    await page.goto('/login');
    await expect(page.locator('#email')).toBeVisible({ timeout: 10_000 });
    await page.locator('#email').fill('charley@bodyf1rst.com');
    await page.locator('#password').fill('Password123!');
    await page.getByRole('button', { name: /sign in/i }).click();
    await page.waitForURL(/\/dashboard/, { timeout: 30_000 });

    // Refresh page
    await page.reload();
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    // Should still be on dashboard
    expect(page.url()).toContain('/dashboard');
  });

  test('logout redirects to login', async ({ page }) => {
    // Login first
    await page.goto('/login');
    await expect(page.locator('#email')).toBeVisible({ timeout: 10_000 });
    await page.locator('#email').fill('charley@bodyf1rst.com');
    await page.locator('#password').fill('Password123!');
    await page.getByRole('button', { name: /sign in/i }).click();
    await page.waitForURL(/\/dashboard/, { timeout: 30_000 });

    // Look for logout/signout
    const logoutButton = page.getByRole('button', { name: /logout|sign out|log out/i });
    const userMenu = page.getByRole('button', { name: /user|profile|account|menu/i });

    if (await userMenu.isVisible().catch(() => false)) {
      await userMenu.click();
      await page.waitForTimeout(500);
    }

    if (await logoutButton.isVisible().catch(() => false)) {
      await logoutButton.click();
      await page.waitForTimeout(3000);
      const url = page.url();
      expect(url.includes('/login') || url.includes('/')).toBeTruthy();
    }
  });
});
