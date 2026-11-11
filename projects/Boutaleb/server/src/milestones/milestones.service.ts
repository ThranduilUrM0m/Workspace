import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import type { MilestoneCreate, MilestoneMove, MilestoneUpdate, MilestoneView } from '@repo/schemas';
import { isValidObjectId, type Model } from 'mongoose';
import type { AccessRequest } from '../access/access.guard.js';
import { ActivityService } from '../activity/activity.service.js';
import { BRIEF, type Brief } from '../briefs/brief.schema.js';
import { PROJECT, type Project } from '../projects/project.schema.js';
import { MILESTONE, type Milestone } from './milestone.schema.js';

const view = (m: Milestone): MilestoneView => ({
    id: String(m._id),
    projectId: String(m.project),
    name: m.name,
    due: m.due ?? null,
    done: m.done ?? false,
    order: m.order,
});

/**
 * The plan's phases. The gate is real but partial, as on the screen: the
 * FIRST phase needs an approved brief (a plan drawn against a brief nobody
 * approved is drawn against an argument not had yet), but phases that
 * already exist stay editable whatever the brief does next, because work
 * that exists is never hidden to enforce an order.
 */
@Injectable()
export class MilestonesService {
    constructor(
        @InjectModel(MILESTONE) private readonly milestones: Model<Milestone>,
        @InjectModel(PROJECT) private readonly projects: Model<Project>,
        @InjectModel(BRIEF) private readonly briefs: Model<Brief>,
        private readonly activity: ActivityService,
    ) {}

    async list(projectId: string): Promise<MilestoneView[]> {
        await this.project(projectId);
        return (await this.rows(projectId)).map(view);
    }

    async create(projectId: string, body: MilestoneCreate, req: AccessRequest): Promise<MilestoneView[]> {
        const p = await this.project(projectId);
        const rows = await this.rows(projectId);
        if (!rows.length && !(await this.briefs.exists({ project: projectId, state: 'approved' }))) {
            throw new ConflictException({ error: 'conflict', reason: 'brief_not_approved' });
        }
        const order = rows.length ? Math.max(...rows.map((r) => r.order)) + 1 : 0;
        const m = await this.milestones.create({ project: projectId, name: body.name, due: body.due, order });
        await this.log(req, 'milestone.create', p, null, view(m.toObject() as Milestone));
        return this.list(projectId);
    }

    async update(projectId: string, id: string, patch: MilestoneUpdate, req: AccessRequest): Promise<MilestoneView[]> {
        const p = await this.project(projectId);
        const before = await this.one(projectId, id);
        const after = await this.milestones.findByIdAndUpdate(id, { $set: patch }, { new: true }).lean<Milestone>();
        await this.log(req, patch.done === undefined ? 'milestone.update' : patch.done ? 'milestone.done' : 'milestone.reopen', p, view(before), after && view(after));
        return this.list(projectId);
    }

    async remove(projectId: string, id: string, req: AccessRequest): Promise<MilestoneView[]> {
        const p = await this.project(projectId);
        const before = await this.one(projectId, id);
        await this.milestones.deleteOne({ _id: id });
        await this.log(req, 'milestone.remove', p, view(before), null);
        return this.list(projectId);
    }

    /** Swap with the neighbour. At either end it is a no-op, not an error: the button is disabled there anyway. */
    async move(projectId: string, id: string, body: MilestoneMove, req: AccessRequest): Promise<MilestoneView[]> {
        const p = await this.project(projectId);
        const rows = await this.rows(projectId);
        const at = rows.findIndex((r) => String(r._id) === id);
        if (at < 0) throw new NotFoundException({ error: 'not_found' });
        const other = rows[at + (body.direction === 'up' ? -1 : 1)];
        if (!other) return rows.map(view);
        const me = rows[at]!;
        await this.milestones.bulkWrite([
            { updateOne: { filter: { _id: me._id }, update: { $set: { order: other.order } } } },
            { updateOne: { filter: { _id: other._id }, update: { $set: { order: me.order } } } },
        ]);
        await this.log(req, 'milestone.move', p, { order: me.order }, { order: other.order });
        return this.list(projectId);
    }

    private rows(projectId: string) {
        return this.milestones.find({ project: projectId }).sort({ order: 1 }).lean<Milestone[]>();
    }

    private async one(projectId: string, id: string): Promise<Milestone> {
        if (!isValidObjectId(id)) throw new NotFoundException({ error: 'not_found' });
        const m = await this.milestones.findOne({ _id: id, project: projectId }).lean<Milestone>();
        if (!m) throw new NotFoundException({ error: 'not_found' });
        return m;
    }

    private async project(id: string): Promise<Project> {
        if (!isValidObjectId(id)) throw new NotFoundException({ error: 'not_found' });
        const p = await this.projects.findById(id).lean<Project>();
        if (!p) throw new NotFoundException({ error: 'not_found' });
        return p;
    }

    private log(req: AccessRequest, action: string, p: Project, before: unknown, after: unknown) {
        return this.activity.record({
            kind: 'change',
            weight: 'routine',
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
