import { Controller, Get, Post } from '@nestjs/common';
import request from 'supertest';
import { addMember, settle, startApp, token, type TestApp } from '../testing/app.js';
import { AnyMember, OwnerOnly, Requires } from './requires.decorator.js';

// Routes that exist only here, one per kind of requirement.
@Controller('probe')
class ProbeController {
    @Get('finance')
    @Requires('view', 'finance')
    viewFinance() {
        return { ok: true };
    }

    @Post('finance')
    @Requires('edit', 'finance')
    editFinance() {
        return { ok: true };
    }

    @Post('invoice')
    @Requires('issueInvoices', 'finance')
    issue() {
        return { ok: true };
    }

    @Get('activity')
    @OwnerOnly()
    activity() {
        return { ok: true };
    }

    @Get('anyone')
    @AnyMember()
    anyone() {
        return { ok: true };
    }

    @Get('forgotten')
    forgotten() {
        return { ok: true };
    }
}

let t: TestApp;

beforeAll(async () => {
    t = await startApp([ProbeController]);
    await addMember(t, 'user_owner', { name: 'Owner', owner: true });
    await addMember(t, 'user_viewer', { name: 'Bookkeeper', levels: { finance: 'view' } as never, rights: { issueInvoices: true } as never });
    await addMember(t, 'user_editor', { name: 'Accountant', levels: { finance: 'edit' } as never, rights: { issueInvoices: true } as never });
    await addMember(t, 'user_gone', { name: 'Former helper', levels: { finance: 'edit' } as never }, 'revoked');
});

afterAll(async () => {
    await t?.close();
});

const call = async (method: 'get' | 'post', path: string, sub: string, sid = `sess_${sub}`) =>
    (await request(t.app.getHttpServer())[method](path).set('Authorization', `Bearer ${await token({ sub, sid })}`)).status;

describe('access guard', () => {
    it('lets the owner through everywhere', async () => {
        expect(await call('get', '/probe/finance', 'user_owner')).toBe(200);
        expect(await call('post', '/probe/invoice', 'user_owner')).toBe(201);
        expect(await call('get', '/probe/activity', 'user_owner')).toBe(200);
    });

    it('holds a View role to reading', async () => {
        expect(await call('get', '/probe/finance', 'user_viewer')).toBe(200);
        expect(await call('post', '/probe/finance', 'user_viewer')).toBe(403);
        // The right is ticked, but the level is View: still no.
        expect(await call('post', '/probe/invoice', 'user_viewer')).toBe(403);
    });

    it('lets Edit plus the right issue an invoice', async () => {
        expect(await call('post', '/probe/finance', 'user_editor')).toBe(201);
        expect(await call('post', '/probe/invoice', 'user_editor')).toBe(201);
    });

    it('keeps owner-only routes from every other role', async () => {
        expect(await call('get', '/probe/activity', 'user_editor')).toBe(403);
    });

    it('refuses a revoked member and a stranger with a valid Clerk session', async () => {
        expect(await call('get', '/probe/anyone', 'user_gone')).toBe(403);
        expect(await call('get', '/probe/anyone', 'user_stranger')).toBe(403);
        expect(await call('get', '/me', 'user_stranger')).toBe(403);
    });

    it('refuses a route that states no requirement, even to the owner', async () => {
        expect(await call('get', '/probe/forgotten', 'user_owner')).toBe(403);
    });

    it('logs every refusal as critical, with who and why', async () => {
        await call('post', '/probe/invoice', 'user_viewer', 'sess_denied');
        await settle();
        const e = await t.events.findOne({ action: 'denied', sessionId: 'sess_denied' }).lean();
        expect(e).toMatchObject({ kind: 'access', weight: 'critical', section: 'finance', actor: { clerkUserId: 'user_viewer', name: 'viewer' } });
        expect(e?.after).toMatchObject({ reason: 'needs issueInvoices on finance' });
    });
});
