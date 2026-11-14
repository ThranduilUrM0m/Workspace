import { expect, test, type Page, type Route } from '@playwright/test';

// T8.3: Clients against a mocked API. The list groups by neglect (Needs you /
// Running / No live work, folded), the record shows the work and the history
// and can log a contact, New client sends the long form in one request.

test.use({ viewport: { width: 1440, height: 900 } });

const API = 'http://localhost:4002';

const daysAgo = (n: number) =>
    new Intl.DateTimeFormat('en-CA', { timeZone: 'Africa/Casablanca' }).format(
        new Date(Date.now() - n * 86_400_000)
    );

const base = {
    status: 'lead',
    language: 'fr',
    self: false,
    phone: null,
    website: null,
    since: daysAgo(60),
    projects: [] as { id: string; name: string; status: string }[],
    lastTheirs: null as string | null,
    firstContact: null as string | null,
    contacts: 0,
};

const SARA = 'c'.repeat(24);
const clients = () => [
    // A site lead who wrote 9 days ago: past the lead's 7, so Needs you, verb Start project.
    {
        ...base,
        id: SARA,
        name: 'Sara Alaoui',
        company: 'Atlas Riads',
        email: 'sara@atlas.ma',
        language: 'en',
        phone: '+212 600 000 000',
        lastTheirs: daysAgo(9),
        firstContact: daysAgo(9),
        contacts: 1,
    },
    // Live work, spoke 3 days ago: Running.
    {
        ...base,
        id: 'b'.repeat(24),
        name: 'Omar Fassi',
        company: 'Villa Zerhoun',
        email: 'omar@example.ma',
        status: 'active',
        projects: [
            { id: '1'.repeat(24), name: 'Villa site', status: 'in_progress' },
            { id: '2'.repeat(24), name: 'Old brochure', status: 'completed' },
        ],
        lastTheirs: daysAgo(3),
        firstContact: daysAgo(90),
        contacts: 6,
    },
    // Filed Active but everything shipped: No live work, with drift shown.
    {
        ...base,
        id: 'e'.repeat(24),
        name: 'Nadia Berrada',
        company: 'Zellige Studio',
        email: 'nadia@zellige.ma',
        status: 'active',
        projects: [{ id: '3'.repeat(24), name: 'Zellige shop', status: 'completed' }],
        lastTheirs: daysAgo(40),
        firstContact: daysAgo(200),
        contacts: 9,
    },
    { ...base, id: 'd'.repeat(24), name: 'Boutaleb', company: 'Boutaleb', email: 'studio@example.ma', status: 'active', self: true },
];

async function api(page: Page, opts: { empty?: boolean } = {}) {
    const seen: { path: string; body: Record<string, unknown> }[] = [];
    const all = opts.empty ? [] : clients();
    const log: Record<string, unknown>[] = [
        { id: 'l1', at: daysAgo(9), kind: 'reply', text: 'Site enquiry — Six rooms and a booking calendar.', project: null },
    ];
    await page.route(`${API}/clients**`, async (r: Route) => {
        const req = r.request();
        const url = new URL(req.url());
        const path = url.pathname;
        if (req.method() === 'PATCH') {
            const body = req.postDataJSON() as Record<string, unknown>;
            seen.push({ path, body });
            const i = all.findIndex((c) => path === `/clients/${c.id}`);
            const saved = { ...all[i], ...body, company: body.company ?? body.name, phone: body.phone || null, website: body.website || null };
            all[i] = saved as never;
            return r.fulfill({ json: saved });
        }
        if (req.method() === 'POST') {
            const body = req.postDataJSON() as Record<string, unknown>;
            seen.push({ path, body });
            if (path.endsWith('/contacts')) {
                log.unshift({ id: `l${log.length + 1}`, at: body.at, kind: body.kind, text: body.text, project: null });
                return r.fulfill({ status: 201, json: log });
            }
            const made = { ...base, id: 'f'.repeat(24), ...body, company: body.company ?? body.name, status: body.status ?? 'lead', since: daysAgo(0), firstContact: body.firstEntry ? daysAgo(0) : null, contacts: body.firstEntry ? 1 : 0 };
            all.push(made as never);
            return r.fulfill({ status: 201, json: made });
        }
        if (path === '/clients/recent-contacts')
            return r.fulfill({ json: log.map((l) => ({ ...l, client: { id: SARA, name: 'Sara Alaoui' } })) });
        if (path === '/clients') {
            const q = url.searchParams.get('q')?.toLowerCase() ?? '';
            return r.fulfill({ json: q ? all.filter((c) => `${c.name} ${c.company} ${c.email}`.toLowerCase().includes(q)) : all });
        }
        if (path.endsWith('/contacts')) return r.fulfill({ json: log });
        const one = all.find((c) => path === `/clients/${c.id}`);
        return one ? r.fulfill({ json: one }) : r.fulfill({ status: 404, json: { error: 'not_found' } });
    });
    return seen;
}

test('the list groups by neglect, folds no live work and shows drift', async ({ page }) => {
    await api(page);
    await page.goto('/app/clients');
    const needs = page.getByRole('region', { name: 'Needs you' });
    await expect(needs.locator('.b-list-name')).toHaveText(['Sara Alaoui']);
    await expect(needs.getByText('Silent 9 days')).toBeVisible();
    await expect(needs.getByRole('link', { name: 'Start project' })).toHaveAttribute('href', `/app/projects/new?client=${SARA}`);
    const running = page.getByRole('region', { name: 'Running' });
    await expect(running.locator('.b-list-name')).toHaveText(['Omar Fassi', 'Boutaleb']);
    await expect(running.getByText('1 live')).toBeVisible();

    const past = page.getByRole('button', { name: /No live work/ });
    await expect(past).toHaveAttribute('aria-expanded', 'false');
    await past.click();
    await expect(page.getByText('no live work', { exact: true })).toBeVisible();

    await expect(page.getByRole('region', { name: 'Open leads' })).toContainText('Sara Alaoui');
    await expect(page.getByRole('region', { name: 'Recent contact' })).toContainText('Six rooms');
});

test('empty: the strip and New client stay', async ({ page }) => {
    await api(page, { empty: true });
    await page.goto('/app/clients');
    await expect(page.getByRole('heading', { name: 'No clients yet' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'New client' }).first()).toHaveAttribute('href', '/app/clients/new');
});

test('the record shows the work and the history; Log contact adds a call', async ({ page }) => {
    const seen = await api(page);
    await page.goto(`/app/clients/${SARA}`);
    await expect(page.locator('.b-rec-name')).toHaveText('Sara Alaoui');
    await expect(page.locator('.b-rec-head .b-av')).toHaveText('SA');
    await expect(page.getByText('Silent 9 days')).toBeVisible();
    await expect(page.getByRole('region', { name: 'Their work' })).toContainText('Nothing signed yet.');
    await expect(page.getByRole('region', { name: 'Recent contact' })).toContainText('Six rooms');
    await expect(page.getByRole('region', { name: 'Contact', exact: true })).toContainText('+212 600 000 000');
    await expect(page.getByRole('region', { name: 'Their language' })).toContainText('English');

    await page.getByRole('navigation', { name: 'Client sections' }).getByRole('link', { name: 'Communication' }).click();
    await expect(page).toHaveURL(/tab=log/);
    await expect(page.getByText('9 days since they last replied or called.')).toBeVisible();
    await page.getByRole('button', { name: 'Log contact' }).click();
    const save = page.getByRole('button', { name: 'Save to history' });
    await expect(save).toBeDisabled();
    await page.getByRole('radio', { name: 'Call', exact: true }).or(page.getByRole('button', { name: 'Call', exact: true })).click();
    await page.getByLabel('In one line').fill('Walked through the booking flow');
    await save.click();
    await expect(page.getByRole('region', { name: 'History' })).toContainText('Walked through the booking flow');
    expect(seen[0]).toEqual({
        path: `/clients/${SARA}/contacts`,
        body: { kind: 'call', text: 'Walked through the booking flow', at: daysAgo(0) },
    });
});

test('New client sends the long form once and lands on the record', async ({ page }) => {
    const seen = await api(page);
    await page.goto('/app/clients/new');
    await expect(page.getByText('A client needs a name.')).toBeVisible();
    await page.getByLabel('Name').fill('Hamza Rami');
    await page.getByLabel('Company (optional)').fill('Argan House');
    await page.getByLabel('Email').fill('hamza@argan.ma');
    await expect(page.getByText('Pick the language you will write to them in.')).toBeVisible();
    await page.getByRole('radio', { name: 'AR', exact: true }).or(page.getByRole('button', { name: 'AR', exact: true })).click();
    await page.getByLabel('How they got in touch (optional)').fill('Instagram DM about a shop.');
    await page.getByRole('button', { name: 'Create client' }).click();
    await expect(page).toHaveURL(new RegExp(`/app/clients/${'f'.repeat(24)}$`));
    expect(seen[0].body).toEqual({
        name: 'Hamza Rami',
        company: 'Argan House',
        email: 'hamza@argan.ma',
        language: 'ar',
        status: 'lead',
        firstEntry: 'Instagram DM about a shop.',
    });
});

test('Edit details: prefilled, grey until changed, sends every field, back on the record', async ({ page }) => {
    const seen = await api(page);
    await page.goto(`/app/clients/${SARA}`);
    await page.getByRole('link', { name: 'Edit details' }).click();
    await expect(page).toHaveURL(`/app/clients/${SARA}/edit`);
    await expect(page.getByLabel('Name')).toHaveValue('Sara Alaoui');
    await expect(page.getByLabel('Phone (optional)')).toHaveValue('+212 600 000 000');
    const save = page.getByRole('button', { name: 'Save changes' });
    await expect(save).toBeDisabled();
    await expect(page.getByText('Nothing changed yet.')).toBeVisible();
    await expect(page.getByLabel('How they got in touch (optional)')).toHaveCount(0);

    // Her own email is not a clash; another client's is.
    await page.getByLabel('Email').fill('omar@example.ma');
    await expect(page.getByRole('link', { name: 'Open that client instead' })).toBeVisible();
    await page.getByLabel('Email').fill('sara@atlas.ma');

    await page.getByLabel('Phone (optional)').fill('');
    await page.getByRole('radio', { name: 'FR', exact: true }).or(page.getByRole('button', { name: 'FR', exact: true })).click();
    await expect(page.getByText('Anything already sent stays in English.')).toBeVisible();
    await save.click();
    await expect(page).toHaveURL(new RegExp(`/app/clients/${SARA}$`));
    expect(seen[0]).toEqual({
        path: `/clients/${SARA}`,
        body: {
            name: 'Sara Alaoui',
            company: 'Atlas Riads',
            email: 'sara@atlas.ma',
            language: 'fr',
            phone: '',
            website: '',
            status: 'lead',
        },
    });
    await expect(page.getByRole('region', { name: 'Contact', exact: true })).not.toContainText('+212');
});

test('a taken email offers the existing client instead', async ({ page }) => {
    await api(page);
    await page.goto('/app/clients/new');
    await page.getByLabel('Email').fill('omar@example.ma');
    await expect(page.getByRole('link', { name: 'Open that client instead' })).toHaveAttribute('href', `/app/clients/${'b'.repeat(24)}`);
    await expect(page.getByRole('button', { name: 'Create client' })).toBeDisabled();
});
