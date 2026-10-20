import { generateKeyPairSync } from 'node:crypto';
import type { INestApplication, Type } from '@nestjs/common';
import { getModelToken } from '@nestjs/mongoose';
import { Test } from '@nestjs/testing';
import { signJwt } from '@clerk/backend/jwt';
import { MongoMemoryServer } from 'mongodb-memory-server';
import type { Model } from 'mongoose';
import { configureApp } from '../app.js';
import { MEMBER, ROLE, type Member, type Role } from '../access/member.schema.js';
import { ACTIVITY, type ActivityEvent } from '../activity/activity.schema.js';

// The whole app on an in-memory Mongo. Tokens are signed here with a
// throwaway key pair; the guard verifies them networkless with the public
// half, as it does with CLERK_JWT_KEY in prod. Test-only: not built.

const { privateKey, publicKey } = generateKeyPairSync('rsa', { modulusLength: 2048 });
export const PRIVATE_PEM = privateKey.export({ type: 'pkcs8', format: 'pem' }).toString();
export const ORIGIN = 'http://localhost:3002';

export function token(claims: Record<string, unknown> = {}, key = PRIVATE_PEM) {
    const now = Math.floor(Date.now() / 1000);
    return signJwt(
        { sub: 'user_owner', sid: 'sess_1', azp: ORIGIN, iss: 'https://test.clerk.accounts.dev', iat: now, nbf: now - 5, exp: now + 60, ...claims },
        key,
        { algorithm: 'RS256', header: { typ: 'JWT', kid: 'test' } },
    );
}

export interface TestApp {
    app: INestApplication;
    roles: Model<Role>;
    members: Model<Member>;
    events: Model<ActivityEvent>;
    close: () => Promise<void>;
}

export async function startApp(controllers: Type[] = []): Promise<TestApp> {
    const mongo = await MongoMemoryServer.create();
    process.env.MONGODB_URI = mongo.getUri('boutaleb');
    process.env.CLIENT_ORIGIN = ORIGIN;
    process.env.CLERK_JWT_KEY = publicKey.export({ type: 'spki', format: 'pem' }).toString();
    const { AppModule } = await import('../app.module.js');
    const moduleRef = await Test.createTestingModule({ imports: [AppModule], controllers }).compile();
    const app = configureApp(moduleRef.createNestApplication());
    await app.init();
    return {
        app,
        roles: app.get(getModelToken(ROLE)),
        members: app.get(getModelToken(MEMBER)),
        events: app.get(getModelToken(ACTIVITY)),
        close: async () => {
            await app.close();
            await mongo.stop();
        },
    };
}

/** A member with a role, in one call. */
export async function addMember(t: TestApp, clerkUserId: string, role: Partial<Role> & { name: string }, status: 'active' | 'revoked' = 'active') {
    const r = await t.roles.create(role);
    return t.members.create({ clerkUserId, name: clerkUserId.replace('user_', ''), email: `${clerkUserId}@example.com`, role: r._id, status });
}

/** The log is written after the answer; give it a moment. */
export const settle = () => new Promise((r) => setTimeout(r, 150));
