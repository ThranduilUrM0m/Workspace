import { generateKeyPairSync } from 'node:crypto';
import type { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { signJwt } from '@clerk/backend/jwt';
import { MongoMemoryServer } from 'mongodb-memory-server';
import request from 'supertest';
import { configureApp } from '../app.js';

// Tokens are signed here with a throwaway key pair; the guard verifies them
// networkless with the public half, as it does with CLERK_JWT_KEY in prod.

const { privateKey, publicKey } = generateKeyPairSync('rsa', { modulusLength: 2048 });
const privatePem = privateKey.export({ type: 'pkcs8', format: 'pem' }).toString();
const ORIGIN = 'http://localhost:3002';

let mongo: MongoMemoryServer;
let app: INestApplication;

function token(claims: Record<string, unknown> = {}, key = privatePem) {
    const now = Math.floor(Date.now() / 1000);
    return signJwt(
        { sub: 'user_owner', sid: 'sess_1', azp: ORIGIN, iss: 'https://test.clerk.accounts.dev', iat: now, nbf: now - 5, exp: now + 60, ...claims },
        key,
        { algorithm: 'RS256', header: { typ: 'JWT', kid: 'test' } },
    );
}

beforeAll(async () => {
    mongo = await MongoMemoryServer.create();
    process.env.MONGODB_URI = mongo.getUri('boutaleb');
    process.env.CLIENT_ORIGIN = ORIGIN;
    process.env.CLERK_JWT_KEY = publicKey.export({ type: 'spki', format: 'pem' }).toString();
    const { AppModule } = await import('../app.module.js');
    const moduleRef = await Test.createTestingModule({ imports: [AppModule] }).compile();
    app = configureApp(moduleRef.createNestApplication());
    await app.init();
});

afterAll(async () => {
    await app?.close();
    await mongo?.stop();
});

const me = (bearer?: string) => {
    const req = request(app.getHttpServer()).get('/me');
    return bearer ? req.set('Authorization', `Bearer ${bearer}`) : req;
};

describe('Clerk session guard', () => {
    it('lets a valid session through and says who it is', async () => {
        const res = await me(await token());
        expect(res.status).toBe(200);
        expect(res.body).toEqual({ userId: 'user_owner', sessionId: 'sess_1' });
    });

    it('refuses a request with no token', async () => {
        expect((await me()).status).toBe(401);
    });

    it('refuses an expired token', async () => {
        const now = Math.floor(Date.now() / 1000);
        expect((await me(await token({ iat: now - 120, nbf: now - 120, exp: now - 60 }))).status).toBe(401);
    });

    it('refuses a token signed with another key', async () => {
        const other = generateKeyPairSync('rsa', { modulusLength: 2048 }).privateKey.export({ type: 'pkcs8', format: 'pem' }).toString();
        expect((await me(await token({}, other))).status).toBe(401);
    });

    it('refuses a token minted for another origin', async () => {
        expect((await me(await token({ azp: 'https://evil.example' }))).status).toBe(401);
    });

    it('keeps /health open', async () => {
        expect((await request(app.getHttpServer()).get('/health')).status).toBe(200);
    });
});
