import { CLIENT_STATUSES, LANGUAGES } from '@repo/schemas';
import { Schema, type InferSchemaType, type Types } from 'mongoose';

// A client: a person, and the organisation they speak for (never merged into
// one string, so a second contact later is an edit, not a migration).
// Projects need it from day one (pick or create one on New project); the
// Clients screens arrive with M8 and extend this record, they do not replace it.
//
// `status` is a sales judgement you store (lead / active / inactive), not
// whether live work exists: that is derived from Projects.
// `language` governs client-facing generated prose only, never the ERP.
// `self` marks the studio's own record, so internal work is an ordinary
// project with a client like any other (structure spec §2).
export const CLIENT = 'Client';

export const ClientSchema = new Schema(
    {
        name: { type: String, required: true, trim: true, maxlength: 120 },
        company: { type: String, required: true, trim: true, maxlength: 120 },
        email: { type: String, required: true, trim: true, lowercase: true, maxlength: 254 },
        status: { type: String, enum: CLIENT_STATUSES, default: 'lead' },
        language: { type: String, enum: LANGUAGES, required: true },
        phone: { type: String, trim: true, maxlength: 40 },
        website: { type: String, trim: true, maxlength: 200 },
        self: { type: Boolean, default: false },
    },
    { timestamps: true },
);
ClientSchema.index({ name: 'text', company: 'text', email: 'text' });
// One studio record, at most.
ClientSchema.index({ self: 1 }, { unique: true, partialFilterExpression: { self: true } });

export type Client = InferSchemaType<typeof ClientSchema> & { _id: Types.ObjectId };

/** What a project list or record shows of its client. */
export const clientSummary = (c: Pick<Client, '_id' | 'name' | 'company' | 'self'>) => ({
    id: String(c._id),
    name: c.name,
    company: c.company,
    self: c.self ?? false,
});
