import { test as setup, expect } from '@playwright/test';

const AUTH_FILE = './e2e/.auth/user.json';

// Backend API URL
const BACKEND_URL = 'https://systemsf1rst-backend-887571186773.us-central1.run.app';

setup('authenticate', async ({ page, context }) => {
  // Step 1: Get a real token from the backend
  const formData = new FormData();
  formData.append('email', 'charley@bodyf1rst.com');
  formData.append('password', 'Password123!');
  formData.append('app', 'crm');

  const loginResponse = await fetch(`${BACKEND_URL}/api/v1/auth/login`, {
    method: 'POST',
    body: formData,
  });

  const loginData = await loginResponse.json();
  expect(loginData.status).toBe(200);
  expect(loginData.token).toBeTruthy();

  const token = loginData.token;
  const user = loginData.user;

  // Step 2: Intercept broken backend endpoints
  // The app's api.ts sends JSON POST to /api/auth/login which 301-redirects and loses the body
  await context.route(`${BACKEND_URL}/api/auth/login`, async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ status: 200, token, user }),
    });
  });

  // The backend's /api/auth/me returns {user: null} — intercept to return real user
  await context.route(`${BACKEND_URL}/api/auth/me`, async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ status: 200, user }),
    });
  });

  // Step 3: Set auth-token cookie for Next.js middleware
  const baseUrl = process.env.BASE_URL || 'http://localhost:3001';
  const url = new URL(baseUrl);
  await context.addCookies([{
    name: 'auth-token',
    value: token,
    domain: url.hostname,
    path: '/',
    httpOnly: false,
    secure: url.protocol === 'https:',
    sameSite: 'Lax',
  }]);

  // Step 4: Log in through the UI form (intercepted API call returns real token)
  await page.goto('/login', { waitUntil: 'domcontentloaded', timeout: 30_000 });
  await page.waitForTimeout(2000);

  await page.getByLabel('Email').fill('charley@bodyf1rst.com');
  await page.getByLabel('Password').fill('Password123!');

  await Promise.all([
    page.waitForURL('**/dashboard**', { timeout: 15_000 }).catch(() => {}),
    page.getByRole('button', { name: 'Sign in' }).click(),
  ]);

  await page.waitForTimeout(3000);

  // Verify we're on the dashboard
  expect(page.url()).toContain('/dashboard');

  // Clear route intercepts (they don't persist in storageState)
  await context.unrouteAll({ behavior: 'ignoreErrors' });

  // Save auth state (cookies + localStorage)
  await page.context().storageState({ path: AUTH_FILE });
});
