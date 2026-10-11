import { NextRequest } from 'next/server';
import { POST } from './route';

const valid = {
    source: 'contact',
    locale: 'en',
    idempotencyKey: '0b6f3f2e-5d0a-4c8e-9a51-2f6d1c7e8a90',
    name: 'Hamza R.',
    email: 'Hamza@Example.ma',
    category: 'new',
    message: 'A booking site.',
    budget: 'not-sure',
    timeline: 'flexible',
    via: 'email',
    stage: 'idea',
};

function send(fields: Record<string, string>) {
    const body = new FormData();
    for (const [k, v] of Object.entries(fields)) body.set(k, v);
    return POST(new NextRequest('http://localhost:3002/api/enquiries', { method: 'POST', body }));
}

describe('POST /api/enquiries (local stand-in)', () => {
    it('answers a valid send with 303 to /thanks and the email cookie', async () => {
        const res = await send(valid);
        expect(res.status).toBe(303);
        expect(res.headers.get('location')).toBe('http://localhost:3002/en/thanks');
        expect(res.cookies.get('bt_thanks_email')?.value).toBe('hamza@example.ma');
    });

    it('sends French, the default, to the unprefixed /thanks', async () => {
        const res = await send({ ...valid, locale: 'fr' });
        expect(res.headers.get('location')).toBe('http://localhost:3002/thanks');
    });

    it('gives a bot the same 303 and keeps nothing', async () => {
        const res = await send({ ...valid, email: 'junk', nickname: 'bot' });
        expect(res.status).toBe(303);
        expect(res.cookies.get('bt_thanks_email')).toBeUndefined();
    });

    it('answers invalid input with 422 and field codes', async () => {
        const res = await send({ ...valid, name: ' ', email: 'nope' });
        expect(res.status).toBe(422);
        expect(await res.json()).toEqual({ errors: { name: 'required', email: 'email' } });
    });
});
