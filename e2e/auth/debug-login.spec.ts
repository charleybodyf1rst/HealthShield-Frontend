import { test, expect } from '@playwright/test';

const BASE_URL = 'https://healthshield-frontend-887571186773.us-central1.run.app';

test('Watch login happen step by step', async ({ page }) => {
  // Intercept the login POST to capture exactly what happens
  let loginRequest: any = null;
  let loginResponse: any = null;

  page.on('request', req => {
    if (req.url().includes('auth/login') && req.method() === 'POST') {
      loginRequest = {
        url: req.url(),
        method: req.method(),
        body: req.postData(),
        headers: req.headers(),
      };
      console.log('>>> LOGIN REQUEST SENT TO:', req.url());
    }
  });

  page.on('response', async res => {
    if (res.url().includes('auth/login') && res.request().method() === 'POST') {
      let body = '';
      try { body = await res.text(); } catch {}
      loginResponse = {
        status: res.status(),
        url: res.url(),
        body: body.substring(0, 500),
      };
      console.log('<<< LOGIN RESPONSE:', res.status(), res.url());
    }
  });

  page.on('requestfailed', req => {
    if (req.url().includes('auth') || req.url().includes('login')) {
      console.log('!!! REQUEST FAILED:', req.url(), req.failure()?.errorText);
    }
  });

  // Clear everything and go to login
  await page.goto(`${BASE_URL}/login`, { waitUntil: 'networkidle' });
  await page.evaluate(() => {
    localStorage.clear();
    sessionStorage.clear();
    document.cookie.split(';').forEach(c => {
      document.cookie = c.trim().split('=')[0] + '=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/';
    });
  });
  await page.reload({ waitUntil: 'networkidle' });
  await page.waitForTimeout(2000);

  // Verify clean state
  const hasError = await page.locator('text=Invalid').count();
  console.log('Error message visible before login:', hasError > 0);

  // Type credentials slowly like a human
  await page.click('input[type="email"]');
  await page.keyboard.type('charley@bodyf1rst.com', { delay: 50 });

  await page.click('input[type="password"]');
  await page.keyboard.type('Password123!', { delay: 50 });

  // Screenshot before clicking
  await page.screenshot({ path: 'e2e/results/watch-before-signin.png' });

  // Click sign in
  console.log('=== CLICKING SIGN IN ===');
  await page.click('button[type="submit"]');

  // Wait and watch
  await page.waitForTimeout(10000);

  // Results
  console.log('\n=== RESULTS ===');
  console.log('Final URL:', page.url());
  console.log('Login request:', JSON.stringify(loginRequest, null, 2));
  console.log('Login response:', JSON.stringify(loginResponse, null, 2));

  if (!loginRequest) {
    console.log('!!! NO LOGIN REQUEST WAS MADE - the form submission is broken');
  }

  const finalError = await page.locator('text=Invalid').count();
  console.log('Error visible after attempt:', finalError > 0);

  await page.screenshot({ path: 'e2e/results/watch-after-signin.png' });

  // Check if we made it to dashboard
  if (page.url().includes('/dashboard')) {
    console.log('SUCCESS - logged in!');
  } else {
    console.log('FAILED - still on:', page.url());
  }

  expect(true).toBe(true);
});
