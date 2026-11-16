import { NextRequest } from 'next/server';
import { POST } from './route';

// The site's route between "email me my access link" and the API. The API is
// mocked; its rules (what is eligible, the 24-hour limit) are tested in the
// server (portal.test.ts).

let calls: { url: string; init: RequestInit }[] = [];
const api = (status: number, json: unknown) => {
    calls = [];
    global.fetch = jest.fn(async (url: string, init: RequestInit) => {
        calls.push({ url, init });
        return new Response(JSON.stringify(json), { status, headers: { 'content-type': 'application/json' } });
    }) as unknown as typeof fetch;
};
const call = (body: unknown, headers: Record<string, string> = {}) => POST(new NextRequest('http://localhost:3002/api/portal/resend', { method: 'POST', body: JSON.stringify(body), headers }));

describe('/api/portal/resend', () => {
    it('forwards the address with the proxy key and the visitor address, and answers ok', async () => {
        api(200, { ok: true });
        const res = await call({ email: 'omar@example.ma' }, { 'x-forwarded-for': '203.0.113.66, 41.92.1.7' });
        expect(res.status).toBe(200);
        expect(await res.json()).toEqual({ ok: true });
        expect(calls[0]!.url).toBe('http://localhost:4002/portal/resend');
        expect(calls[0]!.init.method).toBe('POST');
        const h = calls[0]!.init.headers as Record<string, string>;
        expect(h['x-visitor-ip']).toBe('41.92.1.7');
        expect(h['x-forms-key']).toMatch(/^dev-only-forms-proxy-key/);
        expect(JSON.parse(calls[0]!.init.body as string)).toEqual({ email: 'omar@example.ma' });
    });

    it('whatever the API says on success is not passed on: the answer is always the same two words', async () => {
        api(200, { ok: true, matched: 3 });
        expect(await (await call({ email: 'a@b.co' })).json()).toEqual({ ok: true });
    });

    it('a bad body and a throttle pass through with their status', async () => {
        for (const status of [400, 429]) {
            api(status, { error: 'x' });
            expect((await call({ email: 'x' })).status).toBe(status);
        }
    });

    it('anything else from the API, or no API at all, is 502 and says nothing about why', async () => {
        api(500, { stack: 'secret' });
        const res = await call({ email: 'a@b.co' });
        expect(res.status).toBe(502);
        expect(await res.json()).toEqual({ error: 'unavailable' });

        global.fetch = jest.fn(async () => {
            throw new Error('ECONNREFUSED');
        }) as unknown as typeof fetch;
        expect((await call({ email: 'a@b.co' })).status).toBe(502);
    });
});
