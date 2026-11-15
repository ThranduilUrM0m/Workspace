import { Schema, type InferSchemaType, type Types } from 'mongoose';

// The 24-hour slot behind "email me my access link" (T8.5). One row per
// address that was actually sent something; the row is the limit. Only the
// SHA-256 of the address is kept, so this collection cannot be read back as a
// list of clients' emails. The TTL index removes a row 24 hours after it was
// written; the service also checks the age itself, because Mongo's TTL
// sweep runs once a minute.
export const PORTAL_RESEND = 'PortalResend';

export const RESEND_WINDOW_MS = 24 * 60 * 60 * 1000;

export const PortalResendSchema = new Schema({
    key: { type: String, required: true, unique: true },
    sentAt: { type: Date, required: true, expires: RESEND_WINDOW_MS / 1000 },
});

export type PortalResend = InferSchemaType<typeof PortalResendSchema> & { _id: Types.ObjectId };
