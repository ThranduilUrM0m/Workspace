import { expect, test } from '@playwright/test';

// T6.6: the Dashboard on sample data, each state through ?state=.

test.use({ viewport: { width: 1440, height: 900 } });

test('ready: greets, and shows the four numbers and every widget', async ({ page }) => {
    await page.goto('/app');
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(/^Good (morning|afternoon|evening), Test$/);
    await expect(page.locator('.d-kpi')).toHaveCount(4);
    for (const t of ['Projects in progress', 'Performance', 'Deadlines', 'Recent clients', 'Quick actions']) {
        await expect(page.getByRole('heading', { level: 2, name: t })).toBeVisible();
    }
    await expect(page.getByText('Needs you')).toBeVisible();
});

test('the numbers read one chain, enquiry to revenue', async ({ page }) => {
    await page.goto('/app');
    await expect(page.locator('.d-kpi-lbl')).toHaveText(['Enquiries waiting', 'Unbilled work', 'Owed to you', 'Revenue, MTD']);
    await expect(page.locator('.b-states')).toHaveCount(0);
});

test('empty: nothing needs you, every widget names its door', async ({ page }) => {
    await page.goto('/app?state=empty');
    await expect(page.getByText('Nothing needs you right now.')).toBeVisible();
    await expect(page.locator('.d-none-t', { hasText: 'No projects yet' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'New project' })).toHaveAttribute('href', '/app/projects/new');
    await expect(page.locator('.d-delta')).toHaveCount(0);
});

test('money failing blanks only money, and says so in place', async ({ page }) => {
    await page.goto('/app?state=error');
    await expect(page.locator('.d-fail')).toContainText('Money did not load. The rest of the page is current.');
    await expect(page.locator('.d-kpi', { hasText: 'Owed to you' })).toContainText('Did not load');
    await expect(page.locator('.d-kpi', { hasText: 'Unbilled work' })).toContainText('Did not load');
    await expect(page.locator('.d-kpi', { hasText: 'Enquiries waiting' })).toContainText('2');
    await expect(page.getByText('Villa Anfa — full interior')).toBeVisible();
});

test('loading: the frame stays, the region says it is busy', async ({ page }) => {
    await page.goto('/app?state=loading');
    await expect(page.locator('.d-wrap')).toHaveAttribute('aria-busy', 'true');
    await expect(page.locator('.d-kpi')).toHaveCount(4);
    // Quick actions are not data: live in every state.
    await expect(page.getByRole('link', { name: /New invoice/ })).toBeVisible();
});
