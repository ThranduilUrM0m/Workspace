import { expect, test, type Page } from '@playwright/test';

// T7.5a: the project record (header, tabs, Overview) against a mocked API.
// The page calls the Nest server from the browser, so the route is
// intercepted here and no server needs to run.

test.use({ viewport: { width: 1440, height: 900 } });

const ID = 'a'.repeat(24);
const API = `http://localhost:4002/projects/${ID}`;
const client = { id: 'c'.repeat(24), name: 'Omar Fassi', company: 'Villa Zerhoun', email: 'omar@example.ma', language: 'fr', self: false };
const PROJECT = {
    id: ID,
    name: 'Villa Zerhoun — Site vitrine',
    slug: 'villa-zerhoun-site-vitrine',
    status: 'planning',
    client,
    internal: false,
    governingLanguage: 'fr',
    note: null,
    currency: 'MAD',
    modules: ['quotes', 'invoices'],
    assetOwnership: [
        { asset: 'Domain villazerhoun.ma', holder: 'studio', renews: '2026-11-20', transfer: 'pending' },
        { asset: 'Analytics', holder: 'client', renews: null, transfer: 'done' },
    ],
    archivedAt: null,
    createdAt: '2026-10-01T09:00:00.000Z',
    updatedAt: '2026-10-01T09:00:00.000Z',
};

const NO_BRIEF = { projectId: ID, state: 'none', mine: false, seed: null, sentAt: null, submittedAt: null, decidedAt: null, reason: null, revision: 0, reading: null, areas: [] };
const serve = async (page: Page, body: unknown, status = 200, brief: unknown = NO_BRIEF, milestones: unknown[] = []) => {
    await page.route(`${API}/brief`, (r) => r.fulfill({ json: brief }));
    await page.route(`${API}/milestones`, (r) => r.fulfill({ json: milestones }));
    await page.route(API, (r) => r.fulfill({ status, json: body }));
};

test('overview: the header names it, the record holds it whole', async ({ page }) => {
    await serve(page, PROJECT);
    await page.goto(`/app/projects/${ID}`);

    const head = page.locator('.b-rec-head');
    await expect(head.getByRole('heading', { name: PROJECT.name })).toBeVisible();
    await expect(head.locator('.b-av')).toHaveText('SV');
    await expect(head.getByRole('link', { name: 'Villa Zerhoun' })).toHaveAttribute('href', `/app/clients/${client.id}`);
    await expect(head).toContainText('Planning');
    // Facts no module owns yet say so, never a zero.
    await expect(head.locator('.stat', { hasText: 'Work' })).toContainText('None yet');
    await expect(head.locator('.stat', { hasText: 'Next milestone' })).toContainText('None set');

    const tabs = page.getByRole('navigation', { name: 'Project sections' });
    await expect(tabs.getByRole('link')).toHaveText(['Overview', 'Intake', 'Plan', 'Wireframes']);
    await expect(tabs.getByRole('link', { name: 'Overview' })).toHaveAttribute('aria-current', 'page');

    // The asset register: only the studio's renewal within 30 days warns.
    const assets = page.getByRole('region', { name: 'Asset ownership' });
    await expect(assets.locator('.po-asset')).toHaveCount(2);
    await expect(assets.locator('.po-renew.is-soon')).toHaveText('renews 20 Nov 2026');
    await expect(assets.locator('.tag')).toHaveText(['pending', 'done']);

    // Modules: on ones are filled and counted, the off one is plain.
    const mods = page.getByRole('region', { name: 'ERP modules' });
    await expect(mods.locator('.chip.on')).toHaveText(['quotes0', 'invoices0']);
    await expect(mods.locator('.chip:not(.on)')).toHaveText('payments');

    // A real client: the money way out, the card with address and language, the link block.
    await expect(page.getByRole('link', { name: 'Issue the first invoice' })).toHaveAttribute('href', `/app/finance/invoices/new?project=${ID}`);
    const card = page.getByRole('region', { name: 'Client' });
    await expect(card.getByRole('link', { name: 'omar@example.ma' })).toHaveAttribute('href', 'mailto:omar@example.ma');
    await expect(card).toContainText('Writes in French');
    await expect(page.getByRole('region', { name: 'Magic link' })).toContainText('No link issued yet.');
    await expect(page.getByRole('region', { name: 'Activity' })).toContainText('Nothing logged yet.');
});

test("the spine's Brief track reads the brief's own state", async ({ page }) => {
    await serve(page, PROJECT, 200, { ...NO_BRIEF, state: 'submitted', revision: 1 });
    await page.goto(`/app/projects/${ID}`);
    const track = page.locator('.po-track--brief');
    await expect(track).toContainText('Submitted');
    await expect(track).toContainText('waiting on your review');
});

test('the header and the spine name the next milestone from the plan', async ({ page }) => {
    const ms = [
        { id: 'm1', projectId: ID, name: 'Mockups', due: '2026-10-01', done: true, order: 0 },
        { id: 'm2', projectId: ID, name: 'Build', due: null, done: false, order: 1 },
    ];
    await serve(page, PROJECT, 200, NO_BRIEF, ms);
    await page.goto(`/app/projects/${ID}`);
    await expect(page.locator('.po-track--next')).toContainText('Build');
    await expect(page.locator('.po-track--next')).toContainText('not dated');
    await expect(page.locator('.b-rec-head .stat', { hasText: 'Next milestone' })).toContainText('Not dated');
});

test('a tab is an address: it can be opened, reloaded and walked', async ({ page }) => {
    await serve(page, PROJECT);
    await page.goto(`/app/projects/${ID}?tab=plan`);
    const tabs = page.getByRole('navigation', { name: 'Project sections' });
    await expect(tabs.getByRole('link', { name: 'Plan' })).toHaveAttribute('aria-current', 'page');
    await expect(page.getByRole('heading', { name: 'No plan yet' })).toBeVisible();

    await tabs.getByRole('link', { name: 'Intake' }).click();
    await expect(page).toHaveURL(new RegExp(`/app/projects/${ID}\\?tab=intake$`));
    await expect(page.getByRole('heading', { name: 'Nothing sent yet.' })).toBeVisible();

    await tabs.getByRole('link', { name: 'Overview' }).click();
    await expect(page).toHaveURL(new RegExp(`/app/projects/${ID}$`));
    await expect(page.getByRole('region', { name: 'Money' })).toBeVisible();

    // An unknown tab is Overview, not a blank page.
    await page.goto(`/app/projects/${ID}?tab=nope`);
    await expect(tabs.getByRole('link', { name: 'Overview' })).toHaveAttribute('aria-current', 'page');
});

test('internal work: nobody to write to, nothing to invoice, no link', async ({ page }) => {
    await serve(page, { ...PROJECT, client: { ...client, company: 'Boutaleb', self: true }, internal: true });
    await page.goto(`/app/projects/${ID}`);
    await expect(page.locator('.b-rec-meta')).toContainText('Internal');
    await expect(page.locator('.b-rec-meta').getByRole('link')).toHaveCount(0);
    await expect(page.getByRole('region', { name: 'Client' })).toContainText('Internal work. Nobody to write to.');
    await expect(page.getByRole('region', { name: 'Magic link' })).toHaveCount(0);
    await expect(page.getByRole('link', { name: 'Issue the first invoice' })).toHaveCount(0);
});

test('loading: the record skeleton prints the real tab words', async ({ page }) => {
    await page.route(API, () => new Promise(() => {}));
    await page.goto(`/app/projects/${ID}`);
    await expect(page.locator('.b-rec-wrap')).toHaveAttribute('aria-busy', 'true');
    await expect(page.getByRole('status').filter({ hasText: 'Loading projects…' })).toBeAttached();
    await expect(page.locator('.b-tabs a')).toHaveText(['Overview', 'Intake', 'Plan', 'Wireframes']);
});

test('an address that leads nowhere names the way back', async ({ page }) => {
    let calls = 0;
    await page.route(API, (r) => {
        calls += 1;
        return r.fulfill({ status: 404, json: { message: 'Not Found', statusCode: 404 } });
    });
    await page.goto(`/app/projects/${ID}`);
    await expect(page.getByRole('heading', { name: 'This project does not exist' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'All projects' })).toHaveAttribute('href', '/app/projects');
    expect(calls).toBe(1);
});

test('New project is its own address, not a project id', async ({ page }) => {
    await page.goto('/app/projects/new');
    await expect(page.getByRole('heading', { level: 2, name: 'New project' })).toBeVisible();
});
