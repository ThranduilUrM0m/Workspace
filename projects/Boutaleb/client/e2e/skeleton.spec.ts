import { expect, test } from '@playwright/test';

// Walking-skeleton smoke tests (plan T1.6). Grows into the Tier A suite
// (Standards/launch-readiness.md) at M13.

for (const width of [320, 375, 1280]) {
    test(`/privacy renders without horizontal scroll at ${width}px`, async ({ page }) => {
        await page.setViewportSize({ width, height: 800 });
        const res = await page.goto('/privacy');
        expect(res?.status()).toBe(200);
        await expect(page.getByRole('heading', { level: 1, name: 'Privacy policy' })).toBeVisible();
        const overflow = await page.evaluate(
            () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
        );
        expect(overflow).toBe(0);
    });
}

test('each locale sets lang and direction on <html>', async ({ page }) => {
    for (const [path, lang, dir] of [
        ['/privacy', 'fr', 'ltr'],
        ['/en/privacy', 'en', 'ltr'],
        ['/ar/privacy', 'ar', 'rtl'],
    ]) {
        await page.goto(path);
        await expect(page.locator('html')).toHaveAttribute('lang', lang);
        await expect(page.locator('html')).toHaveAttribute('dir', dir);
    }
});

test('the phone menu opens, traps the page and closes on Escape', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 800 });
    await page.goto('/en/privacy');
    const button = page.getByRole('button', { name: 'Open menu' });
    await button.click();
    await expect(page.locator('html')).toHaveClass(/nav-open/);
    await expect(page.locator('main')).toHaveJSProperty('inert', true);
    await page.keyboard.press('Escape');
    await expect(page.locator('html')).not.toHaveClass(/nav-open/);
    await expect(button).toBeFocused();
});

test('unknown routes answer 404', async ({ request }) => {
    for (const path of ['/this-page-does-not-exist', '/en/nope', '/xx/privacy']) {
        const res = await request.get(path);
        expect(res.status(), path).toBe(404);
    }
});
