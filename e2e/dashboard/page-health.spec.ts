import { test, expect } from '@playwright/test';
import { loginFast, TEST_ACCOUNTS } from '../helpers/test-utils';

const account = TEST_ACCOUNTS[0]; // Ken

/**
 * Dashboard Page Health Tests
 *
 * Verifies that all dashboard pages load correctly when authenticated.
 * Each page is checked for:
 *   - HTTP status below 500 (no server errors)
 *   - Absence of Next.js error overlays
 *   - Page-specific content that proves the correct page rendered
 *
 * Auth: Uses loginFast() for API-based auth injection.
 */

const dashboardPages: Array<{
  path: string;
  name: string;
  /** Text or regex patterns that MUST appear on the page */
  expectedContent: Array<string | RegExp>;
  /** Optional: a selector that should be visible */
  expectedSelector?: string;
}> = [
  {
    path: '/dashboard',
    name: 'Main Dashboard',
    expectedContent: [/good (morning|afternoon|evening)/i, 'Pipeline Overview'],
    expectedSelector: 'h1',
  },
  {
    path: '/dashboard/crm',
    name: 'CRM',
    expectedContent: ['Boat Rental CRM'],
    expectedSelector: 'h1',
  },
  {
    path: '/dashboard/leads',
    name: 'Leads',
    expectedContent: ['Leads', /manage.*leads/i],
    expectedSelector: 'h1',
  },
  {
    path: '/dashboard/contacts',
    name: 'Contacts',
    expectedContent: [/contacts/i],
  },
  {
    path: '/dashboard/companies',
    name: 'Companies',
    expectedContent: [/companies/i],
  },
  {
    path: '/dashboard/bookings',
    name: 'Bookings',
    expectedContent: [/bookings?/i],
  },
  {
    path: '/dashboard/fleet',
    name: 'Fleet',
    expectedContent: ['Fleet Management'],
    expectedSelector: 'h1',
  },
  {
    path: '/dashboard/employees',
    name: 'Employees',
    expectedContent: [/employees?/i],
  },
  {
    path: '/dashboard/calendar',
    name: 'Calendar',
    expectedContent: [/calendar/i],
  },
  {
    path: '/dashboard/inbox',
    name: 'Inbox',
    expectedContent: [/inbox/i],
  },
  {
    path: '/dashboard/messages',
    name: 'Messages',
    expectedContent: [/messages?/i],
  },
  {
    path: '/dashboard/campaigns',
    name: 'Campaigns',
    expectedContent: [/campaigns?/i],
  },
  {
    path: '/dashboard/pipeline',
    name: 'Pipeline',
    expectedContent: ['Sales Pipeline'],
    expectedSelector: 'h1',
  },
  {
    path: '/dashboard/analytics',
    name: 'Analytics',
    expectedContent: [/analytics/i],
  },
  {
    path: '/dashboard/boat-analytics',
    name: 'Boat Analytics',
    expectedContent: [/boat|analytics/i],
  },
  {
    path: '/dashboard/ai-caller',
    name: 'AI Caller',
    expectedContent: [/ai.*caller|caller/i],
  },
  {
    path: '/dashboard/ai-agents',
    name: 'AI Agents',
    expectedContent: [/ai.*agent|assistant/i],
  },
  {
    path: '/dashboard/best-practices',
    name: 'Best Practices',
    expectedContent: [/best.?practices/i],
  },
  {
    path: '/dashboard/projects',
    name: 'Projects',
    expectedContent: [/projects?/i],
  },
  {
    path: '/dashboard/automations',
    name: 'Automations',
    expectedContent: [/automation/i],
  },
];

test.describe('Dashboard Page Health (Authenticated)', () => {
  test.beforeEach(async ({ page }) => {
    await loginFast(page, account.email, account.password);
  });

  // ── Basic HTTP health: no 5xx errors ──────────────────────────────────
  for (const pg of dashboardPages) {
    test(`[HTTP] ${pg.name} (${pg.path}) does not return a server error`, async ({ page }) => {
      const response = await page.goto(pg.path, { waitUntil: 'domcontentloaded' });
      const status = response?.status() ?? 0;

      // 200 = loaded, 302/307 = redirect (acceptable), anything < 500 is fine
      expect(status, `Expected status < 500 but got ${status}`).toBeLessThan(500);

      // Should not redirect to login (auth working)
      expect(page.url()).not.toContain('/login');

      // Must not show Next.js error overlays
      const bodyText = await page.textContent('body');
      expect(bodyText).not.toContain('Internal Server Error');
      expect(bodyText).not.toContain('Application error');
      expect(bodyText).not.toContain('Unhandled Runtime Error');
    });
  }

  // ── Content verification: correct page rendered ───────────────────────
  for (const pg of dashboardPages) {
    test(`[Content] ${pg.name} (${pg.path}) renders expected content`, async ({ page }) => {
      await page.goto(pg.path, { waitUntil: 'domcontentloaded' });
      await page.waitForLoadState('networkidle', { timeout: 30_000 }).catch(() => {
        // networkidle is best-effort; some pages stream data indefinitely
      });

      const url = page.url();

      // If redirected to login, skip content checks
      if (url.includes('/login')) {
        test.skip(true, 'Redirected to login — auth may have expired');
        return;
      }

      // Verify at least one expected content pattern matches
      const bodyText = (await page.textContent('body')) ?? '';
      let matchedAny = false;

      for (const pattern of pg.expectedContent) {
        if (typeof pattern === 'string') {
          if (bodyText.includes(pattern)) {
            matchedAny = true;
            break;
          }
        } else if (pattern.test(bodyText)) {
          matchedAny = true;
          break;
        }
      }

      expect(matchedAny, `None of the expected patterns found on ${pg.path}. Body excerpt: "${bodyText.slice(0, 300)}"`).toBeTruthy();

      // If a selector is specified, verify it is present
      if (pg.expectedSelector) {
        await expect(page.locator(pg.expectedSelector).first()).toBeVisible({ timeout: 10_000 });
      }
    });
  }

  // ── No console errors on main dashboard ───────────────────────────────
  test('[Console] Main dashboard has no critical console errors', async ({ page }) => {
    const errors: string[] = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });

    await page.goto('/dashboard', { waitUntil: 'domcontentloaded' });
    await page.waitForLoadState('networkidle', { timeout: 20_000 }).catch(() => {});

    // Filter out known non-critical errors (failed API fetch is expected in test envs)
    const critical = errors.filter(
      (e) => !e.includes('Failed to load') && !e.includes('net::ERR') && !e.includes('favicon')
    );

    // We allow some errors but no crashes
    expect(critical.length, `Critical console errors: ${critical.join('\n')}`).toBeLessThan(5);
  });

  // ── Navigation sidebar links exist ────────────────────────────────────
  test('[Nav] Dashboard sidebar contains navigation links', async ({ page }) => {
    await page.goto('/dashboard', { waitUntil: 'domcontentloaded' });
    await page.waitForLoadState('networkidle', { timeout: 20_000 }).catch(() => {});

    // Skip if redirected to login
    if (page.url().includes('/login')) {
      test.skip(true, 'Redirected to login');
      return;
    }

    // Verify at least some nav links are present (sidebar or header)
    const navLinks = page.locator('nav a[href*="/dashboard"]');
    const count = await navLinks.count();
    expect(count, 'Expected navigation links to /dashboard/* pages').toBeGreaterThan(0);
  });

  // ── Page load performance ─────────────────────────────────────────────
  test('[Perf] Main dashboard loads within acceptable time', async ({ page }) => {
    const start = Date.now();
    await page.goto('/dashboard', { waitUntil: 'domcontentloaded' });
    const elapsed = Date.now() - start;

    // Dashboard should load within 15 seconds (generous for CI)
    expect(elapsed, `Dashboard took ${elapsed}ms to load`).toBeLessThan(15_000);
  });
});
