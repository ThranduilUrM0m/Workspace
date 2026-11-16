import { createHash, randomBytes } from 'node:crypto';
import { ConflictException, Inject, Injectable, Logger, NotFoundException } from '@nestjs/common';
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
import { CLIENT, type Client } from '../clients/client.schema.js';
import { ContactsService } from '../clients/contacts.service.js';
import { studioDay } from '../common/day.js';
import type { Env } from '../env.js';
import { PROJECT, type Project } from '../projects/project.schema.js';
import { PORTAL_JOBS, type PortalJobs, type PortalLinkPayload } from './portal-jobs.js';
import { PORTAL_LINK, type PortalLink } from './portal-link.schema.js';
import { PORTAL_RESEND, RESEND_WINDOW_MS, type PortalResend } from './portal-resend.schema.js';

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
        @InjectModel(CLIENT) private readonly clients: Model<Client>,
        @InjectModel(PORTAL_RESEND) private readonly resends: Model<PortalResend>,
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

        const { link, url } = await this.mint(projectId, send);

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

    /* ---------- "email me my access link" (T8.5) ---------- */

    /**
     * A visitor with no working link gives an email address. If a client has
     * it and a project of theirs is still waiting on its brief, each such
     * project gets a new link and one email per client lists them. The link
     * the owner sent keeps working (see portal-link.schema.ts: the new link
     * goes in the second slot). At most one send per address per 24 hours.
     *
     * `request` starts this and returns at once, before any database read:
     * the answer takes the same time whether the address is a client's or
     * not, so the response time cannot tell a guesser which addresses are
     * clients (the words were already the same; the timing was not).
     */
    request(email: string): void {
        const run = this.resend(email)
            .catch((e: unknown) => this.log.error(`resend failed: ${e instanceof Error ? e.message : String(e)}`))
            .finally(() => this.inflight.delete(run));
        this.inflight.add(run);
    }

    /** Tests only: wait for every resend started by `request` to finish. */
    async settled(): Promise<void> {
        await Promise.allSettled([...this.inflight]);
    }

    private readonly inflight = new Set<Promise<unknown>>();
    private readonly log = new Logger('Portal');

    private async resend(email: string): Promise<void> {
        const clients = await this.clients.find({ email, self: { $ne: true } }).lean<Client[]>();
        if (!clients.length) return;

        const projects = await this.projects
            .find({ client: { $in: clients.map((c) => c._id) }, archivedAt: null, status: { $ne: 'completed' } })
            .sort({ createdAt: 1 })
            .lean<Project[]>();
        const waiting = await this.briefs.find({ project: { $in: projects.map((p) => p._id) }, state: { $in: ['awaiting', 'sent_back'] } }, { project: 1 }).lean<{ project: unknown }[]>();
        const ids = new Set(waiting.map((b) => String(b.project)));
        const eligible = projects.filter((p) => ids.has(String(p._id)));
        if (!eligible.length) return;

        if (!(await this.takeSlot(email))) return;
        try {
            for (const c of clients) {
                const theirs = eligible.filter((p) => String(p.client) === String(c._id));
                if (!theirs.length) continue;
                const items: PortalLinkPayload[] = [];
                for (const p of theirs) {
                    const { url } = await this.mint(String(p._id), true, 'resend');
                    items.push({ projectId: String(p._id), url });
                    await this.contacts.add({ client: c._id, project: p._id, kind: 'token', text: 'Intake link re-sent at their request', by: null });
                    await this.activity.record({
                        kind: 'change',
                        weight: 'notable',
                        action: 'portal.resend',
                        section: 'projects',
                        target: { type: 'project', id: String(p._id), label: p.name },
                        after: { emailed: true },
                    });
                }
                await this.jobs.sendResend({ clientId: String(c._id), items });
            }
        } catch (e) {
            // Nothing went out: the address must not be locked for a day because of it.
            await this.resends.deleteOne({ key: hashOf(email) });
            throw e;
        }
    }

    /**
     * One conditional write. A row younger than 24 hours does not match the
     * filter, so the upsert tries to insert a second row for the same key and
     * the unique index refuses: that refusal is the answer "already sent".
     */
    private async takeSlot(email: string): Promise<boolean> {
        const now = new Date();
        try {
            await this.resends.updateOne({ key: hashOf(email), sentAt: { $lte: new Date(now.getTime() - RESEND_WINDOW_MS) } }, { $set: { sentAt: now } }, { upsert: true });
            return true;
        } catch (e) {
            if ((e as { code?: number }).code === 11000) return false;
            throw e;
        }
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
        const at = body.at ?? Date.now();
        // Conditional on the draft as read: two saves at the same moment
        // cannot drop each other's prompts; the loser reads again and merges.
        for (let tries = 0; tries < 5; tries++) {
            const brief = await this.briefs.findOne({ project: p._id }).lean<Brief>();
            if (this.stateOf(brief) === 'done') throw new NotFoundException({ error: 'not_found' });
            const was = brief?.draft ?? [];
            // Per prompt, the newest save wins, whatever order the saves land in.
            const merged = new Map(was.map((d) => [d.key, { a: d.a ?? '', at: d.at ?? 0 }]));
            for (const [k, a] of Object.entries(body.answers)) {
                if ((merged.get(k)?.at ?? -1) <= at) merged.set(k, { a, at });
            }
            const draft = [...merged].map(([key, v]) => ({ key, ...v }));
            const res = brief
                ? await this.briefs.updateOne({ project: p._id, draft: was, state: brief.state }, { $set: { draft } })
                : await this.briefs.updateOne({ project: p._id }, { $setOnInsert: { draft } }, { upsert: true });
            if (brief ? res.matchedCount : res.upsertedCount) return { saved: true };
        }
        throw new ConflictException({ error: 'busy' });
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

    /**
     * Makes a new link for a project and puts a brief that has not been sent
     * yet into `awaiting`. Returns the link: the one time it exists in the
     * clear.
     *
     * `owner`: replaces both slots, so every earlier link dies at once.
     * `resend`: fills only the second slot; the owner's link keeps working.
     * A project with no link yet gets its first one either way.
     */
    private async mint(projectId: string, emailed: boolean, slot: 'owner' | 'resend' = 'owner'): Promise<{ link: PortalLink; url: string }> {
        const token = randomBytes(32).toString('base64url');
        const now = new Date();
        let link: PortalLink | null = null;
        if (slot === 'resend') {
            link = await this.links.findOneAndUpdate({ project: projectId }, { $set: { resentHash: hashOf(token), emailedAt: now } }, { returnDocument: 'after' }).lean<PortalLink>();
        }
        link ??= await this.links
            .findOneAndUpdate(
                { project: projectId },
                { $set: { hash: hashOf(token), resentHash: null, issuedAt: now, emailedAt: emailed ? now : null, lastOpenDay: null } },
                { upsert: true, returnDocument: 'after' },
            )
            .lean<PortalLink>();
        if (!link) throw new Error('portal link was not written');
        const url = `${this.config.get('CLIENT_ORIGIN', { infer: true }).replace(/\/$/, '')}/p/${token}`;

        // The questionnaire is now with the client. A brief already answered stays as it is.
        const brief = await this.briefs.findOne({ project: projectId }).lean<Brief>();
        if (!brief || brief.state === 'none') {
            await this.briefs.updateOne({ project: projectId }, { $set: { state: 'awaiting', sentAt: now } }, { upsert: true });
        } else if (brief.state === 'awaiting') {
            await this.briefs.updateOne({ project: projectId }, { $set: { sentAt: now } });
        }
        return { link, url };
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
        const h = hashOf(token);
        const link = await this.links.findOne({ $or: [{ hash: h }, { resentHash: h }] }).lean<PortalLink>();
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
