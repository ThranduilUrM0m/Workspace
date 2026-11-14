import { Body, Controller, Get, Param, Patch, Post, Query, Req } from '@nestjs/common';
import {
    clientEdit,
    clientNew,
    contactCreate,
    type ClientEdit,
    type ClientNew,
    type ContactCreate,
} from '@repo/schemas';
import { z } from 'zod';
import type { AccessRequest } from '../access/access.guard.js';
import { Requires } from '../access/requires.decorator.js';
import { ZodPipe } from '../common/zod.pipe.js';
import { ClientsService } from './clients.service.js';
import { ContactsService } from './contacts.service.js';

const listQuery = z.object({ q: z.string().trim().max(100).optional() });

// /clients (T8.3): the list (also the pickers' search), one client, New
// client, Edit client, and the client's contact log. View on Clients reads, Edit writes.
@Controller('clients')
export class ClientsController {
    constructor(
        private readonly clients: ClientsService,
        private readonly contacts: ContactsService
    ) {}

    @Get()
    @Requires('view', 'clients')
    list(@Query(new ZodPipe(listQuery)) { q }: z.infer<typeof listQuery>) {
        return this.clients.list(q || undefined);
    }

    /** Declared before :id, or ":id" would swallow it. */
    @Get('recent-contacts')
    @Requires('view', 'clients')
    recent() {
        return this.contacts.recent();
    }

    @Get(':id')
    @Requires('view', 'clients')
    get(@Param('id') id: string) {
        return this.clients.get(id);
    }

    @Post()
    @Requires('edit', 'clients')
    create(@Body(new ZodPipe(clientNew)) body: ClientNew, @Req() req: AccessRequest) {
        return this.clients.create(body, req);
    }

    /** Edit client: the stored fields, whole. The history is not editable. */
    @Patch(':id')
    @Requires('edit', 'clients')
    update(
        @Param('id') id: string,
        @Body(new ZodPipe(clientEdit)) body: ClientEdit,
        @Req() req: AccessRequest
    ) {
        return this.clients.update(id, body, req);
    }

    @Get(':id/contacts')
    @Requires('view', 'clients')
    history(@Param('id') id: string) {
        return this.clients.history(id);
    }

    @Post(':id/contacts')
    @Requires('edit', 'clients')
    log(
        @Param('id') id: string,
        @Body(new ZodPipe(contactCreate)) body: ContactCreate,
        @Req() req: AccessRequest
    ) {
        return this.clients.logContact(id, body, req);
    }
}
