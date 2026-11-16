import { visitorFrom } from './proxy';

// The address the API's per-visitor throttle counts. A visitor controls every
// X-Forwarded-For entry except the last one (appended by the proxy in front
// of the site), so a made-up first entry must never be the one counted.

const h = (init: Record<string, string>) => new Headers(init);

describe('visitorFrom', () => {
    it('Netlify\'s own header wins: a visitor cannot set it', () => {
        expect(visitorFrom(h({ 'x-nf-client-connection-ip': '41.92.1.7', 'x-forwarded-for': '203.0.113.66' }))).toBe('41.92.1.7');
    });

    it('otherwise the last X-Forwarded-For entry, never a forged first one', () => {
        expect(visitorFrom(h({ 'x-forwarded-for': '203.0.113.66, 198.51.100.9, 41.92.1.7' }))).toBe('41.92.1.7');
        expect(visitorFrom(h({ 'x-forwarded-for': '41.92.1.7' }))).toBe('41.92.1.7');
    });

    it('a new made-up address on every request still counts as the same visitor', () => {
        const a = visitorFrom(h({ 'x-forwarded-for': '1.1.1.1, 41.92.1.7' }));
        const b = visitorFrom(h({ 'x-forwarded-for': '2.2.2.2, 41.92.1.7' }));
        expect(a).toBe(b);
    });

    it('nothing usable: "local"', () => {
        expect(visitorFrom(h({}))).toBe('local');
        expect(visitorFrom(h({ 'x-forwarded-for': ' , ' }))).toBe('local');
        expect(visitorFrom(h({ 'x-nf-client-connection-ip': '  ' }))).toBe('local');
    });
});
