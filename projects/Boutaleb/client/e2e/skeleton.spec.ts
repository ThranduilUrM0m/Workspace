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

test('the 404 page echoes the path and offers the close match', async ({ page }) => {
    const res = await page.goto('/en/proces');
    expect(res?.status()).toBe(404);
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('That room isn’t on the plan.');
    await expect(page.locator('.nf-path code')).toHaveText('/en/proces');
    await expect(page.locator('.nf-mean a')).toHaveAttribute('href', '/en/services#process');
    await expect(page.getByRole('navigation', { name: 'Ways on' }).getByRole('link')).toHaveCount(4);
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', 'noindex');
});

test('the 404 page has no "did you mean" when nothing is close', async ({ page }) => {
    await page.goto('/xyz-old-link');
    await expect(page.locator('html')).toHaveAttribute('lang', 'fr');
    await expect(page.locator('.nf-mean')).toHaveCount(0);
    await expect(page.locator('.nf-report a')).toHaveAttribute('href', /subject=Lien%20cass%C3%A9/);
});

test('retired addresses answer 301 in every language', async ({ request }) => {
    for (const [from, to] of [
        ['/process', '/services#process'],
        ['/en/faq', '/en/services#questions'],
        ['/ar/privacy-policy', '/ar/privacy'],
        ['/mentions-legales', '/legal-notice'],
    ]) {
        const res = await request.get(from, { maxRedirects: 0 });
        expect(res.status(), from).toBe(301);
        expect(res.headers().location, from).toBe(to);
    }
});

test('/thanks shows the email line only when the intake cookie is there', async ({ page, context, baseURL }) => {
    const res = await page.goto('/en/thanks');
    expect(res?.status()).toBe(200);
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', /noindex/);
    await expect(page.locator('.ty-lede')).toHaveCount(0);
    await expect(page.locator('.ty-steps li')).toHaveCount(4);
    // The footer keeps its links but drops the headline and form here.
    await expect(page.locator('.site-foot .ft-top')).toBeHidden();

    await context.addCookies([{ name: 'bt_thanks_email', value: 'sara@atlas-riads.ma', url: baseURL! }]);
    await page.reload();
    await expect(page.locator('.ty-lede b')).toHaveText('sara@atlas-riads.ma');
    await expect(page.locator('.ty-steps li.now b')).toHaveText('sara@atlas-riads.ma');
});

test('pages carry canonical, hreflang and a share image; untranslated copies stay out of the index', async ({ page, request }) => {
    await page.goto('/en/privacy');
    await expect(page).toHaveTitle('Privacy policy — Boutaleb');
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', /\/en\/privacy$/);
    await expect(page.locator('link[rel="alternate"][hreflang="x-default"]')).toHaveAttribute('href', /\/en\/privacy$/);
    await expect(page.locator('meta[name="robots"]')).toHaveCount(0);
    await expect(page.locator('meta[property="og:locale"]')).toHaveAttribute('content', 'en_US');

    // French copy of the page does not exist yet: no index, not in hreflang.
    await page.goto('/privacy');
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', /noindex/);
    await expect(page.locator('link[rel="alternate"][hreflang="fr"]')).toHaveCount(0);

    const og = await request.get('/en/opengraph-image');
    expect(og.headers()['content-type']).toBe('image/png');
});

test('terms and the legal notice render on the shared legal layout', async ({ page }) => {
    const res = await page.goto('/en/terms');
    expect(res?.status()).toBe(200);
    await expect(page.getByRole('heading', { level: 1, name: 'Terms of service' })).toBeVisible();
    await expect(page.locator('.l-sec')).toHaveCount(12);

    await page.goto('/en/legal-notice');
    await expect(page.getByRole('heading', { level: 1, name: 'Legal notice' })).toBeVisible();
    await expect(page.locator('.l-lang')).toHaveText('This page is only available in French for now.');
    await expect(page.locator('article')).toHaveAttribute('lang', 'fr');
    await expect(page.locator('.l-rec dt')).toHaveCount(10);
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', /noindex/);

    // French is the real one: indexed, no "French only" note.
    await page.goto('/legal-notice');
    await expect(page.getByRole('heading', { level: 1, name: 'Mentions légales' })).toBeVisible();
    await expect(page.locator('.l-lang')).toHaveCount(0);
    await expect(page.locator('meta[name="robots"]')).toHaveCount(0);
});

for (const path of ['/en/terms', '/legal-notice', '/ar/legal-notice', '/en/services', '/ar/services', '/en/about', '/ar/about', '/en', '/', '/en/portfolio', '/en/portfolio/qasidaty', '/en/blog', '/en/blog?view=list', '/en/blog/longevity-beats-trend', '/ar/blog', '/en/contact']) {
    test(`${path} has no horizontal scroll on a 320px phone`, async ({ page }) => {
        await page.setViewportSize({ width: 320, height: 800 });
        await page.goto(path);
        const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
        expect(overflow).toBe(0);
    });
}

test('/services carries the three anchors the footer and redirects point at', async ({ page }) => {
    const res = await page.goto('/en/services');
    expect(res?.status()).toBe(200);
    for (const id of ['offers', 'process', 'questions']) await expect(page.locator(`#${id}`)).toBeAttached();
    await expect(page.locator('.p-row')).toHaveCount(7);
    await expect(page.locator('.qa > div')).toHaveCount(8);
    // English copy only so far: the French and Arabic URLs render it, unindexed.
    await page.goto('/services');
    await expect(page.locator('main')).toHaveAttribute('lang', 'en');
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', /noindex/);
});

test('/about renders its four blocks; standards cards take keyboard focus', async ({ page }) => {
    const res = await page.goto('/en/about');
    expect(res?.status()).toBe(200);
    await expect(page.locator('.a-card')).toHaveCount(4);
    await expect(page.locator('.a-step')).toHaveCount(4);
    await expect(page.locator('.stat')).toHaveCount(4);
    await page.locator('.a-card').first().focus();
    await expect(page.locator('.a-card').first()).toBeFocused();
});

test('the homepage renders its sections from the shared content', async ({ page }) => {
    const res = await page.goto('/en');
    expect(res?.status()).toBe(200);
    await expect(page).toHaveTitle('Boutaleb — custom web products');
    await expect(page.getByRole('heading', { level: 1 })).toContainText('Bespoke');
    await expect(page.locator('.c3-project')).toHaveCount(2);
    await expect(page.locator('.c3-project').first()).toHaveAttribute('href', '/en/portfolio/qasidaty');
    await expect(page.locator('.stat')).toHaveCount(4);

    // The blog card switches post with its numbered buttons.
    const title = page.locator('.bc-title');
    const first = await title.textContent();
    await page.getByRole('button', { name: 'Post 2' }).click();
    await expect(title).not.toHaveText(first!);
    await expect(page.getByRole('button', { name: 'Post 2' })).toHaveAttribute('aria-current', 'true');
});

test('a portfolio card opens its case study in a dialog; the URL alone is a full page', async ({ page }) => {
    await page.goto('/en/portfolio');
    await expect(page.locator('.g3 .card')).toHaveCount(6);

    // Filters: one per category that has projects, each with its count.
    await page.getByRole('button', { name: /^E-commerce/ }).click();
    await expect(page.locator('.g3 .card:visible')).toHaveCount(1);
    await page.getByRole('button', { name: /^All/ }).click();

    await page.locator('.g3 .card').first().click();
    await expect(page).toHaveURL(/\/en\/portfolio\/qasidaty$/);
    const dialog = page.locator('dialog.case-v1[open]');
    await expect(dialog).toBeVisible();
    await expect(dialog.getByRole('heading', { level: 1, name: 'Qasidaty' })).toBeVisible();
    // No live site or PDF on the record: no buttons drawn.
    await expect(dialog.getByRole('link', { name: 'View live site' })).toHaveCount(0);

    await page.keyboard.press('Escape');
    await expect(page).toHaveURL(/\/en\/portfolio$/);
    await expect(page.locator('dialog.case-v1[open]')).toHaveCount(0);

    // Loaded directly: the full page, no dialog.
    const res = await page.goto('/en/portfolio/risala');
    expect(res?.status()).toBe(200);
    await expect(page.locator('article.case-page')).toBeVisible();
    await expect(page.locator('dialog')).toHaveCount(0);
});

test('/blog keeps its filters, sort and view in the address', async ({ page }) => {
    await page.goto('/en/blog');
    await expect(page.getByRole('heading', { level: 1 })).toContainText('Notes from the work');
    await expect(page.locator('.posts .post')).toHaveCount(8);
    await expect(page.locator('.best')).toHaveCount(1);
    await expect(page.locator('.rated .rate')).toHaveCount(3);
    await expect(page.locator('.mv > a')).toHaveCount(4);

    await page.locator('.cats').getByRole('link', { name: /^Process/ }).click();
    await expect(page).toHaveURL(/\/en\/blog\?c=process$/);
    await expect(page.locator('.posts .post')).toHaveCount(3);
    await expect(page.locator('.cats [aria-current]')).toContainText('Process');

    await page.getByRole('link', { name: 'Most read' }).click();
    await expect(page).toHaveURL(/c=process&sort=read/);
    await page.getByRole('link', { name: 'List view' }).click();
    await expect(page.locator('.posts.list')).toBeVisible();

    // Unknown values fall back to the defaults, never a 404.
    const res = await page.goto('/en/blog?c=nope&sort=oldest&page=x');
    expect(res?.status()).toBe(200);
    await expect(page.locator('.posts .post')).toHaveCount(8);
});

test('a post has its contents, actions and thread; the downvote count is never shown', async ({ page }) => {
    await page.goto('/en/blog/longevity-beats-trend');
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Why longevity beats trend in furniture branding');
    await expect(page.locator('.toc a')).toHaveCount(2);

    const like = page.locator('.engage .ibtn').first();
    await expect(like).toHaveAttribute('aria-label', 'Like, 12');
    await like.click();
    await expect(like).toHaveAttribute('aria-pressed', 'true');
    await expect(like).toHaveAttribute('aria-label', 'Like, 13');
    const down = page.getByRole('button', { name: 'Not for me' });
    await down.click();
    await expect(down).toHaveAttribute('aria-pressed', 'true');
    await expect(like).toHaveAttribute('aria-pressed', 'false');
    await expect(down).toHaveText('');

    await expect(page.locator('.thread > .cmt')).toHaveCount(2);
    await expect(page.locator('.cmt .you')).toHaveText('Author');
    await expect(page.locator('.rel .card')).toHaveCount(3);
    await expect(page.locator('meta[name="robots"]')).toHaveCount(0);

    // The tag pill opens the archive narrowed to that tag.
    await page.locator('.aside .pill').first().click();
    await expect(page).toHaveURL(/\/en\/blog\?t=branding#archive$/);
    await expect(page.locator('.tagged')).toContainText('#branding');

    expect((await page.goto('/en/blog/no-such-post'))?.status()).toBe(404);
});

test('on a phone the post contents fold and shut once a section is picked', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 800 });
    await page.goto('/en/blog/longevity-beats-trend');
    const fold = page.locator('details.ptoc');
    await expect(page.locator('.toc')).toBeHidden();
    await fold.locator('summary').click();
    await fold.getByRole('link', { name: 'What to keep fixed' }).click();
    await expect(fold).not.toHaveAttribute('open', '');
    await expect(page).toHaveURL(/#s2$/);
});

test('form fields float their label, flag errors on leaving and clear them on return', async ({ page }) => {
    await page.goto('/en/about');
    const foot = page.locator('#sec-footer form');
    const email = foot.getByLabel('Email');

    // The select's label is raised from the start; it always has a value.
    await expect(foot.getByLabel('Project type')).toHaveValue('website');

    // Nothing is flagged while typing; leaving the field checks it.
    await email.fill('not-an-email');
    await expect(foot.locator('.f-badge')).toHaveCount(0);
    await email.blur();
    const badge = foot.locator('.f-badge');
    await expect(badge).toHaveText('Check email');
    await expect(email).toHaveAttribute('aria-invalid', 'true');
    await expect(email).toHaveAttribute('aria-describedby', (await badge.getAttribute('id'))!);
    // The text ends where the badge begins.
    expect(await email.evaluate((el) => parseFloat(getComputedStyle(el).paddingInlineEnd))).toBeGreaterThan(40);

    // Coming back to fix it clears the flag; the value stays.
    await email.focus();
    await expect(badge).toHaveCount(0);
    await expect(email).toHaveValue('not-an-email');

    // The honeypot is out of reach.
    await expect(foot.locator('input[name="nickname"]')).toHaveAttribute('tabindex', '-1');
});

test('the comment form flags its required fields on submit, in place', async ({ page }) => {
    await page.goto('/en/blog/longevity-beats-trend');
    const form = page.locator('.c-form form');
    await form.getByRole('button', { name: 'Join the conversation' }).click();
    await expect(form.locator('.f-badge')).toHaveCount(3);
    await expect(form.getByLabel('Full name')).toBeFocused();
});

test('error words follow the page language', async ({ page }) => {
    await page.goto('/ar/about');
    const email = page.locator('#sec-footer form input[type="email"]');
    await email.fill('x');
    await email.blur();
    await expect(page.locator('#sec-footer .f-badge')).toHaveText('بريد غير صالح');
});

test('/contact checks each step before moving on and lands on /thanks', async ({ page, context }) => {
    await context.clearCookies();
    await page.goto('/en/contact');
    const main = page.locator('main');
    const rail = page.locator('.rail');
    await expect(rail.locator('[aria-current="step"] .r-title')).toHaveText('Basics');
    // The footer drops its form here.
    await expect(page.locator('#sec-footer form')).toBeHidden();

    // Continue with step 1 empty: it stays, the first missing field takes the focus.
    await page.getByRole('button', { name: 'Continue' }).click();
    await expect(main.getByLabel('Full name')).toBeFocused();
    await expect(page.locator('fieldset[data-s="1"] .f-badge')).toHaveCount(2);

    await main.getByLabel('Full name').fill('Hamza R.');
    await main.getByLabel('Email', { exact: true }).fill('hamza@example.ma');
    await page.getByRole('button', { name: 'Continue' }).click();
    await expect(rail.locator('[aria-current="step"] .r-title')).toHaveText('Project');
    await expect(main.getByLabel('A line or two about what you need')).toBeFocused();

    // Moving on checks step 2 too; step 3 lists files and removes them.
    const message = main.getByLabel('A line or two about what you need');
    await message.fill('A booking site for a riad.');
    await page.getByRole('button', { name: '+ Add more detail' }).click();
    await expect(rail.locator('[aria-current="step"] .r-title')).toHaveText('Extra detail');
    await page.locator('.dz input[type="file"]').setInputFiles([
        { name: 'brief.pdf', mimeType: 'application/pdf', buffer: Buffer.from('x'.repeat(2048)) },
        { name: 'logo.png', mimeType: 'image/png', buffer: Buffer.from('y') },
    ]);
    await expect(page.locator('.dz-list li')).toHaveCount(2);
    await page.getByRole('button', { name: 'Remove logo.png' }).click();
    await expect(page.locator('.dz-list li')).toHaveCount(1);

    // Back never checks; moving on again does, and focuses what is missing.
    await page.getByRole('button', { name: 'Back' }).last().click();
    await message.fill('');
    await page.getByRole('button', { name: '+ Add more detail' }).click();
    await expect(message).toBeFocused();
    await message.fill('A booking site for a riad.');

    // A reload keeps the answers (files aside, and it says so).
    await page.reload();
    await expect(page.locator('.c-restored')).toBeVisible();
    await expect(main.getByLabel('Full name')).toHaveValue('Hamza R.');

    await page.getByRole('button', { name: 'Continue' }).click();
    await page.locator('fieldset[data-s="2"]').getByRole('button', { name: 'Submit' }).click();
    // Dev compiles the handler and /thanks on first use: allow for it.
    await expect(page).toHaveURL(/\/en\/thanks$/, { timeout: 60_000 });
    await expect(page.locator('main')).toContainText('hamza@example.ma');
});

test('/contact keeps every answer when the send fails', async ({ page }) => {
    await page.route('**/api/enquiries', (route) => route.abort('connectionreset'));
    await page.goto('/en/contact');
    const main = page.locator('main');
    await page.evaluate(() => sessionStorage.clear());
    await main.getByLabel('Full name').fill('Sara L.');
    await main.getByLabel('Email', { exact: true }).fill('sara@example.ma');
    await page.getByRole('button', { name: 'Continue' }).click();
    await main.getByLabel('A line or two about what you need').fill('A shop.');
    await page.locator('fieldset[data-s="2"]').getByRole('button', { name: 'Submit' }).click();
    await expect(page.locator('fieldset[data-s="2"] [role="alert"]')).toContainText('Not sent');
    await expect(main.getByLabel('A line or two about what you need')).toHaveValue('A shop.');
});
