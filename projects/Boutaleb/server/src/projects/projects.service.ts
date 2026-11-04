import { ConflictException, Injectable, NotFoundException, UnprocessableEntityException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { slugify, type ProjectCreate, type ProjectListQuery, type ProjectUpdate } from '@repo/schemas';
import { isValidObjectId, type QueryFilter, type Model } from 'mongoose';
import type { AccessRequest } from '../access/access.guard.js';
import { ActivityService } from '../activity/activity.service.js';
import { CLIENT, clientSummary, type Client } from '../clients/client.schema.js';
import { PROJECT, type Project } from './project.schema.js';

type Populated = Omit<Project, 'client'> & { client: Client | null };

/** The project as every screen reads it. */
export function view(p: Populated) {
    return {
        id: String(p._id),
        name: p.name,
        slug: p.slug,
        status: p.status,
        client: p.client ? clientSummary(p.client) : null,
        internal: p.client?.self ?? false,
        governingLanguage: p.governingLanguage,
        note: p.note ?? null,
        currency: p.currency,
        modules: p.modules,
        assetOwnership: p.assetOwnership.map((a) => ({
            asset: a.asset,
            holder: a.holder,
            renews: a.renews ? a.renews.toISOString().slice(0, 10) : null,
            transfer: a.transfer,
        })),
        archivedAt: p.archivedAt?.toISOString() ?? null,
        createdAt: (p as unknown as { createdAt: Date }).createdAt.toISOString(),
        updatedAt: (p as unknown as { updatedAt: Date }).updatedAt.toISOString(),
    };
}
export type ProjectView = ReturnType<typeof view>;

const escape = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

@Injectable()
export class ProjectsService {
    constructor(
        @InjectModel(PROJECT) private readonly projects: Model<Project>,
        @InjectModel(CLIENT) private readonly clients: Model<Client>,
        private readonly activity: ActivityService,
    ) {}

    async list(q: ProjectListQuery): Promise<ProjectView[]> {
        const filter: QueryFilter<Project> = { archivedAt: q.archived ? { $ne: null } : null };
        if (q.status) filter.status = q.status;
        if (q.clientId) filter.client = q.clientId;
        if (q.q) {
            const rx = new RegExp(escape(q.q), 'i');
            filter.$or = [{ name: rx }, { slug: rx }];
        }
        const rows = await this.projects.find(filter).sort({ updatedAt: -1 }).limit(500).populate('client').lean<Populated[]>();
        return rows.map(view);
    }

    async get(id: string): Promise<ProjectView> {
        return view(await this.find(id));
    }

    async create(input: ProjectCreate, req: AccessRequest): Promise<ProjectView> {
        if (input.clientId) await this.mustExist(input.clientId);
        const slug = input.slug ?? (await this.freeSlug(slugify(input.name) || 'project'));
        if (input.slug && (await this.projects.exists({ slug }))) throw this.slugTaken();
        let doc;
        try {
            doc = await this.projects.create({
                name: input.name,
                slug,
                client: input.clientId,
                status: input.clientId ? 'intake_pending' : 'idea',
                governingLanguage: input.governingLanguage,
                note: input.note || undefined,
                currency: input.currency,
            });
        } catch (err) {
            if ((err as { code?: number }).code === 11000) throw this.slugTaken();
            throw err;
        }
        const created = await this.find(String(doc._id));
        await this.log(req, 'project.create', created, undefined, view(created));
        return view(created);
    }

    async update(id: string, patch: ProjectUpdate, req: AccessRequest): Promise<ProjectView> {
        const before = await this.find(id);
        if (patch.clientId) await this.mustExist(patch.clientId);

        const clientAfter = patch.clientId !== undefined ? patch.clientId : before.client ? String(before.client._id) : null;
        const statusAfter = patch.status ?? before.status;
        // Only an idea may have no client: intake, a brief and money all need someone to send them to.
        if (!clientAfter && statusAfter !== 'idea') throw new UnprocessableEntityException({ error: 'invalid', fields: { clientId: 'required' } });

        if (patch.slug && patch.slug !== before.slug && (await this.projects.exists({ slug: patch.slug }))) throw this.slugTaken();

        const { clientId, assetOwnership, ...rest } = patch;
        const set: Record<string, unknown> = { ...rest };
        if (clientId !== undefined) set.client = clientId;
        if (assetOwnership) set.assetOwnership = assetOwnership.map((a) => ({ ...a, renews: a.renews ? new Date(a.renews) : null }));

        try {
            await this.projects.updateOne({ _id: id }, { $set: set });
        } catch (err) {
            if ((err as { code?: number }).code === 11000) throw this.slugTaken();
            throw err;
        }
        const after = await this.find(id);
        await this.log(req, 'project.update', after, view(before), view(after));
        return view(after);
    }

    /** Archive and restore are each other's undo; neither loses anything. */
    async setArchived(id: string, archived: boolean, req: AccessRequest): Promise<ProjectView> {
        const before = await this.find(id);
        if (Boolean(before.archivedAt) === archived) return view(before);
        await this.projects.updateOne({ _id: id }, { $set: { archivedAt: archived ? new Date() : null } });
        const after = await this.find(id);
        await this.log(req, archived ? 'project.archive' : 'project.restore', after, view(before), view(after));
        return view(after);
    }

    private async find(id: string): Promise<Populated> {
        if (!isValidObjectId(id)) throw new NotFoundException({ error: 'not_found' });
        const p = await this.projects.findById(id).populate('client').lean<Populated>();
        if (!p) throw new NotFoundException({ error: 'not_found' });
        return p;
    }

    private async mustExist(clientId: string) {
        if (!(await this.clients.exists({ _id: clientId }))) throw new UnprocessableEntityException({ error: 'invalid', fields: { clientId: 'unknown' } });
    }

    /** The derived slug bumps on collision (-2, -3…); a typed one is refused instead. */
    private async freeSlug(base: string): Promise<string> {
        const rx = new RegExp(`^${escape(base)}(?:-(\\d+))?$`);
        const taken = new Set((await this.projects.find({ slug: rx }, { slug: 1 }).lean()).map((p) => p.slug));
        if (!taken.has(base)) return base;
        let n = 2;
        while (taken.has(`${base}-${n}`)) n++;
        return `${base}-${n}`;
    }

    private slugTaken() {
        return new ConflictException({ error: 'invalid', fields: { slug: 'taken' } });
    }

    private log(req: AccessRequest, action: string, p: Populated, before: unknown, after: unknown) {
        return this.activity.record({
            kind: 'change',
            weight: 'notable',
            action,
            actor: req.member,
            section: 'projects',
            target: { type: 'project', id: String(p._id), label: p.name },
            before,
            after,
            sessionId: req.auth.sessionId,
        });
    }
}
