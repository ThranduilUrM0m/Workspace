import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { configureApp } from './app.js';
import { AppModule } from './app.module.js';
import type { Env } from './env.js';

async function bootstrap(): Promise<void> {
    const app = configureApp(await NestFactory.create(AppModule));
    const port = app.get<ConfigService<Env, true>>(ConfigService).get('PORT', { infer: true });
    await app.listen(port);
}

void bootstrap();
