import { NextRequest } from 'next/server';
import { POST, PUT } from './route';

// The site's route between the client's page and the API's /portal calls.
// The API is mocked; its rules (dead links, one submission) are tested in
// the server (portal.test.ts).

const TOKEN = 'A'.repeat(43);
const ctx = (action: string) => ({ params: Promise.resolve({ token: TOKEN, action }) });

let calls: { url: string; init: RequestInit }[] = [];
const api = (status: number, json: unknown) => {
    calls = [];
    global.fetch = jest.fn(async (url: string, init: RequestInit) => {
        calls.push({ url, init });
        return new Response(JSON.stringify(json), { status, headers: { 'content-type': 'application/json' } });
    }) as unknown as typeof fetch;
};

const call = (verb: typeof PUT | typeof POST, action: string, body: unknown, headers: Record<string, string> = {}) =>
    verb(new NextRequest(`http://localhost:3002/api/portal/${TOKEN}/${action}`, { method: verb === PUT ? 'PUT' : 'POST', body: JSON.stringify(body), headers }), ctx(action));

describe('/api/portal/<token>/<action>', () => {
    it('draft: forwards the answers with the proxy key and the visitor address', async () => {
        api(200, { saved: true });
        const res = await call(PUT, 'draft', { answers: { 'discovery.what': 'Rooms.' } }, { 'x-forwarded-for': '203.0.113.66, 41.92.1.7' });
        expect(res.status).toBe(200);
        expect(calls[0]!.url).toBe(`http://localhost:4002/portal/${TOKEN}/draft`);
        expect(calls[0]!.init.method).toBe('PUT');
        const h = calls[0]!.init.headers as Record<string, string>;
        expect(h['x-visitor-ip']).toBe('41.92.1.7');
        expect(h['x-forms-key']).toMatch(/^dev-only-forms-proxy-key/);
        expect(JSON.parse(calls[0]!.init.body as string)).toEqual({ answers: { 'discovery.what': 'Rooms.' } });
    });

    it('submit: forwards as POST and returns the API answer', async () => {
        api(200, { state: 'done' });
        const res = await call(POST, 'submit', { answers: { 'discovery.what': 'Rooms.' } });
        expect(calls[0]!.init.method).toBe('POST');
        expect(await res.json()).toEqual({ state: 'done' });
    });

    it('a dead link, a bad body and a throttle pass through with their status', async () => {
        for (const status of [404, 400, 429]) {
            api(status, { error: 'x' });
            expect((await call(PUT, 'draft', { answers: {} })).status).toBe(status);
        }
    });

    it('anything else from the API, or no API at all, is 502 and says nothing about why', async () => {
        api(500, { stack: 'secret' });
        const res = await call(PUT, 'draft', { answers: {} });
        expect(res.status).toBe(502);
        expect(await res.json()).toEqual({ error: 'unavailable' });

        global.fetch = jest.fn(async () => {
            throw new Error('ECONNREFUSED');
        }) as unknown as typeof fetch;
        expect((await call(POST, 'submit', { answers: {} })).status).toBe(502);
    });

    it('only draft by PUT and submit by POST: nothing else is forwarded', async () => {
        api(200, {});
        expect((await call(POST, 'draft', {})).status).toBe(404);
        expect((await call(PUT, 'submit', {})).status).toBe(404);
        expect((await call(PUT, 'view', {})).status).toBe(404);
        expect(calls).toHaveLength(0);
    });
});
