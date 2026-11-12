import request from 'supertest';
import { addMember, settle, startApp, token, type TestApp } from '../testing/app.js';

let t: TestApp;

beforeAll(async () => {
    t = await startApp();
    await addMember(t, 'user_owner', { name: 'Owner', owner: true });
    await addMember(t, 'user_viewer', { name: 'Viewer', levels: { projects: 'view' } as never });
});

afterAll(async () => {
    await t?.close();
});

const as = async (sub: string) => `Bearer ${await token({ sub, sid: `sess_${sub}` })}`;
const api = () => request(t.app.getHttpServer());
const owner = async () => as('user_owner');

/** An idea with its brief written and, unless told otherwise, approved. */
async function project(approved = true) {
    const auth = await owner();
    const p = await api().post('/projects').set('Authorization', auth).send({ name: `Plan ${Math.random()}`, governingLanguage: 'en', clientId: null });
    await api().put(`/projects/${p.body.id}/brief`).set('Authorization', auth).send({ answers: { 'discovery.what': 'Something.' } });
    if (approved) await api().post(`/projects/${p.body.id}/brief/approve`).set('Authorization', auth);
    return p.body.id as string;
}

const names = (rows: { name: string }[]) => rows.map((r) => r.name);

describe('the gate', () => {
    it('the first phase needs an approved brief', async () => {
        const id = await project(false);
        const res = await api().post(`/projects/${id}/milestones`).set('Authorization', await owner()).send({ name: 'Mockups' });
        expect(res.status).toBe(409);
    });

    it('phases that exist stay editable after the brief is reopened', async () => {
        const id = await project();
        const auth = await owner();
        await api().post(`/projects/${id}/milestones`).set('Authorization', auth).send({ name: 'Mockups' });
        await api().post(`/projects/${id}/brief/reopen`).set('Authorization', auth);
        const second = await api().post(`/projects/${id}/milestones`).set('Authorization', auth).send({ name: 'Build' });
        expect(second.status).toBe(201);
        expect(names(second.body)).toEqual(['Mockups', 'Build']);
    });
});

describe('the plan', () => {
    it('adds in order, dated or not; reads back as the owner set it', async () => {
        const id = await project();
        const auth = await owner();
        await api().post(`/projects/${id}/milestones`).set('Authorization', auth).send({ name: 'Mockups', due: '2026-12-01' });
        const res = await api().post(`/projects/${id}/milestones`).set('Authorization', auth).send({ name: 'Build' });
        expect(res.body).toMatchObject([
            { name: 'Mockups', due: '2026-12-01', done: false, order: 0 },
            { name: 'Build', due: null, done: false, order: 1 },
        ]);
        const viewer = await api().get(`/projects/${id}/milestones`).set('Authorization', await as('user_viewer'));
        expect(names(viewer.body)).toEqual(['Mockups', 'Build']);
        await settle();
        expect(await t.events.exists({ action: 'milestone.create', 'target.id': id })).toBeTruthy();
    });

    it('a bad date or an empty name is refused', async () => {
        const id = await project();
        const auth = await owner();
        expect((await api().post(`/projects/${id}/milestones`).set('Authorization', auth).send({ name: 'X', due: '2026-02-30x' })).status).toBe(400);
        expect((await api().post(`/projects/${id}/milestones`).set('Authorization', auth).send({ name: '  ' })).status).toBe(400);
    });

    it('moves up and down by swapping with the neighbour; the ends are a no-op', async () => {
        const id = await project();
        const auth = await owner();
        for (const name of ['A', 'B', 'C']) await api().post(`/projects/${id}/milestones`).set('Authorization', auth).send({ name });
        const rows = (await api().get(`/projects/${id}/milestones`).set('Authorization', auth)).body;
        const c = rows[2].id;
        const up = await api().post(`/projects/${id}/milestones/${c}/move`).set('Authorization', auth).send({ direction: 'up' });
        expect(names(up.body)).toEqual(['A', 'C', 'B']);
        const a = rows[0].id;
        const top = await api().post(`/projects/${id}/milestones/${a}/move`).set('Authorization', auth).send({ direction: 'up' });
        expect(names(top.body)).toEqual(['A', 'C', 'B']);
    });

    it('edit, mark done, reopen, remove', async () => {
        const id = await project();
        const auth = await owner();
        const [m] = (await api().post(`/projects/${id}/milestones`).set('Authorization', auth).send({ name: 'Mockups' })).body;
        const edited = await api().patch(`/projects/${id}/milestones/${m.id}`).set('Authorization', auth).send({ name: 'Wireframes', due: '2026-12-10' });
        expect(edited.body[0]).toMatchObject({ name: 'Wireframes', due: '2026-12-10' });
        const done = await api().patch(`/projects/${id}/milestones/${m.id}`).set('Authorization', auth).send({ done: true });
        expect(done.body[0].done).toBe(true);
        const undated = await api().patch(`/projects/${id}/milestones/${m.id}`).set('Authorization', auth).send({ due: null });
        expect(undated.body[0].due).toBeNull();
        const gone = await api().delete(`/projects/${id}/milestones/${m.id}`).set('Authorization', auth);
        expect(gone.body).toEqual([]);
        await settle();
        expect(await t.events.exists({ action: 'milestone.remove', 'target.id': id })).toBeTruthy();
    });

    it("another project's milestone is not reachable through this one", async () => {
        const a = await project();
        const b = await project();
        const auth = await owner();
        const [m] = (await api().post(`/projects/${a}/milestones`).set('Authorization', auth).send({ name: 'Mine' })).body;
        expect((await api().patch(`/projects/${b}/milestones/${m.id}`).set('Authorization', auth).send({ done: true })).status).toBe(404);
        expect((await api().delete(`/projects/${b}/milestones/${m.id}`).set('Authorization', auth)).status).toBe(404);
    });

    it('a viewer reads but cannot change', async () => {
        const id = await project();
        const res = await api().post(`/projects/${id}/milestones`).set('Authorization', await as('user_viewer')).send({ name: 'X' });
        expect(res.status).toBe(403);
    });
});

describe('GET /milestones/open', () => {
    it('answers every open phase of live projects in one call: done phases and archived projects left out', async () => {
        const auth = await owner();
        const a = await project();
        const b = await project();
        const [first] = (await api().post(`/projects/${a}/milestones`).set('Authorization', auth).send({ name: 'A done' })).body;
        await api().post(`/projects/${a}/milestones`).set('Authorization', auth).send({ name: 'A open', due: '2026-12-01' });
        await api().patch(`/projects/${a}/milestones/${first.id}`).set('Authorization', auth).send({ done: true });
        await api().post(`/projects/${b}/milestones`).set('Authorization', auth).send({ name: 'B archived' });
        await api().post(`/projects/${b}/archive`).set('Authorization', auth);

        const res = await api().get('/milestones/open').set('Authorization', await as('user_viewer'));
        expect(res.status).toBe(200);
        const mine = res.body.filter((m: { projectId: string }) => m.projectId === a || m.projectId === b);
        expect(mine).toMatchObject([{ projectId: a, name: 'A open', due: '2026-12-01', done: false }]);
    });

    it('needs View on Projects', async () => {
        await addMember(t, 'user_nobody', { name: 'Nobody', levels: {} as never });
        expect((await api().get('/milestones/open').set('Authorization', await as('user_nobody'))).status).toBe(403);
    });
});
