import { randomUUID } from 'node:crypto';
import { getModelToken } from '@nestjs/mongoose';
import type { Model } from 'mongoose';
import request from 'supertest';
import { CLIENT, type Client } from '../clients/client.schema.js';
import { FormTokens } from '../enquiries/form-token.js';
import { DEV_FORMS_PROXY_KEY } from '../env.js';
import { addMember, settle, startApp, token, type TestApp } from '../testing/app.js';
import { DEAL, type Deal } from './deal.schema.js';

let t: TestApp;
let tokens: FormTokens;
let deals: Model<Deal>;
let clients: Model<Client>;

beforeAll(async () => {
    t = await startApp();
    tokens = t.app.get(FormTokens);
    deals = t.app.get(getModelToken(DEAL));
    clients = t.app.get(getModelToken(CLIENT));
    await addMember(t, 'user_owner', { name: 'Owner', owner: true });
    await addMember(t, 'user_viewer', { name: 'Viewer', levels: { deals: 'view' } as never });
    await addMember(t, 'user_dealer', {
        name: 'Deals only',
        levels: { deals: 'edit', clients: 'view' } as never,
    });
});

afterAll(async () => {
    await t?.close();
});

const api = () => request(t.app.getHttpServer());
const as = async (sub: string) => `Bearer ${await token({ sub, sid: `sess_${sub}` })}`;

let ip = 0;
const enquire = (body: Record<string, unknown>) =>
    api()
        .post('/enquiries')
        .set('x-forms-key', DEV_FORMS_PROXY_KEY)
        .set('x-visitor-ip', `10.9.0.${++ip}`)
        .send({ idempotencyKey: randomUUID(), t: tokens.issue(Date.now() - 5_000), ...body });

const footer = (over: Record<string, unknown> = {}) => ({
    source: 'footer',
    name: 'Sara Alaoui',
    email: 'sara@atlas-riads.ma',
    projectType: 'website',
    message: 'A booking site for a riad.',
    locale: 'en',
    ...over,
});

describe('a public enquiry becomes a lead', () => {
    it('makes a lead client in the visitor language and a site deal on it, linked to the enquiry', async () => {
        const res = await enquire(footer());
        expect(res.status).toBe(201);
        const c = await clients.findOne({ email: 'sara@atlas-riads.ma' }).lean<Client>();
        expect(c).toMatchObject({
            name: 'Sara Alaoui',
            company: 'Sara Alaoui',
            status: 'lead',
            language: 'en',
        });
        const list = await api()
            .get('/deals')
            .set('Authorization', await as('user_owner'));
        const d = list.body.find((x: { client: { id: string } }) => x.client.id === String(c!._id));
        expect(d).toMatchObject({
            title: 'Sara Alaoui — Website',
            stage: 'lead',
            source: 'site',
            value: null,
            priced: false,
            sent: null,
        });
        expect(d.enquiry).toMatchObject({
            ref: res.body.ref,
            source: 'footer',
            message: 'A booking site for a riad.',
            details: { projectType: 'website' },
        });
        await settle();
        expect(
            await t.events.exists({ action: 'deal.from_enquiry', 'target.id': d.id })
        ).toBeTruthy();
    });

    it('a second enquiry from the same address reuses the client and opens a second deal', async () => {
        await enquire(footer({ email: 'Omar@Kasbah.ma', name: 'Omar' }));
        await enquire(footer({ email: 'omar@kasbah.ma', name: 'Omar', projectType: 'erp' }));
        expect(await clients.countDocuments({ email: 'omar@kasbah.ma' })).toBe(1);
        const c = await clients.findOne({ email: 'omar@kasbah.ma' }).lean<Client>();
        const mine = await deals.find({ client: c!._id }).lean<Deal[]>();
        expect(mine.map((d) => d.title).sort()).toEqual([
            'Omar — ERP / internal tool',
            'Omar — Website',
        ]);
    });

    it('/contact names the deal after the company; adding to a footer lead makes no second deal', async () => {
        const first = await enquire(footer({ email: 'nadia@zellige.ma', name: 'Nadia' }));
        await enquire({
            source: 'contact',
            name: 'Nadia',
            email: 'nadia@zellige.ma',
            lead: first.body.ref,
            category: 'new',
            company: 'Zellige Studio',
            message: 'More detail.',
            budget: '5k-15k',
            timeline: 'months',
            via: 'email',
            stage: 'direction',
        });
        const c = await clients.findOne({ email: 'nadia@zellige.ma' }).lean<Client>();
        expect(await deals.countDocuments({ client: c!._id })).toBe(1);

        await enquire({
            source: 'contact',
            name: 'Youssef',
            email: 'y@dar.ma',
            category: 'refresh',
            company: 'Dar Salam',
            phone: '+212 600',
            message: 'Redo the site.',
            budget: '2k-5k',
            timeline: 'asap',
            via: 'phone',
            stage: 'ready',
            locale: 'ar',
        });
        const y = await clients.findOne({ email: 'y@dar.ma' }).lean<Client>();
        expect(y).toMatchObject({ company: 'Dar Salam', phone: '+212 600', language: 'ar' });
        const d = await deals.findOne({ client: y!._id }).lean<Deal>();
        expect(d!.title).toBe('Dar Salam — Refresh / redesign');
    });
});

describe('log an enquiry', () => {
    it('with a new client: the client is saved as a lead, the deal is a lead with an estimate', async () => {
        const res = await api()
            .post('/deals')
            .set('Authorization', await as('user_owner'))
            .send({
                newClient: { name: 'Hamza R.', email: 'Hamza@Example.ma', language: 'fr' },
                title: 'Spa site and booking',
                value: 48000,
                source: 'referral',
                note: 'Called on Monday.',
            });
        expect(res.status).toBe(201);
        expect(res.body).toMatchObject({
            stage: 'lead',
            source: 'referral',
            value: 48000,
            priced: false,
            note: 'Called on Monday.',
            enquiry: null,
            client: { name: 'Hamza R.', email: 'hamza@example.ma' },
        });
        expect(res.body.opened).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    });

    it('with a picked client; the studio itself cannot be picked', async () => {
        const c = await clients.create({
            name: 'Leila',
            company: 'Atelier Leila',
            email: 'leila@atelier.ma',
            language: 'fr',
        });
        const ok = await api()
            .post('/deals')
            .set('Authorization', await as('user_owner'))
            .send({ clientId: String(c._id), title: 'Shop rebuild', source: 'repeat' });
        expect(ok.status).toBe(201);
        expect(ok.body.client.id).toBe(String(c._id));

        const self = await clients.create({
            name: 'Boutaleb',
            company: 'Boutaleb',
            email: 'studio@boutaleb.dev',
            language: 'fr',
            self: true,
        });
        const no = await api()
            .post('/deals')
            .set('Authorization', await as('user_owner'))
            .send({ clientId: String(self._id), title: 'Own site', source: 'direct' });
        expect(no.status).toBe(422);
    });

    it('refuses: no client, both kinds of client, no source, a taken email', async () => {
        const auth = await as('user_owner');
        expect(
            (
                await api()
                    .post('/deals')
                    .set('Authorization', auth)
                    .send({ title: 'Nothing', source: 'site' })
            ).status
        ).toBe(400);
        const c = await clients.findOne({ email: 'leila@atelier.ma' }).lean<Client>();
        expect(
            (
                await api()
                    .post('/deals')
                    .set('Authorization', auth)
                    .send({
                        clientId: String(c!._id),
                        newClient: { name: 'X', email: 'x@x.ma', language: 'fr' },
                        title: 'Both',
                        source: 'site',
                    })
            ).status
        ).toBe(400);
        expect(
            (
                await api()
                    .post('/deals')
                    .set('Authorization', auth)
                    .send({ clientId: String(c!._id), title: 'No source' })
            ).status
        ).toBe(400);
        const taken = await api()
            .post('/deals')
            .set('Authorization', auth)
            .send({
                newClient: { name: 'Leila again', email: 'LEILA@atelier.ma', language: 'fr' },
                title: 'Dup',
                source: 'site',
            });
        expect(taken.status).toBe(409);
        expect(taken.body.client.id).toBe(String(c!._id));
    });
});

describe('close as lost', () => {
    it('records the reason and the day; a closed deal cannot be closed again', async () => {
        const c = await clients.findOne({ email: 'leila@atelier.ma' }).lean<Client>();
        const d = await api()
            .post('/deals')
            .set('Authorization', await as('user_owner'))
            .send({ clientId: String(c!._id), title: 'Lost one', source: 'direct' });
        expect(
            (
                await api()
                    .post(`/deals/${d.body.id}/lose`)
                    .set('Authorization', await as('user_owner'))
                    .send({ lostWhy: '' })
            ).status
        ).toBe(400);
        const lost = await api()
            .post(`/deals/${d.body.id}/lose`)
            .set('Authorization', await as('user_owner'))
            .send({ lostWhy: 'Not a real enquiry' });
        expect(lost.status).toBe(200);
        expect(lost.body).toMatchObject({ stage: 'lost', lostWhy: 'Not a real enquiry' });
        expect(lost.body.decided).toMatch(/^\d{4}-\d{2}-\d{2}$/);
        expect(
            (
                await api()
                    .post(`/deals/${d.body.id}/lose`)
                    .set('Authorization', await as('user_owner'))
                    .send({ lostWhy: 'again' })
            ).status
        ).toBe(409);
        const lostOnly = await api()
            .get('/deals?stage=lost')
            .set('Authorization', await as('user_owner'));
        expect(lostOnly.body.every((x: { stage: string }) => x.stage === 'lost')).toBe(true);
    });
});

describe('who may', () => {
    it('View on Deals reads but cannot write; Edit on Deals without Edit on Clients cannot make a client', async () => {
        const viewer = await as('user_viewer');
        expect((await api().get('/deals').set('Authorization', viewer)).status).toBe(200);
        expect(
            (
                await api()
                    .post('/deals')
                    .set('Authorization', viewer)
                    .send({
                        newClient: { name: 'A', email: 'a@a.ma', language: 'fr' },
                        title: 'Nope',
                        source: 'site',
                    })
            ).status
        ).toBe(403);

        const dealer = await as('user_dealer');
        expect(
            (
                await api()
                    .post('/deals')
                    .set('Authorization', dealer)
                    .send({
                        newClient: { name: 'B', email: 'b@b.ma', language: 'fr' },
                        title: 'Nope',
                        source: 'site',
                    })
            ).status
        ).toBe(403);
        const c = await clients.findOne({ email: 'leila@atelier.ma' }).lean<Client>();
        expect(
            (
                await api()
                    .post('/deals')
                    .set('Authorization', dealer)
                    .send({ clientId: String(c!._id), title: 'Allowed', source: 'repeat' })
            ).status
        ).toBe(201);
    });

    it('an unknown id is a 404', async () => {
        expect(
            (
                await api()
                    .get('/deals/0123456789abcdef01234567')
                    .set('Authorization', await as('user_owner'))
            ).status
        ).toBe(404);
        expect(
            (
                await api()
                    .get('/deals/nope')
                    .set('Authorization', await as('user_owner'))
            ).status
        ).toBe(404);
    });
});
