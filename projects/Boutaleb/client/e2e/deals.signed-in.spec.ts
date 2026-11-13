import { expect, test, type Page, type Route } from '@playwright/test';

// T8.2: Deals against a mocked API. One list with three doors, a record
// that shows what the site form said and can be closed as lost, and Log an
// enquiry with a picked or a new client.

test.use({ viewport: { width: 1440, height: 900 } });

const API = 'http://localhost:4002';

/** A calendar day `n` days before today, in the studio's zone (the screens count from it). */
const daysAgo = (n: number) =>
    new Intl.DateTimeFormat('en-CA', { timeZone: 'Africa/Casablanca' }).format(
        new Date(Date.now() - n * 86_400_000)
    );

const sara = {
    id: 'c'.repeat(24),
    name: 'Sara Alaoui',
    company: 'Atlas Riads',
    email: 'sara@atlas.ma',
    language: 'en',
    self: false,
};
const omar = {
    id: 'b'.repeat(24),
    name: 'Omar Fassi',
    company: 'Villa Zerhoun',
    email: 'omar@example.ma',
    language: 'fr',
    self: false,
};
const studio = {
    id: 'd'.repeat(24),
    name: 'Boutaleb',
    company: 'Boutaleb',
    email: 'studio@example.ma',
    status: 'active',
    language: 'en',
    self: true,
};

const base = {
    value: null,
    priced: false,
    sent: null,
    decided: null,
    lostWhy: null,
    note: null,
    enquiry: null,
    source: 'direct',
};
const SITE = '1'.repeat(24);
const deals = () => [
    {
        ...base,
        id: SITE,
        title: 'Sara Alaoui — Website',
        stage: 'lead',
        source: 'site',
        opened: daysAgo(2),
        client: sara,
        enquiry: {
            id: 'e'.repeat(24),
            ref: 'L-ABCDEFGHJK',
            source: 'contact',
            message: 'Six rooms and a booking calendar.',
            details: { category: 'new', budget: '5k-15k', timeline: 'months' },
            receivedAt: new Date().toISOString(),
        },
    },
    {
        ...base,
        id: '2'.repeat(24),
        title: 'Kasbah Table ordering',
        stage: 'proposal',
        source: 'referral',
        value: 35000,
        priced: true,
        opened: daysAgo(30),
        sent: daysAgo(12),
        client: omar,
    },
    {
        ...base,
        id: '3'.repeat(24),
        title: 'Spa booking',
        stage: 'proposal',
        value: 48000,
        priced: true,
        opened: daysAgo(10),
        sent: daysAgo(2),
        client: sara,
    },
    {
        ...base,
        id: '4'.repeat(24),
        title: 'Riad Nozha site',
        stage: 'won',
        source: 'referral',
        value: 55000,
        priced: true,
        opened: daysAgo(120),
        sent: daysAgo(110),
        decided: daysAgo(100),
        client: omar,
    },
    {
        ...base,
        id: '5'.repeat(24),
        title: 'Souss Optique rebuild',
        stage: 'lost',
        value: 40000,
        priced: true,
        opened: daysAgo(90),
        sent: daysAgo(80),
        decided: daysAgo(70),
        lostWhy: 'Went with a cheaper quote',
        client: omar,
    },
];

/** Radix toggle items are radios or pressed buttons depending on the mode: accept either. */
const opt = (page: Page, name: string) =>
    page
        .getByRole('radio', { name, exact: true })
        .or(page.getByRole('button', { name, exact: true }));

type Seen = { method: string; path: string; body: Record<string, unknown> | null };

async function api(page: Page, opts: { empty?: boolean } = {}) {
    const seen: Seen[] = [];
    const all = opts.empty ? [] : deals();
    await page.route(`${API}/deals**`, async (r: Route) => {
        const req = r.request();
        const path = new URL(req.url()).pathname;
        if (req.method() === 'POST') {
            const body = req.postDataJSON() as Record<string, unknown>;
            seen.push({ method: 'POST', path, body });
            if (path.endsWith('/lose')) {
                const d = all.find((x) => path.includes(x.id))!;
                Object.assign(d, { stage: 'lost', lostWhy: body.lostWhy, decided: daysAgo(0) });
                return r.fulfill({ json: d });
            }
            const nc = body.newClient as Record<string, string> | undefined;
            const made = {
                ...base,
                id: 'f'.repeat(24),
                title: body.title,
                stage: 'lead',
                source: body.source,
                value: body.value ?? null,
                opened: daysAgo(0),
                note: body.note ?? null,
                client: nc
                    ? {
                          id: 'a'.repeat(24),
                          name: nc.name,
                          company: nc.company ?? nc.name,
                          email: nc.email,
                          language: nc.language,
                          self: false,
                      }
                    : omar,
            };
            all.push(made as never);
            return r.fulfill({ status: 201, json: made });
        }
        if (path === '/deals') return r.fulfill({ json: all });
        const one = all.find((x) => path === `/deals/${x.id}`);
        return one
            ? r.fulfill({ json: one })
            : r.fulfill({ status: 404, json: { error: 'not_found' } });
    });
    await page.route(`${API}/clients**`, async (r: Route) => {
        const q = new URL(r.request().url()).searchParams.get('q')?.toLowerCase() ?? '';
        const list = [{ ...omar, status: 'active' }, { ...sara, status: 'lead' }, studio];
        return r.fulfill({
            json: q
                ? list.filter((c) => `${c.name} ${c.company} ${c.email}`.toLowerCase().includes(q))
                : list,
        });
    });
    return seen;
}

test('the whole funnel: your move ranks the rot first, closed is folded', async ({ page }) => {
    await api(page);
    await page.goto('/app/deals');
    const mine = page.getByRole('region', { name: 'Your move' });
    await expect(mine.locator('.b-list-name')).toHaveText([
        'Kasbah Table ordering',
        'Sara Alaoui — Website',
    ]);
    await expect(mine.getByText('Unanswered 12 days')).toBeVisible();
    await expect(mine.getByRole('link', { name: 'Chase reply' })).toBeVisible();
    await expect(
        page.getByRole('region', { name: 'Waiting on them' }).locator('.b-list-name')
    ).toHaveText(['Spa booking']);

    const closed = page.getByRole('button', { name: /Closed · 1 won/ });
    await expect(closed).toHaveAttribute('aria-expanded', 'false');
    await closed.click();
    await expect(page.getByText('Went with a cheaper quote')).toBeVisible();

    // The rail: what is out, and which channel won.
    await expect(
        page.getByRole('region', { name: 'Out and unanswered' }).locator('.b-ev-t')
    ).toHaveCount(2);
    await expect(page.getByRole('region', { name: 'Where the wins came from' })).toContainText(
        'Referral'
    );
});

test('a door narrows the one list and says how to get back out', async ({ page }) => {
    await api(page);
    await page.goto('/app/deals/leads');
    await expect(page.locator('.dl-scope')).toContainText('Showing 1 lead deal of 5.');
    await expect(page.locator('.b-list-main .b-list-name')).toHaveText(['Sara Alaoui — Website']);
    await page.getByRole('link', { name: 'Show the whole funnel' }).click();
    await expect(page).toHaveURL(/\/app\/deals$/);
    await expect(page.locator('.dl-scope')).toHaveCount(0);
});

test('empty: the strip and the way in stay, the rail goes', async ({ page }) => {
    await api(page, { empty: true });
    await page.goto('/app/deals');
    await expect(page.getByRole('heading', { name: 'No deals yet' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Log an enquiry' }).first()).toBeVisible();
});

test('a site deal shows what they wrote; close it as lost with a reason', async ({ page }) => {
    const seen = await api(page);
    await page.goto(`/app/deals/${SITE}`);
    await expect(page.locator('.b-rec-name')).toHaveText('Sara Alaoui — Website');
    const wrote = page.getByRole('region', { name: 'What they wrote' });
    await expect(wrote).toContainText('Six rooms and a booking calendar.');
    await expect(wrote).toContainText('New project');
    await expect(wrote).toContainText('$5k–$15k');
    await expect(
        page.getByRole('navigation', { name: 'Deal sections' }).getByRole('link')
    ).toHaveText(['Overview', 'Proposal', 'Contract']);

    await page.getByRole('button', { name: 'Close as lost' }).click();
    const confirm = page.locator('.dr-lose').getByRole('button', { name: 'Close as lost' });
    await expect(confirm).toBeDisabled();
    await page.getByLabel('Why it was lost').fill('Not a real enquiry');
    await confirm.click();
    await expect(page.getByRole('region', { name: 'Why it was lost' })).toContainText(
        'Not a real enquiry'
    );
    expect(seen.find((s) => s.path.endsWith('/lose'))?.body).toEqual({
        lostWhy: 'Not a real enquiry',
    });

    await page.getByRole('navigation', { name: 'Deal sections' }).getByRole('link', { name: 'Proposal' }).click();
    await expect(page).toHaveURL(/tab=proposal/);
    await expect(page.getByText('Drafting proposals arrives in a later release.')).toBeVisible();
});

test('log an enquiry with a picked client: source is required, create lands on the deal', async ({
    page,
}) => {
    const seen = await api(page);
    await page.goto('/app/deals/new');
    await expect(page.getByText('Pick a client, or create one.')).toBeVisible();
    await page.getByLabel('Search or create a client').fill('o');
    // The studio is a client, not a counterparty: never offered here.
    await expect(page.getByRole('option', { name: /Boutaleb/ })).toHaveCount(0);
    await page.getByRole('option', { name: /Omar Fassi/ }).click();
    await page.getByLabel('What they want').fill('Booking module');
    await page.getByLabel('Rough value in MAD (optional)').fill('60 000');
    await expect(page.getByText('Say where this came from.')).toBeVisible();
    // Omar has a won deal: Repeat is suggested until picked.
    await opt(page, 'Referral').click();
    await expect(page.getByText(/Repeat.*probably the honest answer/)).toBeVisible();
    await opt(page, 'Repeat').click();
    await page.getByRole('button', { name: 'Log the enquiry' }).click();
    await expect(page).toHaveURL(new RegExp(`/app/deals/${'f'.repeat(24)}$`));
    expect(seen[0].body).toEqual({
        clientId: omar.id,
        title: 'Booking module',
        value: 60000,
        source: 'repeat',
    });
});

test('log an enquiry with a new client: sent with the deal in one request', async ({ page }) => {
    const seen = await api(page);
    await page.goto('/app/deals/new');
    await page.getByLabel('Search or create a client').fill('Hamza R.');
    await page.getByRole('option', { name: /Create .Hamza R.. as a new client/ }).click();
    await page.getByLabel('Email').fill('hamza@example.ma');
    await opt(page, 'FR').click();
    await page.getByLabel('What they want').fill('Spa site and booking');
    await opt(page, 'Direct').click();
    await page.getByRole('button', { name: 'Log the enquiry' }).click();
    await expect(page).toHaveURL(new RegExp(`/app/deals/${'f'.repeat(24)}$`));
    expect(seen[0].body).toEqual({
        newClient: { name: 'Hamza R.', email: 'hamza@example.ma', language: 'fr' },
        title: 'Spa site and booking',
        value: null,
        source: 'direct',
    });
});
