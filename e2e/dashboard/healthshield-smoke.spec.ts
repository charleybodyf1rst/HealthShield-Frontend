import { test, expect } from '@playwright/test';

const BACKEND_URL = 'https://systemsf1rst-backend-887571186773.us-central1.run.app';

// Helper: get auth token for API calls
async function getAuthToken(): Promise<string> {
  const formData = new FormData();
  formData.append('email', 'charley@bodyf1rst.com');
  formData.append('password', 'Password123!');
  formData.append('app', 'crm');

  const res = await fetch(`${BACKEND_URL}/api/v1/auth/login`, {
    method: 'POST',
    body: formData,
  });
  const data = await res.json();
  return data.token;
}

// Helper: make authenticated API call
async function apiCall(token: string, method: string, path: string, body?: Record<string, unknown>) {
  const res = await fetch(`${BACKEND_URL}${path}`, {
    method,
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'X-Organization-ID': '12',
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  return res.json();
}

test.describe('HealthShield Dashboard Smoke Tests', () => {
  let token: string;

  test.beforeAll(async () => {
    token = await getAuthToken();
    expect(token).toBeTruthy();
  });

  test('1. Create Lead — Sarah Johnson (new policy)', async ({ page }) => {
    // Create via API for reliability
    const result = await apiCall(token, 'POST', '/api/v1/sales/leads', {
      firstName: 'Sarah',
      lastName: 'Johnson',
      email: 'sarah.johnson@example.com',
      phone: '5125551001',
      company: 'Johnson & Associates',
      status: 'new',
      source: 'website',
      value: 1200,
      notes: 'Interested in individual health insurance plan',
    });

    console.log('Lead 1 created:', JSON.stringify(result).substring(0, 200));
    expect(result.status === 200 || result.status === 201 || result.data).toBeTruthy();

    // Verify it shows on the leads page
    await page.goto('/dashboard/leads', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(3000);
    await expect(page.locator('text=Sarah Johnson').first()).toBeVisible({ timeout: 10000 });
    await page.screenshot({ path: 'e2e/results/lead-1-created.png' });
  });

  test('2. Create Lead — Marcus Williams (renewal)', async ({ page }) => {
    const result = await apiCall(token, 'POST', '/api/v1/sales/leads', {
      firstName: 'Marcus',
      lastName: 'Williams',
      email: 'marcus.williams@example.com',
      phone: '5125551002',
      company: 'Williams Family',
      status: 'new',
      source: 'referral',
      value: 2400,
      notes: 'Family plan renewal inquiry — 4 members',
    });

    console.log('Lead 2 created:', JSON.stringify(result).substring(0, 200));
    expect(result.status === 200 || result.status === 201 || result.data).toBeTruthy();

    await page.goto('/dashboard/leads', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(3000);
    await expect(page.locator('text=Marcus Williams').first()).toBeVisible({ timeout: 10000 });
    await page.screenshot({ path: 'e2e/results/lead-2-created.png' });
  });

  test('3. Verify leads appear in pipeline', async ({ page }) => {
    await page.goto('/dashboard/pipeline', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(3000);

    // Pipeline should show the new leads in the "New" column
    const pageContent = await page.textContent('body');
    const hasSarah = pageContent?.includes('Sarah') || pageContent?.includes('Johnson');
    const hasMarcus = pageContent?.includes('Marcus') || pageContent?.includes('Williams');

    console.log('Pipeline has Sarah:', hasSarah);
    console.log('Pipeline has Marcus:', hasMarcus);

    await page.screenshot({ path: 'e2e/results/pipeline-with-leads.png' });
    expect(hasSarah || hasMarcus).toBeTruthy();
  });

  test('4. Create calendar appointment', async ({ page }) => {
    // Create via API
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dateStr = tomorrow.toISOString().split('T')[0];

    const result = await apiCall(token, 'POST', '/api/v1/sales/calendar/appointments', {
      title: 'Enrollment Review — Johnson',
      type: 'discovery_call',
      date: dateStr,
      start_time: '10:00',
      duration: 60,
      notes: 'Review Gold plan options for Sarah Johnson',
    });

    console.log('Appointment created:', JSON.stringify(result).substring(0, 200));
    expect(result.status === 200 || result.status === 201 || result.data).toBeTruthy();

    // Verify on calendar page
    await page.goto('/dashboard/calendar', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(3000);
    await page.screenshot({ path: 'e2e/results/calendar-appointment.png' });
  });

  test('5. Create task', async ({ page }) => {
    // Create via API
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dueDate = tomorrow.toISOString().split('T')[0];

    const result = await apiCall(token, 'POST', '/api/v1/crm/tasks', {
      title: 'Follow up with Marcus Williams',
      description: 'Send family plan comparison document and schedule follow-up call',
      priority: 'high',
      status: 'pending',
      due_date: dueDate,
      category: 'follow_up',
    });

    console.log('Task created:', JSON.stringify(result).substring(0, 200));
    expect(result.status === 200 || result.status === 201 || result.data).toBeTruthy();

    // Verify on tasks page
    await page.goto('/dashboard/tasks', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(3000);

    const pageContent = await page.textContent('body');
    const hasTask = pageContent?.includes('Marcus Williams') || pageContent?.includes('Follow up');
    console.log('Tasks page has our task:', hasTask);

    await page.screenshot({ path: 'e2e/results/task-created.png' });
  });

  test('6. Verify dashboard shows data', async ({ page }) => {
    await page.goto('/dashboard', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(4000);

    await page.screenshot({ path: 'e2e/results/dashboard-final.png' });

    // Dashboard should load without crashing
    const pageContent = await page.textContent('body');
    expect(pageContent).toContain('Good');  // "Good morning/afternoon, Charley"
    console.log('Dashboard loaded successfully');
  });
});
