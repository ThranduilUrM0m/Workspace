import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MILESTONE, MilestoneSchema } from '../milestones/milestone.schema.js';
import { PROJECT, ProjectSchema } from '../projects/project.schema.js';
import { WireframeViewController } from './wireframe-view.controller.js';
import { WIREFRAME_ROUND, WireframeRoundSchema } from './wireframe-round.schema.js';
import { WireframesController } from './wireframes.controller.js';
import { WireframesService } from './wireframes.service.js';

// Wireframe rounds (T7.5d). Its own module, unlike briefs and milestones:
// it is the first one that needs storage, and keeping that dependency out
// of ProjectsModule keeps Projects testable without it.
@Module({
    imports: [
        MongooseModule.forFeature([
            { name: WIREFRAME_ROUND, schema: WireframeRoundSchema },
            { name: PROJECT, schema: ProjectSchema },
            { name: MILESTONE, schema: MilestoneSchema },
        ]),
    ],
    controllers: [WireframesController, WireframeViewController],
    providers: [WireframesService],
})
export class WireframesModule {}
