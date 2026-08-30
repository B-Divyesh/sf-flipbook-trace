import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: '../../tests',
  timeout: 45_000,
  expect: { timeout: 10_000 },
  fullyParallel: false,
  workers: 1,
  reporter: [
    ['list'],
    ['json', { outputFile: '.factory/evidence-polish-7-live/playwright-live.json' }],
  ],
  use: {
    baseURL: 'https://flipbook-trace.sociobot.in',
    serviceWorkers: 'allow',
    screenshot: 'only-on-failure',
    trace: 'retain-on-failure',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
  ],
});
