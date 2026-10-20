import { generateKeyPairSync } from 'node:crypto';
import request from 'supertest';
import { addMember, startApp, token, type TestApp } from '../testing/app.js';

let t: TestApp;

beforeAll(async () => {
    t = await startApp();
    await addMember(t, 'user_owner', { name: 'Owner', owner: true });
});

afterAll(async () => {
    await t?.close();
});

const me = (bearer?: string) => {
    const req = request(t.app.getHttpServer()).get('/me');
    return bearer ? req.set('Authorization', `Bearer ${bearer}`) : req;
};

describe('Clerk session guard', () => {
    it('lets a valid session through and says who it is', async () => {
        const res = await me(await token());
        expect(res.status).toBe(200);
        expect(res.body).toMatchObject({ userId: 'user_owner', sessionId: 'sess_1', role: { name: 'Owner', owner: true } });
    });

    it('refuses a request with no token', async () => {
        expect((await me()).status).toBe(401);
    });

    it('refuses an expired token', async () => {
        const now = Math.floor(Date.now() / 1000);
        expect((await me(await token({ iat: now - 120, nbf: now - 120, exp: now - 60 }))).status).toBe(401);
    });

    it('refuses a token signed with another key', async () => {
        const other = generateKeyPairSync('rsa', { modulusLength: 2048 }).privateKey.export({ type: 'pkcs8', format: 'pem' }).toString();
        expect((await me(await token({}, other))).status).toBe(401);
    });

    it('refuses a token minted for another origin', async () => {
        expect((await me(await token({ azp: 'https://evil.example' }))).status).toBe(401);
    });

    it('keeps /health open', async () => {
        expect((await request(t.app.getHttpServer()).get('/health')).status).toBe(200);
    });
});
