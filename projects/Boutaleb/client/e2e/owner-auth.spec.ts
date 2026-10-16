import { expect, test } from '@playwright/test';

// T6.2: Clerk guards the owner side and stays off the public site.

test('a signed-out visit to /app is sent to /login, with the way back', async ({ request }) => {
    const res = await request.get('/app', { maxRedirects: 0 });
    expect([302, 307]).toContain(res.status());
    const to = new URL(res.headers()['location'] ?? '', 'http://localhost:3002');
    expect(to.pathname).toBe('/login');
    expect(to.searchParams.get('redirect_url')).toContain('/app');
});

test('public pages load no Clerk script and set no Clerk cookie', async ({ page, context }) => {
    const clerkRequests: string[] = [];
    page.on('request', (r) => {
        if (/clerk/i.test(r.url())) clerkRequests.push(r.url());
    });
    await page.goto('/en/privacy');
    await page.waitForLoadState('networkidle');
    expect(clerkRequests).toEqual([]);
    const cookies = await context.cookies();
    expect(cookies.filter((c) => /clerk|__session|__client/i.test(c.name))).toEqual([]);
});
