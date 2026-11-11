import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { BRIEF_AREAS, type BriefAreaKey, type BriefNote, type BriefSendBack, type BriefState, type BriefView, type BriefWrite } from '@repo/schemas';
import { isValidObjectId, type Model } from 'mongoose';
import type { AccessRequest } from '../access/access.guard.js';
import { ActivityService } from '../activity/activity.service.js';
import type { Client } from '../clients/client.schema.js';
import { PROJECT, type Project } from '../projects/project.schema.js';
import { BRIEF, type Brief } from './brief.schema.js';

type Owned = Omit<Project, 'client'> & { client: Client | null };

const iso = (d: Date | null | undefined) => (d ? d.toISOString() : null);

function view(projectId: string, b: Brief | null): BriefView {
    if (!b) return { projectId, state: 'none', mine: false, seed: null, sentAt: null, submittedAt: null, decidedAt: null, reason: null, revision: 0, reading: null, areas: [] };
    return {
        projectId,
        state: b.state as BriefState,
        mine: b.mine ?? false,
        seed: b.seed ?? null,
        sentAt: iso(b.sentAt),
        submittedAt: iso(b.submittedAt),
        decidedAt: iso(b.decidedAt),
        reason: b.reason ?? null,
        revision: b.revision ?? 0,
        reading: b.reading ? { summary: b.reading.summary, risks: [...b.reading.risks], assumptions: [...b.reading.assumptions] } : null,
        areas: b.areas.map((a) => ({ key: a.key as BriefAreaKey, qs: a.qs.map((x) => ({ q: x.q, a: x.a ?? '' })), note: a.note ?? null })),
    };
}

/**
 * The brief's rulings. Every transition is checked against the state it
 * comes from (409 otherwise), because two tabs open on one brief must not
 * both approve it, and a ruling on a brief that changed under you is not
 * the ruling you meant.
 */
@Injectable()
export class BriefsService {
    constructor(
        @InjectModel(BRIEF) private readonly briefs: Model<Brief>,
        @InjectModel(PROJECT) private readonly projects: Model<Project>,
        private readonly activity: ActivityService,
    ) {}

    async get(projectId: string): Promise<BriefView> {
        await this.project(projectId);
        return view(projectId, await this.briefs.findOne({ project: projectId }).lean<Brief>());
    }

    /**
     * The owner writes it. Only where there is nobody to ask: an idea with
     * no client, or the studio's own work. A client's brief is theirs to
     * answer; offering to write it for them reads as giving up on them.
     */
    async write(projectId: string, body: BriefWrite, req: AccessRequest): Promise<BriefView> {
        const p = await this.project(projectId);
        if (p.client && !p.client.self) throw new ConflictException({ error: 'conflict', reason: 'client_answers' });
        const before = await this.briefs.findOne({ project: projectId }).lean<Brief>();
        if (before?.state === 'approved') throw new ConflictException({ error: 'conflict', reason: 'approved' });

        // Notes survive a rewrite: they are about the area, not one wording of it.
        const notes = new Map((before?.areas ?? []).map((a) => [a.key, a.note ?? null]));
        const areas = BRIEF_AREAS.map((a) => ({
            key: a.key,
            note: notes.get(a.key) ?? null,
            qs: a.parts.map((pt) => ({ q: pt.label, a: (body.answers[`${a.key}.${pt.key}`] ?? '').trim() })),
        }));
        const after = await this.briefs
            .findOneAndUpdate(
                { project: projectId },
                {
                    $set: { mine: true, state: 'submitted', submittedAt: new Date(), decidedAt: null, reason: null, reading: null, areas },
                    $inc: { revision: before?.state === 'submitted' ? 0 : 1 },
                },
                { upsert: true, new: true },
            )
            .lean<Brief>();
        return this.done(req, 'brief.write', p, before, after);
    }

    /** Approving with gaps is normal: you plan around what you got. An intake-pending project moves to Planning. */
    async approve(projectId: string, req: AccessRequest): Promise<BriefView> {
        const p = await this.project(projectId);
        const { before, after } = await this.move(projectId, ['submitted'], { state: 'approved', decidedAt: new Date() });
        if (p.status === 'intake_pending') await this.projects.updateOne({ _id: projectId }, { $set: { status: 'planning' } });
        return this.done(req, 'brief.approve', p, before, after);
    }

    /** A brief you disagree with, never a thin one. Your own writing has nobody to go back to. */
    async sendBack(projectId: string, body: BriefSendBack, req: AccessRequest): Promise<BriefView> {
        const p = await this.project(projectId);
        const current = await this.briefs.findOne({ project: projectId }).lean<Brief>();
        if (current?.mine) throw new ConflictException({ error: 'conflict', reason: 'mine' });
        const { before, after } = await this.move(projectId, ['submitted'], { state: 'sent_back', reason: body.reason, decidedAt: new Date() });
        return this.done(req, 'brief.send_back', p, before, after);
    }

    /** Undo of a ruling: back to submitted, the reason cleared. */
    async reopen(projectId: string, req: AccessRequest): Promise<BriefView> {
        const p = await this.project(projectId);
        const { before, after } = await this.move(projectId, ['approved', 'sent_back'], { state: 'submitted', reason: null, decidedAt: null });
        return this.done(req, 'brief.reopen', p, before, after);
    }

    async note(projectId: string, area: string, body: BriefNote, req: AccessRequest): Promise<BriefView> {
        const p = await this.project(projectId);
        const before = await this.briefs.findOne({ project: projectId }).lean<Brief>();
        if (!before || !before.areas.some((a) => a.key === area)) throw new NotFoundException({ error: 'not_found' });
        const onArea: Record<string, unknown> = { project: projectId, 'areas.key': area };
        const after = await this.briefs.findOneAndUpdate(onArea, { $set: { 'areas.$.note': body.note || null } }, { new: true }).lean<Brief>();
        return this.done(req, 'brief.note', p, before, after);
    }

    private async move(projectId: string, from: BriefState[], set: Record<string, unknown>) {
        const before = await this.briefs.findOne({ project: projectId }).lean<Brief>();
        // Conditional on the state it was read in: a second click, or a second tab, gets a 409.
        const after = await this.briefs.findOneAndUpdate({ project: projectId, state: { $in: from } }, { $set: set }, { new: true }).lean<Brief>();
        if (!after) throw new ConflictException({ error: 'conflict', reason: 'state', state: before?.state ?? 'none' });
        return { before, after };
    }

    private async project(id: string): Promise<Owned> {
        if (!isValidObjectId(id)) throw new NotFoundException({ error: 'not_found' });
        const p = await this.projects.findById(id).populate('client').lean<Owned>();
        if (!p) throw new NotFoundException({ error: 'not_found' });
        return p;
    }

    private async done(req: AccessRequest, action: string, p: Owned, before: Brief | null, after: Brief | null): Promise<BriefView> {
        const id = String(p._id);
        const b = view(id, before);
        const a = view(id, after);
        await this.activity.record({
            kind: 'change',
            weight: 'notable',
            action,
            actor: req.member,
            section: 'projects',
            target: { type: 'project', id, label: p.name },
            before: { state: b.state, revision: b.revision },
            after: { state: a.state, revision: a.revision },
            sessionId: req.auth.sessionId,
        });
        return a;
    }
}
