import { Body, Controller, Get, Post, Query, Req } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { clientCreate, type ClientCreate } from '@repo/schemas';
import type { Model } from 'mongoose';
import { z } from 'zod';
import type { AccessRequest } from '../access/access.guard.js';
import { Requires } from '../access/requires.decorator.js';
import { ActivityService } from '../activity/activity.service.js';
import { ZodPipe } from '../common/zod.pipe.js';
import { CLIENT, type Client } from './client.schema.js';

const pickQuery = z.object({ q: z.string().trim().max(100).optional() });

const pick = (c: Client) => ({
    id: String(c._id),
    name: c.name,
    company: c.company,
    email: c.email,
    status: c.status,
    language: c.language,
    self: c.self ?? false,
});

// Just what New project needs: search clients to pick one, or create one
// inline as a lead. The Clients screens (M8, T8.3) grow this into the full
// list, record and edit.
@Controller('clients')
export class ClientsController {
    constructor(
        @InjectModel(CLIENT) private readonly clients: Model<Client>,
        private readonly activity: ActivityService,
    ) {}

    @Get()
    @Requires('view', 'clients')
    async list(@Query(new ZodPipe(pickQuery)) { q }: z.infer<typeof pickQuery>) {
        const rx = q ? new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i') : null;
        const filter = rx ? { $or: [{ name: rx }, { company: rx }, { email: rx }] } : {};
        const rows = await this.clients.find(filter).sort({ updatedAt: -1 }).limit(50).lean<Client[]>();
        return rows.map(pick);
    }

    /** First contact is a lead by definition; Clients owns promoting it. */
    @Post()
    @Requires('edit', 'clients')
    async create(@Body(new ZodPipe(clientCreate)) body: ClientCreate, @Req() req: AccessRequest) {
        const c = await this.clients.create({ ...body, company: body.company || body.name, status: 'lead' });
        const out = pick(c.toObject() as Client);
        await this.activity.record({
            kind: 'change',
            weight: 'notable',
            action: 'client.create',
            actor: req.member,
            section: 'clients',
            target: { type: 'client', id: out.id, label: out.company },
            after: out,
            sessionId: req.auth.sessionId,
        });
        return out;
    }
}
