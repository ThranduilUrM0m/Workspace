import { createClerkClient } from '@clerk/nextjs/server';
import { clerk, clerkSetup } from '@clerk/testing/playwright';
import { expect, test as setup } from '@playwright/test';

// Signs the e2e user in once and saves the session for the signed-in
// specs (*.signed-in.spec.ts). Run through `infisical run` so the Clerk
// keys are present. The user lives in the Clerk DEV instance only; the
// +clerk_test address makes Clerk send it no email at all.

export const E2E_EMAIL = 'e2e+clerk_test@example.com';
export const AUTH_FILE = 'e2e/.auth/user.json';

setup.describe.configure({ mode: 'serial' });

setup('clerk testing token', async () => {
    await clerkSetup();
});

setup('the e2e user exists', async () => {
    const secretKey = process.env.CLERK_SECRET_KEY;
    if (!secretKey?.startsWith('sk_test_')) throw new Error('Signed-in e2e runs on the Clerk dev instance only (sk_test_ key).');
    const api = createClerkClient({ secretKey });
    const { data } = await api.users.getUserList({ emailAddress: [E2E_EMAIL] });
    if (!data.length) {
        await api.users.createUser({ emailAddress: [E2E_EMAIL], firstName: 'Test', lastName: 'Owner', skipPasswordRequirement: true });
    }
});

setup('sign in and keep the session', async ({ page }) => {
    await page.goto('/login');
    await clerk.signIn({ page, emailAddress: E2E_EMAIL });
    await page.goto('/app');
    await expect(page.getByRole('heading', { level: 1, name: 'Dashboard' })).toBeVisible();
    await page.context().storageState({ path: AUTH_FILE });
});
