import { getModelToken } from '@nestjs/mongoose';
import type { Model } from 'mongoose';
import request from 'supertest';
import { addMember, settle, startApp, token, type TestApp } from '../testing/app.js';
import { BRIEF, type Brief } from './brief.schema.js';

let t: TestApp;
let briefs: Model<Brief>;

beforeAll(async () => {
    t = await startApp();
    briefs = t.app.get(getModelToken(BRIEF));
    await addMember(t, 'user_owner', { name: 'Owner', owner: true });
    await addMember(t, 'user_viewer', { name: 'Viewer', levels: { projects: 'view' } as never });
});

afterAll(async () => {
    await t?.close();
});

const as = async (sub: string) => `Bearer ${await token({ sub, sid: `sess_${sub}` })}`;
const api = () => request(t.app.getHttpServer());
const owner = async () => as('user_owner');

async function idea(name = 'Riad booking tool') {
    const res = await api().post('/projects').set('Authorization', await owner()).send({ name, governingLanguage: 'en', clientId: null });
    return res.body.id as string;
}

async function forClient(name = 'Villa Zerhoun — Site') {
    const auth = await owner();
    const c = await api().post('/clients').set('Authorization', auth).send({ name: 'Omar Fassi', company: 'Villa Zerhoun', email: `omar+${Math.random()}@example.ma`, language: 'fr' });
    const res = await api().post('/projects').set('Authorization', auth).send({ name, governingLanguage: 'fr', clientId: c.body.id });
    return res.body.id as string;
}

/** A client's submission, as the portal will store it (M8). */
async function submitted(projectId: string) {
    await briefs.create({
        project: projectId,
        state: 'submitted',
        sentAt: new Date('2026-11-01'),
        submittedAt: new Date('2026-11-05'),
        revision: 1,
        reading: { summary: 'A booking site for a riad.', risks: ['Budget is tight'], assumptions: ['French only'] },
        areas: [
            { key: 'discovery', qs: [{ q: 'What do you sell?', a: 'Rooms.' }] },
            { key: 'strategy', qs: [{ q: 'What is success?', a: '' }] },
        ],
    });
}

describe('reading', () => {
    it('a project with no brief answers state none, not 404', async () => {
        const id = await idea();
        const res = await api().get(`/projects/${id}/brief`).set('Authorization', await as('user_viewer'));
        expect(res.status).toBe(200);
        expect(res.body).toMatchObject({ projectId: id, state: 'none', mine: false, revision: 0, areas: [] });
    });

    it('an unknown project is 404', async () => {
        const res = await api().get(`/projects/${'f'.repeat(24)}/brief`).set('Authorization', await owner());
        expect(res.status).toBe(404);
    });
});

describe('writing it yourself', () => {
    it('an idea: the owner writes it, every prompt kept, empty ones empty', async () => {
        const id = await idea('Own idea A');
        const res = await api()
            .put(`/projects/${id}/brief`)
            .set('Authorization', await owner())
            .send({ answers: { 'discovery.what': 'A booking tool for small riads.', 'requirements.day1': 'Take a booking.' } });
        expect(res.status).toBe(200);
        expect(res.body).toMatchObject({ state: 'submitted', mine: true, revision: 1, reading: null });
        expect(res.body.areas).toHaveLength(5);
        expect(res.body.areas[0].qs).toEqual([
            { q: 'What the business does', a: 'A booking tool for small riads.' },
            { q: 'Who it is for', a: '' },
            { q: 'What is broken today', a: '' },
        ]);
        await settle();
        expect(await t.events.exists({ action: 'brief.write', 'target.id': id })).toBeTruthy();
    });

    it('rewriting a submitted brief is the same revision; nothing at all is refused', async () => {
        const id = await idea('Own idea B');
        const auth = await owner();
        await api().put(`/projects/${id}/brief`).set('Authorization', auth).send({ answers: { 'discovery.what': 'First go.' } });
        const again = await api().put(`/projects/${id}/brief`).set('Authorization', auth).send({ answers: { 'discovery.what': 'Second go.' } });
        expect(again.body.revision).toBe(1);
        const blank = await api().put(`/projects/${id}/brief`).set('Authorization', auth).send({ answers: { 'discovery.what': '   ' } });
        expect(blank.status).toBe(400);
        const unknown = await api().put(`/projects/${id}/brief`).set('Authorization', auth).send({ answers: { 'nope.x': 'a' } });
        expect(unknown.status).toBe(400);
    });

    it("a client's brief is theirs to answer", async () => {
        const id = await forClient('Client project W');
        const res = await api().put(`/projects/${id}/brief`).set('Authorization', await owner()).send({ answers: { 'discovery.what': 'x' } });
        expect(res.status).toBe(409);
    });

    it('a viewer cannot write', async () => {
        const id = await idea('Own idea V');
        const res = await api().put(`/projects/${id}/brief`).set('Authorization', await as('user_viewer')).send({ answers: { 'discovery.what': 'x' } });
        expect(res.status).toBe(403);
    });
});

describe('the ruling', () => {
    it('approve moves an intake-pending project to planning; a second approve is a 409', async () => {
        const id = await forClient('Client project A');
        await submitted(id);
        const auth = await owner();
        const ok = await api().post(`/projects/${id}/brief/approve`).set('Authorization', auth);
        expect(ok.status).toBe(200);
        expect(ok.body.state).toBe('approved');
        expect(ok.body.decidedAt).toBeTruthy();
        expect((await api().get(`/projects/${id}`).set('Authorization', auth)).body.status).toBe('planning');
        expect((await api().post(`/projects/${id}/brief/approve`).set('Authorization', auth)).status).toBe(409);
    });

    it('send back needs a reason that says what to change; reopen undoes it', async () => {
        const id = await forClient('Client project B');
        await submitted(id);
        const auth = await owner();
        const short = await api().post(`/projects/${id}/brief/send-back`).set('Authorization', auth).send({ reason: 'Too thin.' });
        expect(short.status).toBe(400);
        const back = await api()
            .post(`/projects/${id}/brief/send-back`)
            .set('Authorization', auth)
            .send({ reason: 'The budget and the feature list cannot both be true.' });
        expect(back.body).toMatchObject({ state: 'sent_back', reason: 'The budget and the feature list cannot both be true.' });
        const re = await api().post(`/projects/${id}/brief/reopen`).set('Authorization', auth);
        expect(re.body).toMatchObject({ state: 'submitted', reason: null, decidedAt: null });
    });

    it('your own writing has nobody to be sent back to', async () => {
        const id = await idea('Own idea C');
        const auth = await owner();
        await api().put(`/projects/${id}/brief`).set('Authorization', auth).send({ answers: { 'discovery.what': 'Mine.' } });
        const res = await api().post(`/projects/${id}/brief/send-back`).set('Authorization', auth).send({ reason: 'I disagree with myself here.' });
        expect(res.status).toBe(409);
    });

    it('an approved brief is reopened before it is rewritten', async () => {
        const id = await idea('Own idea D');
        const auth = await owner();
        await api().put(`/projects/${id}/brief`).set('Authorization', auth).send({ answers: { 'discovery.what': 'Mine.' } });
        await api().post(`/projects/${id}/brief/approve`).set('Authorization', auth);
        expect((await api().put(`/projects/${id}/brief`).set('Authorization', auth).send({ answers: { 'discovery.what': 'Changed.' } })).status).toBe(409);
        // An idea stays an idea: only a project with a client moves to planning.
        expect((await api().get(`/projects/${id}`).set('Authorization', auth)).body.status).toBe('idea');
    });
});

describe('notes', () => {
    it('a gap you fill yourself, cleared by an empty note', async () => {
        const id = await forClient('Client project N');
        await submitted(id);
        const auth = await owner();
        const set = await api().put(`/projects/${id}/brief/areas/strategy/note`).set('Authorization', auth).send({ note: 'From the call: they want 20 bookings a month.' });
        expect(set.body.areas.find((a: { key: string }) => a.key === 'strategy').note).toBe('From the call: they want 20 bookings a month.');
        const cleared = await api().put(`/projects/${id}/brief/areas/strategy/note`).set('Authorization', auth).send({ note: '' });
        expect(cleared.body.areas.find((a: { key: string }) => a.key === 'strategy').note).toBeNull();
        expect((await api().put(`/projects/${id}/brief/areas/ux/note`).set('Authorization', auth).send({ note: 'x' })).status).toBe(404);
    });
});
