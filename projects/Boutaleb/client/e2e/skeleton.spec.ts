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

test('the Arabic frame speaks Arabic and keeps the wordmark Latin', async ({ page }) => {
    await page.goto('/ar/privacy');
    await expect(page.getByRole('navigation', { name: 'القائمة' }).getByRole('link', { name: 'نبذة' })).toBeAttached();
    const mark = page.locator('.site-mark bdi');
    await expect(mark).toHaveAttribute('dir', 'ltr');
    await expect(page.locator('.site-mark')).not.toHaveAttribute('dir', /.*/);
    // Tracking breaks Arabic joins: no letter-spacing on Arabic text.
    const spacing = await page.locator('.nf-cap').first().evaluate((el) => getComputedStyle(el).letterSpacing);
    expect(spacing).toBe('normal');
});

test('the language switch marks the current language and links the others to the same page', async ({ page }) => {
    await page.goto('/en/privacy');
    const sw = page.locator('.lang-sw');
    await expect(sw.locator('[aria-current="true"]')).toHaveText('EN');
    await expect(sw.getByRole('link', { name: 'FR, Français' })).toHaveAttribute('href', '/privacy');
    await expect(sw.getByRole('link', { name: 'عربي، العربية' })).toHaveAttribute('href', '/ar/privacy');
});

test('only the bare home page follows a remembered language', async ({ request }) => {
    const opts = { maxRedirects: 0, headers: { cookie: 'NEXT_LOCALE=en' } };
    const home = await request.get('/', opts);
    expect(home.status()).toBe(307);
    expect(home.headers().location).toMatch(/\/en$/);
    const page = await request.get('/privacy', opts);
    expect(page.status()).toBe(200);
});

test('a switch click remembers the language', async ({ page, context }) => {
    await page.goto('/privacy');
    await page.locator('.lang-sw').getByRole('link', { name: 'EN, English' }).click();
    await expect(page).toHaveURL(/\/en\/privacy$/);
    const cookie = (await context.cookies()).find((c) => c.name === 'NEXT_LOCALE');
    expect(cookie?.value).toBe('en');
});
