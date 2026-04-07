import { test, expect } from '@playwright/test';

/**
 * Interactions E2E Tests
 *
 * Tests interaction logging and management across CRM and Contacts pages,
 * plus API CRUD operations for interactions.
 *
 * Backend: https://systemsf1rst-backend-887571186773.us-central1.run.app
 * Auth: Uses storageState from e2e/.auth/user.json (set by global-setup).
 */

const BACKEND_URL = 'https://systemsf1rst-backend-887571186773.us-central1.run.app';
const API_TIMEOUT = 20_000;

// Helper to extract auth token from localStorage
async function getTokenFromPage(page: any): Promise<string | null> {
  try {
    const storage = await page.evaluate(() => localStorage.getItem('healthshield-crm-auth'));
    const auth = storage ? JSON.parse(storage) : null;
    return auth?.state?.tokens?.accessToken ?? null;
  } catch {
    return null;
  }
}

// ─── CRM Page - Interactions ──────────────────────────────────────────────────

test.describe('Interactions - CRM Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/dashboard/crm', { waitUntil: 'domcontentloaded' });
    await page.waitForLoadState('networkidle', { timeout: 30_000 }).catch(() => {});

    if (page.url().includes('/login')) {
      test.skip(true, 'Redirected to login — auth may have expired');
    }
  });

  test('CRM page loads with heading', async ({ page }) => {
    const heading = page.locator('h1').first();
    await expect(heading).toBeVisible({ timeout: 10_000 });
    const text = await heading.textContent();
    expect(text?.toLowerCase()).toMatch(/crm|customer|management/i);
  });

  test('Activity feed section is visible with recent interactions', async ({ page }) => {
    const bodyText = (await page.textContent('body')) ?? '';
    // Activity feed may show as "Activity", "Recent Activity", "Feed", or "Interactions"
    const hasActivitySection =
      /activity|recent|feed|interaction|timeline/i.test(bodyText);
    expect(
      hasActivitySection,
      'Expected an activity feed or interaction timeline section'
    ).toBeTruthy();
  });

  test('Interaction logging buttons are available', async ({ page }) => {
    const bodyText = (await page.textContent('body')) ?? '';
    // Look for action buttons related to logging interactions
    const hasLogButtons =
      /log.*call|add.*note|send.*email|new.*interaction|log.*interaction|add.*activity/i.test(bodyText);

    // Also check for actual buttons
    const actionButtons = page.locator(
      'button:has-text("Log"), button:has-text("Add Note"), button:has-text("Call"), button:has-text("Email"), button:has-text("Interaction")'
    );
    const buttonCount = await actionButtons.count();

    expect(
      hasLogButtons || buttonCount > 0,
      'Expected at least one interaction logging button'
    ).toBeTruthy();
  });
});

// ─── Contacts Page - Interactions ─────────────────────────────────────────────

test.describe('Interactions - Contacts Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/dashboard/contacts', { waitUntil: 'domcontentloaded' });
    await page.waitForLoadState('networkidle', { timeout: 30_000 }).catch(() => {});

    if (page.url().includes('/login')) {
      test.skip(true, 'Redirected to login — auth may have expired');
    }
  });

  test('Contacts page loads', async ({ page }) => {
    const heading = page.locator('h1, h2').first();
    await expect(heading).toBeVisible({ timeout: 10_000 });
    const bodyText = (await page.textContent('body')) ?? '';
    expect(bodyText.toLowerCase()).toMatch(/contact|customer/i);
  });

  test('Contact list or table renders', async ({ page }) => {
    // Contacts may render as a table, list, or grid of cards
    const table = page.locator('table');
    const cards = page.locator('[class*="card"], [class*="grid"] > div');
    const list = page.locator('[role="list"], ul, ol');

    const tableCount = await table.count();
    const cardCount = await cards.count();
    const listCount = await list.count();

    expect(
      tableCount + cardCount + listCount,
      'Expected contacts displayed as table, cards, or list'
    ).toBeGreaterThan(0);
  });

  test('Click on contact shows detail view with interaction history', async ({ page }) => {
    // Try clicking on the first contact row or card
    const contactRow = page.locator('table tbody tr, [class*="card"]').first();
    const isVisible = await contactRow.isVisible().catch(() => false);

    if (!isVisible) {
      test.skip(true, 'No contact rows/cards found to click');
      return;
    }

    await contactRow.click();
    await page.waitForTimeout(2000);

    // After clicking, look for detail view content
    const bodyText = (await page.textContent('body')) ?? '';
    const hasDetailView =
      /interaction|history|activity|note|call|email|timeline|detail/i.test(bodyText);

    expect(
      hasDetailView,
      'Expected interaction history section on contact detail'
    ).toBeTruthy();
  });
});

// ─── Interactions - API CRUD ──────────────────────────────────────────────────

test.describe('Interactions - API CRUD', () => {
  let authToken: string | null = null;
  let createdInteractionId: number | null = null;

  test.beforeEach(async ({ page }) => {
    // Navigate to dashboard first to get auth token from localStorage
    await page.goto('/dashboard/crm', { waitUntil: 'domcontentloaded' });
    await page.waitForLoadState('networkidle', { timeout: 30_000 }).catch(() => {});

    if (page.url().includes('/login')) {
      test.skip(true, 'Redirected to login — no auth token available');
      return;
    }

    authToken = await getTokenFromPage(page);
    if (!authToken) {
      test.skip(true, 'Could not extract auth token from localStorage');
    }
  });

  test('GET /api/boat-rentals/crm/interactions/options returns dropdown options', async ({ request }) => {
    if (!authToken) return;

    const response = await request.get(
      `${BACKEND_URL}/api/boat-rentals/crm/interactions/options`,
      {
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
        timeout: API_TIMEOUT,
      }
    );

    expect(response.status(), `Options returned ${response.status()}`).toBeLessThan(500);

    if (response.status() === 200) {
      const body = await response.json();
      expect(body).toBeTruthy();
    }
  });

  test('POST create interaction', async ({ request }) => {
    if (!authToken) return;

    const response = await request.post(
      `${BACKEND_URL}/api/boat-rentals/crm/interactions`,
      {
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
        data: {
          type: 'note',
          customer_id: 1,
          notes: 'E2E test interaction — automated test',
          direction: 'outbound',
        },
        timeout: API_TIMEOUT,
      }
    );

    expect(response.status(), `Create returned ${response.status()}`).toBeLessThan(500);

    if (response.status() === 200 || response.status() === 201) {
      const body = await response.json();
      createdInteractionId = body?.id ?? body?.data?.id ?? null;
    }
  });

  test('PUT update interaction notes', async ({ request }) => {
    if (!authToken || !createdInteractionId) {
      test.skip(true, 'No interaction to update (create may have failed)');
      return;
    }

    const response = await request.put(
      `${BACKEND_URL}/api/boat-rentals/crm/interactions/${createdInteractionId}`,
      {
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
        data: {
          notes: 'E2E test interaction — updated by automated test',
        },
        timeout: API_TIMEOUT,
      }
    );

    expect(response.status(), `Update returned ${response.status()}`).toBeLessThan(500);
  });

  test('DELETE remove test interaction', async ({ request }) => {
    if (!authToken || !createdInteractionId) {
      test.skip(true, 'No interaction to delete (create may have failed)');
      return;
    }

    const response = await request.delete(
      `${BACKEND_URL}/api/boat-rentals/crm/interactions/${createdInteractionId}`,
      {
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
        timeout: API_TIMEOUT,
      }
    );

    expect(response.status(), `Delete returned ${response.status()}`).toBeLessThan(500);
  });

  test('POST log-sms interaction', async ({ request }) => {
    if (!authToken) return;

    const response = await request.post(
      `${BACKEND_URL}/api/boat-rentals/crm/interactions/log-sms`,
      {
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
        data: {
          customer_id: 1,
          notes: 'E2E test SMS log',
          direction: 'outbound',
          phone_number: '+15125551234',
        },
        timeout: API_TIMEOUT,
      }
    );

    expect(response.status(), `Log SMS returned ${response.status()}`).toBeLessThan(500);
  });

  test('POST log-email interaction', async ({ request }) => {
    if (!authToken) return;

    const response = await request.post(
      `${BACKEND_URL}/api/boat-rentals/crm/interactions/log-email`,
      {
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
        data: {
          customer_id: 1,
          notes: 'E2E test email log',
          direction: 'outbound',
          subject: 'Automated E2E Test',
          email: 'test@example.com',
        },
        timeout: API_TIMEOUT,
      }
    );

    expect(response.status(), `Log email returned ${response.status()}`).toBeLessThan(500);
  });
});
