import { renderOwnerNotice, renderReceipt } from '@repo/emails';
import { task } from '@trigger.dev/sdk';
import type { EnquiryJobPayload, EnquiryNoticePayload } from '../enquiries/enquiry-jobs.js';
import type { Enquiry } from '../enquiries/enquiry.schema.js';
import { mail, mailer, models } from './runtime.js';

// The two emails after an enquiry (public-forms.md §5). Each job is given
// only the enquiry's id and reads the record itself, so an enquiry deleted
// in the meantime sends nothing. Retries: trigger.config.ts (3, backoff).
// A job that fails for good is written to Settings › Activity, as critical.

/** The answers as the receipt and the notice list them, in the form's order. */
const LABELS: [key: string, label: string][] = [
    ['projectType', 'Project type'],
    ['category', 'New or refresh'],
    ['company', 'Company'],
    ['site', 'Current site'],
    ['phone', 'Phone'],
    ['budget', 'Budget'],
    ['timeline', 'Timeline'],
    ['via', 'Preferred contact'],
    ['timezone', 'Timezone / location'],
    ['stage', 'Stage'],
    ['outcome', 'What success looks like'],
    ['heard', 'Heard about it from'],
    ['refs', 'References'],
    ['followUp', 'Added later'],
];

function answers(e: Enquiry) {
    const d = (e.details ?? {}) as Record<string, unknown>;
    return LABELS.filter(([k]) => typeof d[k] === 'string' && d[k] !== '').map(([k, label]) => ({ label, value: String(d[k]) }));
}

async function load(enquiryId: string) {
    const { enquiries } = await models();
    return enquiries.findById(enquiryId).lean<Enquiry>();
}

async function failedForGood(action: string, enquiryId: string, error: unknown) {
    const { activity } = await models();
    await activity.create({
        kind: 'system',
        weight: 'critical',
        action,
        section: 'deals',
        target: { type: 'enquiry', id: enquiryId },
        after: { error: error instanceof Error ? error.message : String(error) },
    });
}

/** The copy of what they sent, to the visitor. Sent once, plain, no marketing. */
export const enquiryReceipt = task({
    id: 'enquiry-receipt',
    run: async ({ enquiryId }: EnquiryJobPayload) => {
        const e = await load(enquiryId);
        if (!e) return { sent: false, reason: 'enquiry gone' };
        const site = mail.site();
        const prefix = e.locale && e.locale !== 'fr' ? `/${e.locale}` : '';
        const { subject, html, text } = await renderReceipt({
            source: e.source,
            name: e.name,
            email: e.email,
            message: e.message,
            answers: answers(e),
            site,
            addDetailUrl: e.source === 'footer' ? `${site}${prefix}/contact?lead=${encodeURIComponent(e.ref)}` : undefined,
        });
        await mailer().sendMail({ from: mail.from(), to: e.email, subject, html, text });
        return { sent: true };
    },
    onFailure: async ({ payload, error }) => failedForGood('enquiry.receipt_failed', payload.enquiryId, error),
});

/** The facts, to the owner. Reply-To is the visitor, so replying answers them. */
export const enquiryNotice = task({
    id: 'enquiry-notice',
    run: async ({ enquiryId, kind }: EnquiryNoticePayload) => {
        const e = await load(enquiryId);
        if (!e) return { sent: false, reason: 'enquiry gone' };
        const { subject, text } = renderOwnerNotice({
            kind,
            name: e.name,
            email: e.email,
            source: e.source,
            message: e.message,
            answers: answers(e),
            // The ERP's place for enquiries arrives with T8.2 (Deals › Leads).
            link: `${mail.site()}/app/deals/leads?enquiry=${encodeURIComponent(enquiryId)}`,
        });
        await mailer().sendMail({ from: mail.from(), to: mail.owner(), replyTo: `${e.name} <${e.email}>`, subject, text });
        return { sent: true };
    },
    onFailure: async ({ payload, error }) => failedForGood('enquiry.notice_failed', payload.enquiryId, error),
});
