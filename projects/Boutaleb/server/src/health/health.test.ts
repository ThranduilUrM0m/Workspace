import type { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { MongoMemoryServer } from 'mongodb-memory-server';
import request from 'supertest';
import { configureApp } from '../app.js';

// The whole app against a throwaway mongod, so the suite needs no Docker.

let mongo: MongoMemoryServer;
let app: INestApplication;

beforeAll(async () => {
    mongo = await MongoMemoryServer.create();
    process.env.MONGODB_URI = mongo.getUri('boutaleb');
    process.env.CLERK_JWT_KEY = 'unused-by-health';
    // ConfigModule reads the environment when app.module loads, so it loads now.
    const { AppModule } = await import('../app.module.js');
    const moduleRef = await Test.createTestingModule({ imports: [AppModule] }).compile();
    app = configureApp(moduleRef.createNestApplication());
    await app.init();
});

afterAll(async () => {
    await app?.close();
    await mongo?.stop();
});

describe('GET /health', () => {
    it('answers 200 when Mongo is up', async () => {
        const res = await request(app.getHttpServer()).get('/health');
        expect(res.status).toBe(200);
        expect(res.body).toMatchObject({ status: 'ok', info: { mongo: { status: 'up' } } });
    });

    it('sends security headers', async () => {
        const res = await request(app.getHttpServer()).get('/health');
        expect(res.headers['x-content-type-options']).toBe('nosniff');
        expect(res.headers['x-powered-by']).toBeUndefined();
    });

    // Last: it stops the database.
    it('answers 503 when Mongo is down', async () => {
        await mongo.stop({ doCleanup: false });
        const res = await request(app.getHttpServer()).get('/health');
        expect(res.status).toBe(503);
        expect(res.body).toMatchObject({ status: 'error', error: { mongo: { status: 'down' } } });
    });
});
