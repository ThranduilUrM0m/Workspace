import {
    ConflictException,
    Injectable,
    NotFoundException,
    UnprocessableEntityException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import type { ClientNew, ClientRow, ContactCreate, ContactView } from '@repo/schemas';
import { isValidObjectId, type Model, type Types } from 'mongoose';
import type { AccessRequest } from '../access/access.guard.js';
import { ActivityService } from '../activity/activity.service.js';
import { studioDay } from '../common/day.js';
import { PROJECT, type Project } from '../projects/project.schema.js';
import { CLIENT, type Client } from './client.schema.js';
import { ContactsService } from './contacts.service.js';

const escape = (q: string) => q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// The Clients screens' reads and writes. Sends facts, never verdicts: who
// needs you, standing and silence are derived on screen from these rows.
@Injectable()
export class ClientsService {
    constructor(
        @InjectModel(CLIENT) private readonly clients: Model<Client>,
        @InjectModel(PROJECT) private readonly projects: Model<Project>,
        private readonly contacts: ContactsService,
        private readonly activity: ActivityService,
    ) {}

    /** Everyone, or a search (the pickers type into it, so it stays capped at 50). */
    async list(q?: string): Promise<ClientRow[]> {
        const rx = q ? new RegExp(escape(q), 'i') : null;
        const query = this.clients
            .find(rx ? { $or: [{ name: rx }, { company: rx }, { email: rx }] } : {})
            .sort({ updatedAt: -1 });
        if (rx) query.limit(50);
        return this.rows(await query.lean<Client[]>());
    }

    async get(id: string): Promise<ClientRow> {
        const [row] = await this.rows([await this.find(id)]);
        return row;
    }

    /** New client (and New project's / Log an enquiry's inline create). First contact is a lead unless you say otherwise. */
    async create(body: ClientNew, req: AccessRequest): Promise<ClientRow> {
        // One client per address: a second record for the same person splits
        // their history in two. The form offers the existing one instead.
        const clash = await this.clients.findOne({ email: body.email }).lean<Client>();
        if (clash) {
            const [client] = await this.rows([clash]);
            throw new ConflictException({ error: 'invalid', fields: { email: 'taken' }, client });
        }
        const { firstEntry, ...fields } = body;
        const c = await this.clients.create({
            ...fields,
            company: body.company || body.name,
            status: body.status ?? 'lead',
        });
        // Your words about how they got in touch: a note, so it does not start the reply clock.
        if (firstEntry)
            await this.contacts.add({
                client: c._id,
                kind: 'note',
                text: firstEntry,
                by: req.member ? String(req.member._id) : null,
            });
        const [out] = await this.rows([c.toObject() as Client]);
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

    async history(id: string): Promise<ContactView[]> {
        const c = await this.find(id);
        return this.contacts.list(c._id);
    }

    /** Log contact. A day in the future is refused; a project must be theirs. */
    async logContact(id: string, body: ContactCreate, req: AccessRequest): Promise<ContactView[]> {
        const c = await this.find(id);
        const today = studioDay();
        if (body.at && body.at > today)
            throw new UnprocessableEntityException({ error: 'invalid', fields: { at: 'future' } });
        if (body.projectId && !(await this.projects.exists({ _id: body.projectId, client: c._id })))
            throw new UnprocessableEntityException({
                error: 'invalid',
                fields: { projectId: 'unknown' },
            });
        const entry = await this.contacts.add({
            client: c._id,
            kind: body.kind,
            text: body.text,
            at: body.at ?? today,
            project: body.projectId ?? null,
            by: req.member ? String(req.member._id) : null,
        });
        await this.activity.record({
            kind: 'change',
            weight: 'notable',
            action: 'contact.log',
            actor: req.member,
            section: 'clients',
            target: { type: 'client', id: String(c._id), label: c.company },
            after: { kind: entry.kind, at: entry.at, text: entry.text },
            sessionId: req.auth.sessionId,
        });
        return this.contacts.list(c._id);
    }

    private async find(id: string): Promise<Client> {
        if (!isValidObjectId(id)) throw new NotFoundException({ error: 'not_found' });
        const c = await this.clients.findById(id).lean<Client>();
        if (!c) throw new NotFoundException({ error: 'not_found' });
        return c;
    }

    /** Clients plus their projects and contact facts, in two extra queries however many rows. */
    private async rows(cs: Client[]): Promise<ClientRow[]> {
        if (!cs.length) return [];
        const ids = cs.map((c) => c._id as Types.ObjectId);
        const [projects, facts] = await Promise.all([
            this.projects
                .find({ client: { $in: ids }, archivedAt: null })
                .select('name status client')
                .sort({ name: 1 })
                .lean<Pick<Project, '_id' | 'name' | 'status' | 'client'>[]>(),
            this.contacts.facts(ids),
        ]);
        return cs.map((c) => {
            const id = String(c._id);
            const f = facts.get(id) ?? ContactsService.none;
            return {
                id,
                name: c.name,
                company: c.company,
                email: c.email,
                status: c.status,
                language: c.language,
                self: c.self ?? false,
                phone: c.phone ?? null,
                website: c.website ?? null,
                since: studioDay(c.createdAt),
                projects: projects
                    .filter((p) => String(p.client) === id)
                    .map((p) => ({ id: String(p._id), name: p.name, status: p.status })),
                ...f,
            };
        });
    }
}
