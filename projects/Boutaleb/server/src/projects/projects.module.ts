import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { BRIEF, BriefSchema } from '../briefs/brief.schema.js';
import { BriefsController } from '../briefs/briefs.controller.js';
import { BriefsService } from '../briefs/briefs.service.js';
import { CLIENT, ClientSchema } from '../clients/client.schema.js';
import { MILESTONE, MilestoneSchema } from '../milestones/milestone.schema.js';
import { MilestonesController, OpenMilestonesController } from '../milestones/milestones.controller.js';
import { MilestonesService } from '../milestones/milestones.service.js';
import { PROJECT, ProjectSchema } from './project.schema.js';
import { ProjectsController } from './projects.controller.js';
import { ProjectsService } from './projects.service.js';

// Projects, their briefs (T7.5b) and milestones (T7.5c). Reads the Client
// model to attach a project's client; the /clients routes live in ClientsModule.
@Module({
    imports: [
        MongooseModule.forFeature([
            { name: PROJECT, schema: ProjectSchema },
            { name: CLIENT, schema: ClientSchema },
            { name: BRIEF, schema: BriefSchema },
            { name: MILESTONE, schema: MilestoneSchema },
        ]),
    ],
    controllers: [ProjectsController, BriefsController, MilestonesController, OpenMilestonesController],
    providers: [ProjectsService, BriefsService, MilestonesService],
})
export class ProjectsModule {}
