import { expect, test, type Page, type Route } from '@playwright/test';
import { zipSync, strToU8 } from 'fflate';

// T7.5d: the Wireframes tab against a mocked API that keeps the rounds, so
// each change's answer is what the screen draws next. The upload runs for
// real in the browser (unzip, one PUT per file, commit); only the API and
// storage answers are faked.

test.use({ viewport: { width: 1440, height: 900 } });

const ID = 'f'.repeat(24);
const API = 'http://localhost:4002';
const URL_ = `${API}/projects/${ID}`;
const CLIENT = { id: 'c'.repeat(24), name: 'Nozha B', company: 'Riad Nozha', email: 'n@example.ma', language: 'fr', self: false };
const project = (client: unknown) => ({
    id: ID,
    name: 'Riad site',
    slug: 'riad-site',
    status: 'planning',
    client,
    internal: false,
    governingLanguage: 'en',
    note: null,
    currency: 'MAD',
    modules: [],
    assetOwnership: [],
    archivedAt: null,
    createdAt: '2026-10-01T09:00:00.000Z',
    updatedAt: '2026-10-01T09:00:00.000Z',
});

type Round = {
    id: string; projectId: string; v: number; state: string; note: string | null; sourceName: string | null; frozen: boolean;
    sentAt: string | null; decidedAt: string | null; pages: { name: string; file: string; snap: null }[]; comments: { page: string | null; at: string; body: string }[];
};

const round = (v: number, over: Partial<Round> = {}): Round => ({
    id: `r${v}`, projectId: ID, v, state: 'draft', note: null, sourceName: null, frozen: false, sentAt: null, decidedAt: null, pages: [], comments: [], ...over,
});
const PAGES = [
    { name: 'Home', file: 'index.html', snap: null },
    { name: 'The menu', file: 'menu.html', snap: null },
];

async function api(page: Page, { client = CLIENT as unknown, planned = true, start = [] as Round[] } = {}) {
    let rounds = start;
    const seen: { method: string; path: string; body: unknown }[] = [];
    const puts: string[] = [];
    await page.route(`${API}/storage/**`, async (r) => {
        puts.push(new URL(r.request().url()).searchParams.get('f')!);
        return r.fulfill({ json: { ok: true } });
    });
    await page.route(`${URL_}**`, async (r: Route) => {
        const req = r.request();
        const path = new URL(req.url()).pathname.replace(`/projects/${ID}`, '');
        if (path === '') return r.fulfill({ json: project(client) });
        if (path === '/milestones') return r.fulfill({ json: planned ? [{ id: 'm1', projectId: ID, name: 'Mockups', due: null, done: false, order: 0 }] : [] });
        if (path === '/brief') return r.fulfill({ json: { projectId: ID, state: 'approved', mine: true, seed: null, sentAt: null, submittedAt: null, decidedAt: null, reason: null, revision: 1, reading: null, areas: [] } });
        if (req.method() === 'GET') return r.fulfill({ json: rounds });
        const body = req.postDataJSON() as Record<string, unknown> | null;
        seen.push({ method: req.method(), path, body });
        const live = rounds[0];
        const today = '2026-11-11T10:00:00.000Z';
        if (path === '/wireframes') {
            rounds = [round((live?.v ?? 0) + 1, { note: (body?.note as string) ?? null, pages: live?.pages ?? [], sourceName: live?.sourceName ?? null }), ...rounds];
        } else if (path.endsWith('/upload')) {
            const files = (body!.files as { path: string }[]).map((f) => ({ path: f.path, url: `${API}/storage/put?f=${encodeURIComponent(f.path)}`, headers: { 'Content-Type': 'application/octet-stream' } }));
            return r.fulfill({ json: { uploadId: 'a'.repeat(24), files } });
        } else if (path.endsWith('/upload/commit')) {
            rounds = [{ ...live!, pages: PAGES, sourceName: body!.name as string }, ...rounds.slice(1)];
        } else if (path.endsWith('/send')) {
            rounds = [{ ...live!, state: 'sent', frozen: true, sentAt: today }, ...rounds.slice(1)];
        } else if (path.endsWith('/verdict')) {
            const said = body!.body ? [{ page: (body!.page as string) ?? null, at: today, body: body!.body as string }] : [];
            rounds = [{ ...live!, state: body!.verdict as string, decidedAt: today, comments: said }, ...rounds.slice(1)];
        }
        return r.fulfill({ json: rounds });
    });
    return { seen, puts };
}

test('two empty states: the plan comes first; with a plan, round one starts', async ({ page }) => {
    await api(page, { planned: false });
    await page.goto(`/app/projects/${ID}?tab=wireframes`);
    await expect(page.getByRole('heading', { name: 'No wireframes yet.' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Open the plan' })).toHaveAttribute('href', `/app/projects/${ID}?tab=plan`);
    await expect(page.getByRole('button', { name: /Start round/ })).toHaveCount(0);
});

test('upload a zip, send it, record changes, start the next round with a note', async ({ page }) => {
    const { seen, puts } = await api(page);
    await page.goto(`/app/projects/${ID}?tab=wireframes`);
    await page.getByRole('button', { name: 'Start round one' }).click();
    await expect(page.getByRole('heading', { name: 'Round 1' })).toBeVisible();
    await expect(page.getByText('never sent')).toBeVisible();

    // A zipped folder: one wrapping directory, OS litter, a file type nobody uses.
    const zip = zipSync({
        'riad/index.html': strToU8('<title>Home</title>'),
        'riad/menu.html': strToU8('<title>The menu</title>'),
        'riad/css/style.css': strToU8('body{}'),
        'riad/.DS_Store': strToU8('x'),
        'riad/notes.md': strToU8('x'),
    });
    await page.locator('input[type=file]').setInputFiles({ name: 'riad-v1.zip', mimeType: 'application/zip', buffer: Buffer.from(zip) });
    await expect(page.getByRole('list', { name: 'Round 1 pages' }).getByRole('listitem')).toHaveCount(2);
    expect(seen.find((s) => s.path === '/wireframes/1/upload')?.body).toEqual({
        files: [
            { path: 'css/style.css', size: 6 },
            { path: 'index.html', size: 19 },
            { path: 'menu.html', size: 23 },
        ],
    });
    expect(puts.sort()).toEqual(['css/style.css', 'index.html', 'menu.html']);
    expect(seen.find((s) => s.path === '/wireframes/1/upload/commit')?.body).toMatchObject({ name: 'riad-v1.zip' });

    await page.getByRole('button', { name: 'Send it to the client' }).click();
    await expect(page.getByText('With the client')).toBeVisible();

    // Changes need a sentence: the button waits for one.
    await page.getByRole('button', { name: 'Record changes asked' }).click();
    const save = page.getByRole('button', { name: 'Record it' });
    await expect(save).toBeDisabled();
    await page.getByLabel('Which page').selectOption('The menu');
    await page.getByLabel('What they asked for').fill('Prices on the right.');
    await save.click();
    await expect(page.getByText('Changes asked')).toBeVisible();
    await expect(page.locator('.wf-note')).toContainText('Prices on the right.');
    await expect(page.locator('.wf-frame.has-note')).toContainText('The menu');

    await page.getByRole('button', { name: 'Start round 2' }).click();
    await page.getByLabel('What changes in round 2?').fill('Menu reworked.');
    await page.getByRole('button', { name: 'Start round 2' }).click();
    await expect(page.getByRole('heading', { name: 'Round 2' })).toBeVisible();
    await expect(page.getByText('Menu reworked.')).toBeVisible();
    expect(seen.at(-1)).toMatchObject({ path: '/wireframes', body: { note: 'Menu reworked.' } });

    // Round 1 is history now, closed until asked.
    const old = page.getByRole('button', { name: /Round 1/ });
    await expect(old).toHaveAttribute('aria-expanded', 'false');
    await old.click();
    await expect(page.getByText('Prices on the right.')).toBeVisible();
});

test('a zip with no top-level page is refused before anything is sent', async ({ page }) => {
    const { seen } = await api(page, { start: [round(1)] });
    await page.goto(`/app/projects/${ID}?tab=wireframes`);
    const zip = zipSync({ 'a/b/index.html': strToU8('x'), 'c.css': strToU8('x') });
    await page.locator('input[type=file]').setInputFiles({ name: 'bad.zip', mimeType: 'application/zip', buffer: Buffer.from(zip) });
    await expect(page.locator('.wf-fail')).toContainText('No .html file at the top of the folder');
    expect(seen).toEqual([]);
});

test('no client: the round stays a draft and the screen says why', async ({ page }) => {
    await api(page, { client: null, start: [round(1, { pages: PAGES, sourceName: 'x.zip' })] });
    await page.goto(`/app/projects/${ID}?tab=wireframes`);
    await expect(page.getByText('Nobody to send it to yet')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Send it to the client' })).toHaveCount(0);
});

test('approval needs no sentence', async ({ page }) => {
    await api(page, { start: [round(1, { state: 'sent', frozen: true, pages: PAGES, sentAt: '2026-11-10T10:00:00.000Z' })] });
    await page.goto(`/app/projects/${ID}?tab=wireframes`);
    await page.getByRole('button', { name: 'Record their approval' }).click();
    await page.getByRole('button', { name: 'Record the approval' }).click();
    await expect(page.getByText(/^Approved \d/)).toBeVisible();
    await expect(page.getByRole('button', { name: 'Start round 2' })).toBeVisible();
});
