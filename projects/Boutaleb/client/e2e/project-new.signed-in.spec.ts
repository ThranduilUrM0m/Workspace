import { expect, test, type Page, type Route } from '@playwright/test';

// T7.6: Create a project against a mocked API. Three answers to "whose is
// it" (an existing client, a new one, nobody), a slug that follows the
// name, and a create that lands on the project's own screen.

test.use({ viewport: { width: 1440, height: 900 } });

const API = 'http://localhost:4002';
const ID = 'f'.repeat(24);
const omar = { id: 'c'.repeat(24), name: 'Omar Fassi', company: 'Villa Zerhoun', email: 'omar@example.ma', status: 'active', language: 'fr', self: false };
const studio = { id: 'd'.repeat(24), name: 'Boutaleb', company: 'Boutaleb', email: 'studio@example.ma', status: 'active', language: 'en', self: true };
const existing = { id: 'a'.repeat(24), name: 'Villa Zerhoun', slug: 'villa-zerhoun', status: 'planning', client: null, internal: false, governingLanguage: 'fr', note: null, currency: 'MAD', modules: [], assetOwnership: [], archivedAt: null, createdAt: '2026-10-01T09:00:00.000Z', updatedAt: '2026-10-01T09:00:00.000Z' };

type Seen = { method: string; path: string; body: Record<string, unknown> | null };

async function api(page: Page, opts: { failProject?: number } = {}) {
    const seen: Seen[] = [];
    let created: Record<string, unknown> | null = null;
    await page.route(`${API}/clients**`, async (r: Route) => {
        const req = r.request();
        if (req.method() === 'POST') {
            const body = req.postDataJSON() as Record<string, unknown>;
            seen.push({ method: 'POST', path: '/clients', body });
            if (String(body.email).toLowerCase() === omar.email) return r.fulfill({ status: 409, json: { error: 'invalid', fields: { email: 'taken' }, client: omar } });
            return r.fulfill({ status: 201, json: { id: 'e'.repeat(24), name: body.name, company: body.company ?? body.name, email: String(body.email).toLowerCase(), status: 'lead', language: body.language, self: false } });
        }
        const q = new URL(req.url()).searchParams.get('q')?.toLowerCase() ?? '';
        const all = [omar, studio];
        return r.fulfill({ json: q ? all.filter((c) => `${c.name} ${c.company} ${c.email}`.toLowerCase().includes(q)) : all });
    });
    await page.route(`${API}/projects**`, async (r: Route) => {
        const req = r.request();
        const path = new URL(req.url()).pathname;
        if (path === '/projects' && req.method() === 'POST') {
            const body = req.postDataJSON() as Record<string, unknown>;
            seen.push({ method: 'POST', path, body });
            if (opts.failProject) return r.fulfill({ status: opts.failProject, json: opts.failProject === 409 ? { error: 'invalid', fields: { slug: 'taken' } } : {} });
            created = { ...existing, id: ID, name: body.name, slug: body.slug ?? 'new-one', status: body.clientId ? 'intake_pending' : 'idea', note: body.note ?? null };
            return r.fulfill({ status: 201, json: created });
        }
        if (path === '/projects') return r.fulfill({ json: [existing] });
        if (path === `/projects/${ID}`) return r.fulfill({ json: created });
        if (path.endsWith('/brief')) return r.fulfill({ json: { projectId: ID, state: 'none', mine: false, seed: null, sentAt: null, submittedAt: null, decidedAt: null, reason: null, revision: 0, reading: null, areas: [] } });
        return r.fulfill({ json: [] });
    });
    return seen;
}

const create = (page: Page) => page.getByRole('button', { name: 'Create project' });

test('an existing client: pick, the name and slug follow, create lands on the project', async ({ page }) => {
    const seen = await api(page);
    await page.goto('/app/projects/new');
    await expect(page.getByRole('heading', { name: 'New project' })).toBeVisible();
    await expect(page.getByText('Pick a client, or create one.')).toBeVisible();
    await expect(create(page)).toBeDisabled();

    await page.getByLabel('Search or create a client').fill('omar');
    await page.getByRole('option', { name: /Omar Fassi/ }).click();
    await expect(page.getByText('omar@example.ma')).toBeVisible();
    // The name prefills from the company; that slug is taken, so the derived one bumps.
    await expect(page.getByLabel('Project name')).toHaveValue('Villa Zerhoun');
    await expect(page.locator('.pn-slug-val')).toHaveText('villa-zerhoun-2');
    const preview = page.getByRole('complementary', { name: 'What this creates' });
    await expect(preview).toContainText('Omar Fassi · Villa Zerhoun');
    await expect(preview).toContainText('Intake pending');

    await page.getByLabel('Project name').fill('Riad booking tool');
    await expect(page.locator('.pn-slug-val')).toHaveText('riad-booking-tool');
    await create(page).click();
    await expect(page).toHaveURL(new RegExp(`/app/projects/${ID}$`));
    expect(seen.at(-1)).toMatchObject({ path: '/projects', body: { name: 'Riad booking tool', clientId: omar.id, governingLanguage: 'fr', currency: 'MAD' } });
    // A derived slug is the server's to settle; only a typed one is sent.
    expect(seen.at(-1)!.body).not.toHaveProperty('slug');
});

test('a new client is created inline as a lead, with a language, before the project', async ({ page }) => {
    const seen = await api(page);
    await page.goto('/app/projects/new');
    await page.getByLabel('Search or create a client').fill('Salma Idrissi');
    await page.getByRole('option', { name: /Create “Salma Idrissi” as a new client/ }).click();
    await expect(page.getByLabel('Name', { exact: true })).toHaveValue('Salma Idrissi');
    await page.getByLabel('Email').fill('salma@riad.ma');
    await page.getByLabel('Project name').fill('Riad Nozha site');
    await expect(page.getByText('Pick the language you will write to them in.')).toBeVisible();
    await page.getByRole('radio', { name: 'AR' }).or(page.getByRole('button', { name: 'AR' })).click();
    await expect(page.getByRole('complementary', { name: 'What this creates' })).toContainText('new, as a lead');
    await create(page).click();
    await expect(page).toHaveURL(new RegExp(`/app/projects/${ID}$`));
    expect(seen[0]).toMatchObject({ path: '/clients', body: { name: 'Salma Idrissi', email: 'salma@riad.ma', language: 'ar' } });
    expect(seen[1]).toMatchObject({ path: '/projects', body: { clientId: 'e'.repeat(24), governingLanguage: 'ar' } });
});

test('an email that already has a client offers that client instead', async ({ page }) => {
    await api(page);
    await page.goto('/app/projects/new');
    await page.getByLabel('Search or create a client').fill('someone');
    await page.getByRole('option', { name: /Create “someone” as a new client/ }).click();
    await page.getByLabel('Email').fill('omar@example.ma');
    await expect(page.getByText('That email already belongs to a client.')).toBeVisible();
    await page.getByRole('button', { name: 'Use that client instead' }).click();
    await expect(page.getByText('omar@example.ma')).toBeVisible();
    await expect(page.getByLabel('Email')).toHaveCount(0);
});

test('my own idea: no client, an idea, no intake section', async ({ page }) => {
    const seen = await api(page);
    await page.goto('/app/projects/new');
    await page.getByLabel('Search or create a client').click();
    await page.getByRole('option', { name: 'No client, my own idea' }).click();
    await expect(page.getByText('no client on this one yet')).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Intake link' })).toHaveCount(0);
    await page.getByLabel('Project name').fill('Booking widget');
    await expect(page.getByRole('complementary', { name: 'What this creates' })).toContainText('Idea');
    await create(page).click();
    await expect(page).toHaveURL(new RegExp(`/app/projects/${ID}$`));
    expect(seen.at(-1)).toMatchObject({ body: { clientId: null, name: 'Booking widget' } });
});

test('a typed slug is sent and, when taken, flagged rather than changed', async ({ page }) => {
    const seen = await api(page, { failProject: 409 });
    await page.goto('/app/projects/new');
    await page.getByLabel('Search or create a client').click();
    await page.getByRole('option', { name: 'No client, my own idea' }).click();
    await page.getByLabel('Project name').fill('Booking widget');
    await page.getByRole('button', { name: 'Edit' }).click();
    await page.getByLabel('Slug').fill('Widget One');
    await expect(page.getByLabel('Slug')).toHaveValue('widget-one');
    await create(page).click();
    expect(seen.at(-1)).toMatchObject({ body: { slug: 'widget-one' } });
    await expect(page.getByText('That slug is already taken.')).toBeVisible();
    await expect(create(page)).toBeDisabled();
});

test('a failed save keeps every entry and offers Try again', async ({ page }) => {
    await api(page, { failProject: 500 });
    await page.goto('/app/projects/new');
    await page.getByLabel('Search or create a client').click();
    await page.getByRole('option', { name: 'No client, my own idea' }).click();
    await page.getByLabel('Project name').fill('Booking widget');
    await create(page).click();
    await expect(page.getByRole('form', { name: 'New project' }).getByRole('alert')).toContainText('Not saved.');
    await expect(page.getByLabel('Project name')).toHaveValue('Booking widget');
    await expect(page.getByRole('button', { name: 'Try again' })).toBeEnabled();
});
