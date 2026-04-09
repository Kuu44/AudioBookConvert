import { defineConfig, devices } from '@playwright/test';

const browserTarget = (process.env.PLAYWRIGHT_BROWSER || (process.env.CI ? 'chromium' : 'msedge')).toLowerCase();
const useChromium = browserTarget === 'chromium';

export default defineConfig({
  testDir: './tests',
  fullyParallel: false,
  retries: 0,
  reporter: 'line',
  use: {
    baseURL: 'http://127.0.0.1:4173',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure'
  },
  webServer: {
    command: 'node ./node_modules/vite/bin/vite.js --host 127.0.0.1 --port 4173',
    url: 'http://127.0.0.1:4173',
    reuseExistingServer: !process.env.CI,
    stdout: 'ignore',
    stderr: 'pipe'
  },
  projects: [
    useChromium
      ? {
          name: 'chromium',
          use: {
            ...devices['Desktop Chrome']
          }
        }
      : {
          name: 'msedge',
          use: {
            ...devices['Desktop Edge'],
            channel: 'msedge'
          }
        }
  ]
});
