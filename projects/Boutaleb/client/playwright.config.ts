import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
    testDir: './e2e',
    use: { baseURL: 'http://localhost:3002' },
    projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
    webServer: {
        command: 'corepack pnpm dev',
        url: 'http://localhost:3002/en/privacy',
        reuseExistingServer: true,
        timeout: 180_000,
    },
});
