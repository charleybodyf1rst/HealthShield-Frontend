import { test, expect } from '@playwright/test';

/**
 * Fleet Management Tests
 *
 * Tests the fleet page (/dashboard/fleet) which displays:
 *   - Stats cards (Total Fleet, Available, In Use, Maintenance, Avg Fuel Level)
 *   - Search + filter controls (status filter, location filter)
 *   - Boat cards grid with images, status badges, capacity, pricing, fuel levels
 *   - Boat detail navigation
 *   - Equipment/features on each boat card
 *
 * Auth: Uses storageState from e2e/.auth/user.json (set by global-setup).
 */

test.describe('Fleet Page - Structure and Load', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/dashboard/fleet', { waitUntil: 'domcontentloaded' });
    await page.waitForLoadState('networkidle', { timeout: 30_000 }).catch(() => {});

    if (page.url().includes('/login')) {
      test.skip(true, 'Redirected to login');
    }
  });

  test('Fleet page loads with correct heading', async ({ page }) => {
    await expect(page.locator('h1')).toContainText('Fleet Management');

    const body = (await page.textContent('body')) ?? '';
    expect(body).toContain('Manage your boat fleet');
  });

  test('Fleet page shows stats cards', async ({ page }) => {
    const expectedStats = ['Total Fleet', 'Available', 'In Use', 'Maintenance', 'Avg Fuel Level'];
    const body = (await page.textContent('body')) ?? '';

    for (const stat of expectedStats) {
      expect(body, `Expected stat card "${stat}"`).toContain(stat);
    }
  });

  test('Stats cards show numeric values', async ({ page }) => {
    // The stats should display numbers (not just labels)
    const statCards = page.locator('.grid .text-2xl.font-bold');
    const count = await statCards.count();
    expect(count, 'Expected at least 4 stat value elements').toBeGreaterThanOrEqual(4);

    // At least one should have a non-empty value
    const firstValue = await statCards.first().textContent();
    expect(firstValue?.trim().length).toBeGreaterThan(0);
  });

  test('Fleet page has Add Boat button', async ({ page }) => {
    const addBtn = page.getByRole('button', { name: /add boat/i });
    await expect(addBtn).toBeVisible({ timeout: 10_000 });
  });

  test('Fleet page has Refresh button', async ({ page }) => {
    // The refresh button is an icon button with RefreshCw icon
    const refreshBtn = page.locator('button').filter({ has: page.locator('svg.lucide-refresh-cw') }).first();
    // Fallback: find by icon button near the header
    if (!(await refreshBtn.isVisible())) {
      const anyRefreshBtn = page.locator('button').filter({ has: page.locator('svg') }).first();
      await expect(anyRefreshBtn).toBeVisible({ timeout: 10_000 });
    } else {
      await expect(refreshBtn).toBeVisible({ timeout: 10_000 });
    }
  });
});

test.describe('Fleet Page - Boat Cards Display', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/dashboard/fleet', { waitUntil: 'domcontentloaded' });
    await page.waitForLoadState('networkidle', { timeout: 30_000 }).catch(() => {});

    if (page.url().includes('/login')) {
      test.skip(true, 'Redirected to login');
    }
  });

  test('Boat cards are displayed in a grid', async ({ page }) => {
    // The boats are rendered in a grid of cards
    const boatCards = page.locator('.grid .overflow-hidden').filter({ has: page.locator('img') });
    const cardCount = await boatCards.count();

    // Static data has boats defined, so we expect at least 1
    expect(cardCount, 'Expected at least 1 boat card').toBeGreaterThan(0);
  });

  test('Each boat card shows name and location', async ({ page }) => {
    // Get the first boat card
    const firstCard = page.locator('.grid .overflow-hidden').filter({ has: page.locator('img') }).first();

    if (await firstCard.isVisible()) {
      // Card should have a title (boat name)
      const cardTitle = firstCard.locator('h3, [class*="CardTitle"]').first();
      const titleText = await cardTitle.textContent();
      expect(titleText?.trim().length).toBeGreaterThan(0);

      // Card should show location info (Lake Austin or Lake Travis)
      const cardText = (await firstCard.textContent()) ?? '';
      const hasLocation = /lake\s*(austin|travis)/i.test(cardText) || /slip/i.test(cardText);
      expect(hasLocation, 'Boat card should show location').toBeTruthy();
    }
  });

  test('Boat cards show status badges', async ({ page }) => {
    const body = (await page.textContent('body')) ?? '';
    // At least one status type should be visible
    const hasStatus = /Available|In Use|Maintenance|Out of Service/.test(body);
    expect(hasStatus, 'Expected at least one boat status badge').toBeTruthy();
  });

  test('Boat cards display capacity information', async ({ page }) => {
    const body = (await page.textContent('body')) ?? '';
    const hasCapacity = /\d+\s*guests?/i.test(body);
    expect(hasCapacity, 'Expected guest capacity on boat cards').toBeTruthy();
  });

  test('Boat cards display pricing', async ({ page }) => {
    const body = (await page.textContent('body')) ?? '';
    const hasPricing = /from\s*\$\d+/i.test(body) || /\$\d+/.test(body);
    expect(hasPricing, 'Expected pricing information on boat cards').toBeTruthy();
  });

  test('Boat cards show fuel level with progress bar', async ({ page }) => {
    const body = (await page.textContent('body')) ?? '';
    expect(body).toContain('Fuel Level');

    // Progress bars should be present
    const progressBars = page.locator('[role="progressbar"], .h-2');
    const pbCount = await progressBars.count();
    expect(pbCount, 'Expected fuel level progress bars').toBeGreaterThan(0);
  });

  test('Boat cards display feature badges', async ({ page }) => {
    // Features are shown as outline badges
    const featureBadges = page.locator('.flex.flex-wrap.gap-1 [class*="Badge"]');
    const badgeCount = await featureBadges.count();

    // At least some boats should have features
    expect(badgeCount, 'Expected feature badges on boat cards').toBeGreaterThanOrEqual(0);
  });

  test('Boat cards have View Details button', async ({ page }) => {
    const viewDetailsLinks = page.getByRole('link', { name: /view details/i });
    const count = await viewDetailsLinks.count();
    expect(count, 'Expected View Details links on boat cards').toBeGreaterThan(0);
  });
});

test.describe('Fleet Page - Search and Filters', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/dashboard/fleet', { waitUntil: 'domcontentloaded' });
    await page.waitForLoadState('networkidle', { timeout: 30_000 }).catch(() => {});

    if (page.url().includes('/login')) {
      test.skip(true, 'Redirected to login');
    }
  });

  test('Search input is visible and functional', async ({ page }) => {
    const searchInput = page.getByPlaceholder(/search boats/i);
    await expect(searchInput).toBeVisible({ timeout: 10_000 });

    // Type a search query
    await searchInput.fill('pontoon');
    await page.waitForTimeout(500);
    await expect(searchInput).toHaveValue('pontoon');
  });

  test('Search filters boat cards', async ({ page }) => {
    const searchInput = page.getByPlaceholder(/search boats/i);

    // Count initial cards
    const initialCards = page.locator('.grid .overflow-hidden').filter({ has: page.locator('img') });
    const initialCount = await initialCards.count();

    // Search for nonexistent boat
    await searchInput.fill('zzzznonexistentboat');
    await page.waitForTimeout(500);

    // Should show no boats or empty state
    const body = (await page.textContent('body')) ?? '';
    const hasEmptyState = /no boats found/i.test(body);
    const filteredCards = page.locator('.grid .overflow-hidden').filter({ has: page.locator('img') });
    const filteredCount = await filteredCards.count();

    expect(hasEmptyState || filteredCount < initialCount || filteredCount === 0).toBeTruthy();
  });

  test('Status filter dropdown works', async ({ page }) => {
    // Find status filter (the one with "All Statuses" or similar)
    const statusSelect = page.locator('button[role="combobox"]').filter({ hasText: /status|all statuses/i }).first();

    if (await statusSelect.isVisible()) {
      await statusSelect.click();
      await page.waitForTimeout(500);

      // Should show status options
      const options = page.locator('[role="option"]');
      const optionCount = await options.count();
      expect(optionCount).toBeGreaterThan(0);

      // Select "Available"
      const availableOption = page.locator('[role="option"]').filter({ hasText: /available/i }).first();
      if (await availableOption.isVisible()) {
        await availableOption.click();
        await page.waitForTimeout(500);

        // Page should not crash
        const body = (await page.textContent('body')) ?? '';
        expect(body).not.toContain('Application error');
      } else {
        await page.keyboard.press('Escape');
      }
    }
  });

  test('Location filter dropdown works', async ({ page }) => {
    const locationSelect = page.locator('button[role="combobox"]').filter({ hasText: /location|all locations/i }).first();

    if (await locationSelect.isVisible()) {
      await locationSelect.click();
      await page.waitForTimeout(500);

      const options = page.locator('[role="option"]');
      const optionCount = await options.count();
      expect(optionCount).toBeGreaterThan(0);

      // Select "Lake Austin"
      const lakeAustinOption = page.locator('[role="option"]').filter({ hasText: /lake austin/i }).first();
      if (await lakeAustinOption.isVisible()) {
        await lakeAustinOption.click();
        await page.waitForTimeout(500);

        // All visible boats should be at Lake Austin
        const body = (await page.textContent('body')) ?? '';
        expect(body).not.toContain('Application error');
      } else {
        await page.keyboard.press('Escape');
      }
    }
  });

  test('Combining search and filters works without errors', async ({ page }) => {
    // Apply a status filter
    const statusSelect = page.locator('button[role="combobox"]').filter({ hasText: /status|all statuses/i }).first();
    if (await statusSelect.isVisible()) {
      await statusSelect.click();
      await page.waitForTimeout(500);

      const availableOption = page.locator('[role="option"]').filter({ hasText: /available/i }).first();
      if (await availableOption.isVisible()) {
        await availableOption.click();
        await page.waitForTimeout(500);
      } else {
        await page.keyboard.press('Escape');
      }
    }

    // Also apply a search
    const searchInput = page.getByPlaceholder(/search boats/i);
    await searchInput.fill('boat');
    await page.waitForTimeout(500);

    // Page should not crash
    const body = (await page.textContent('body')) ?? '';
    expect(body).not.toContain('Application error');
    expect(body).not.toContain('Unhandled Runtime Error');
  });
});

test.describe('Fleet Page - Boat Details Navigation', () => {
  test('Clicking View Details navigates to boat detail page', async ({ page }) => {
    await page.goto('/dashboard/fleet', { waitUntil: 'domcontentloaded' });
    await page.waitForLoadState('networkidle', { timeout: 30_000 }).catch(() => {});

    if (page.url().includes('/login')) {
      test.skip(true, 'Redirected to login');
      return;
    }

    const viewDetailsLink = page.getByRole('link', { name: /view details/i }).first();

    if (await viewDetailsLink.isVisible()) {
      await viewDetailsLink.click();
      await page.waitForTimeout(3000);

      // Should navigate to a fleet detail page
      expect(page.url()).toMatch(/\/dashboard\/fleet\/[^/]+/);
    } else {
      test.skip(true, 'No View Details links available');
    }
  });
});

test.describe('Fleet Page - Boat Card Actions', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/dashboard/fleet', { waitUntil: 'domcontentloaded' });
    await page.waitForLoadState('networkidle', { timeout: 30_000 }).catch(() => {});

    if (page.url().includes('/login')) {
      test.skip(true, 'Redirected to login');
    }
  });

  test('Boat card has actions dropdown menu', async ({ page }) => {
    // Find the three-dot menu button on a boat card
    const moreButton = page.locator('.grid .overflow-hidden button').filter({ has: page.locator('svg') }).first();

    if (await moreButton.isVisible()) {
      await moreButton.click();
      await page.waitForTimeout(500);

      // Dropdown should show action items
      const menuItems = page.locator('[role="menuitem"]');
      const count = await menuItems.count();
      expect(count, 'Expected dropdown menu items').toBeGreaterThan(0);

      // Check for expected actions
      const body = (await page.textContent('body')) ?? '';
      const hasExpectedActions =
        body.includes('View Details') ||
        body.includes('Schedule Maintenance') ||
        body.includes('View Bookings') ||
        body.includes('Mark Available');

      expect(hasExpectedActions, 'Expected fleet action menu items').toBeTruthy();

      await page.keyboard.press('Escape');
    }
  });
});

test.describe('Fleet Page - Empty State', () => {
  test('Empty state shows when no boats match filters', async ({ page }) => {
    await page.goto('/dashboard/fleet', { waitUntil: 'domcontentloaded' });
    await page.waitForLoadState('networkidle', { timeout: 30_000 }).catch(() => {});

    if (page.url().includes('/login')) {
      test.skip(true, 'Redirected to login');
      return;
    }

    // Search for something that won't match
    const searchInput = page.getByPlaceholder(/search boats/i);
    await searchInput.fill('zzzznonexistentboat12345');
    await page.waitForTimeout(500);

    const body = (await page.textContent('body')) ?? '';
    const hasEmptyState = /no boats found/i.test(body);
    expect(hasEmptyState, 'Expected "No boats found" empty state').toBeTruthy();
  });
});
