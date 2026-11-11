import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { getModelToken } from '@nestjs/mongoose';
import type { Model } from 'mongoose';
import request from 'supertest';
import { MILESTONE, type Milestone } from '../milestones/milestone.schema.js';
import { addMember, settle, startApp, token, type TestApp } from '../testing/app.js';
import { nameFromFile, pageOrder, titleOf } from './pages.js';

let t: TestApp;
let dir: string;
let milestones: Model<Milestone>;

beforeAll(async () => {
    dir = await mkdtemp(join(tmpdir(), 'wf-'));
    process.env.STORAGE_DIR = dir;
    t = await startApp();
    milestones = t.app.get(getModelToken(MILESTONE));
    await addMember(t, 'user_owner', { name: 'Owner', owner: true });
    await addMember(t, 'user_viewer', { name: 'Viewer', levels: { projects: 'view' } as never });
});

afterAll(async () => {
    await t?.close();
    await rm(dir, { recursive: true, force: true });
});

const as = async (sub: string) => `Bearer ${await token({ sub, sid: `sess_${sub}` })}`;
const api = () => request(t.app.getHttpServer());
const owner = async () => as('user_owner');

/** A project, with a client unless told otherwise, and a plan unless told otherwise. */
async function project({ client = true, planned = true } = {}) {
    const auth = await owner();
    let clientId: string | null = null;
    if (client) {
        const n = Math.random().toString(36).slice(2, 8);
        clientId = (await api().post('/clients').set('Authorization', auth).send({ name: `Client ${n}`, email: `c${n}@example.ma`, language: 'fr' })).body.id;
    }
    const p = await api().post('/projects').set('Authorization', auth).send({ name: `WF ${Math.random()}`, governingLanguage: 'en', clientId });
    if (planned) await milestones.create({ project: p.body.id, name: 'Mockups', order: 0 });
    return p.body.id as string;
}

const FOLDER: Record<string, string> = {
    'index.html': '<!doctype html><title>Home &amp; welcome</title><link rel="stylesheet" href="style.css">',
    'menu.html': '<html><head><title>\n  The   menu </title></head></html>',
    'about-us.html': '<p>no title here</p>',
    'style.css': 'body{margin:0}',
    'img/logo.svg': '<svg xmlns="http://www.w3.org/2000/svg"/>',
};

/** The browser's half: ask for tickets, PUT every file, commit. */
async function upload(id: string, v: number, files = FOLDER) {
    const auth = await owner();
    const ticket = await api()
        .post(`/projects/${id}/wireframes/${v}/upload`)
        .set('Authorization', auth)
        .send({ files: Object.entries(files).map(([path, body]) => ({ path, size: Buffer.byteLength(body) })) });
    expect(ticket.status).toBe(200);
    for (const f of ticket.body.files as { path: string; url: string; headers: Record<string, string> }[]) {
        const put = await api().put(new URL(f.url).pathname + new URL(f.url).search).set(f.headers).send(Buffer.from(files[f.path]!));
        expect(put.status).toBe(200);
    }
    return api().post(`/projects/${id}/wireframes/${v}/upload/commit`).set('Authorization', auth).send({ uploadId: ticket.body.uploadId, name: 'site-v1.zip' });
}

describe('reading pages out of a folder', () => {
    it('takes the <title>, decodes it, falls back to the file name', () => {
        expect(titleOf('<title>Caf&#233; &amp; co &#x2014; menu</title>')).toBe('Café & co — menu');
        expect(titleOf('<title>  </title>')).toBeNull();
        expect(nameFromFile('about-us.html')).toBe('About us');
        expect(['menu.html', 'about.html', 'index.html'].sort(pageOrder)).toEqual(['index.html', 'about.html', 'menu.html']);
    });
});

describe('the gate', () => {
    it('round one needs a plan', async () => {
        const id = await project({ planned: false });
        const res = await api().post(`/projects/${id}/wireframes`).set('Authorization', await owner()).send({});
        expect(res.status).toBe(409);
        expect(res.body.reason).toBe('plan_missing');
    });

    it('sending needs a client', async () => {
        const id = await project({ client: false });
        const auth = await owner();
        await api().post(`/projects/${id}/wireframes`).set('Authorization', auth).send({});
        await upload(id, 1);
        const res = await api().post(`/projects/${id}/wireframes/1/send`).set('Authorization', auth);
        expect(res.body.reason).toBe('no_client');
    });
});

describe('a round, end to end', () => {
    it('upload reads the pages; send freezes a copy; changes need a sentence; the next round inherits pages only', async () => {
        const id = await project();
        const auth = await owner();

        const started = await api().post(`/projects/${id}/wireframes`).set('Authorization', auth).send({});
        expect(started.status).toBe(201);
        expect(started.body).toMatchObject([{ v: 1, state: 'draft', pages: [], frozen: false }]);
        expect((await api().post(`/projects/${id}/wireframes`).set('Authorization', auth).send({})).body.reason).toBe('round_open');

        const committed = await upload(id, 1);
        expect(committed.status).toBe(200);
        expect(committed.body[0].sourceName).toBe('site-v1.zip');
        expect(committed.body[0].pages).toEqual([
            { name: 'Home & welcome', file: 'index.html', snap: null },
            { name: 'About us', file: 'about-us.html', snap: null },
            { name: 'The menu', file: 'menu.html', snap: null },
        ]);

        const sent = await api().post(`/projects/${id}/wireframes/1/send`).set('Authorization', auth);
        expect(sent.body[0]).toMatchObject({ state: 'sent', frozen: true });
        expect(sent.body[0].sentAt).toBeTruthy();
        expect((await api().post(`/projects/${id}/wireframes/1/send`).set('Authorization', auth)).status).toBe(409);

        const silent = await api().post(`/projects/${id}/wireframes/1/verdict`).set('Authorization', auth).send({ verdict: 'changes', body: '  ' });
        expect(silent.status).toBe(400);
        const unknownPage = await api().post(`/projects/${id}/wireframes/1/verdict`).set('Authorization', auth).send({ verdict: 'changes', page: 'Gallery', body: 'Bigger.' });
        expect(unknownPage.status).toBe(400);
        const changes = await api().post(`/projects/${id}/wireframes/1/verdict`).set('Authorization', auth).send({ verdict: 'changes', page: 'The menu', body: 'Prices on the right.' });
        expect(changes.body[0]).toMatchObject({ state: 'changes', comments: [{ page: 'The menu', body: 'Prices on the right.' }] });
        expect((await api().post(`/projects/${id}/wireframes/1/verdict`).set('Authorization', auth).send({ verdict: 'approved' })).status).toBe(409);

        const next = await api().post(`/projects/${id}/wireframes`).set('Authorization', auth).send({ note: 'Menu reworked.' });
        expect(next.body.map((r: { v: number }) => r.v)).toEqual([2, 1]);
        expect(next.body[0]).toMatchObject({ state: 'draft', note: 'Menu reworked.', comments: [], frozen: false, sourceName: 'site-v1.zip' });
        expect(next.body[0].pages).toHaveLength(3);

        const approved = await (async () => {
            await api().post(`/projects/${id}/wireframes/2/send`).set('Authorization', auth);
            return api().post(`/projects/${id}/wireframes/2/verdict`).set('Authorization', auth).send({ verdict: 'approved' });
        })();
        expect(approved.body[0]).toMatchObject({ state: 'approved', comments: [] });

        await settle();
        for (const action of ['wireframe.start', 'wireframe.upload', 'wireframe.send', 'wireframe.changes', 'wireframe.approved']) {
            expect(await t.events.exists({ action, 'target.id': id })).toBeTruthy();
        }
    });

    it('a sent round cannot take a new upload', async () => {
        const id = await project();
        const auth = await owner();
        await api().post(`/projects/${id}/wireframes`).set('Authorization', auth).send({});
        await upload(id, 1);
        await api().post(`/projects/${id}/wireframes/1/send`).set('Authorization', auth);
        const res = await api().post(`/projects/${id}/wireframes/1/upload`).set('Authorization', auth).send({ files: [{ path: 'index.html', size: 10 }] });
        expect(res.status).toBe(409);
    });
});

describe('the frozen copy', () => {
    it('serves the round sandboxed, with relative links intact; a re-upload to the next round leaves it untouched', async () => {
        const id = await project();
        const auth = await owner();
        await api().post(`/projects/${id}/wireframes`).set('Authorization', auth).send({});
        await upload(id, 1);
        await api().post(`/projects/${id}/wireframes/1/send`).set('Authorization', auth);
        await api().post(`/projects/${id}/wireframes/1/verdict`).set('Authorization', auth).send({ verdict: 'changes', body: 'Again.' });
        await api().post(`/projects/${id}/wireframes`).set('Authorization', auth).send({});
        await upload(id, 2, { 'index.html': '<title>Home, round two</title>' });

        const link = await api().post(`/projects/${id}/wireframes/1/view`).set('Authorization', await as('user_viewer'));
        expect(link.status).toBe(200);
        const base = new URL(link.body.base).pathname;
        const page = await api().get(`${base}index.html`);
        expect(page.status).toBe(200);
        expect(page.text).toContain('Home &amp; welcome');
        expect(page.headers['content-type']).toMatch(/^text\/html/);
        expect(page.headers['content-security-policy']).toMatch(/^sandbox allow-scripts/);
        expect((await api().get(`${base}img/logo.svg`)).headers['content-type']).toMatch(/^image\/svg\+xml/);
        expect((await api().get(`${base}..%2Fr2%2Findex.html`)).status).toBe(404);
        expect((await api().get(`${base.replace(/\/[^/]+\/$/, '/forged.token/')}index.html`)).status).toBe(404);

        const draft = await api().post(`/projects/${id}/wireframes/2/view`).set('Authorization', auth);
        expect((await api().get(`${new URL(draft.body.base).pathname}index.html`)).text).toContain('round two');
    });

    it('refuses a path that would leave the folder, and an upload ticket for an unknown file type', async () => {
        const id = await project();
        const auth = await owner();
        await api().post(`/projects/${id}/wireframes`).set('Authorization', auth).send({});
        const bad = (files: unknown) => api().post(`/projects/${id}/wireframes/1/upload`).set('Authorization', auth).send({ files });
        expect((await bad([{ path: '../escape.html', size: 1 }])).status).toBe(400);
        expect((await bad([{ path: 'index.html', size: 1 }, { path: 'run.exe', size: 1 }])).status).toBe(400);
        expect((await bad([{ path: 'pages/inner.html', size: 1 }])).status).toBe(400);
    });

    it('a viewer reads and opens rounds but cannot change them; a forged upload token is refused', async () => {
        const id = await project();
        const viewer = await as('user_viewer');
        expect((await api().get(`/projects/${id}/wireframes`).set('Authorization', viewer)).status).toBe(200);
        expect((await api().post(`/projects/${id}/wireframes`).set('Authorization', viewer).send({})).status).toBe(403);
        expect((await api().put('/storage/put?token=abc.def').set('Content-Type', 'application/octet-stream').send(Buffer.from('x'))).status).toBe(403);
    });
});
