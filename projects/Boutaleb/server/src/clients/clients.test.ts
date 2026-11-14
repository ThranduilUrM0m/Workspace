import { randomUUID } from 'node:crypto';
import request from 'supertest';
import { studioDay } from '../common/day.js';
import { FormTokens } from '../enquiries/form-token.js';
import { DEV_FORMS_PROXY_KEY } from '../env.js';
import { addMember, settle, startApp, token, type TestApp } from '../testing/app.js';

// T8.3: the Clients list and record read facts (projects, the contact log),
// New client takes the long form, and the log is written by the site, by
// Log an enquiry, by New client's first entry, and by Log contact.

let t: TestApp;
let tokens: FormTokens;

beforeAll(async () => {
    t = await startApp();
    tokens = t.app.get(FormTokens);
    await addMember(t, 'user_owner', { name: 'Owner', owner: true });
    await addMember(t, 'user_viewer', { name: 'Viewer', levels: { clients: 'view' } as never });
});

afterAll(async () => {
    await t?.close();
});

const api = () => request(t.app.getHttpServer());
const as = async (sub = 'user_owner') => `Bearer ${await token({ sub, sid: `sess_${sub}` })}`;

const newClient = async (over: Record<string, unknown> = {}) =>
    api()
        .post('/clients')
        .set('Authorization', await as())
        .send({
            name: 'Nadia Berrada',
            email: `nadia+${randomUUID()}@example.ma`,
            language: 'fr',
            ...over,
        });

describe('New client', () => {
    it('stores the long form; a first entry is a note, so the reply clock has not started', async () => {
        const res = await newClient({
            company: 'Zellige Studio',
            phone: '+212 600 000 000',
            website: 'zellige.ma',
            status: 'active',
            firstEntry: 'Met at the Rabat design fair.',
        });
        expect(res.status).toBe(201);
        expect(res.body).toMatchObject({
            name: 'Nadia Berrada',
            company: 'Zellige Studio',
            phone: '+212 600 000 000',
            website: 'zellige.ma',
            status: 'active',
            since: studioDay(),
            projects: [],
            lastTheirs: null,
            firstContact: studioDay(),
            contacts: 1,
        });
        const log = await api()
            .get(`/clients/${res.body.id}/contacts`)
            .set('Authorization', await as());
        expect(log.body).toMatchObject([
            { kind: 'note', text: 'Met at the Rabat design fair.', project: null },
        ]);
    });

    it('defaults to a lead with no history; a taken email answers 409 with the client', async () => {
        const res = await newClient();
        expect(res.body).toMatchObject({ status: 'lead', contacts: 0, firstContact: null });
        const again = await newClient({ email: res.body.email });
        expect(again.status).toBe(409);
        expect(again.body.client.id).toBe(res.body.id);
    });

    it('refuses an unknown status (400)', async () => {
        expect((await newClient({ status: 'vip' })).status).toBe(400);
    });
});

describe('Edit client', () => {
    const edit = async (id: string, body: Record<string, unknown>, who = 'user_owner') =>
        api()
            .patch(`/clients/${id}`)
            .set('Authorization', await as(who))
            .send(body);

    it('rewrites the stored fields; empty phone/website clear; Activity keeps only what changed', async () => {
        const c = (
            await newClient({
                company: 'Zellige Studio',
                phone: '+212 600 000 000',
                website: 'zellige.ma',
            })
        ).body;
        const res = await edit(c.id, {
            name: 'Nadia B.',
            company: '',
            email: c.email,
            language: 'ar',
            status: 'active',
            phone: '',
            website: 'zellige.ma',
        });
        expect(res.status).toBe(200);
        expect(res.body).toMatchObject({
            name: 'Nadia B.',
            company: 'Nadia B.',
            language: 'ar',
            status: 'active',
            phone: null,
            website: 'zellige.ma',
        });
        const ev = await t.events
            .findOne({ action: 'client.edit', 'target.id': c.id })
            .lean<{ before: object; after: object }>();
        expect(ev?.before).toEqual({
            name: 'Nadia Berrada',
            company: 'Zellige Studio',
            language: 'fr',
            status: 'lead',
            phone: '+212 600 000 000',
        });
        expect(ev?.after).toEqual({
            name: 'Nadia B.',
            company: 'Nadia B.',
            language: 'ar',
            status: 'active',
            phone: null,
        });
    });

    it('saving nothing new writes no Activity', async () => {
        const c = (await newClient()).body;
        const res = await edit(c.id, {
            name: c.name,
            email: c.email,
            language: c.language,
            status: c.status,
        });
        expect(res.status).toBe(200);
        expect(await t.events.exists({ action: 'client.edit', 'target.id': c.id })).toBeFalsy();
    });

    it("another client's email answers 409 with that client; viewers 403; unknown 404; bad status 400", async () => {
        const a = (await newClient()).body;
        const b = (await newClient()).body;
        const base = { name: a.name, language: 'fr', status: 'lead' };
        const clash = await edit(a.id, { ...base, email: b.email.toUpperCase() });
        expect(clash.status).toBe(409);
        expect(clash.body.client.id).toBe(b.id);
        expect((await edit(a.id, { ...base, email: a.email }, 'user_viewer')).status).toBe(403);
        expect((await edit('0'.repeat(24), { ...base, email: a.email })).status).toBe(404);
        expect((await edit(a.id, { ...base, email: a.email, status: 'vip' })).status).toBe(400);
    });
});

describe('the contact log', () => {
    it('their reply stops the clock; your note does not; a project must be theirs; no future days', async () => {
        const c = (await newClient()).body;
        const other = (await newClient()).body;
        const project = await api()
            .post('/projects')
            .set('Authorization', await as())
            .send({
                name: `Spa site ${randomUUID().slice(0, 6)}`,
                clientId: c.id,
                governingLanguage: 'fr',
            });
        expect(project.status).toBe(201);

        const log = async (body: Record<string, unknown>, id = c.id) =>
            api()
                .post(`/clients/${id}/contacts`)
                .set('Authorization', await as())
                .send(body);

        expect((await log({ kind: 'sent', text: 'Sent the quote', at: '2026-01-02' })).status).toBe(
            201
        );
        const r = await log({
            kind: 'reply',
            text: 'They approved the quote',
            at: '2026-01-05',
            projectId: project.body.id,
        });
        expect(r.status).toBe(201);
        expect(r.body[0]).toMatchObject({
            kind: 'reply',
            at: '2026-01-05',
            project: { id: project.body.id },
        });
        expect(
            (await log({ kind: 'note', text: 'Thinking about upsell', at: '2026-01-09' })).status
        ).toBe(201);

        const row = await api()
            .get(`/clients/${c.id}`)
            .set('Authorization', await as());
        expect(row.body).toMatchObject({
            lastTheirs: '2026-01-05',
            firstContact: '2026-01-02',
            contacts: 3,
            projects: [{ id: project.body.id }],
        });

        expect(
            (await log({ kind: 'call', text: 'x', projectId: project.body.id }, other.id)).status
        ).toBe(422);
        expect((await log({ kind: 'call', text: 'x', at: '2999-01-01' })).status).toBe(422);
        expect((await log({ kind: 'token', text: 'typed by hand' })).status).toBe(400);
        expect(await t.events.exists({ action: 'contact.log', 'target.id': c.id })).toBeTruthy();
        const recent = await api()
            .get('/clients/recent-contacts')
            .set('Authorization', await as());
        expect(recent.status).toBe(200);
        expect(recent.body.length).toBeLessThanOrEqual(8);
        expect(recent.body[0]).toHaveProperty('client.name');
    });

    it('a site enquiry and a logged enquiry are both their move, on the day they came in', async () => {
        const email = `hamza+${randomUUID()}@example.ma`;
        const sent = await api()
            .post('/enquiries')
            .set('x-forms-key', DEV_FORMS_PROXY_KEY)
            .set('x-visitor-ip', '10.8.0.1')
            .send({
                idempotencyKey: randomUUID(),
                t: tokens.issue(Date.now() - 5_000),
                source: 'footer',
                name: 'Hamza R',
                email,
                projectType: 'website',
                message: 'A shop for argan oil.',
                locale: 'en',
            });
        expect(sent.status).toBe(201);
        await settle();
        const found = await api()
            .get(`/clients?q=${encodeURIComponent(email)}`)
            .set('Authorization', await as());
        const c = found.body[0];
        expect(c).toMatchObject({ lastTheirs: studioDay(), contacts: 1 });

        await api()
            .post('/deals')
            .set('Authorization', await as())
            .send({ clientId: c.id, title: 'Second shop', source: 'repeat' });
        const log = await api()
            .get(`/clients/${c.id}/contacts`)
            .set('Authorization', await as());
        expect(log.body.map((e: { text: string }) => e.text).sort()).toEqual([
            'Enquiry — Second shop',
            'Site enquiry — A shop for argan oil.',
        ]);
    });
});

describe('reading and rights', () => {
    it('lists everyone with their facts; unknown id 404; viewers read but cannot write', async () => {
        const c = (await newClient()).body;
        const viewer = await as('user_viewer');
        const all = await api().get('/clients').set('Authorization', viewer);
        expect(all.status).toBe(200);
        expect(all.body.find((x: { id: string }) => x.id === c.id)).toMatchObject({ contacts: 0 });
        expect(
            (
                await api()
                    .get(`/clients/${'0'.repeat(24)}`)
                    .set('Authorization', viewer)
            ).status
        ).toBe(404);
        expect((await api().get('/clients/nope').set('Authorization', viewer)).status).toBe(404);
        expect(
            (
                await api()
                    .post(`/clients/${c.id}/contacts`)
                    .set('Authorization', viewer)
                    .send({ kind: 'call', text: 'x' })
            ).status
        ).toBe(403);
    });
});
