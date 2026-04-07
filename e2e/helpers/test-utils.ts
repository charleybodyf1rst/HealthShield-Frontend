import { type Page, expect, request as pwRequest } from '@playwright/test';

export const API_BASE =
  process.env.API_BASE ||
  'https://systemsf1rst-backend-887571186773.us-central1.run.app';

export interface TestAccount {
  email: string;
  password: string;
  firstName: string;
  phone: string;
}

export const TEST_ACCOUNTS: TestAccount[] = [
  { email: 'ken@systemsf1rst.com', password: 'Password123!', firstName: 'Ken', phone: '+15124700454' },
  { email: 'charley@bodyf1rst.com', password: 'Password123!', firstName: 'Charley', phone: '+15123505372' },
  { email: 'michael@systemsf1rst.com', password: 'Password123!', firstName: 'Michael', phone: '+13124017455' },
  { email: 'billy@systemsf1rst.com', password: 'Password123!', firstName: 'Billy', phone: '+14693526110' },
  { email: 'dustin@systemsf1rst.com', password: 'Password123!', firstName: 'Dustin', phone: '+15126449673' },
  { email: 'chris@systemsf1rst.com', password: 'Password123!', firstName: 'Chris', phone: '+15127912185' },
  { email: 'richie@systemsf1rst.com', password: 'Password123!', firstName: 'Richie', phone: '+15124018832' },
];

/**
 * Login via the UI by filling the login form and submitting.
 */
export async function login(
  page: Page,
  email: string,
  password: string,
): Promise<void> {
  await page.goto('/login');
  await page.waitForLoadState('domcontentloaded');

  await page.getByLabel('Email').fill(email);
  await page.getByLabel('Password').fill(password);
  await page.getByRole('button', { name: 'Sign in' }).click();

  await page.waitForURL('**/dashboard**', { timeout: 15000, waitUntil: 'domcontentloaded' });
  await expect(page).toHaveURL(/\/dashboard/);
}

// Token cache — login once per account per test run
const tokenCache = new Map<string, { token: string; user: Record<string, unknown> }>();

async function getCachedToken(email: string, password: string): Promise<{ token: string; user: Record<string, unknown> }> {
  if (tokenCache.has(email)) return tokenCache.get(email)!;

  const ctx = await pwRequest.newContext();
  let response;
  for (let attempt = 0; attempt < 3; attempt++) {
    if (attempt > 0) await new Promise((r) => setTimeout(r, 10000 * attempt));
    response = await ctx.post(`${API_BASE}/api/v1/sales/login`, {
      multipart: { email, password },
    });
    if (response.status() !== 429) break;
  }

  if (!response!.ok()) {
    await ctx.dispose();
    throw new Error(`Token fetch failed for ${email}: ${response!.status()}`);
  }

  const body = await response!.json();
  await ctx.dispose();
  const result = { token: body.data.token, user: body.data.user };
  tokenCache.set(email, result);
  return result;
}

/**
 * Fast login using cached tokens. Only hits the API once per email per test run.
 * Injects auth state directly into localStorage for the HealthShield CRM.
 */
export async function loginFast(
  page: Page,
  email: string,
  password: string,
): Promise<void> {
  const { token, user } = await getCachedToken(email, password);

  const authState = {
    state: {
      user: {
        id: String(user?.id ?? ''),
        email: (user?.email as string) ?? email,
        firstName: (user?.firstName as string) ?? '',
        lastName: (user?.lastName as string) ?? '',
        role: (user?.role as string) ?? 'sales_rep',
        phone: (user?.phone as string) ?? '',
        avatar: undefined,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      tokens: {
        accessToken: token,
        refreshToken: '',
        expiresIn: 86400,
        createdAt: Date.now(),
      },
      isAuthenticated: true,
      isLoading: false,
      error: null,
      isHydrated: true,
    },
    version: 0,
  };

  await page.goto('/login', { waitUntil: 'commit' });
  await page.evaluate((state) => {
    localStorage.setItem('healthshield-crm-auth', JSON.stringify(state));
  }, authState);
  await page.goto('/dashboard');
  await page.waitForLoadState('domcontentloaded');
}
