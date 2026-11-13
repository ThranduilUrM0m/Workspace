import { randomBytes } from 'node:crypto';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { contactEnquiry, footerEnquiry, type ContactEnquiry, type FooterEnquiry } from '@repo/schemas';
import type { Model } from 'mongoose';
import { ActivityService } from '../activity/activity.service.js';
import { CONVERSIONS, type Conversions } from './conversions.js';
import { ENQUIRY_JOBS, type EnquiryJobs } from './enquiry-jobs.js';
import { ENQUIRY, type Enquiry } from './enquiry.schema.js';
import type { TokenCheck } from './form-token.js';

export type Answer =
    | { status: 201; body: { ref: string; email: string } }
    | { status: 422; body: { errors: Record<string, string> } };

const LOCALES = ['fr', 'en', 'ar'];

/** `L-` and ten base32 characters: 50 bits, not guessable, still readable aloud. */
const newRef = () => {
    const abc = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
    return `L-${[...randomBytes(10)].map((b) => abc[b % abc.length]).join('')}`;
};

const isDuplicate = (err: unknown) => (err as { code?: number }).code === 11000;

/**
 * The pipeline after the guards (public-forms.md §1): a bot gets a fake
 * success and nothing is kept; then validation; then one write,
 * idempotent; then the jobs are queued without being awaited for.
 */
@Injectable()
export class EnquiriesService {
    private readonly logger = new Logger(EnquiriesService.name);

    constructor(
        @InjectModel(ENQUIRY) private readonly enquiries: Model<Enquiry>,
        @Inject(ENQUIRY_JOBS) private readonly jobs: EnquiryJobs,
        @Inject(CONVERSIONS) private readonly conversions: Conversions,
        private readonly activity: ActivityService,
    ) {}

    async receive(raw: Record<string, unknown>, token: TokenCheck): Promise<Answer> {
        if (token === 'bot') {
            // The same answer a person gets. A counter, not a record: no name, no message kept.
            void this.activity.record({ kind: 'system', weight: 'routine', action: 'enquiry.bot', after: { source: raw.source === 'contact' ? 'contact' : 'footer' } });
            return { status: 201, body: { ref: newRef(), email: typeof raw.email === 'string' ? raw.email.trim().toLowerCase() : '' } };
        }
        if (token === 'expired') return { status: 422, body: { errors: { form: 'expired' } } };

        const locale = LOCALES.includes(raw.locale as string) ? (raw.locale as string) : 'fr';
        if (raw.source === 'footer') {
            const parsed = footerEnquiry.safeParse(raw);
            return parsed.success ? this.footer(parsed.data, locale) : invalid(parsed.error.issues);
        }
        if (raw.source === 'contact') {
            const parsed = contactEnquiry.safeParse(raw);
            return parsed.success ? this.contact(parsed.data, locale) : invalid(parsed.error.issues);
        }
        return { status: 422, body: { errors: { source: 'required' } } };
    }

    private footer(d: FooterEnquiry, locale: string): Promise<Answer> {
        return this.create({ source: 'footer', name: d.name, email: d.email, message: d.message, details: { projectType: d.projectType }, key: d.idempotencyKey, locale });
    }

    private async contact(d: ContactEnquiry, locale: string): Promise<Answer> {
        const { name, email, message, idempotencyKey: key, lead, ...rest } = d;
        const details = Object.fromEntries(Object.entries(rest).filter(([, v]) => v !== '' && v !== undefined));
        // "Add budget and timeline" from a footer receipt: add to that enquiry,
        // but only for the same email. A ref alone never reaches someone else's.
        if (lead) {
            const done = await this.enquiries.findOne({ keys: key }).lean<Enquiry>();
            if (done) return created(done);
            const added = await this.enquiries
                .findOneAndUpdate(
                    { ref: lead, email },
                    // Merged key by key, so the footer's project type survives; the
                    // footer message stays the message, the new one is kept beside it.
                    { $set: { ...dotted({ ...details, followUp: message }), detailsAddedAt: new Date() }, $addToSet: { keys: key } },
                    { returnDocument: 'after' },
                )
                .lean<Enquiry>()
                .catch((err: unknown) => (isDuplicate(err) ? null : Promise.reject(err)));
            if (added) {
                await this.after(added, false);
                return created(added);
            }
        }
        return this.create({ source: 'contact', name, email, message, details, key, locale });
    }

    private async create(e: { source: 'footer' | 'contact'; name: string; email: string; message: string; details: object; key: string; locale: string }): Promise<Answer> {
        try {
            const doc = await this.enquiries.create({ ref: newRef(), source: e.source, name: e.name, email: e.email, message: e.message, details: e.details, keys: [e.key], locale: e.locale });
            const saved = doc.toObject() as Enquiry;
            await this.after(saved, true);
            return created(saved);
        } catch (err) {
            if (!isDuplicate(err)) throw err;
            // The key is known: a retried send. Answer as the first time, write nothing.
            const first = await this.enquiries.findOne({ keys: e.key }).lean<Enquiry>();
            if (!first) throw err;
            return created(first);
        }
    }

    /** Logged, then queued. A queue failure never fails the visitor's send: it is in the log for the owner. */
    private async after(e: Enquiry, first: boolean) {
        const id = String(e._id);
        await this.activity.record({
            kind: 'change',
            weight: 'notable',
            action: first ? 'enquiry.create' : 'enquiry.details',
            section: 'deals',
            target: { type: 'enquiry', id, label: e.name },
        });
        if (first) {
            this.conversions.count({ source: e.source, locale: e.locale }).catch((err: unknown) => {
                this.logger.warn(`enquiry ${id}: conversion not counted: ${String((err as Error).message ?? err)}`);
            });
        }
        this.jobs.queue(id, first).catch((err: unknown) => {
            this.logger.error(`enquiry ${id}: jobs not queued`, err as Error);
            void this.activity.record({ kind: 'system', weight: 'critical', action: 'enquiry.jobs_failed', section: 'deals', target: { type: 'enquiry', id, label: e.name }, after: { error: String((err as Error).message ?? err) } });
        });
    }
}

const dotted = (o: Record<string, unknown>) => Object.fromEntries(Object.entries(o).map(([k, v]) => [`details.${k}`, v]));

const created = (e: Enquiry): Answer => ({ status: 201, body: { ref: e.ref, email: e.email } });

function invalid(issues: { path: PropertyKey[]; message: string }[]): Answer {
    return { status: 422, body: { errors: Object.fromEntries(issues.map((i) => [String(i.path[0] ?? 'form'), i.message])) } };
}
