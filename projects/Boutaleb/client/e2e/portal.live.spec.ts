import { expect, test } from '@playwright/test';

// LIVE portal smoke: the real site against the real API and the local Mongo.
// Every other portal check fakes one side (Jest mocks the API; portal.spec.ts
// stands a stand-in API up on 4002), so only this one sees the two disagree
// about a path, a header or a body. Skipped unless PORTAL_LIVE_TOKEN is set.
//
// Run, one heavy thing at a time (8 GB machine):
//   1. API on 4002:  cd server; infisical run --silent -- node --conditions=boutaleb-node dist/main.js
//   2. A link:       cd server; infisical run --silent -- node --conditions=boutaleb-node dist/cli/smoke-portal-link.js
//                    (resets the LOCAL demo project's brief, prints a token)
//   3. This file:    cd client; PORTAL_LIVE_TOKEN=<token> infisical run --silent -- pnpm test:live
// The site is started by Playwright (next start) or reused if already on 3002.
// Before deploy (T13) run it once against the staging API as well.

const TOKEN = process.env.PORTAL_LIVE_TOKEN;
test.skip(!TOKEN, 'PORTAL_LIVE_TOKEN not set: the live smoke needs the real API (see the header)');

test.describe.configure({ mode: 'serial' });

test('the link opens, an answer saves on the real API, survives a reload, and the brief sends', async ({ page }) => {
    const res = await page.goto(`/p/${TOKEN}`);
    expect(res?.status()).toBe(200);
    await page.getByRole('button', { name: 'English' }).click();
    await page.getByRole('button', { name: 'Start the brief' }).click();

    const what = page.getByLabel(/What does the business do\?/);
    const text = `Live smoke ${Date.now()}`;
    await what.fill(text);
    await expect(page.getByRole('status').filter({ hasText: 'Saved' })).toBeVisible();

    await page.reload();
    await page.getByRole('button', { name: 'English' }).click();
    await page.getByRole('button', { name: 'Start the brief' }).click();
    await expect(page.getByLabel(/What does the business do\?/)).toHaveValue(text);

    await page.getByRole('button', { name: 'Send to Boutaleb' }).click();
    await expect(page.getByRole('heading', { name: 'That is everything needed.' })).toBeVisible();
    await page.reload();
    await expect(page.getByRole('textbox')).toHaveCount(0);
});

test('"email me my access link" goes through to the real API and answers the same words', async ({ request }) => {
    const res = await request.post('/api/portal/resend', { data: { email: `nobody+${Date.now()}@example.invalid` } });
    expect(res.status()).toBe(200);
    expect(await res.json()).toEqual({ ok: true });
    const bad = await request.post('/api/portal/resend', { data: { email: 'not-an-email' } });
    expect(bad.status()).toBe(400);
});

test('a token the API does not know is the dead-link page', async ({ page }) => {
    const res = await page.goto(`/p/${'Q'.repeat(43)}`);
    expect(res?.status()).toBe(404);
    await expect(page.getByRole('heading', { name: 'This link no longer opens anything.' })).toBeVisible();
});
