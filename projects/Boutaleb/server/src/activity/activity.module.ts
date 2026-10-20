import { Global, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ACTIVITY, ActivitySchema, SEEN_SESSION, SeenSessionSchema } from './activity.schema.js';
import { ActivityService } from './activity.service.js';

// Global: every feature module records into the same log.
@Global()
@Module({
    imports: [
        MongooseModule.forFeature([
            { name: ACTIVITY, schema: ActivitySchema },
            { name: SEEN_SESSION, schema: SeenSessionSchema },
        ]),
    ],
    providers: [ActivityService],
    exports: [ActivityService],
})
export class ActivityModule {}
