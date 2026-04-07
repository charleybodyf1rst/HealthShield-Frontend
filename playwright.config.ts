import { defineConfig } from '@playwright/test';

// Port 3001: HealthShield dev server (port 3000 is used by CRM-Website-v2)
const BASE_URL = process.env.BASE_URL || 'http://localhost:3001';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: 1,
  workers: 1,
  timeout: 45_000,

  reporter: [
    ['html', { open: 'never', outputFolder: 'playwright-report' }],
    ['json', { outputFile: 'e2e/results/test-results.json' }],
    ['list'],
  ],

  use: {
    baseURL: BASE_URL,
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    trace: 'retain-on-failure',
    navigationTimeout: 60_000,
    actionTimeout: 15_000,
  },

  projects: [
    {
      name: 'setup',
      testMatch: /global-setup\.ts/,
    },
    {
      name: 'marketing',
      testDir: './e2e/marketing',
    },
    {
      name: 'auth',
      testDir: './e2e/auth',
    },
    {
      name: 'dashboard',
      testDir: './e2e/dashboard',
      dependencies: ['setup'],
      use: {
        storageState: './e2e/.auth/user.json',
      },
    },
    {
      name: 'ai-verification',
      testDir: './e2e/ai-verification',
      dependencies: ['setup'],
      use: {
        storageState: './e2e/.auth/user.json',
      },
    },
    {
      name: 'payment',
      testDir: './e2e/payment',
    },
    {
      name: 'boat-rentals',
      testDir: './e2e/dashboard',
      testMatch: [
        'bookings-crud.spec.ts',
        'equipment-crud.spec.ts',
        'damage-reports.spec.ts',
        'promo-codes.spec.ts',
        'maintenance.spec.ts',
        'captain-schedules.spec.ts',
        'captain-waivers.spec.ts',
        'automations-crud.spec.ts',
        'interactions.spec.ts',
        'analytics-deep.spec.ts',
      ],
      dependencies: ['setup'],
      use: {
        storageState: './e2e/.auth/user.json',
      },
    },
    {
      name: 'booking-flow',
      testDir: './e2e/marketing',
      testMatch: ['booking-flow.spec.ts'],
    },
  ],
});
