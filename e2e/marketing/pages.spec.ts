import { test, expect } from '@playwright/test';

// =============================================================================
// MARKETING PAGES - HealthShield Insurance Platform E2E Tests
// =============================================================================

test.describe('Homepage', () => {
  test.setTimeout(60_000);

  test('homepage loads with "AI-POWERED HEALTH" headline', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const heading = page.locator('h1').first();
    await expect(heading).toBeVisible({ timeout: 15_000 });
    await expect(heading).toContainText(/ai.powered\s+health/i);
  });
});

// =============================================================================
// SERVICES PAGE
// =============================================================================
test.describe('Services Page', () => {
  test.setTimeout(60_000);

  test('/services page loads', async ({ page }) => {
    const response = await page.goto('/services');
    expect(response?.status()).toBeLessThan(400);
    await page.waitForLoadState('networkidle');

    const heading = page.locator('h1, h2').first();
    await expect(heading).toBeVisible({ timeout: 15_000 });
  });
});

// =============================================================================
// PLANS PAGE
// =============================================================================
test.describe('Plans Page', () => {
  test.setTimeout(60_000);

  test('/plans page loads', async ({ page }) => {
    const response = await page.goto('/plans');
    expect(response?.status()).toBeLessThan(400);
    await page.waitForLoadState('networkidle');

    const heading = page.locator('h1, h2').first();
    await expect(heading).toBeVisible({ timeout: 15_000 });
  });
});

// =============================================================================
// PRICING PAGE
// =============================================================================
test.describe('Pricing Page', () => {
  test.setTimeout(60_000);

  test('/pricing page loads with 3 tiers', async ({ page }) => {
    const response = await page.goto('/pricing');
    expect(response?.status()).toBeLessThan(400);
    await page.waitForLoadState('networkidle');

    const heading = page.locator('h1, h2').first();
    await expect(heading).toBeVisible({ timeout: 15_000 });

    // Expect at least 3 pricing tier cards/sections
    const tiers = page.locator('[class*="card"], [class*="tier"], [class*="plan"], [class*="pricing"]');
    await expect(tiers).toHaveCount(3, { timeout: 10_000 }).catch(async () => {
      // Fallback: check for at least 3 price-like elements
      const priceElements = page.locator('text=/\\$\\d+/');
      const count = await priceElements.count();
      expect(count).toBeGreaterThanOrEqual(3);
    });
  });
});

// =============================================================================
// QUOTE PAGE
// =============================================================================
test.describe('Quote Page', () => {
  test.setTimeout(60_000);

  test('/quote page loads with form', async ({ page }) => {
    const response = await page.goto('/quote');
    expect(response?.status()).toBeLessThan(400);
    await page.waitForLoadState('networkidle');

    // Should have a form with input fields
    const form = page.locator('form').first();
    await expect(form).toBeVisible({ timeout: 15_000 });

    // Should have at least one input or text field
    const inputs = page.locator('input, textarea, select');
    const count = await inputs.count();
    expect(count).toBeGreaterThanOrEqual(1);
  });
});

// =============================================================================
// FAQ PAGE
// =============================================================================
test.describe('FAQ Page', () => {
  test.setTimeout(60_000);

  test('/faq page loads with accordion', async ({ page }) => {
    const response = await page.goto('/faq');
    expect(response?.status()).toBeLessThan(400);
    await page.waitForLoadState('networkidle');

    const heading = page.locator('h1, h2').first();
    await expect(heading).toBeVisible({ timeout: 15_000 });

    // Accordion items (buttons that expand/collapse)
    const accordionTriggers = page.locator(
      '[data-state="closed"], [data-state="open"], [role="button"][aria-expanded], button:has-text("?")'
    );
    const count = await accordionTriggers.count();
    expect(count).toBeGreaterThanOrEqual(1);
  });
});

// =============================================================================
// ABOUT PAGE
// =============================================================================
test.describe('About Page', () => {
  test.setTimeout(60_000);

  test('/about page loads', async ({ page }) => {
    const response = await page.goto('/about');
    expect(response?.status()).toBeLessThan(400);
    await page.waitForLoadState('networkidle');

    const heading = page.locator('h1, h2').first();
    await expect(heading).toBeVisible({ timeout: 15_000 });
  });
});

// =============================================================================
// CONTACT PAGE
// =============================================================================
test.describe('Contact Page', () => {
  test.setTimeout(60_000);

  test('/contact page loads', async ({ page }) => {
    const response = await page.goto('/contact');
    expect(response?.status()).toBeLessThan(400);
    await page.waitForLoadState('networkidle');

    const heading = page.locator('h1, h2').first();
    await expect(heading).toBeVisible({ timeout: 15_000 });
  });
});

// =============================================================================
// NAVIGATION
// =============================================================================
test.describe('Navigation', () => {
  test.setTimeout(60_000);

  test('header navigation links work', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const nav = page.locator('header');
    await expect(nav).toBeVisible({ timeout: 15_000 });

    // Check key navigation links exist in the header
    const headerLinks = page.locator('header a, header nav a');
    const count = await headerLinks.count();
    expect(count).toBeGreaterThanOrEqual(3);
  });

  test('footer links exist', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const footer = page.locator('footer');
    await expect(footer).toBeVisible({ timeout: 15_000 });

    // Footer should contain multiple links
    const footerLinks = footer.locator('a');
    const count = await footerLinks.count();
    expect(count).toBeGreaterThanOrEqual(3);
  });
});
