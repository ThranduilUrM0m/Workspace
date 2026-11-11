import { expect, test, type Page, type Route } from '@playwright/test';

// T7.5c: the Plan tab against a mocked API that keeps the phase list, so
// each change's answer is what the screen draws next.

test.use({ viewport: { width: 1440, height: 900 } });

const ID = 'e'.repeat(24);
const URL_ = `http://localhost:4002/projects/${ID}`;
const PROJECT = {
    id: ID,
    name: 'Studio site',
    slug: 'studio-site',
    status: 'planning',
    client: null,
    internal: false,
    governingLanguage: 'en',
    note: null,
    currency: 'MAD',
    modules: [],
    assetOwnership: [],
    archivedAt: null,
    createdAt: '2026-10-01T09:00:00.000Z',
    updatedAt: '2026-10-01T09:00:00.000Z',
};
const brief = (state: string) => ({ projectId: ID, state, mine: true, seed: null, sentAt: null, submittedAt: null, decidedAt: null, reason: null, revision: 1, reading: null, areas: [] });

type M = { id: string; projectId: string; name: string; due: string | null; done: boolean; order: number };

async function api(page: Page, briefState: string, start: M[]) {
    let rows = start;
    const seen: { method: string; path: string; body: unknown }[] = [];
    let n = rows.length;
    await page.route(`${URL_}**`, async (r: Route) => {
        const req = r.request();
        const path = new URL(req.url()).pathname.replace(`/projects/${ID}`, '');
        if (path === '') return r.fulfill({ json: PROJECT });
        if (path === '/brief') return r.fulfill({ json: brief(briefState) });
        if (req.method() === 'GET') return r.fulfill({ json: rows });
        const body = req.postDataJSON() as Record<string, unknown> | null;
        seen.push({ method: req.method(), path, body });
        const id = path.split('/')[2];
        if (req.method() === 'POST' && path === '/milestones') {
            rows = [...rows, { id: `m${++n}`, projectId: ID, name: body!.name as string, due: (body!.due as string) ?? null, done: false, order: n }];
        } else if (req.method() === 'PATCH') {
            rows = rows.map((m) => (m.id === id ? { ...m, ...body } : m));
        } else if (req.method() === 'DELETE') {
            rows = rows.filter((m) => m.id !== id);
        } else if (path.endsWith('/move')) {
            const at = rows.findIndex((m) => m.id === id);
            const to = at + (body!.direction === 'up' ? -1 : 1);
            const next = [...rows];
            [next[at], next[to]] = [next[to]!, next[at]!];
            rows = next;
        }
        return r.fulfill({ json: rows });
    });
    return seen;
}

const phase = (id: string, name: string, over: Partial<M> = {}): M => ({ id, projectId: ID, name, due: null, done: false, order: 0, ...over });

test('the gate: no phases and no approved brief points back to the intake', async ({ page }) => {
    await api(page, 'submitted', []);
    await page.goto(`/app/projects/${ID}?tab=plan`);
    await expect(page.getByRole('heading', { name: 'No plan yet.' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Open the intake' })).toHaveAttribute('href', `/app/projects/${ID}?tab=intake`);
    await expect(page.getByRole('button', { name: '+ Add a phase' })).toHaveCount(0);
});

test('approved and no phases is a decision, not a gap; the first phase is added in place', async ({ page }) => {
    const seen = await api(page, 'approved', []);
    await page.goto(`/app/projects/${ID}?tab=plan`);
    await expect(page.getByRole('heading', { name: 'This project runs as one piece.' })).toBeVisible();
    await page.getByRole('button', { name: '+ Add a phase' }).click();
    await page.getByLabel('Phase', { exact: true }).fill('Mockups');
    await page.getByLabel('Due', { exact: true }).fill('2026-12-01');
    await page.getByRole('button', { name: 'Add phase' }).click();
    expect(seen[0]).toMatchObject({ method: 'POST', path: '/milestones', body: { name: 'Mockups', due: '2026-12-01' } });
    const list = page.getByRole('list', { name: 'Phases, in order' });
    await expect(list.getByRole('listitem')).toHaveCount(1);
    await expect(list).toContainText('Mockups');
    await expect(page.getByText('1 phase, 1 still open')).toBeVisible();
});

test('order is the owner’s: move, mark done, edit, remove', async ({ page }) => {
    const seen = await api(page, 'approved', [phase('a', 'Mockups', { due: '2026-12-01' }), phase('b', 'Build', { order: 1 }), phase('c', 'Handover', { order: 2 })]);
    await page.goto(`/app/projects/${ID}?tab=plan`);
    const items = page.getByRole('list', { name: 'Phases, in order' }).getByRole('listitem');
    await expect(items).toHaveCount(3);
    // The ends cannot move further.
    await expect(page.getByRole('button', { name: 'Move Mockups earlier' })).toBeDisabled();
    await expect(page.getByRole('button', { name: 'Move Handover later' })).toBeDisabled();

    await page.getByRole('button', { name: 'Move Handover earlier' }).click();
    await expect(items.locator('.pp-ph-name')).toHaveText(['Mockups', 'Handover', 'Build']);
    expect(seen.at(-1)).toMatchObject({ path: '/milestones/c/move', body: { direction: 'up' } });

    await items.first().getByRole('button', { name: 'Mark done' }).click();
    await expect(items.first()).toContainText('Done');
    await expect(page.getByText('3 phases, 2 still open')).toBeVisible();

    // Edit replaces the row; Remove lives only there.
    await expect(page.getByRole('button', { name: 'Remove' })).toHaveCount(0);
    await page.getByRole('button', { name: 'Edit Build' }).click();
    await page.getByLabel('Phase', { exact: true }).fill('Build the site');
    await page.getByRole('button', { name: 'Save' }).click();
    await expect(items.nth(2)).toContainText('Build the site');
    expect(seen.at(-1)).toMatchObject({ method: 'PATCH', path: '/milestones/b', body: { name: 'Build the site', due: null } });

    await page.getByRole('button', { name: 'Edit Handover' }).click();
    await page.getByRole('button', { name: 'Remove' }).click();
    await expect(items).toHaveCount(2);
    expect(seen.at(-1)).toMatchObject({ method: 'DELETE', path: '/milestones/c' });
});

test('phases that exist are shown even when the brief was reopened, with a warning', async ({ page }) => {
    await api(page, 'submitted', [phase('a', 'Mockups')]);
    await page.goto(`/app/projects/${ID}?tab=plan`);
    await expect(page.getByRole('list', { name: 'Phases, in order' })).toContainText('Mockups');
    await expect(page.getByText('The brief is not approved yet')).toBeVisible();
});
