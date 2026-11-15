import { createHash, randomBytes } from 'node:crypto';
import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import {
    BRIEF_AREAS,
    BRIEF_PARTS,
    PORTAL_TOKEN,
    type Language,
    type PortalAnswers,
    type PortalLinkIssued,
    type PortalLinkStatus,
    type PortalState,
    type PortalView,
} from '@repo/schemas';
import { isValidObjectId, type Model } from 'mongoose';
import type { AccessRequest } from '../access/access.guard.js';
import { ActivityService } from '../activity/activity.service.js';
import { BRIEF, type Brief } from '../briefs/brief.schema.js';
import type { Client } from '../clients/client.schema.js';
import { ContactsService } from '../clients/contacts.service.js';
import { studioDay } from '../common/day.js';
import type { Env } from '../env.js';
import { PROJECT, type Project } from '../projects/project.schema.js';
import { PORTAL_JOBS, type PortalJobs } from './portal-jobs.js';
import { PORTAL_LINK, type PortalLink } from './portal-link.schema.js';

type Owned = Omit<Project, 'client'> & { client: Client | null };

const iso = (d: Date | null | undefined) => (d ? d.toISOString() : null);
const hashOf = (token: string) => createHash('sha256').update(token).digest('hex');

/** The answers a brief holds, back under their prompt keys (the stored `q` is the prompt's English label). */
function answersOf(b: Brief | null): Record<string, string> {
    const out: Record<string, string> = {};
    for (const area of b?.areas ?? []) {
        for (const q of area.qs) {
            const part = BRIEF_PARTS.find((x) => x.area === area.key && x.label === q.q);
            if (part && q.a) out[part.key] = q.a;
        }
    }
    return out;
}

/**
 * The magic link and the questionnaire behind it. The link is the only
 * credential, so every way a request can go wrong (unknown token, old
 * link, archived or finished project, a client-less project) answers the
 * same 404: nothing to tell a guesser which of them it was.
 */
@Injectable()
export class PortalService {
    constructor(
        @InjectModel(PORTAL_LINK) private readonly links: Model<PortalLink>,
        @InjectModel(PROJECT) private readonly projects: Model<Project>,
        @InjectModel(BRIEF) private readonly briefs: Model<Brief>,
        private readonly activity: ActivityService,
        private readonly contacts: ContactsService,
        private readonly config: ConfigService<Env, true>,
        @Inject(PORTAL_JOBS) private readonly jobs: PortalJobs,
    ) {}

    /* ---------- the owner's side ---------- */

    async status(projectId: string): Promise<PortalLinkStatus> {
        await this.owned(projectId);
        return this.statusOf(await this.links.findOne({ project: projectId }).lean<PortalLink>());
    }

    /**
     * Issues a link, replacing any earlier one. The link is returned here
     * and nowhere else afterwards: only its hash is kept.
     */
    async issue(projectId: string, send: boolean, req: AccessRequest): Promise<PortalLinkIssued> {
        const p = await this.owned(projectId);
        if (!p.client || p.client.self) throw new NotFoundException({ error: 'not_found' });
        if (p.archivedAt || p.status === 'completed') throw new NotFoundException({ error: 'not_found' });

        const token = randomBytes(32).toString('base64url');
        const now = new Date();
        const link = await this.links
            .findOneAndUpdate({ project: projectId }, { $set: { hash: hashOf(token), issuedAt: now, emailedAt: send ? now : null, lastOpenDay: null } }, { upsert: true, returnDocument: 'after' })
            .lean<PortalLink>();
        const url = `${this.config.get('CLIENT_ORIGIN', { infer: true }).replace(/\/$/, '')}/p/${token}`;

        // The questionnaire is now with the client. A brief already answered stays as it is.
        const brief = await this.briefs.findOne({ project: projectId }).lean<Brief>();
        if (!brief || brief.state === 'none') {
            await this.briefs.updateOne({ project: projectId }, { $set: { state: 'awaiting', sentAt: now } }, { upsert: true });
        } else if (brief.state === 'awaiting') {
            await this.briefs.updateOne({ project: projectId }, { $set: { sentAt: now } });
        }

        if (send) await this.jobs.sendLink({ projectId, url });
        await this.contacts.add({
            client: p.client._id,
            project: p._id,
            kind: 'token',
            text: send ? 'Intake link emailed' : 'Intake link issued to copy',
            by: req.member ? String(req.member._id) : null,
        });
        await this.activity.record({
            kind: 'change',
            weight: 'notable',
            action: 'portal.issue',
            actor: req.member,
            section: 'projects',
            target: { type: 'project', id: projectId, label: p.name },
            after: { emailed: send },
            sessionId: req.auth.sessionId,
        });
        return { ...this.statusOf(link), url, sent: send };
    }

    /* ---------- the client's side ---------- */

    async view(token: string): Promise<PortalView> {
        const { link, p } = await this.resolve(token);
        const brief = await this.briefs.findOne({ project: p._id }).lean<Brief>();
        await this.noteOpen(link, p);
        return this.viewOf(p, brief);
    }

    /** Saves what is typed so far. A refresh, or another phone, picks up where it stopped. */
    async save(token: string, body: PortalAnswers): Promise<{ saved: true }> {
        const { p } = await this.resolve(token);
        const brief = await this.briefs.findOne({ project: p._id }).lean<Brief>();
        if (this.stateOf(brief) === 'done') throw new NotFoundException({ error: 'not_found' });
        const merged = new Map((brief?.draft ?? []).map((d) => [d.key, d.a ?? '']));
        for (const [k, a] of Object.entries(body.answers)) merged.set(k, a);
        const draft = [...merged].map(([key, a]) => ({ key, a }));
        await this.briefs.updateOne({ project: p._id }, { $set: { draft } }, { upsert: true });
        return { saved: true };
    }

    /**
     * The one submission. Conditional on the state it was read in, so a
     * double click or a second tab cannot submit twice. The owner's notes on
     * each area survive, as on a brief the owner writes.
     */
    async submit(token: string, body: PortalAnswers): Promise<PortalView> {
        const { p } = await this.resolve(token);
        const before = await this.briefs.findOne({ project: p._id }).lean<Brief>();
        if (this.stateOf(before) === 'done') throw new NotFoundException({ error: 'not_found' });

        const notes = new Map((before?.areas ?? []).map((a) => [a.key, a.note ?? null]));
        const areas = BRIEF_AREAS.map((a) => ({
            key: a.key,
            note: notes.get(a.key) ?? null,
            qs: a.parts.map((pt) => ({ q: pt.label, a: (body.answers[`${a.key}.${pt.key}`] ?? '').trim() })),
        }));
        const after = await this.briefs
            .findOneAndUpdate(
                { project: p._id, state: { $in: ['none', 'awaiting', 'sent_back'] } },
                { $set: { mine: false, state: 'submitted', submittedAt: new Date(), decidedAt: null, reason: null, reading: null, areas, draft: [] }, $inc: { revision: 1 } },
                { upsert: !before, returnDocument: 'after' },
            )
            .lean<Brief>();
        if (!after) throw new NotFoundException({ error: 'not_found' });

        if (p.client) await this.contacts.add({ client: p.client._id, project: p._id, kind: 'reply', text: 'Intake answers submitted', by: null });
        await this.activity.record({
            kind: 'change',
            weight: 'notable',
            action: 'portal.submit',
            section: 'projects',
            target: { type: 'project', id: String(p._id), label: p.name },
            before: { state: before?.state ?? 'none', revision: before?.revision ?? 0 },
            after: { state: 'submitted', revision: after.revision },
        });
        return this.viewOf(p, after);
    }

    /* ---------- internals ---------- */

    private stateOf(b: Brief | null): PortalState {
        return b?.state === 'submitted' || b?.state === 'approved' ? 'done' : b?.state === 'sent_back' ? 'sent_back' : 'open';
    }

    private viewOf(p: Owned, b: Brief | null): PortalView {
        const state = this.stateOf(b);
        const answers = state === 'done' ? {} : { ...answersOf(b), ...Object.fromEntries((b?.draft ?? []).map((d) => [d.key, d.a ?? ''])) };
        const c = p.client!;
        return { state, project: p.name, who: c.company || c.name, language: c.language as Language, reason: state === 'sent_back' ? (b?.reason ?? null) : null, answers };
    }

    private statusOf(l: PortalLink | null): PortalLinkStatus {
        return { live: !!l, issuedAt: iso(l?.issuedAt), emailedAt: iso(l?.emailedAt), lastOpen: l?.lastOpenDay ?? null };
    }

    /** The first open of each studio day is logged; a refresh or a second phone is not. */
    private async noteOpen(link: PortalLink, p: Owned) {
        const day = studioDay();
        const first = await this.links.findOneAndUpdate({ _id: link._id, lastOpenDay: { $ne: day } }, { $set: { lastOpenDay: day } });
        if (!first) return;
        await this.activity.record({ kind: 'view', weight: 'routine', action: 'portal.open', section: 'projects', target: { type: 'project', id: String(p._id), label: p.name } });
    }

    private async resolve(token: string): Promise<{ link: PortalLink; p: Owned }> {
        const gone = new NotFoundException({ error: 'not_found' });
        if (!PORTAL_TOKEN.test(token)) throw gone;
        const link = await this.links.findOne({ hash: hashOf(token) }).lean<PortalLink>();
        if (!link) throw gone;
        const p = await this.projects.findById(link.project).populate('client').lean<Owned>();
        if (!p || !p.client || p.client.self || p.archivedAt || p.status === 'completed') throw gone;
        return { link, p };
    }

    private async owned(id: string): Promise<Owned> {
        if (!isValidObjectId(id)) throw new NotFoundException({ error: 'not_found' });
        const p = await this.projects.findById(id).populate('client').lean<Owned>();
        if (!p) throw new NotFoundException({ error: 'not_found' });
        return p;
    }
}
