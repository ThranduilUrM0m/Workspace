import type { INestApplication } from '@nestjs/common';
import helmet from 'helmet';

// Everything main.ts sets on the app, shared with the e2e tests so they run
// the same app the server does.
export function configureApp(app: INestApplication): INestApplication {
    app.use(helmet());
    // Terminus reports 'shutting_down' and Mongoose closes cleanly on SIGTERM.
    app.enableShutdownHooks();
    return app;
}
