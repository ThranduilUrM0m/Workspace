import { expect, test } from '@playwright/test';

// T6.3: the three auth screens, signed out, against the Clerk dev instance.
// Signed-in flows wait for @clerk/testing tokens.

test('/login has both providers, no sign-up link and no Remember me', async ({ page }) => {
    await page.goto('/login');
    await expect(page.getByRole('heading', { name: 'Login to your dashboard.' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Google' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'GitHub' })).toBeVisible();
    await expect(page.getByText(/sign up|create an account/i)).toHaveCount(0);
    await expect(page.getByLabel(/remember me/i)).toHaveCount(0);
});

test('/login badges a malformed address before asking Clerk', async ({ page }) => {
    await page.goto('/login');
    await page.getByLabel('Email').fill('not-an-address');
    await page.getByLabel('Password').fill('anything');
    await page.getByRole('button', { name: 'Log in' }).click();
    await expect(page.getByText('Invalid email')).toBeVisible();
});

test('an unknown address gets the one credential message, no field marked', async ({ page }) => {
    await page.goto('/login');
    await page.getByLabel('Email').fill('nobody-here@example.com');
    await page.getByLabel('Password').fill('not-a-real-password-123');
    await page.getByRole('button', { name: 'Log in' }).click();
    await expect(page.getByRole('status')).toHaveText('Email or password is incorrect.', { timeout: 20_000 });
    await expect(page.locator('[data-invalid]')).toHaveCount(0);
});

test('/forgot-password shows the same sent panel for an unknown address', async ({ page }) => {
    await page.goto('/forgot-password');
    await page.getByLabel('Email').fill('nobody-here@example.com');
    await page.getByRole('button', { name: 'Send reset code' }).click();
    await expect(page.getByText(/has an account, a reset code is on its way/)).toBeVisible({ timeout: 20_000 });
    await expect(page.getByLabel('Code')).toBeVisible();
});

test('/reset-password reached directly shows the code-expired panel', async ({ page }) => {
    await page.goto('/reset-password');
    await expect(page.getByText('That code no longer works.')).toBeVisible({ timeout: 20_000 });
    await expect(page.getByRole('link', { name: 'Send a new code' })).toHaveAttribute('href', '/forgot-password');
});

test('a failed submit focuses the first bad field and keeps its badge', async ({ page }) => {
    await page.goto('/login');
    await page.getByRole('button', { name: 'Log in' }).click();
    await expect(page.getByLabel('Email')).toBeFocused();
    await expect(page.getByText('Required')).toHaveCount(2);
});

test('/privacy-notice is reachable signed out and linked from /login', async ({ page }) => {
    await page.goto('/login');
    await page.getByRole('link', { name: 'How your data is handled' }).click();
    await expect(page).toHaveURL(/\/privacy-notice$/);
    await expect(page.getByRole('heading', { name: 'How your data is handled.' })).toBeVisible();
});
