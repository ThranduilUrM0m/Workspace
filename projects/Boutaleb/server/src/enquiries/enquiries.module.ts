import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { ThrottlerModule } from '@nestjs/throttler';
import { EnquiriesController } from './enquiries.controller.js';
import { EnquiriesService } from './enquiries.service.js';
import type { Env } from '../env.js';
import { CONVERSIONS, NoConversions } from './conversions.js';
import { ENQUIRY_JOBS, HeldJobs } from './enquiry-jobs.js';
import { TriggerJobs } from './trigger-jobs.js';
import { EnquiryThrottler, FormsProxyGuard } from './enquiry.guards.js';
import { ENQUIRY, EnquirySchema } from './enquiry.schema.js';
import { FormTokens } from './form-token.js';

const MINUTE = 60_000;

// Public enquiries (T8.1). The rate limit lives here only: no other route
// is counted. Its store is in memory, which is right for one API instance;
// a second instance needs a shared store (public-forms.md §3).
@Module({
    imports: [
        MongooseModule.forFeature([{ name: ENQUIRY, schema: EnquirySchema }]),
        ThrottlerModule.forRoot([
            { name: 'short', ttl: 10 * MINUTE, limit: 5 },
            { name: 'day', ttl: 24 * 60 * MINUTE, limit: 20 },
        ]),
    ],
    controllers: [EnquiriesController],
    providers: [EnquiriesService, FormTokens, FormsProxyGuard, EnquiryThrottler, { provide: CONVERSIONS, useClass: NoConversions }, {
            // With a Trigger.dev key the emails are queued; without one (tests, a bare run) they are held.
            provide: ENQUIRY_JOBS,
            inject: [ConfigService],
            useFactory: (config: ConfigService<Env, true>) => (config.get('TRIGGER_SECRET_KEY', { infer: true }) ? new TriggerJobs() : new HeldJobs()),
        }],
    exports: [ENQUIRY_JOBS],
})
export class EnquiriesModule {}
