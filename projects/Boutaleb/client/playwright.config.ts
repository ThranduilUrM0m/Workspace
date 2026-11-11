import { defineConfig, devices } from '@playwright/test';

// Signed-out specs run as before. Signed-in specs (*.signed-in.spec.ts)
// reuse the session signed-in.setup.ts saves; they need the Clerk keys,
// so run them through `infisical run -- pnpm exec playwright test`.
const SIGNED_IN = /\.signed-in\.spec\.ts$/;

export default defineConfig({
    testDir: './e2e',
    use: { baseURL: 'http://localhost:3002' },
    projects: [
        { name: 'chromium', use: { ...devices['Desktop Chrome'] }, testIgnore: [SIGNED_IN, /\.setup\.ts$/] },
        { name: 'signed-in setup', testMatch: /signed-in\.setup\.ts$/ },
        {
            name: 'signed-in',
            testMatch: SIGNED_IN,
            use: { ...devices['Desktop Chrome'], storageState: 'e2e/.auth/user.json' },
            dependencies: ['signed-in setup'],
        },
    ],
    // The production server, never `next dev`: dev compiles every route on
    // first hit and does not fit in 8 GB next to Chromium. Run `next build`
    // first; the tests then hit what ships.
    webServer: {
        command: 'corepack pnpm start',
        url: 'http://localhost:3002/en/privacy',
        reuseExistingServer: true,
        timeout: 180_000,
    },
});
