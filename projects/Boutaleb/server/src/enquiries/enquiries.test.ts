import { randomUUID } from 'node:crypto';
import { getModelToken } from '@nestjs/mongoose';
import type { Model } from 'mongoose';
import request from 'supertest';
import { DEV_FORMS_PROXY_KEY } from '../env.js';
import { settle, startApp, type TestApp } from '../testing/app.js';
import { CONVERSIONS, type Conversions } from './conversions.js';
import { ENQUIRY_JOBS, type HeldJobs } from './enquiry-jobs.js';
import { ENQUIRY, type Enquiry } from './enquiry.schema.js';
import { FormTokens } from './form-token.js';

let t: TestApp;
let enquiries: Model<Enquiry>;
let jobs: HeldJobs;
let tokens: FormTokens;
let conversions: Conversions;

beforeAll(async () => {
    t = await startApp();
    enquiries = t.app.get(getModelToken(ENQUIRY));
    jobs = t.app.get(ENQUIRY_JOBS);
    conversions = t.app.get(CONVERSIONS);
    tokens = t.app.get(FormTokens);
});

afterAll(async () => {
    await t?.close();
});

let ip = 0;
/** Each test is its own visitor unless it says otherwise, so the rate limit never leaks between tests. */
const visitor = () => `10.0.0.${++ip}`;
const shown = () => tokens.issue(Date.now() - 5_000);

const send = (body: Record<string, unknown>, from = visitor(), key = DEV_FORMS_PROXY_KEY) =>
    request(t.app.getHttpServer()).post('/enquiries').set('x-forms-key', key).set('x-visitor-ip', from).send(body);

const footer = (over: Record<string, unknown> = {}) => ({
    source: 'footer',
    name: 'Sara Alaoui',
    email: 'Sara@Atlas-Riads.ma',
    projectType: 'website',
    message: 'A booking site for a riad.',
    idempotencyKey: randomUUID(),
    t: shown(),
    locale: 'en',
    ...over,
});

const contact = (over: Record<string, unknown> = {}) => ({
    source: 'contact',
    name: 'Sara Alaoui',
    email: 'sara@atlas-riads.ma',
    category: 'new',
    message: 'Six rooms, a booking calendar.',
    budget: '5k-15k',
    timeline: 'months',
    via: 'email',
    stage: 'direction',
    idempotencyKey: randomUUID(),
    t: shown(),
    ...over,
});

describe('who may call', () => {
    it('only the site route, proven by the proxy key', async () => {
        expect((await send(footer(), visitor(), 'wrong-key')).status).toBe(401);
        expect((await request(t.app.getHttpServer()).post('/enquiries').send(footer())).status).toBe(401);
        expect((await request(t.app.getHttpServer()).get('/enquiries/token')).status).toBe(401);
    });

    it('issues a token to the route', async () => {
        const res = await request(t.app.getHttpServer()).get('/enquiries/token').set('x-forms-key', DEV_FORMS_PROXY_KEY);
        expect(res.status).toBe(200);
        expect(res.body.t).toMatch(/^\d{13}\.[\w-]+$/);
    });
});

describe('a real send', () => {
    it('writes one enquiry, queues receipt and notice, answers with an unguessable ref', async () => {
        const body = footer();
        const res = await send(body);
        expect(res.status).toBe(201);
        expect(res.body.ref).toMatch(/^L-[A-Z2-9]{10}$/);
        expect(res.body.email).toBe('sara@atlas-riads.ma');
        const e = await enquiries.findOne({ ref: res.body.ref }).lean<Enquiry>();
        expect(e).toMatchObject({ source: 'footer', email: 'sara@atlas-riads.ma', details: { projectType: 'website' }, locale: 'en', keys: [body.idempotencyKey] });
        expect(jobs.held).toContainEqual({ enquiryId: String(e!._id), first: true });
        await settle();
        expect(await t.events.exists({ action: 'enquiry.create', 'target.id': String(e!._id) })).toBeTruthy();
    });

    it('a retried send answers the first time again and writes nothing', async () => {
        const body = footer();
        const first = await send(body);
        const again = await send(body);
        expect(again.status).toBe(201);
        expect(again.body.ref).toBe(first.body.ref);
        expect(await enquiries.countDocuments({ keys: body.idempotencyKey })).toBe(1);
    });

    it('keeps only what the form asked: unknown keys are dropped', async () => {
        const res = await send(contact({ admin: true, phone: '' }));
        const e = await enquiries.findOne({ ref: res.body.ref }).lean<Enquiry>();
        expect(e!.details).toEqual({ category: 'new', budget: '5k-15k', timeline: 'months', via: 'email', stage: 'direction' });
    });
});

describe('Add budget and timeline (lead)', () => {
    it('adds to the footer enquiry for the same email, keeps its message, notifies the owner only', async () => {
        const f = await send(footer());
        const res = await send(contact({ lead: f.body.ref }));
        expect(res.body.ref).toBe(f.body.ref);
        const e = await enquiries.findOne({ ref: f.body.ref }).lean<Enquiry>();
        expect(e!.message).toBe('A booking site for a riad.');
        expect(e!.details).toMatchObject({ projectType: 'website', budget: '5k-15k', followUp: 'Six rooms, a booking calendar.' });
        expect(e!.keys).toHaveLength(2);
        expect(jobs.held.at(-1)).toEqual({ enquiryId: String(e!._id), first: false });
    });

    it('a ref with another email reaches nothing: it becomes its own enquiry', async () => {
        const f = await send(footer());
        const res = await send(contact({ lead: f.body.ref, email: 'someone@else.ma' }));
        expect(res.body.ref).not.toBe(f.body.ref);
        expect((await enquiries.findOne({ ref: f.body.ref }).lean<Enquiry>())!.keys).toHaveLength(1);
    });
});

describe('spam', () => {
    it('a filled honeypot gets the same 201 and nothing is kept', async () => {
        const before = await enquiries.countDocuments();
        const res = await send(footer({ nickname: 'bot' }));
        expect(res.status).toBe(201);
        expect(res.body.ref).toMatch(/^L-/);
        expect(await enquiries.countDocuments()).toBe(before);
        await settle();
        expect(await t.events.exists({ action: 'enquiry.bot' })).toBeTruthy();
    });

    it('too fast, a forged or a missing token: a bot, fake success', async () => {
        const before = await enquiries.countDocuments();
        for (const tk of [tokens.issue(), `${Date.now() - 5_000}.forged`, undefined]) {
            expect((await send(footer({ t: tk }))).status).toBe(201);
        }
        expect(await enquiries.countDocuments()).toBe(before);
    });

    it('a day-old form is refused honestly, so the visitor can reload', async () => {
        const res = await send(footer({ t: tokens.issue(Date.now() - 25 * 60 * 60 * 1000) }));
        expect(res.status).toBe(422);
        expect(res.body.errors).toEqual({ form: 'expired' });
    });

    it('5 sends per 10 minutes per visitor; the sixth is 429; another visitor is unaffected; bots never see it', async () => {
        const me = visitor();
        for (let i = 0; i < 5; i++) expect((await send(footer(), me)).status).toBe(201);
        expect((await send(footer(), me)).status).toBe(429);
        expect((await send(footer({ nickname: 'x' }), me)).status).toBe(201);
        expect((await send(footer())).status).toBe(201);
    });
});

describe('conversions', () => {
    it('one per new enquiry; never for a retry, a /contact addition or a bot', async () => {
        const spy = vi.spyOn(conversions, 'count');
        const body = footer();
        const f = await send(body);
        await send(body);
        await send(contact({ lead: f.body.ref }));
        await send(footer({ nickname: 'bot' }));
        await send(contact());
        expect(spy.mock.calls).toEqual([[{ source: 'footer', locale: 'en' }], [{ source: 'contact', locale: 'fr' }]]);
        spy.mockRestore();
    });

    it('a failed count never fails the send', async () => {
        const spy = vi.spyOn(conversions, 'count').mockRejectedValueOnce(new Error('umami down'));
        expect((await send(footer())).status).toBe(201);
        spy.mockRestore();
    });
});

describe('validation', () => {
    it('422 with a code per field; nothing written', async () => {
        const before = await enquiries.countDocuments();
        const res = await send(footer({ name: ' ', email: 'not-an-email', message: 'x'.repeat(5001) }));
        expect(res.status).toBe(422);
        expect(res.body.errors).toEqual({ name: 'required', email: 'email', message: 'tooLong' });
        expect(await enquiries.countDocuments()).toBe(before);
    });

    it('an unknown source is refused', async () => {
        const res = await send(footer({ source: 'sidebar' }));
        expect(res.status).toBe(422);
        expect(res.body.errors).toEqual({ source: 'required' });
    });
});
