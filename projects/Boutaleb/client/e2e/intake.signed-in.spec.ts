import { expect, test, type Page, type Route } from '@playwright/test';

// T7.5b: the Intake tab against a mocked API that keeps state, so each
// ruling's answer is what the next screen reads.

test.use({ viewport: { width: 1440, height: 900 } });

const ID = 'b'.repeat(24);
const PROJECT_URL = `http://localhost:4002/projects/${ID}`;
const client = { id: 'c'.repeat(24), name: 'Omar Fassi', company: 'Villa Zerhoun', email: 'omar@example.ma', language: 'fr', self: false };
const project = (over: Record<string, unknown> = {}) => ({
    id: ID,
    name: 'Riad booking tool',
    slug: 'riad-booking-tool',
    status: 'idea',
    client: null,
    internal: false,
    governingLanguage: 'en',
    note: null,
    currency: 'MAD',
    modules: ['quotes', 'invoices', 'payments'],
    assetOwnership: [],
    archivedAt: null,
    createdAt: '2026-10-01T09:00:00.000Z',
    updatedAt: '2026-10-01T09:00:00.000Z',
    ...over,
});
const none = { projectId: ID, state: 'none', mine: false, seed: null, sentAt: null, submittedAt: null, decidedAt: null, reason: null, revision: 0, reading: null, areas: [] };

const LONG = 'A long enough answer that says something you can actually plan the work against.';
const fromClient = {
    ...none,
    state: 'submitted',
    sentAt: '2026-11-01T09:00:00.000Z',
    submittedAt: '2026-11-05T09:00:00.000Z',
    revision: 1,
    reading: { summary: 'A booking site for a riad in Fès.', risks: ['The budget is tight for online payment.'], assumptions: [] },
    areas: [
        { key: 'discovery', qs: [{ q: 'What do you sell?', a: LONG }], note: null },
        { key: 'strategy', qs: [{ q: 'What is success?', a: 'More.' }, { q: 'How will you know?', a: '' }], note: null },
    ],
};

/** The API, with a brief that changes as it is acted on. Returns the requests it saw. */
async function api(page: Page, p: Record<string, unknown>, start: Record<string, unknown>, answer: (method: string, path: string, body: unknown) => Record<string, unknown> | number) {
    let brief = start;
    const seen: { method: string; path: string; body: unknown }[] = [];
    await page.route(`${PROJECT_URL}**`, async (r: Route) => {
        const req = r.request();
        const path = new URL(req.url()).pathname.replace(`/projects/${ID}`, '');
        if (path === '') return r.fulfill({ json: p });
        if (path === '/milestones') return r.fulfill({ json: [] });
        if (req.method() === 'GET') return r.fulfill({ json: brief });
        const body = req.postDataJSON();
        seen.push({ method: req.method(), path, body });
        const out = answer(req.method(), path, body);
        if (typeof out === 'number') return r.fulfill({ status: out, json: { error: 'conflict' } });
        brief = out;
        return r.fulfill({ json: brief });
    });
    return seen;
}

test('an idea: nobody to ask, so you write it, then approve it', async ({ page }) => {
    const seen = await api(page, project(), none, (_m, path, body) => {
        if (path === '/brief') {
            const answers = (body as { answers: Record<string, string> }).answers;
            return {
                ...none,
                state: 'submitted',
                mine: true,
                submittedAt: '2026-11-11T09:00:00.000Z',
                revision: 1,
                areas: [{ key: 'discovery', qs: [{ q: 'What the business does', a: answers['discovery.what'] }], note: null }],
            };
        }
        return { ...none, state: 'approved', mine: true, revision: 1, decidedAt: '2026-11-11T10:00:00.000Z', areas: [] };
    });
    await page.goto(`/app/projects/${ID}?tab=intake`);
    await expect(page.getByRole('heading', { name: 'No client, so no questionnaire.' })).toBeVisible();
    await page.getByRole('button', { name: 'Write the brief' }).click();

    const save = page.getByRole('button', { name: 'Save the brief' });
    await expect(save).toBeDisabled();
    await page.getByLabel('What the business does').fill('Rooms in a riad, sold to travellers.');
    await page.getByLabel('What it must do on day one').fill('Take a booking.');
    await expect(page.getByText('2 of 11 written')).toBeVisible();
    await save.click();

    await expect.poll(() => seen[0]).toMatchObject({ method: 'PUT', path: '/brief', body: { answers: { 'discovery.what': 'Rooms in a riad, sold to travellers.', 'requirements.day1': 'Take a booking.' } } });
    await expect(page.getByText('Written by you')).toBeVisible();
    // Your own writing has nobody to go back to: no Send it back at all.
    await expect(page.getByRole('button', { name: 'Send it back' })).toHaveCount(0);
    await page.getByRole('button', { name: 'Approve the brief' }).click();
    await expect(page.getByText(/Approved .*The plan can be drawn\./)).toBeVisible();
    await expect.poll(() => seen[1]).toMatchObject({ method: 'POST', path: '/brief/approve' });
});

test("a client's project: no writing it for them, the questionnaire goes with the link", async ({ page }) => {
    await api(page, project({ client, status: 'intake_pending' }), none, () => 500);
    await page.goto(`/app/projects/${ID}?tab=intake`);
    await expect(page.getByRole('heading', { name: 'Nothing sent yet.' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Write the brief' })).toHaveCount(0);
});

test('a client submission: read, approve over thin areas, or send back with a reason', async ({ page }) => {
    const seen = await api(page, project({ client, status: 'intake_pending' }), fromClient, (_m, path, body) => {
        if (path === '/brief/send-back') return { ...fromClient, state: 'sent_back', reason: (body as { reason: string }).reason, decidedAt: '2026-11-11T10:00:00.000Z' };
        if (path === '/brief/reopen') return fromClient;
        return 500;
    });
    await page.goto(`/app/projects/${ID}?tab=intake`);
    await expect(page.getByRole('heading', { name: 'What they are asking for' })).toBeVisible();
    await expect(page.getByText('A booking site for a riad in Fès.')).toBeVisible();
    // Strategy has two thin answers out of two; the button says so before you press it.
    await expect(page.getByRole('region', { name: /Strategy/ }).getByText('thin', { exact: true })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Approve the brief · 1 area still thin' })).toBeVisible();

    await page.getByRole('button', { name: 'Send it back' }).click();
    const send = page.getByRole('button', { name: 'Send it back' });
    await page.getByLabel('Why is this going back?').fill('Too thin.');
    await expect(send).toBeDisabled();
    await page.getByLabel('Why is this going back?').fill('The budget and the feature list cannot both be true.');
    await send.click();
    await expect.poll(() => seen.at(-1)).toMatchObject({ path: '/brief/send-back', body: { reason: 'The budget and the feature list cannot both be true.' } });
    await expect(page.getByText('The budget and the feature list cannot both be true.')).toBeVisible();
    await page.getByRole('button', { name: 'Reopen' }).click();
    await expect(page.getByRole('button', { name: 'Approve the brief · 1 area still thin' })).toBeVisible();
});

test('a thin area gets your note, never a second question to them', async ({ page }) => {
    const seen = await api(page, project({ client, status: 'intake_pending' }), fromClient, (_m, _path, body) => ({
        ...fromClient,
        areas: fromClient.areas.map((a) => (a.key === 'strategy' ? { ...a, note: (body as { note: string }).note } : a)),
    }));
    await page.goto(`/app/projects/${ID}?tab=intake`);
    const strategy = page.getByRole('region', { name: /Strategy/ });
    await strategy.getByRole('button', { name: 'Fill this gap yourself' }).click();
    await strategy.getByLabel('What you know that they did not say').fill('From the call: twenty bookings a month.');
    await strategy.getByRole('button', { name: 'Save note' }).click();
    await expect.poll(() => seen.at(-1)).toMatchObject({ method: 'PUT', path: '/brief/areas/strategy/note', body: { note: 'From the call: twenty bookings a month.' } });
    await expect(strategy.getByText('Your note')).toBeVisible();
    // A note closes the gap: the area is no longer thin, and the approve button stops warning.
    await expect(page.getByRole('button', { name: 'Approve the brief', exact: true })).toBeVisible();
});

test('a ruling on a brief that changed under you says so', async ({ page }) => {
    await api(page, project({ client, status: 'intake_pending' }), fromClient, () => 409);
    await page.goto(`/app/projects/${ID}?tab=intake`);
    await page.getByRole('button', { name: /Approve the brief/ }).click();
    await expect(page.getByRole('alert').filter({ hasText: 'This brief changed since it was opened.' })).toBeVisible();
});
