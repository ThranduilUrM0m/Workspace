import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { validateEnv, type Env } from './env.js';
import { ActivityModule } from './activity/activity.module.js';
import { AuthModule } from './auth/auth.module.js';
import { HealthModule } from './health/health.module.js';
import { ProjectsModule } from './projects/projects.module.js';

@Module({
    imports: [
        ConfigModule.forRoot({ isGlobal: true, ignoreEnvFile: true, validate: validateEnv }),
        MongooseModule.forRootAsync({
            inject: [ConfigService],
            useFactory: (config: ConfigService<Env, true>) => ({
                uri: config.get('MONGODB_URI', { infer: true }),
            }),
        }),
        ActivityModule,
        AuthModule,
        HealthModule,
        ProjectsModule,
    ],
})
export class AppModule {}
