import { expect, test } from '@playwright/test';

// T6.5: the ERP shell, signed in as the e2e user.

test.describe('desktop', () => {
    test.use({ viewport: { width: 1440, height: 900 } });

    test('the rail shows every group and marks the current page', async ({ page }) => {
        await page.goto('/app');
        const nav = page.getByRole('navigation', { name: 'App' });
        for (const label of ['Dashboard', 'Work', 'Projects', 'Clients', 'Analytics', 'Blog', 'Pages']) {
            await expect(nav.getByRole('link', { name: label })).toBeAttached();
        }
        await expect(nav.getByRole('link', { name: 'Dashboard' })).toHaveAttribute('aria-current', 'page');
        await expect(page.locator('.profile-block')).toContainText('Hello, Test');
    });

    test('a record page keeps its section marked and opens its group', async ({ page }) => {
        await page.goto('/app/finance/invoices/FAC-2026-0001');
        const nav = page.getByRole('navigation', { name: 'App' });
        // Collapsed, the rail hides its sub-links; the panel opens on hover.
        await page.locator('.sidebar').hover();
        await expect(nav.getByRole('button', { name: 'Finance' })).toHaveAttribute('aria-expanded', 'true');
        await expect(nav.getByRole('link', { name: 'Invoices' })).toHaveAttribute('aria-current', 'page');
        await expect(page.getByRole('heading', { level: 1 })).toHaveText('Finance › Invoices › FAC 2026 0001');
    });

    test('the rail never reflows the page when it opens', async ({ page }) => {
        await page.goto('/app');
        const before = await page.locator('#main').boundingBox();
        await page.locator('.sidebar').hover();
        await expect(page.locator('.sidebar-inner')).toHaveCSS('width', '240px');
        expect(await page.locator('#main').boundingBox()).toEqual(before);
    });

    test('the skip link lands on the content', async ({ page }) => {
        await page.goto('/app');
        await page.keyboard.press('Tab');
        await expect(page.getByRole('link', { name: 'Skip to content' })).toBeFocused();
        await page.keyboard.press('Enter');
        await expect(page.locator('#content')).toBeFocused();
    });
});

test.describe('phone', () => {
    test.use({ viewport: { width: 390, height: 844 }, hasTouch: true });

    test('the menu opens over the bar, makes the page inert, and closes with Esc', async ({ page }) => {
        await page.goto('/app');
        const open = page.getByRole('button', { name: 'Open menu' });
        await open.click();
        await expect(page.locator('#main')).toHaveAttribute('inert', '');
        await expect(page.getByRole('navigation', { name: 'App' }).getByRole('link', { name: 'Dashboard' })).toBeFocused();
        await page.keyboard.press('Escape');
        await expect(page.locator('#main')).not.toHaveAttribute('inert', '');
        await expect(open).toBeFocused();
    });

    test('following a link closes the menu', async ({ page }) => {
        await page.goto('/app');
        await page.getByRole('button', { name: 'Open menu' }).click();
        await page.getByRole('navigation', { name: 'App' }).getByRole('link', { name: 'Projects' }).click();
        await expect(page).toHaveURL(/\/app\/projects$/);
        await expect(page.getByRole('button', { name: 'Open menu' })).toBeVisible();
        await expect(page.locator('#main')).not.toHaveAttribute('inert', '');
    });
});
