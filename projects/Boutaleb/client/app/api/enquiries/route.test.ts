import { NextRequest } from 'next/server';
import { POST } from './route';

// The site's route in front of the API's POST /enquiries: what it forwards,
// and how it turns the API's answer into each form's answer. The API is
// mocked; its own pipeline is tested in the server (enquiries.test.ts).

const contact = { source: 'contact', locale: 'en', name: 'Hamza R.', email: 'hamza@example.ma', t: '1.x' };
const footer = { source: 'footer', locale: 'fr', name: 'Sara', email: 'sara@x.ma', t: '1.x' };

let calls: { url: string; init: RequestInit }[] = [];
const api = (status: number, json: unknown) => {
    calls = [];
    global.fetch = jest.fn(async (url: string, init: RequestInit) => {
        calls.push({ url, init });
        return new Response(JSON.stringify(json), { status, headers: { 'content-type': 'application/json' } });
    }) as unknown as typeof fetch;
};

function send(fields: Record<string, string>, headers: Record<string, string> = {}) {
    const body = new FormData();
    for (const [k, v] of Object.entries(fields)) body.set(k, v);
    return POST(new NextRequest('http://localhost:3002/api/enquiries', { method: 'POST', body, headers }));
}

describe('POST /api/enquiries (the site route in front of the API)', () => {
    it('forwards the fields as JSON with the proxy key and the visitor address', async () => {
        api(201, { ref: 'L-ABCDEFGHJK', email: 'sara@x.ma' });
        await send(footer, { 'x-forwarded-for': '41.92.1.7, 10.0.0.1' });
        expect(calls[0]!.url).toBe('http://localhost:4002/enquiries');
        const h = calls[0]!.init.headers as Record<string, string>;
        expect(h['x-visitor-ip']).toBe('41.92.1.7');
        expect(h['x-forms-key']).toMatch(/^dev-only-forms-proxy-key/);
        expect(JSON.parse(calls[0]!.init.body as string)).toEqual(footer);
    });

    it('a footer send: 201 with the lead, no cookie', async () => {
        api(201, { ref: 'L-ABCDEFGHJK', email: 'sara@x.ma' });
        const res = await send(footer);
        expect(res.status).toBe(201);
        expect(await res.json()).toEqual({ lead: 'L-ABCDEFGHJK' });
        expect(res.cookies.get('bt_thanks_email')).toBeUndefined();
    });

    it('a /contact send: 303 to the localised /thanks with the email cookie', async () => {
        api(201, { ref: 'L-ABCDEFGHJK', email: 'hamza@example.ma' });
        const res = await send(contact);
        expect(res.status).toBe(303);
        expect(res.headers.get('location')).toBe('http://localhost:3002/en/thanks');
        expect(res.cookies.get('bt_thanks_email')?.value).toBe('hamza@example.ma');
        const fr = await send({ ...contact, locale: 'fr' });
        expect(fr.headers.get('location')).toBe('http://localhost:3002/thanks');
    });

    it('422 and 429 pass through as they are', async () => {
        api(422, { errors: { name: 'required' } });
        const bad = await send(contact);
        expect(bad.status).toBe(422);
        expect(await bad.json()).toEqual({ errors: { name: 'required' } });
        api(429, { message: 'ThrottlerException: Too Many Requests' });
        expect((await send(contact)).status).toBe(429);
    });

    it('the API down or refusing the route: 502, the form shows its failure state', async () => {
        api(401, { error: 'unauthorized' });
        expect((await send(contact)).status).toBe(502);
        global.fetch = jest.fn(async () => {
            throw new TypeError('fetch failed');
        }) as unknown as typeof fetch;
        expect((await send(contact)).status).toBe(502);
    });
});
