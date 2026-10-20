import { Module } from '@nestjs/common';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { AccessGuard } from '../access/access.guard.js';
import { AccessModule } from '../access/access.module.js';
import { ActivityInterceptor } from '../activity/activity.interceptor.js';
import { ClerkAuthGuard } from './clerk-auth.guard.js';
import { MeController } from './me.controller.js';

// Global guards run in the order listed: Clerk says who is calling, then
// AccessGuard says what they may do. Then every answered request is logged.
@Module({
    imports: [AccessModule],
    controllers: [MeController],
    providers: [
        { provide: APP_GUARD, useClass: ClerkAuthGuard },
        { provide: APP_GUARD, useClass: AccessGuard },
        { provide: APP_INTERCEPTOR, useClass: ActivityInterceptor },
    ],
})
export class AuthModule {}
