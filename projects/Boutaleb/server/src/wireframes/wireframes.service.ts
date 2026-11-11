import { BadRequestException, ConflictException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import type { RoundStart, RoundVerdict, RoundView, RoundViewLink, UploadCommit, UploadStart, UploadTicket } from '@repo/schemas';
import mime from 'mime';
import { isValidObjectId, Types, type Model } from 'mongoose';
import type { AccessRequest } from '../access/access.guard.js';
import { ActivityService } from '../activity/activity.service.js';
import type { Env } from '../env.js';
import { MILESTONE, type Milestone } from '../milestones/milestone.schema.js';
import { PROJECT, type Project } from '../projects/project.schema.js';
import { OBJECT_STORE, type ObjectStore } from '../storage/object-store.js';
import { Signer } from '../storage/signer.js';
import { isPage, nameFromFile, pageOrder, titleOf } from './pages.js';
import { WIREFRAME_ROUND, type WireframeRound } from './wireframe-round.schema.js';

const day = (d: Date | null | undefined) => (d ? d.toISOString() : null);

const view = (r: WireframeRound): RoundView => ({
    id: String(r._id),
    projectId: String(r.project),
    v: r.v,
    state: r.state,
    note: r.note ?? null,
    sourceName: r.sourceName ?? null,
    frozen: !!r.bundleKey,
    sentAt: day(r.sentAt),
    decidedAt: day(r.decidedAt),
    pages: r.pages.map((p) => ({ name: p.name, file: p.file, snap: p.snapKey ?? null })),
    comments: r.comments.map((c) => ({ page: c.page ?? null, at: c.at.toISOString(), body: c.body })),
});

/** A round's pages open for an hour: long enough to review, short enough that a forwarded link goes quiet. */
const VIEW_TTL_SECONDS = 3600;

/**
 * Wireframe rounds. A round is a decision, not a file: what was sent, when,
 * and what came back. Append-only once sent. The gate is partial, as on the
 * plan: the FIRST round needs a plan (at least one phase), but rounds that
 * exist are always shown and always workable.
 *
 * Storage layout: a working folder is uploaded to wf/<project>/work/<upload>/,
 * a fresh prefix per upload, so a failed upload never damages the folder
 * already in place; commit points the round at it. Sending copies it to
 * wf/<project>/r<v>/, which is never written again.
 */
@Injectable()
export class WireframesService {
    private readonly publicUrl: string;

    constructor(
        @InjectModel(WIREFRAME_ROUND) private readonly rounds: Model<WireframeRound>,
        @InjectModel(PROJECT) private readonly projects: Model<Project>,
        @InjectModel(MILESTONE) private readonly milestones: Model<Milestone>,
        @Inject(OBJECT_STORE) private readonly store: ObjectStore,
        private readonly signer: Signer,
        private readonly activity: ActivityService,
        config: ConfigService<Env, true>,
    ) {
        this.publicUrl = config.get('PUBLIC_API_URL', { infer: true });
    }

    async list(projectId: string): Promise<RoundView[]> {
        await this.project(projectId);
        return (await this.rounds.find({ project: projectId }).sort({ v: -1 }).lean<WireframeRound[]>()).map(view);
    }

    /**
     * Round one, or the next round. The next inherits the pages and the
     * working folder and nothing else: carrying the comments forward would
     * make them look said about a drawing that did not exist yet.
     */
    async start(projectId: string, body: RoundStart, req: AccessRequest): Promise<RoundView[]> {
        const p = await this.project(projectId);
        const live = await this.rounds.findOne({ project: projectId }).sort({ v: -1 }).lean<WireframeRound>();
        if (!live && !(await this.milestones.exists({ project: projectId }))) this.conflict('plan_missing');
        if (live && (live.state === 'draft' || live.state === 'sent')) this.conflict('round_open');
        const r = await this.rounds.create({
            project: projectId,
            v: (live?.v ?? 0) + 1,
            note: body.note,
            sourceKey: live?.sourceKey ?? null,
            sourceName: live?.sourceName ?? null,
            pages: live?.pages.map((pg) => ({ name: pg.name, file: pg.file, snapKey: null })) ?? [],
        });
        await this.log(req, 'wireframe.start', p, null, { v: r.v });
        return this.list(projectId);
    }

    /** One pre-signed PUT per file, into a prefix no other upload uses. */
    async uploadStart(projectId: string, v: number, body: UploadStart): Promise<UploadTicket> {
        await this.project(projectId);
        await this.draft(projectId, v);
        const uploadId = new Types.ObjectId().toHexString();
        const prefix = this.workPrefix(projectId, uploadId);
        const files = await Promise.all(
            body.files.map(async (f) => ({ path: f.path, ...(await this.store.presignPut(prefix + f.path, mime.getType(f.path) ?? 'application/octet-stream', f.size)) })),
        );
        return { uploadId, files };
    }

    /** The upload is done: point the round at it and read the pages out of it. */
    async uploadCommit(projectId: string, v: number, body: UploadCommit, req: AccessRequest): Promise<RoundView[]> {
        const p = await this.project(projectId);
        const r = await this.draft(projectId, v);
        const prefix = this.workPrefix(projectId, body.uploadId);
        const files = (await this.store.list(prefix)).map((k) => k.slice(prefix.length));
        const pageFiles = files.filter(isPage).sort(pageOrder);
        if (!pageFiles.length) this.conflict('no_pages');
        const pages = await Promise.all(
            pageFiles.map(async (file) => {
                const html = (await this.store.get(prefix + file))?.toString('utf8') ?? '';
                return { name: titleOf(html) ?? nameFromFile(file), file, snapKey: null };
            }),
        );
        await this.rounds.updateOne({ _id: r._id, state: 'draft' }, { $set: { sourceKey: prefix, sourceName: body.name, pages } });
        await this.log(req, 'wireframe.upload', p, { pages: r.pages.map((x) => x.file) }, { pages: pageFiles, files: files.length });
        return this.list(projectId);
    }

    /**
     * THE FREEZE. The round is claimed as sent first (so two clicks cannot
     * both copy), then the working folder is copied to its own prefix. If
     * the copy fails the claim is undone and nothing has changed.
     */
    async send(projectId: string, v: number, req: AccessRequest): Promise<RoundView[]> {
        const p = await this.project(projectId);
        const r = await this.draft(projectId, v);
        if (!p.client) this.conflict('no_client');
        if (!r.sourceKey || !r.pages.length) this.conflict('no_pages');
        const bundleKey = `wf/${projectId}/r${v}/`;
        const claimed = await this.rounds.updateOne({ _id: r._id, state: 'draft' }, { $set: { state: 'sent', sentAt: new Date(), bundleKey } });
        if (!claimed.modifiedCount) this.conflict('not_draft');
        try {
            if (!(await this.store.copyPrefix(r.sourceKey!, bundleKey))) throw new Error('empty source');
        } catch (e) {
            await this.rounds.updateOne({ _id: r._id }, { $set: { state: 'draft', sentAt: null, bundleKey: null } });
            throw e;
        }
        await this.log(req, 'wireframe.send', p, { state: 'draft' }, { state: 'sent', v, pages: r.pages.length });
        return this.list(projectId);
    }

    /** Their verdict on the round with them. Recorded once; a round that came back is a record. */
    async verdict(projectId: string, v: number, body: RoundVerdict, req: AccessRequest): Promise<RoundView[]> {
        const p = await this.project(projectId);
        const r = await this.round(projectId, v);
        if (r.state !== 'sent') this.conflict('not_sent');
        if (body.page !== null && !r.pages.some((pg) => pg.name === body.page)) throw new BadRequestException({ error: 'invalid', fields: { page: 'unknown' } });
        const now = new Date();
        const comments = body.body ? [{ page: body.page, at: now, body: body.body }] : [];
        const done = await this.rounds.updateOne(
            { _id: r._id, state: 'sent' },
            { $set: { state: body.verdict, decidedAt: now }, $push: { comments: { $each: comments } } },
        );
        if (!done.modifiedCount) this.conflict('not_sent');
        await this.log(req, `wireframe.${body.verdict}`, p, { state: 'sent' }, { state: body.verdict, v, said: body.body || null });
        return this.list(projectId);
    }

    /** An address that serves the round's files: the frozen copy once sent, the working folder before. */
    async viewLink(projectId: string, v: number): Promise<RoundViewLink> {
        await this.project(projectId);
        const r = await this.round(projectId, v);
        const prefix = r.bundleKey ?? r.sourceKey;
        if (!prefix) this.conflict('no_pages');
        const token = this.signer.sign({ wf: prefix }, VIEW_TTL_SECONDS);
        return { base: `${this.publicUrl}/wireframes/view/${token}/`, expires: new Date(Date.now() + VIEW_TTL_SECONDS * 1000).toISOString() };
    }

    private workPrefix(projectId: string, uploadId: string) {
        return `wf/${projectId}/work/${uploadId}/`;
    }

    private async draft(projectId: string, v: number): Promise<WireframeRound> {
        const r = await this.round(projectId, v);
        if (r.state !== 'draft') this.conflict('not_draft');
        return r;
    }

    private async round(projectId: string, v: number): Promise<WireframeRound> {
        const r = Number.isInteger(v) && v > 0 ? await this.rounds.findOne({ project: projectId, v }).lean<WireframeRound>() : null;
        if (!r) throw new NotFoundException({ error: 'not_found' });
        return r;
    }

    private async project(id: string): Promise<Project> {
        if (!isValidObjectId(id)) throw new NotFoundException({ error: 'not_found' });
        const p = await this.projects.findById(id).lean<Project>();
        if (!p) throw new NotFoundException({ error: 'not_found' });
        return p;
    }

    private conflict(reason: string): never {
        throw new ConflictException({ error: 'conflict', reason });
    }

    private log(req: AccessRequest, action: string, p: Project, before: unknown, after: unknown) {
        return this.activity.record({
            kind: 'change',
            weight: action === 'wireframe.approved' || action === 'wireframe.send' ? 'notable' : 'routine',
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
