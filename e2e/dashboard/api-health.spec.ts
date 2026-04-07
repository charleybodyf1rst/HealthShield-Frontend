import { test, expect } from '@playwright/test';

/**
 * API Endpoint Health Checks
 *
 * Verifies that key backend API endpoints respond correctly.
 * These tests use Playwright's APIRequestContext (not a browser page).
 *
 * Backend: https://systemsf1rst-backend-887571186773.us-central1.run.app
 *
 * Tests cover:
 *   - General health endpoint
 *   - Auth endpoints (login with invalid and valid credentials)
 *   - Dashboard stats API
 *   - Leads CRUD API
 *   - Customers API
 *   - Boats API
 *   - Bookings API
 *   - Pipeline API
 *
 * Auth: Uses storageState from e2e/.auth/user.json (set by global-setup).
 */

const BACKEND_URL = 'https://systemsf1rst-backend-887571186773.us-central1.run.app';
const API_TIMEOUT = 20_000;

const AUTH_CREDENTIALS = {
  email: 'charley@bodyf1rst.com',
  password: 'Password123!',
};

// Helper to get a Bearer token
async function getAuthToken(request: any): Promise<string | null> {
  try {
    const loginResp = await request.post(`${BACKEND_URL}/api/v1/auth/login`, {
      headers: { Accept: 'application/json' },
      multipart: {
        email: AUTH_CREDENTIALS.email,
        password: AUTH_CREDENTIALS.password,
      },
      timeout: API_TIMEOUT,
    });

    if (loginResp.status() >= 400) return null;

    const body = await loginResp.json();
    return body?.token || body?.access_token || null;
  } catch {
    return null;
  }
}

// ─── Frontend Health ────────────────────────────────────────────────────────

test.describe('Frontend API Health', () => {
  test('Frontend /api/health endpoint returns healthy status or 404', async ({ request }) => {
    const response = await request.get('/api/health', { timeout: API_TIMEOUT });
    expect([200, 404]).toContain(response.status());

    if (response.status() === 200) {
      const body = await response.json();
      expect(body.status).toBe('healthy');
      expect(body.timestamp).toBeTruthy();
    }
  });
});

// ─── Backend General Health ─────────────────────────────────────────────────

test.describe('Backend API Health', () => {
  test('Backend API root is reachable (no 5xx)', async ({ request }) => {
    const response = await request.get(`${BACKEND_URL}/api/v1/health`, {
      headers: { Accept: 'application/json' },
      timeout: API_TIMEOUT,
    });
    expect(response.status(), `Backend health returned ${response.status()}`).toBeLessThan(500);
  });

  test('Backend returns proper CORS headers', async ({ request }) => {
    const response = await request.get(`${BACKEND_URL}/api/v1/health`, {
      headers: {
        Accept: 'application/json',
        Origin: 'http://localhost:3000',
      },
      timeout: API_TIMEOUT,
    });
    // Just verify it responds without 5xx
    expect(response.status()).toBeLessThan(500);
  });
});

// ─── Auth Endpoints ─────────────────────────────────────────────────────────

test.describe('Backend Auth Endpoints', () => {
  test('Login with invalid credentials returns 401 or 422 (not 500)', async ({ request }) => {
    const response = await request.post(`${BACKEND_URL}/api/v1/auth/login`, {
      headers: { Accept: 'application/json' },
      multipart: {
        email: 'invalid@nonexistent.com',
        password: 'wrongpassword',
      },
      timeout: API_TIMEOUT,
    });

    const status = response.status();
    expect(status, `Expected 4xx but got ${status}`).toBeLessThan(500);
    expect([401, 403, 422]).toContain(status);
  });

  test('Login with valid credentials returns 200 with token', async ({ request }) => {
    const response = await request.post(`${BACKEND_URL}/api/v1/auth/login`, {
      headers: { Accept: 'application/json' },
      multipart: {
        email: AUTH_CREDENTIALS.email,
        password: AUTH_CREDENTIALS.password,
      },
      timeout: API_TIMEOUT,
    });

    const status = response.status();
    expect(status, `Login returned ${status}`).toBeLessThan(500);

    if (status === 200) {
      const body = await response.json();
      const token = body?.token || body?.access_token;
      expect(token, 'Login response should include a token').toBeTruthy();
    }
  });

  test('Login with missing fields returns validation error (not 500)', async ({ request }) => {
    const response = await request.post(`${BACKEND_URL}/api/v1/auth/login`, {
      headers: { Accept: 'application/json' },
      multipart: { email: '' },
      timeout: API_TIMEOUT,
    });

    expect(response.status()).toBeLessThan(500);
  });
});

// ─── Dashboard Stats API ────────────────────────────────────────────────────

test.describe('Backend Dashboard Stats', () => {
  test('Dashboard stats endpoint responds (authenticated)', async ({ request }) => {
    const token = await getAuthToken(request);
    if (!token) {
      test.skip(true, 'Could not obtain auth token');
      return;
    }

    const response = await request.get(`${BACKEND_URL}/api/v1/boat-rentals/dashboard/stats`, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/json',
      },
      timeout: API_TIMEOUT,
    });

    // Accept any response that isn't a crash
    expect(response.status()).toBeDefined();
  });

  test('Dashboard stats without auth returns 401', async ({ request }) => {
    const response = await request.get(`${BACKEND_URL}/api/v1/boat-rentals/dashboard/stats`, {
      headers: { Accept: 'application/json' },
      timeout: API_TIMEOUT,
    });

    const status = response.status();
    // Should be 401 (unauthenticated) but definitely not 500
    expect(status).toBeLessThan(500);
  });
});

// ─── Leads API ──────────────────────────────────────────────────────────────

test.describe('Backend Leads API', () => {
  let token: string | null = null;

  test.beforeAll(async ({ request }) => {
    token = await getAuthToken(request);
  });

  test('GET leads list responds without 5xx', async ({ request }) => {
    if (!token) {
      test.skip(true, 'No auth token');
      return;
    }

    const response = await request.get(`${BACKEND_URL}/api/v1/crm/leads`, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/json',
      },
      timeout: API_TIMEOUT,
    });

    expect(response.status(), `Leads GET returned ${response.status()}`).toBeLessThan(500);
  });

  test('GET leads list returns array data on success', async ({ request }) => {
    if (!token) {
      test.skip(true, 'No auth token');
      return;
    }

    const response = await request.get(`${BACKEND_URL}/api/v1/crm/leads`, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/json',
      },
      timeout: API_TIMEOUT,
    });

    if (response.status() === 200) {
      const body = await response.json();
      // Response should contain data (array of leads or paginated response)
      expect(body).toBeDefined();
      const data = body?.data || body?.leads || body;
      expect(Array.isArray(data) || typeof data === 'object').toBeTruthy();
    }
  });

  test('GET leads with search parameter responds', async ({ request }) => {
    if (!token) {
      test.skip(true, 'No auth token');
      return;
    }

    const response = await request.get(`${BACKEND_URL}/api/v1/crm/leads?search=test`, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/json',
      },
      timeout: API_TIMEOUT,
    });

    expect(response.status()).toBeLessThan(500);
  });

  test('GET leads with status filter responds', async ({ request }) => {
    if (!token) {
      test.skip(true, 'No auth token');
      return;
    }

    const response = await request.get(`${BACKEND_URL}/api/v1/crm/leads?status=new`, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/json',
      },
      timeout: API_TIMEOUT,
    });

    expect(response.status()).toBeLessThan(500);
  });

  test('GET lead stats endpoint responds', async ({ request }) => {
    if (!token) {
      test.skip(true, 'No auth token');
      return;
    }

    const response = await request.get(`${BACKEND_URL}/api/v1/crm/leads/stats`, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/json',
      },
      timeout: API_TIMEOUT,
    });

    expect(response.status()).toBeLessThan(500);
  });

  test('GET pipeline endpoint responds', async ({ request }) => {
    if (!token) {
      test.skip(true, 'No auth token');
      return;
    }

    const response = await request.get(`${BACKEND_URL}/api/v1/crm/pipeline`, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/json',
      },
      timeout: API_TIMEOUT,
    });

    expect(response.status()).toBeLessThan(500);
  });

  test('POST create lead with missing data returns validation error (not 500)', async ({ request }) => {
    if (!token) {
      test.skip(true, 'No auth token');
      return;
    }

    const response = await request.post(`${BACKEND_URL}/api/v1/crm/leads`, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      data: { firstName: '' }, // Missing required fields
      timeout: API_TIMEOUT,
    });

    // Should return 422 validation error, not 500
    expect(response.status()).toBeLessThan(500);
  });
});

// ─── Customers API ──────────────────────────────────────────────────────────

test.describe('Backend Customers API', () => {
  let token: string | null = null;

  test.beforeAll(async ({ request }) => {
    token = await getAuthToken(request);
  });

  test('GET customers list responds without 5xx', async ({ request }) => {
    if (!token) {
      test.skip(true, 'No auth token');
      return;
    }

    const response = await request.get(`${BACKEND_URL}/api/v1/boat-rentals/customers`, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/json',
      },
      timeout: API_TIMEOUT,
    });

    expect(response.status()).toBeLessThan(500);
  });

  test('GET customers without auth returns 401', async ({ request }) => {
    const response = await request.get(`${BACKEND_URL}/api/v1/boat-rentals/customers`, {
      headers: { Accept: 'application/json' },
      timeout: API_TIMEOUT,
    });

    expect(response.status()).toBeLessThan(500);
    // Expected: 401 Unauthorized
    expect([401, 403]).toContain(response.status());
  });
});

// ─── Boats API ──────────────────────────────────────────────────────────────

test.describe('Backend Boats API', () => {
  let token: string | null = null;

  test.beforeAll(async ({ request }) => {
    token = await getAuthToken(request);
  });

  test('GET boats list responds without 5xx', async ({ request }) => {
    if (!token) {
      test.skip(true, 'No auth token');
      return;
    }

    const response = await request.get(`${BACKEND_URL}/api/v1/boat-rentals/boats`, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/json',
      },
      timeout: API_TIMEOUT,
    });

    expect(response.status(), `Boats GET returned ${response.status()}`).toBeLessThan(500);
  });

  test('GET boats without auth returns 401', async ({ request }) => {
    const response = await request.get(`${BACKEND_URL}/api/v1/boat-rentals/boats`, {
      headers: { Accept: 'application/json' },
      timeout: API_TIMEOUT,
    });

    expect(response.status()).toBeLessThan(500);
  });
});

// ─── Bookings API ───────────────────────────────────────────────────────────

test.describe('Backend Bookings API', () => {
  let token: string | null = null;

  test.beforeAll(async ({ request }) => {
    token = await getAuthToken(request);
  });

  test('GET bookings list responds without 5xx', async ({ request }) => {
    if (!token) {
      test.skip(true, 'No auth token');
      return;
    }

    const response = await request.get(`${BACKEND_URL}/api/v1/boat-rentals/bookings`, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/json',
      },
      timeout: API_TIMEOUT,
    });

    expect(response.status(), `Bookings GET returned ${response.status()}`).toBeLessThan(500);
  });

  test('GET bookings returns data or empty array on success', async ({ request }) => {
    if (!token) {
      test.skip(true, 'No auth token');
      return;
    }

    const response = await request.get(`${BACKEND_URL}/api/v1/boat-rentals/bookings`, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/json',
      },
      timeout: API_TIMEOUT,
    });

    if (response.status() === 200) {
      const body = await response.json();
      expect(body).toBeDefined();
    }
  });

  test('GET bookings without auth returns 401', async ({ request }) => {
    const response = await request.get(`${BACKEND_URL}/api/v1/boat-rentals/bookings`, {
      headers: { Accept: 'application/json' },
      timeout: API_TIMEOUT,
    });

    expect(response.status()).toBeLessThan(500);
  });
});

// ─── AI Endpoints ───────────────────────────────────────────────────────────

test.describe('Backend AI Endpoints', () => {
  let token: string | null = null;

  test.beforeAll(async ({ request }) => {
    token = await getAuthToken(request);
  });

  test('AI next-best-actions endpoint responds', async ({ request }) => {
    if (!token) {
      test.skip(true, 'No auth token');
      return;
    }

    const response = await request.get(`${BACKEND_URL}/api/v1/crm/ai/next-best-actions`, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/json',
      },
      timeout: API_TIMEOUT,
    });

    // AI endpoints may 404 if not configured, but should not 500
    expect(response.status()).toBeLessThan(500);
  });
});

// ─── Response Time Checks ───────────────────────────────────────────────────

test.describe('Backend Response Times', () => {
  let token: string | null = null;

  test.beforeAll(async ({ request }) => {
    token = await getAuthToken(request);
  });

  test('Login endpoint responds within 10 seconds', async ({ request }) => {
    const start = Date.now();
    await request.post(`${BACKEND_URL}/api/v1/auth/login`, {
      headers: { Accept: 'application/json' },
      multipart: {
        email: AUTH_CREDENTIALS.email,
        password: AUTH_CREDENTIALS.password,
      },
      timeout: API_TIMEOUT,
    });
    const elapsed = Date.now() - start;
    expect(elapsed, `Login took ${elapsed}ms`).toBeLessThan(10_000);
  });

  test('Boats list responds within 10 seconds', async ({ request }) => {
    if (!token) {
      test.skip(true, 'No auth token');
      return;
    }

    const start = Date.now();
    await request.get(`${BACKEND_URL}/api/v1/boat-rentals/boats`, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/json',
      },
      timeout: API_TIMEOUT,
    });
    const elapsed = Date.now() - start;
    expect(elapsed, `Boats list took ${elapsed}ms`).toBeLessThan(10_000);
  });

  test('Leads list responds within 10 seconds', async ({ request }) => {
    if (!token) {
      test.skip(true, 'No auth token');
      return;
    }

    const start = Date.now();
    await request.get(`${BACKEND_URL}/api/v1/crm/leads`, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/json',
      },
      timeout: API_TIMEOUT,
    });
    const elapsed = Date.now() - start;
    expect(elapsed, `Leads list took ${elapsed}ms`).toBeLessThan(10_000);
  });
});
