import { getModelToken } from '@nestjs/mongoose';
import type { Model } from 'mongoose';
import request from 'supertest';
import { addMember, startApp, token, type TestApp } from '../testing/app.js';
import { BRIEF, type Brief } from '../briefs/brief.schema.js';
import { CONTACT, type Contact } from '../clients/contact.schema.js';
import { DEV_FORMS_PROXY_KEY } from '../env.js';
import { PROJECT, type Project } from '../projects/project.schema.js';
import { HeldPortalJobs, PORTAL_JOBS } from './portal-jobs.js';
import { PORTAL_LINK, type PortalLink } from './portal-link.schema.js';
import { PORTAL_RESEND } from './portal-resend.schema.js';

let t: TestApp;
let briefs: Model<Brief>;
let projects: Model<Project>;
let contacts: Model<Contact>;
let links: Model<PortalLink>;
let held: HeldPortalJobs;

beforeAll(async () => {
    t = await startApp();
    briefs = t.app.get(getModelToken(BRIEF));
    projects = t.app.get(getModelToken(PROJECT));
    contacts = t.app.get(getModelToken(CONTACT));
    links = t.app.get(getModelToken(PORTAL_LINK));
    held = t.app.get(PORTAL_JOBS);
    await addMember(t, 'user_owner', { name: 'Owner', owner: true });
    await addMember(t, 'user_viewer', { name: 'Viewer', levels: { projects: 'view' } as never });
});

afterAll(async () => {
    await t?.close();
});

const api = () => request(t.app.getHttpServer());
const as = async (sub: string) => `Bearer ${await token({ sub, sid: `sess_${sub}` })}`;
const owner = () => as('user_owner');

/** The client's browser never reaches the API: the site does, with the shared key. */
const site = {
    get: (path: string) => api().get(path).set('x-forms-key', DEV_FORMS_PROXY_KEY).set('x-visitor-ip', '203.0.113.7'),
    put: (path: string) => api().put(path).set('x-forms-key', DEV_FORMS_PROXY_KEY).set('x-visitor-ip', '203.0.113.7'),
    post: (path: string) => api().post(path).set('x-forms-key', DEV_FORMS_PROXY_KEY).set('x-visitor-ip', '203.0.113.7'),
};

async function forClient(name = 'Villa Zerhoun — Site', language = 'fr') {
    const auth = await owner();
    const c = await api().post('/clients').set('Authorization', auth).send({ name: 'Omar Fassi', company: 'Villa Zerhoun', email: `omar+${Math.random()}@example.ma`, language });
    const res = await api().post('/projects').set('Authorization', auth).send({ name, governingLanguage: language, clientId: c.body.id });
    return { id: res.body.id as string, clientId: c.body.id as string };
}

const issue = async (id: string, send = false) => api().post(`/projects/${id}/portal-link`).set('Authorization', await owner()).send({ send });
const tokenOf = (url: string) => url.split('/p/')[1]!;

describe('issuing', () => {
    it('gives a link once, keeps only its hash, and puts the brief in awaiting', async () => {
        const { id } = await forClient('Issue A');
        const res = await issue(id);
        expect(res.status).toBe(201);
        expect(res.body.url).toMatch(/^http:\/\/localhost:3002\/p\/[A-Za-z0-9_-]{43}$/);
        expect(res.body).toMatchObject({ live: true, sent: false, emailedAt: null });

        const stored = await links.findOne({ project: id }).lean();
        expect(JSON.stringify(stored)).not.toContain(tokenOf(res.body.url));
        expect(stored?.hash).toMatch(/^[a-f0-9]{64}$/);

        const brief = await briefs.findOne({ project: id }).lean();
        expect(brief?.state).toBe('awaiting');
        expect(brief?.sentAt).toBeTruthy();

        const status = await api().get(`/projects/${id}/portal-link`).set('Authorization', await owner());
        expect(status.body).toMatchObject({ live: true });
        expect(status.body.url).toBeUndefined();
    });

    it('send: queues the email, once per issue', async () => {
        const { id } = await forClient('Issue B');
        const before = held.held.length;
        const res = await issue(id, true);
        expect(res.body).toMatchObject({ sent: true });
        expect(res.body.emailedAt).toBeTruthy();
        expect(held.held).toHaveLength(before + 1);
        expect(held.held.at(-1)).toEqual({ projectId: id, url: res.body.url });
    });

    it('writes a token entry to the client\'s contact log and an Activity line', async () => {
        const { id, clientId } = await forClient('Issue C');
        await issue(id, true);
        const entry = await contacts.findOne({ client: clientId, kind: 'token' }).lean();
        expect(entry).toMatchObject({ text: 'Intake link emailed', project: expect.anything() });
        const event = await t.events.findOne({ action: 'portal.issue', 'target.id': id }).lean();
        expect(event?.after).toEqual({ emailed: true });
    });

    it('re-issuing kills the old link at once', async () => {
        const { id } = await forClient('Issue D');
        const first = tokenOf((await issue(id)).body.url);
        const second = tokenOf((await issue(id)).body.url);
        expect((await site.get(`/portal/${first}`)).status).toBe(404);
        expect((await site.get(`/portal/${second}`)).status).toBe(200);
    });

    it('a project with no client, or the studio\'s own, has nobody to send to', async () => {
        const auth = await owner();
        const idea = await api().post('/projects').set('Authorization', auth).send({ name: 'Own idea', governingLanguage: 'en', clientId: null });
        expect((await issue(idea.body.id)).status).toBe(404);
    });

    it('needs Edit on Projects', async () => {
        const { id } = await forClient('Issue E');
        const res = await api().post(`/projects/${id}/portal-link`).set('Authorization', await as('user_viewer')).send({ send: false });
        expect(res.status).toBe(403);
    });
});

describe('the client opens it', () => {
    it('sees the project, who it is for, their language, and no answers yet', async () => {
        const { id } = await forClient('Open A', 'ar');
        const url = (await issue(id)).body.url;
        const res = await site.get(`/portal/${tokenOf(url)}`);
        expect(res.status).toBe(200);
        expect(res.body).toEqual({ state: 'open', project: 'Open A', who: 'Villa Zerhoun', language: 'ar', reason: null, answers: {} });
    });

    it('is refused without the site\'s key, and an unknown or malformed token is the same 404', async () => {
        const { id } = await forClient('Open B');
        const tk = tokenOf((await issue(id)).body.url);
        expect((await api().get(`/portal/${tk}`)).status).toBe(401);
        expect((await site.get(`/portal/${'A'.repeat(43)}`)).status).toBe(404);
        const bad = await site.get('/portal/not-a-token');
        expect(bad.status).toBe(404);
        expect(bad.body).toEqual((await site.get(`/portal/${'B'.repeat(43)}`)).body);
    });

    it('the first open of a day is logged, a refresh is not', async () => {
        const { id } = await forClient('Open C');
        const tk = tokenOf((await issue(id)).body.url);
        await site.get(`/portal/${tk}`);
        await site.get(`/portal/${tk}`);
        await site.get(`/portal/${tk}`);
        expect(await t.events.countDocuments({ action: 'portal.open', 'target.id': id })).toBe(1);
    });

    it('is dead once the project is archived or completed', async () => {
        const a = await forClient('Dead A');
        const ta = tokenOf((await issue(a.id)).body.url);
        await projects.updateOne({ _id: a.id }, { $set: { archivedAt: new Date() } });
        expect((await site.get(`/portal/${ta}`)).status).toBe(404);

        const c = await forClient('Dead B');
        const tc = tokenOf((await issue(c.id)).body.url);
        await projects.updateOne({ _id: c.id }, { $set: { status: 'completed' } });
        expect((await site.get(`/portal/${tc}`)).status).toBe(404);
        expect((await site.put(`/portal/${tc}/draft`).send({ answers: { 'discovery.what': 'x' } })).status).toBe(404);
    });
});

describe('answering', () => {
    it('a draft survives a reload, and a later save merges into it', async () => {
        const { id } = await forClient('Answer A');
        const tk = tokenOf((await issue(id)).body.url);
        expect((await site.put(`/portal/${tk}/draft`).send({ answers: { 'discovery.what': 'We rent rooms.' } })).status).toBe(200);
        await site.put(`/portal/${tk}/draft`).send({ answers: { 'ux.feel': 'Calm.' } });
        const res = await site.get(`/portal/${tk}`);
        expect(res.body.answers).toEqual({ 'discovery.what': 'We rent rooms.', 'ux.feel': 'Calm.' });
        expect((await briefs.findOne({ project: id }).lean())?.state).toBe('awaiting');
    });

    it('refuses an unknown prompt', async () => {
        const { id } = await forClient('Answer B');
        const tk = tokenOf((await issue(id)).body.url);
        expect((await site.put(`/portal/${tk}/draft`).send({ answers: { 'nope.x': 'a' } })).status).toBe(400);
    });

    it('submit stores every prompt, moves the brief to submitted, and logs it as their reply', async () => {
        const { id, clientId } = await forClient('Answer C');
        const tk = tokenOf((await issue(id)).body.url);
        await site.put(`/portal/${tk}/draft`).send({ answers: { 'discovery.what': 'draft' } });
        const res = await site.post(`/portal/${tk}/submit`).send({ answers: { 'discovery.what': 'Rooms for rent.', 'requirements.day1': 'Take a booking.' } });
        expect(res.status).toBe(200);
        expect(res.body).toMatchObject({ state: 'done', answers: {} });

        const brief = await briefs.findOne({ project: id }).lean();
        expect(brief).toMatchObject({ state: 'submitted', mine: false, revision: 1 });
        expect(brief?.draft).toHaveLength(0);
        expect(brief?.areas).toHaveLength(5);
        expect(brief?.areas[0]?.qs[0]).toEqual({ q: 'What the business does', a: 'Rooms for rent.' });
        expect(brief?.areas[0]?.qs[1]).toEqual({ q: 'Who it is for', a: '' });

        expect(await contacts.countDocuments({ client: clientId, kind: 'reply', text: 'Intake answers submitted' })).toBe(1);
        expect(await t.events.countDocuments({ action: 'portal.submit', 'target.id': id })).toBe(1);

        // The owner reads it where they always read a brief.
        const owned = await api().get(`/projects/${id}/brief`).set('Authorization', await owner());
        expect(owned.body).toMatchObject({ state: 'submitted', mine: false, revision: 1 });
    });

    it('a blank form cannot be sent, and a sent one cannot be sent or edited again', async () => {
        const { id } = await forClient('Answer D');
        const tk = tokenOf((await issue(id)).body.url);
        expect((await site.post(`/portal/${tk}/submit`).send({ answers: { 'discovery.what': '   ' } })).status).toBe(400);
        await site.post(`/portal/${tk}/submit`).send({ answers: { 'discovery.what': 'One answer.' } });
        expect((await site.post(`/portal/${tk}/submit`).send({ answers: { 'discovery.what': 'Again.' } })).status).toBe(404);
        expect((await site.put(`/portal/${tk}/draft`).send({ answers: { 'discovery.what': 'Edit.' } })).status).toBe(404);
        expect((await site.get(`/portal/${tk}`)).body.state).toBe('done');
    });

    it('a sent-back brief reopens with the reason and the earlier answers, and comes back as revision 2', async () => {
        const { id } = await forClient('Answer E');
        const tk = tokenOf((await issue(id)).body.url);
        await site.post(`/portal/${tk}/submit`).send({ answers: { 'discovery.what': 'Rooms for rent.' } });
        const sent = await api().post(`/projects/${id}/brief/send-back`).set('Authorization', await owner()).send({ reason: 'The day-one list contradicts the budget.' });
        expect(sent.status).toBe(200);

        const open = await site.get(`/portal/${tk}`);
        expect(open.body).toMatchObject({ state: 'sent_back', reason: 'The day-one list contradicts the budget.' });
        expect(open.body.answers['discovery.what']).toBe('Rooms for rent.');

        await site.post(`/portal/${tk}/submit`).send({ answers: { 'discovery.what': 'Rooms for rent.', 'requirements.day1': 'Bookings only.' } });
        expect((await briefs.findOne({ project: id }).lean())).toMatchObject({ state: 'submitted', revision: 2, reason: null });
    });
});

describe('"email me my access link"', () => {
    // Its own visitor address each time: the whole file otherwise shares one, and the 60/min throttle counts it.
    let visitor = 0;
    const resend = (email: string) => api().post('/portal/resend').set('x-forms-key', DEV_FORMS_PROXY_KEY).set('x-visitor-ip', `198.51.100.${++visitor}`).send({ email });
    const heldFor = (clientId: string) => held.heldResends.filter((r) => r.clientId === clientId);
    const mail = () => `resend+${Math.random().toString(36).slice(2)}@example.ma`;

    async function client(email: string) {
        const res = await api().post('/clients').set('Authorization', await owner()).send({ name: 'Omar Fassi', company: 'Villa Zerhoun', email, language: 'fr' });
        return res.body.id as string;
    }
    async function projectFor(clientId: string, name: string) {
        const res = await api().post('/projects').set('Authorization', await owner()).send({ name, governingLanguage: 'fr', clientId });
        return res.body.id as string;
    }

    it('issues a new link, kills the old one, queues one email, and logs it', async () => {
        const email = mail();
        const clientId = await client(email);
        const id = await projectFor(clientId, 'Resend A');
        const old = tokenOf((await issue(id, true)).body.url);

        const res = await resend(email);
        expect(res.status).toBe(200);
        expect(res.body).toEqual({ ok: true });

        const [sent] = heldFor(clientId);
        expect(sent?.items).toHaveLength(1);
        expect(sent?.items[0]?.projectId).toBe(id);
        const fresh = tokenOf(sent!.items[0]!.url);
        expect((await site.get(`/portal/${old}`)).status).toBe(404);
        expect((await site.get(`/portal/${fresh}`)).status).toBe(200);

        expect(await contacts.countDocuments({ client: clientId, kind: 'token', text: 'Intake link re-sent at their request' })).toBe(1);
        expect(await t.events.countDocuments({ action: 'portal.resend', 'target.id': id })).toBe(1);
    });

    it('answers the same words for an address that is no client, and queues nothing', async () => {
        const before = held.heldResends.length;
        const stranger = await resend(mail());
        expect(stranger.status).toBe(200);
        expect(stranger.body).toEqual({ ok: true });
        expect(held.heldResends).toHaveLength(before);
    });

    it('is case-insensitive about the address', async () => {
        const email = mail();
        const clientId = await client(email);
        await issue(await projectFor(clientId, 'Resend Case'));
        await resend(email.toUpperCase());
        expect(heldFor(clientId)).toHaveLength(1);
    });

    it('sends at most once per address per 24 hours, and again after that', async () => {
        const email = mail();
        const clientId = await client(email);
        await issue(await projectFor(clientId, 'Resend B'));
        await resend(email);
        const again = await resend(email);
        expect(again.body).toEqual({ ok: true });
        expect(heldFor(clientId)).toHaveLength(1);

        await t.app.get(getModelToken(PORTAL_RESEND)).updateMany({}, { $set: { sentAt: new Date(Date.now() - 25 * 3_600_000) } });
        await resend(email);
        expect(heldFor(clientId)).toHaveLength(2);
    });

    it('several waiting projects: one email, a link each; submitted, archived, completed and never-sent ones are left out', async () => {
        const email = mail();
        const clientId = await client(email);
        const a = await projectFor(clientId, 'Many A');
        const b = await projectFor(clientId, 'Many B');
        const submitted = await projectFor(clientId, 'Many submitted');
        const archived = await projectFor(clientId, 'Many archived');
        const completed = await projectFor(clientId, 'Many completed');
        await projectFor(clientId, 'Many never sent');
        for (const id of [a, b, submitted, archived, completed]) await issue(id);
        await site.post(`/portal/${tokenOf((await issue(submitted)).body.url)}/submit`).send({ answers: { 'discovery.what': 'Done.' } });
        await projects.updateOne({ _id: archived }, { $set: { archivedAt: new Date() } });
        await projects.updateOne({ _id: completed }, { $set: { status: 'completed' } });

        await resend(email);
        const sent = heldFor(clientId);
        expect(sent).toHaveLength(1);
        expect(sent[0]?.items.map((i) => i.projectId).sort()).toEqual([a, b].sort());
    });

    it('a sent-back brief gets its link too', async () => {
        const email = mail();
        const clientId = await client(email);
        const id = await projectFor(clientId, 'Resend sent back');
        await site.post(`/portal/${tokenOf((await issue(id)).body.url)}/submit`).send({ answers: { 'discovery.what': 'First.' } });
        await api().post(`/projects/${id}/brief/send-back`).set('Authorization', await owner()).send({ reason: 'The day-one list contradicts the budget.' });
        await resend(email);
        expect(heldFor(clientId)[0]?.items[0]?.projectId).toBe(id);
    });

    it('an address with nothing waiting does not use up its 24 hours', async () => {
        const email = mail();
        const clientId = await client(email);
        await resend(email);
        expect(heldFor(clientId)).toHaveLength(0);
        await issue(await projectFor(clientId, 'Resend late'));
        await resend(email);
        expect(heldFor(clientId)).toHaveLength(1);
    });

    it('refuses a malformed address, and anyone but the site', async () => {
        expect((await resend('not-an-email')).status).toBe(400);
        expect((await api().post('/portal/resend').send({ email: 'a@b.co' })).status).toBe(401);
    });
});
