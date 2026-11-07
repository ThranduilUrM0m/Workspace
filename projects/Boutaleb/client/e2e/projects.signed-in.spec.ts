import { expect, test, type Page, type Route } from '@playwright/test';

// T7.4: the Projects list against a mocked API (the page calls the Nest
// server straight from the browser, so the route is intercepted here and
// no server needs to run).

test.use({ viewport: { width: 1440, height: 900 } });

const API = 'http://localhost:4002/projects';
const client = { id: 'c'.repeat(24), name: 'Omar Fassi', company: 'Villa Zerhoun', self: false };
const studio = { id: 'd'.repeat(24), name: 'Boutaleb', company: 'Boutaleb', self: true };
let seq = 0;
const project = (name: string, status: string, over: Record<string, unknown> = {}) => ({
    id: String(++seq).padStart(24, '0'),
    name,
    slug: name.toLowerCase().replace(/\W+/g, '-'),
    status,
    client,
    internal: false,
    governingLanguage: 'fr',
    note: null,
    currency: 'MAD',
    modules: ['quotes', 'invoices', 'payments'],
    assetOwnership: [],
    archivedAt: null,
    createdAt: '2026-10-01T09:00:00.000Z',
    updatedAt: '2026-10-01T09:00:00.000Z',
    ...over,
});

const PROJECTS = [
    project('Villa Zerhoun — Site', 'planning'),
    project('Studio site', 'in_progress', { client: studio, internal: true }),
    project('Riad Nozha — Booking', 'intake_pending'),
    project('Riad booking tool', 'idea', { client: null }),
    project('Café Andalou', 'completed'),
];

const serve = (page: Page, body: unknown, status = 200) => page.route(`${API}*`, (r: Route) => r.fulfill({ status, json: body }));

test('ready: grouped by whose turn it is, Completed folded', async ({ page }) => {
    let auth = '';
    await page.route(`${API}*`, (r) => {
        auth = r.request().headers().authorization ?? '';
        return r.fulfill({ json: PROJECTS });
    });
    await page.goto('/app/projects');
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Projects');

    const group = (name: string) => page.getByRole('region', { name });
    await expect(group('Your move').locator('.b-list-gh-n')).toHaveText('2');
    expect(auth).toMatch(/^Bearer \S+/);
    await expect(group('Waiting on them').locator('.b-list-gh-n')).toHaveText('1');
    await expect(group('Parked').locator('.b-list-gh-n')).toHaveText('1');

    // Planning goes to the plan tab; the internal build opens the board.
    const planning = page.locator('.b-list-row', { hasText: 'Villa Zerhoun — Site' });
    await expect(planning.getByRole('link', { name: 'Plan phases' })).toHaveAttribute('href', `/app/projects/${PROJECTS[0]!.id}?tab=plan`);
    await expect(page.locator('.b-list-row', { hasText: 'Studio site' })).toContainText('Internal');
    await expect(page.locator('.b-list-row', { hasText: 'Riad booking tool' })).toContainText('Yours');
    await expect(page.locator('.b-list-row', { hasText: 'Riad Nozha' })).toContainText('No reply yet');
    await expect(page.locator('.b-list-row', { hasText: 'Riad Nozha' }).getByRole('link', { name: 'Omar Fassi' })).toHaveAttribute('href', `/app/clients/${client.id}`);

    // Completed is a fold, not a page.
    const fold = page.getByRole('button', { name: /Completed/ });
    await expect(fold).toHaveAttribute('aria-expanded', 'false');
    await expect(page.getByText('Café Andalou')).toHaveCount(0);
    await fold.click();
    await expect(page.locator('.b-list-row', { hasText: 'Café Andalou' })).toBeVisible();

    // The pipeline counts every stage present, in funnel order.
    await expect(page.locator('.pr-legend > span')).toHaveText(['1idea', '1intake', '1planning', '1building', '1done']);
    await expect(page.getByRole('link', { name: 'New project' })).toHaveAttribute('href', '/app/projects/new');
});

test('the search filters this list, and says so when nothing matches', async ({ page }) => {
    await serve(page, PROJECTS);
    await page.goto('/app/projects');
    const box = page.getByRole('searchbox', { name: 'Filter projects…' });
    await box.fill('nozha');
    await expect(page.locator('.b-list-row')).toHaveCount(1);
    await box.fill('zzz');
    await expect(page.getByText('Nothing matches “zzz”.')).toBeVisible();
});

test('empty: the strip and New project stay, the rail goes', async ({ page }) => {
    await serve(page, []);
    await page.goto('/app/projects');
    await expect(page.getByRole('heading', { name: 'No projects yet' })).toBeVisible();
    await expect(page.locator('.b-rail')).toHaveCount(0);
    await expect(page.locator('.b-list-strip .stat')).toHaveCount(4);
});

test('loading: a skeleton in the shape of the list, the primary still live', async ({ page }) => {
    await page.route(`${API}*`, () => new Promise(() => {}));
    await page.goto('/app/projects');
    await expect(page.locator('.b-list-wrap')).toHaveAttribute('aria-busy', 'true');
    await expect(page.getByRole('status').filter({ hasText: 'Loading projects…' })).toBeAttached();
    await expect(page.locator('.b-skel-row')).toHaveCount(6);
    await expect(page.getByRole('link', { name: 'New project' })).toBeVisible();
});

test('a refusal is not retried, and says it is a refusal', async ({ page }) => {
    let calls = 0;
    await page.route(`${API}*`, (r) => {
        calls += 1;
        return r.fulfill({ status: 403, json: { message: 'Forbidden', statusCode: 403 } });
    });
    await page.goto('/app/projects');
    await expect(page.getByRole('heading', { name: 'No access to projects' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Try again' })).toHaveCount(0);
    expect(calls).toBe(1);
});

test('a server failure is retried, then the failed panel gives the real count', async ({ page }) => {
    test.slow(); // three retries back off 1s, 2s, 4s
    let calls = 0;
    await page.route(`${API}*`, (r) => {
        calls += 1;
        return r.fulfill({ status: 503, json: { message: 'down' } });
    });
    await page.goto('/app/projects');
    await expect(page.getByRole('alert').filter({ hasText: 'The projects did not load' })).toBeVisible({ timeout: 15_000 });
    await expect(page.locator('.b-fail-when')).toContainText('Tried 4 times · last at');
    expect(calls).toBe(4);

    await page.unroute(`${API}*`);
    await serve(page, PROJECTS);
    await page.getByRole('button', { name: 'Try again' }).click();
    await expect(page.getByRole('region', { name: 'Your move' })).toBeVisible();
});
