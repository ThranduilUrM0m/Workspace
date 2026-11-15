import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { ThrottlerModule } from '@nestjs/throttler';
import { BRIEF, BriefSchema } from '../briefs/brief.schema.js';
import { CLIENT, ClientSchema } from '../clients/client.schema.js';
import { ClientsModule } from '../clients/clients.module.js';
import type { Env } from '../env.js';
import { PROJECT, ProjectSchema } from '../projects/project.schema.js';
import { PortalController, PortalLinkController, PortalResendController } from './portal.controller.js';
import { PortalProxyGuard, PortalThrottler } from './portal.guards.js';
import { PORTAL_JOBS, HeldPortalJobs } from './portal-jobs.js';
import { PORTAL_LINK, PortalLinkSchema } from './portal-link.schema.js';
import { PORTAL_RESEND, PortalResendSchema } from './portal-resend.schema.js';
import { PortalService } from './portal.service.js';
import { TriggerPortalJobs } from './trigger-portal-jobs.js';

// The client's magic link and intake questionnaire (T8.4). The rate limit
// lives here only, in memory: right for one API instance (as for enquiries).
@Module({
    imports: [
        ClientsModule,
        MongooseModule.forFeature([
            { name: PORTAL_LINK, schema: PortalLinkSchema },
            { name: CLIENT, schema: ClientSchema },
            { name: PORTAL_RESEND, schema: PortalResendSchema },
            { name: PROJECT, schema: ProjectSchema },
            { name: BRIEF, schema: BriefSchema },
        ]),
        ThrottlerModule.forRoot([{ name: 'default', ttl: 60_000, limit: 60 }]),
    ],
    controllers: [PortalLinkController, PortalResendController, PortalController],
    providers: [
        PortalService,
        PortalProxyGuard,
        PortalThrottler,
        {
            // With a Trigger.dev key the email is queued; without one (tests, a bare run) it is held.
            provide: PORTAL_JOBS,
            inject: [ConfigService],
            useFactory: (config: ConfigService<Env, true>) => (config.get('TRIGGER_SECRET_KEY', { infer: true }) ? new TriggerPortalJobs() : new HeldPortalJobs()),
        },
    ],
})
export class PortalModule {}
