import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CLIENT, ClientSchema } from '../clients/client.schema.js';
import { ClientsController } from '../clients/clients.controller.js';
import { PROJECT, ProjectSchema } from './project.schema.js';
import { ProjectsController } from './projects.controller.js';
import { ProjectsService } from './projects.service.js';

// Projects, and the slice of Clients they need. Clients gets its own module
// when its screens arrive (M8) and this one imports it instead.
@Module({
    imports: [
        MongooseModule.forFeature([
            { name: PROJECT, schema: ProjectSchema },
            { name: CLIENT, schema: ClientSchema },
        ]),
    ],
    controllers: [ProjectsController, ClientsController],
    providers: [ProjectsService],
})
export class ProjectsModule {}
