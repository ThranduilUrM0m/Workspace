import mongoose from 'mongoose';
import { createTransport, type Transporter } from 'nodemailer';
import { ActivitySchema, ACTIVITY } from '../activity/activity.schema.js';
import { ENQUIRY, EnquirySchema, type Enquiry } from '../enquiries/enquiry.schema.js';

// What the jobs need, outside Nest: they run in Trigger.dev's worker, not
// in the API process. One Mongo connection and one mail transport per
// worker, opened on first use.
//
// Mail goes over SMTP through Nodemailer, so the provider is four values:
// SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS. Development defaults to
// Mailpit on this machine (every email lands in its inbox page, nobody
// real receives one); production is OCI Email Delivery.

const env = (k: string, fallback?: string) => {
    const v = process.env[k] ?? fallback;
    if (v === undefined) throw new Error(`${k} is not set`);
    return v;
};

let db: Promise<typeof mongoose> | null = null;
export async function models() {
    db ??= mongoose.connect(env('MONGODB_URI', 'mongodb://127.0.0.1:27017/boutaleb'));
    const m = await db;
    return {
        enquiries: (m.models[ENQUIRY] ?? m.model(ENQUIRY, EnquirySchema)) as mongoose.Model<Enquiry>,
        activity: m.models[ACTIVITY] ?? m.model(ACTIVITY, ActivitySchema),
    };
}

let transport: Transporter | null = null;
export function mailer() {
    const user = process.env.SMTP_USER;
    transport ??= createTransport({
        host: env('SMTP_HOST', 'localhost'),
        port: Number(env('SMTP_PORT', '1025')),
        // 587 upgrades with STARTTLS; 465 is TLS from the start.
        secure: env('SMTP_PORT', '1025') === '465',
        auth: user ? { user, pass: env('SMTP_PASS') } : undefined,
    });
    return transport;
}

export const mail = {
    /** "Zakariae Boutaleb <hello@…>", never no-reply: a reply must reach the owner. */
    from: () => env('MAIL_FROM', 'Zakariae Boutaleb <hello@boutaleb.local>'),
    owner: () => env('OWNER_EMAIL', 'owner@boutaleb.local'),
    site: () => env('SITE_URL', 'http://localhost:3002').replace(/\/$/, ''),
};
