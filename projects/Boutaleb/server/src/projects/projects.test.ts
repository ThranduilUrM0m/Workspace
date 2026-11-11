import request from 'supertest';
import { addMember, settle, startApp, token, type TestApp } from '../testing/app.js';

let t: TestApp;

beforeAll(async () => {
    t = await startApp();
    await addMember(t, 'user_owner', { name: 'Owner', owner: true });
    await addMember(t, 'user_viewer', { name: 'Viewer', levels: { projects: 'view', clients: 'view' } as never });
    await addMember(t, 'user_nobody', { name: 'Finance only', levels: { finance: 'edit' } as never });
});

afterAll(async () => {
    await t?.close();
});

const as = async (sub: string) => `Bearer ${await token({ sub, sid: `sess_${sub}` })}`;
const api = () => request(t.app.getHttpServer());
const owner = async () => as('user_owner');

async function newClient(name = 'Omar Fassi', company = 'Villa Zerhoun') {
    const res = await api().post('/clients').set('Authorization', await owner()).send({ name, company, email: `${name.split(' ')[0]}@Example.ma`, language: 'fr' });
    expect(res.status).toBe(201);
    return res.body as { id: string; status: string; email: string };
}

describe('clients, as far as Projects needs them', () => {
    it('creates a client as a lead, lowercases the email, and finds it by search', async () => {
        const c = await newClient('Salma Idrissi', 'Riad Nozha');
        expect(c.status).toBe('lead');
        expect(c.email).toBe('salma@example.ma');
        const found = await api().get('/clients?q=nozha').set('Authorization', await owner());
        expect(found.body.map((x: { id: string }) => x.id)).toContain(c.id);
    });

    it('refuses a second client with the same email, and names the one that has it', async () => {
        const first = await newClient('Leila Bennani', 'Atelier Leila');
        const res = await api().post('/clients').set('Authorization', await owner()).send({ name: 'Leila B', email: 'LEILA@example.ma', language: 'fr' });
        expect(res.status).toBe(409);
        expect(res.body.fields).toEqual({ email: 'taken' });
        expect(res.body.client.id).toBe(first.id);
    });

    it('company defaults to the name', async () => {
        const res = await api().post('/clients').set('Authorization', await owner()).send({ name: 'Atlas Spa', email: 'contact@atlas.ma', language: 'en' });
        expect(res.body.company).toBe('Atlas Spa');
    });
});

describe('create', () => {
    it('with a client: lands at intake_pending, slug from the name, all three modules on', async () => {
        const c = await newClient();
        const res = await api().post('/projects').set('Authorization', await owner()).send({ name: 'Villa Zerhoun — Site', governingLanguage: 'fr', clientId: c.id });
        expect(res.status).toBe(201);
        expect(res.body).toMatchObject({
            status: 'intake_pending',
            slug: 'villa-zerhoun-site',
            // The record's client card writes to them: address and language travel with the project.
            client: { id: c.id, company: 'Villa Zerhoun', email: 'omar@example.ma', language: 'fr', self: false },
            internal: false,
            modules: ['quotes', 'invoices', 'payments'],
            currency: 'MAD',
            archivedAt: null,
        });
    });

    it('with no client: an idea', async () => {
        const res = await api().post('/projects').set('Authorization', await owner()).send({ name: 'Riad booking tool', governingLanguage: 'en', clientId: null });
        expect(res.body).toMatchObject({ status: 'idea', client: null });
    });

    it('a derived slug bumps on collision; a typed one is refused', async () => {
        const auth = await owner();
        const a = await api().post('/projects').set('Authorization', auth).send({ name: 'Café Andalou', governingLanguage: 'fr', clientId: null });
        const b = await api().post('/projects').set('Authorization', auth).send({ name: 'Cafe Andalou', governingLanguage: 'fr', clientId: null });
        expect(a.body.slug).toBe('cafe-andalou');
        expect(b.body.slug).toBe('cafe-andalou-2');
        const typed = await api().post('/projects').set('Authorization', auth).send({ name: 'Other', slug: 'cafe-andalou', governingLanguage: 'fr', clientId: null });
        expect(typed.status).toBe(409);
        expect(typed.body).toEqual({ error: 'invalid', fields: { slug: 'taken' } });
    });

    it('refuses with field codes: no name, no language, a bad slug, an unknown client', async () => {
        const auth = await owner();
        const bad = await api().post('/projects').set('Authorization', auth).send({ name: ' ', slug: 'Not A Slug', clientId: null });
        expect(bad.status).toBe(400);
        expect(bad.body.fields).toMatchObject({ name: 'required', governingLanguage: 'required', slug: 'slug' });
        const ghost = await api().post('/projects').set('Authorization', auth).send({ name: 'X', governingLanguage: 'fr', clientId: 'a'.repeat(24) });
        expect(ghost.status).toBe(422);
        expect(ghost.body.fields).toEqual({ clientId: 'unknown' });
    });
});

describe('update, archive, restore', () => {
    it('changes status and assets, and only an idea may have no client', async () => {
        const auth = await owner();
        const idea = (await api().post('/projects').set('Authorization', auth).send({ name: 'Own thing', governingLanguage: 'fr', clientId: null })).body;
        const stuck = await api().patch(`/projects/${idea.id}`).set('Authorization', auth).send({ status: 'planning' });
        expect(stuck.status).toBe(422);
        expect(stuck.body.fields).toEqual({ clientId: 'required' });

        const c = await newClient('Nadia Benali', 'Dar Salam');
        const moved = await api()
            .patch(`/projects/${idea.id}`)
            .set('Authorization', auth)
            .send({ clientId: c.id, status: 'planning', assetOwnership: [{ asset: 'Domain', holder: 'studio', renews: '2027-03-11', transfer: 'pending' }] });
        expect(moved.status).toBe(200);
        expect(moved.body).toMatchObject({ status: 'planning', client: { id: c.id }, assetOwnership: [{ asset: 'Domain', holder: 'studio', renews: '2027-03-11', transfer: 'pending' }] });

        const empty = await api().patch(`/projects/${idea.id}`).set('Authorization', auth).send({});
        expect(empty.status).toBe(400);
    });

    it('archive leaves every list but keeps the record; restore undoes it', async () => {
        const auth = await owner();
        const p = (await api().post('/projects').set('Authorization', auth).send({ name: 'Short lived', governingLanguage: 'fr', clientId: null })).body;
        const archived = await api().post(`/projects/${p.id}/archive`).set('Authorization', auth);
        expect(archived.status).toBe(200);
        expect(archived.body.archivedAt).not.toBeNull();

        const ids = async (qs = '') => (await api().get(`/projects${qs}`).set('Authorization', auth)).body.map((x: { id: string }) => x.id);
        expect(await ids()).not.toContain(p.id);
        expect(await ids('?archived=true')).toContain(p.id);
        expect((await api().get(`/projects/${p.id}`).set('Authorization', auth)).status).toBe(200);

        await api().post(`/projects/${p.id}/restore`).set('Authorization', auth);
        expect(await ids()).toContain(p.id);
    });

    it('an unknown or malformed id is a 404', async () => {
        const auth = await owner();
        expect((await api().get(`/projects/${'b'.repeat(24)}`).set('Authorization', auth)).status).toBe(404);
        expect((await api().get('/projects/nope').set('Authorization', auth)).status).toBe(404);
    });
});

describe('list', () => {
    it('filters by status and by search', async () => {
        const auth = await owner();
        await api().post('/projects').set('Authorization', auth).send({ name: 'Kasbah Table', governingLanguage: 'fr', clientId: null });
        const ideas = (await api().get('/projects?status=idea').set('Authorization', auth)).body as { status: string }[];
        expect(ideas.length).toBeGreaterThan(0);
        expect(ideas.every((p) => p.status === 'idea')).toBe(true);
        const found = (await api().get('/projects?q=kasbah').set('Authorization', auth)).body as { name: string }[];
        expect(found.map((p) => p.name)).toEqual(['Kasbah Table']);
    });
});

describe('who may', () => {
    it('View on Projects reads but cannot change; no level is refused outright', async () => {
        const viewer = await as('user_viewer');
        expect((await api().get('/projects').set('Authorization', viewer)).status).toBe(200);
        expect((await api().post('/projects').set('Authorization', viewer).send({ name: 'X', governingLanguage: 'fr', clientId: null })).status).toBe(403);
        expect((await api().post('/clients').set('Authorization', viewer).send({ name: 'X', email: 'x@x.ma', language: 'fr' })).status).toBe(403);
        const nobody = await as('user_nobody');
        expect((await api().get('/projects').set('Authorization', nobody)).status).toBe(403);
    });
});

describe('the browser may call it', () => {
    it('lets the client origin in, with the Bearer header, and no other origin', async () => {
        const pre = await api().options('/projects').set('Origin', 'http://localhost:3002').set('Access-Control-Request-Method', 'GET').set('Access-Control-Request-Headers', 'authorization');
        expect(pre.status).toBe(204);
        expect(pre.headers['access-control-allow-origin']).toBe('http://localhost:3002');
        expect(pre.headers['access-control-allow-headers']).toMatch(/Authorization/);
        expect(pre.headers['access-control-allow-credentials']).toBeUndefined();
        const other = await api().get('/projects').set('Origin', 'https://evil.example').set('Authorization', await owner());
        expect(other.headers['access-control-allow-origin']).not.toBe('https://evil.example');
    });
});

describe('the log', () => {
    it('every change is a notable entry with before and after', async () => {
        const auth = await owner();
        const p = (await api().post('/projects').set('Authorization', auth).send({ name: 'Logged', governingLanguage: 'fr', clientId: null })).body;
        await api().patch(`/projects/${p.id}`).set('Authorization', auth).send({ name: 'Logged, renamed' });
        await settle();
        const update = await t.events.findOne({ action: 'project.update', 'target.id': p.id }).lean();
        expect(update).toMatchObject({ kind: 'change', weight: 'notable', section: 'projects', actor: { clerkUserId: 'user_owner' } });
        expect((update!.before as { name: string }).name).toBe('Logged');
        expect((update!.after as { name: string }).name).toBe('Logged, renamed');
        expect(await t.events.exists({ action: 'project.create', 'target.id': p.id })).toBeTruthy();
    });
});
