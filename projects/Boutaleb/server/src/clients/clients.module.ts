import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PROJECT, ProjectSchema } from '../projects/project.schema.js';
import { CLIENT, ClientSchema } from './client.schema.js';
import { ClientsController } from './clients.controller.js';
import { ClientsService } from './clients.service.js';
import { CONTACT, ContactSchema } from './contact.schema.js';
import { ContactsService } from './contacts.service.js';

// Clients (T8.3) and the contact log. Exports ContactsService so Deals (and
// magic links later) can append to a client's history without owning it.
@Module({
    imports: [
        MongooseModule.forFeature([
            { name: CLIENT, schema: ClientSchema },
            { name: PROJECT, schema: ProjectSchema },
            { name: CONTACT, schema: ContactSchema },
        ]),
    ],
    controllers: [ClientsController],
    providers: [ClientsService, ContactsService],
    exports: [ContactsService],
})
export class ClientsModule {}
