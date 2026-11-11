import type { INestApplication } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import helmet from 'helmet';
import type { Env } from './env.js';

// Everything main.ts sets on the app, shared with the e2e tests so they run
// the same app the server does.
export function configureApp(app: INestApplication): INestApplication {
    app.use(helmet());
    // The ERP calls the API from the browser with a Bearer token, so the one
    // origin Clerk tokens are issued to (azp) is the one CORS lets in. No
    // cookies cross: credentials stay off.
    app.enableCors({
        origin: app.get<ConfigService<Env, true>>(ConfigService).get('CLIENT_ORIGIN', { infer: true }),
        // PUT: local-folder uploads (src/storage); S3 uploads go to the bucket, not here.
        methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
        allowedHeaders: ['Authorization', 'Content-Type', 'Idempotency-Key'],
        maxAge: 600,
    });
    // Terminus reports 'shutting_down' and Mongoose closes cleanly on SIGTERM.
    app.enableShutdownHooks();
    return app;
}
