import request from 'supertest';
import { addMember, settle, startApp, token, type TestApp } from '../testing/app.js';

let t: TestApp;

beforeAll(async () => {
    t = await startApp();
    await addMember(t, 'user_owner', { name: 'Owner', owner: true });
});

afterAll(async () => {
    await t?.close();
});

const me = async (sid: string) =>
    request(t.app.getHttpServer()).get('/me?q=secret').set('Authorization', `Bearer ${await token({ sid })}`).set('User-Agent', 'vitest');

describe('activity log', () => {
    it('logs a session\'s first request as a sign-in, once', async () => {
        await me('sess_a');
        await me('sess_a');
        await settle();
        expect(await t.events.countDocuments({ action: 'sign_in', sessionId: 'sess_a' })).toBe(1);
        expect(await t.events.findOne({ action: 'sign_in', sessionId: 'sess_a' }).lean()).toMatchObject({ kind: 'access', weight: 'notable' });
    });

    it('logs every read as routine, with the path but never the query', async () => {
        await me('sess_b');
        await settle();
        const e = await t.events.findOne({ action: 'GET /me', sessionId: 'sess_b' }).lean();
        expect(e).toMatchObject({ kind: 'view', weight: 'routine', actor: { name: 'owner' }, request: { method: 'GET', path: '/me', status: 200, userAgent: 'vitest' } });
        expect(JSON.stringify(e)).not.toContain('secret');
    });

    it('lets routine entries expire and keeps the rest', async () => {
        const routine = await t.events.findOne({ weight: 'routine' }).lean();
        const notable = await t.events.findOne({ weight: 'notable' }).lean();
        expect(routine?.expireAt).toBeInstanceOf(Date);
        expect(notable?.expireAt).toBeUndefined();
    });

    it('logs nothing for public routes or unsigned callers', async () => {
        const before = await t.events.countDocuments();
        await request(t.app.getHttpServer()).get('/health');
        await request(t.app.getHttpServer()).get('/me');
        await settle();
        expect(await t.events.countDocuments()).toBe(before);
    });

    it('refuses to edit or delete an entry', async () => {
        await expect(t.events.updateOne({}, { action: 'rewritten' })).rejects.toThrow('append-only');
        await expect(t.events.deleteMany({})).rejects.toThrow('append-only');
    });
});
