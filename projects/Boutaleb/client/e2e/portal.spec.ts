import { createServer, type Server } from 'node:http';
import { expect, test } from '@playwright/test';

// The client's page behind a magic link (T8.4). The page is read on the
// site's server, so the API cannot be mocked in the browser: this spec
// stands a small stand-in API up on 4002 (where `next start` looks locally)
// and the real site talks to it. Run it with the real API stopped.

const OPEN = 'A'.repeat(43);
const BACK = 'B'.repeat(43);
const DONE = 'C'.repeat(43);

type State = 'open' | 'sent_back' | 'done';
const store: Record<string, { state: State; reason: string | null; language: string; answers: Record<string, string>; project: string }> = {};
const reset = () => {
    store[OPEN] = { state: 'open', reason: null, language: 'en', answers: {}, project: 'Villa Zerhoun — Site' };
    store[BACK] = { state: 'sent_back', reason: 'The day-one list contradicts the budget.', language: 'fr', answers: { 'discovery.what': 'Des chambres.' }, project: 'Riad Nozha' };
    store[DONE] = { state: 'done', reason: null, language: 'en', answers: {}, project: 'Done project' };
};

let api: Server;
let resendStatus = 200;
const seen: { method: string; url: string; key: string | undefined; body: string }[] = [];

test.beforeAll(async () => {
    api = createServer((req, res) => {
        let body = '';
        req.on('data', (c) => (body += c));
        req.on('end', () => {
            seen.push({ method: req.method ?? '', url: req.url ?? '', key: req.headers['x-forms-key'] as string | undefined, body });
            const [, , token, action] = (req.url ?? '').split('/');
            const rec = token ? store[token] : undefined;
            const send = (status: number, json: unknown) => {
                res.writeHead(status, { 'content-type': 'application/json' });
                res.end(JSON.stringify(json));
            };
            // "Email me my access link" (T8.5): the real API answers { ok: true } whatever the address.
            if (req.method === 'POST' && token === 'resend') return resendStatus === 200 ? send(200, { ok: true }) : send(resendStatus, { error: 'x' });
            if (!rec) return send(404, { error: 'not_found' });
            const view = () => ({ state: rec.state, project: rec.project, who: 'Villa Zerhoun', language: rec.language, reason: rec.reason, answers: rec.state === 'done' ? {} : rec.answers });
            if (req.method === 'GET' && !action) return send(200, view());
            if (rec.state === 'done') return send(404, { error: 'not_found' });
            if (req.method === 'PUT' && action === 'draft') {
                Object.assign(rec.answers, (JSON.parse(body) as { answers: Record<string, string> }).answers);
                return send(200, { saved: true });
            }
            if (req.method === 'POST' && action === 'submit') {
                rec.state = 'done';
                return send(200, view());
            }
            return send(404, { error: 'not_found' });
        });
    });
    await new Promise<void>((ok) => api.listen(4002, '127.0.0.1', ok));
});

test.afterAll(async () => {
    await new Promise((ok) => api.close(ok));
});

test.beforeEach(() => {
    reset();
    seen.length = 0;
    resendStatus = 200;
});

test.describe('email me my access link (T8.5)', () => {
    test('the dead-link page leads to it, and /p is never indexed or cached and stays out of the language redirect', async ({ page }) => {
        await page.goto(`/p/${'Z'.repeat(43)}`);
        await page.getByRole('link', { name: 'Get a new link by email' }).click();
        await expect(page).toHaveURL(/\/p$/);
        const res = await page.goto('/p');
        expect(res?.headers()['x-robots-tag']).toContain('noindex');
        expect(res?.headers()['cache-control']).toContain('no-store');
        expect(res?.headers()['referrer-policy']).toBe('no-referrer');
        await expect(page.locator('meta[name="robots"]').first()).toHaveAttribute('content', /noindex/);
    });

    test('asks for an address, refuses a bad one, sends a good one, and says the same words whatever it is', async ({ page }) => {
        await page.goto('/p');
        await page.getByRole('button', { name: 'English' }).click();
        await page.getByLabel('Your email address').fill('nope');
        await page.getByRole('button', { name: 'Send the link' }).click();
        await expect(page.locator('#resend-problem')).toContainText('does not look like an email address');
        expect(seen).toHaveLength(0);

        await page.getByLabel('Your email address').fill('Omar@Example.ma');
        await page.getByRole('button', { name: 'Send the link' }).click();
        await expect(page.getByRole('heading', { name: 'Done, if there was something to send.' })).toBeVisible();
        expect(seen).toHaveLength(1);
        expect(seen[0]).toMatchObject({ method: 'POST', url: '/portal/resend' });
        expect(seen[0]!.key).toMatch(/^dev-only-forms-proxy-key/);
        expect(JSON.parse(seen[0]!.body)).toEqual({ email: 'omar@example.ma' });
    });

    test('a failed send is said to have failed, and can be tried again', async ({ page }) => {
        resendStatus = 500;
        await page.goto('/p');
        await page.getByRole('button', { name: 'English' }).click();
        await page.getByLabel('Your email address').fill('omar@example.ma');
        await page.getByRole('button', { name: 'Send the link' }).click();
        await expect(page.locator('#resend-problem')).toContainText('Nothing was sent');
        resendStatus = 200;
        await page.getByRole('button', { name: 'Send the link' }).click();
        await expect(page.getByRole('heading', { name: 'Done, if there was something to send.' })).toBeVisible();
    });

    test('reads in Arabic right to left, with the address field left to right', async ({ page }) => {
        await page.goto('/p');
        await page.getByRole('button', { name: 'العربية' }).click();
        await expect(page.locator('.pt-root')).toHaveAttribute('dir', 'rtl');
        await expect(page.locator('#resend-email')).toHaveAttribute('dir', 'ltr');
    });
});

test('a link that opens nothing is a 404 in three languages, never indexed and never cached', async ({ page }) => {
    const res = await page.goto(`/p/${'Z'.repeat(43)}`);
    expect(res?.status()).toBe(404);
    expect(res?.headers()['referrer-policy']).toBe('no-referrer');
    expect(res?.headers()['x-robots-tag']).toContain('noindex');
    expect(res?.headers()['cache-control']).toContain('no-store');
    await expect(page.getByRole('heading', { name: 'This link no longer opens anything.' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Ce lien n’ouvre plus rien.' })).toBeVisible();
    await expect(page.locator('section[lang="ar"]')).toHaveAttribute('dir', 'rtl');
    await expect(page.locator('meta[name="robots"]').first()).toHaveAttribute('content', /noindex/);
});

test('the site proves itself to the API with the shared key; the token goes to the API and nowhere else', async ({ page }) => {
    await page.goto(`/p/${OPEN}`);
    expect(seen[0]).toMatchObject({ method: 'GET', url: `/portal/${OPEN}` });
    expect(seen[0]!.key).toMatch(/^dev-only-forms-proxy-key/);
});

test('answers: intro, start, type, saved on the server, survive a reload, send, confirmation', async ({ page }) => {
    await page.goto(`/p/${OPEN}`);
    await expect(page.locator('html')).not.toHaveAttribute('dir', 'rtl');
    await expect(page.getByRole('heading', { level: 1, name: 'This is the part that decides whether it works.' })).toBeVisible();
    await page.getByRole('button', { name: 'Start the brief' }).click();

    const send = page.getByRole('button', { name: 'Send to Boutaleb' });
    await expect(send).toBeDisabled();
    await expect(page.getByText('0 of 11 answered')).toBeVisible();

    await page.getByLabel(/What does the business do\?/).fill('Rooms for rent in Fès.');
    await expect(page.getByText('1 of 11 answered')).toBeVisible();
    await expect(page.getByRole('status').filter({ hasText: 'Saved' })).toBeVisible();
    expect(store[OPEN]!.answers['discovery.what']).toBe('Rooms for rent in Fès.');

    // A reload comes back to the intro with the answer already there.
    await page.reload();
    await page.getByRole('button', { name: 'Start the brief' }).click();
    await expect(page.getByLabel(/What does the business do\?/)).toHaveValue('Rooms for rent in Fès.');

    await page.getByRole('button', { name: 'Send to Boutaleb' }).click();
    await expect(page.getByRole('heading', { name: 'That is everything needed.' })).toBeVisible();

    // Sent is sent: the link now only confirms.
    await page.reload();
    await expect(page.getByRole('heading', { name: 'That is everything needed.' })).toBeVisible();
    await expect(page.getByRole('textbox')).toHaveCount(0);
});

test('the page speaks the client\'s language and switches to Arabic right to left without a reload', async ({ page }) => {
    await page.goto(`/p/${OPEN}`);
    const root = page.locator('.pt-root');
    await expect(root).toHaveAttribute('lang', 'en');
    await page.getByRole('button', { name: 'العربية' }).click();
    await expect(root).toHaveAttribute('dir', 'rtl');
    await expect(page.getByRole('heading', { level: 1, name: 'هذه هي المرحلة التي تحسم نجاح المشروع.' })).toBeVisible();
    await page.getByRole('button', { name: 'Français' }).click();
    await expect(root).toHaveAttribute('dir', 'ltr');
    await expect(page.getByRole('button', { name: 'Commencer le brief' })).toBeVisible();
});

test('a brief sent back opens on the form with the reason and the earlier answers', async ({ page }) => {
    await page.goto(`/p/${BACK}`);
    await expect(page.getByRole('heading', { name: 'Quelques réponses méritent un second regard.' })).toBeVisible();
    await expect(page.getByText('The day-one list contradicts the budget.')).toBeVisible();
    await expect(page.getByLabel(/Que fait l’entreprise/)).toHaveValue('Des chambres.');
});

test('no first-person pronouns on the intro in English', async ({ page }) => {
    await page.goto(`/p/${OPEN}`);
    const text = await page.locator('.pt-main').innerText();
    expect(text).not.toMatch(/\b(we|our|us|I|me|my)\b/i);
});

test('reduced motion: both opening lines are simply there, stacked', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto(`/p/${OPEN}`);
    await expect(page.getByText('Anyone can vibecode a website in an afternoon.')).toBeVisible();
    await expect(page.getByText('Almost none of them survive their first real month.')).toBeVisible();
});

test.describe('phone', () => {
    test.use({ viewport: { width: 390, height: 844 } });

    test('the form never scrolls sideways and every control is at least 44px', async ({ page }) => {
        await page.goto(`/p/${OPEN}`);
        await page.getByRole('button', { name: 'Start the brief' }).click();
        const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
        expect(overflow).toBeLessThanOrEqual(0);
        for (const control of await page.locator('.pt-lang, .pt-btn, .pt-jump-a').all()) {
            const box = await control.boundingBox();
            expect(box!.height).toBeGreaterThanOrEqual(43.5);
        }
    });
});
