import { DEAL_SOURCES, DEAL_STAGES } from '@repo/schemas';
import { Schema, type InferSchemaType, type Types } from 'mongoose';
import { CLIENT } from '../clients/client.schema.js';
import { ENQUIRY } from '../enquiries/enquiry.schema.js';

// A deal (T8.2): the pre-project funnel, ending at "signed". Required
// client, exactly like a Project. `enquiry` links a deal the public form
// created to what the visitor wrote; the unique index means one enquiry can
// never make two deals, however often the hook runs.
//
// `opened`, `sent` and `decided` are the three events the record draws
// (asked, offered, decided). `sent` is when the current document (proposal,
// then contract) went out: null means nothing is out, which is a different
// kind of late from an unanswered one.
export const DEAL = 'Deal';

export const DealSchema = new Schema(
    {
        client: { type: Schema.Types.ObjectId, ref: CLIENT, required: true },
        title: { type: String, required: true, trim: true, maxlength: 120 },
        stage: { type: String, enum: DEAL_STAGES, default: 'lead' },
        source: { type: String, enum: DEAL_SOURCES, required: true },
        value: { type: Number, default: null },
        priced: { type: Boolean, default: false },
        opened: { type: Date, required: true },
        sent: { type: Date, default: null },
        decided: { type: Date, default: null },
        lostWhy: { type: String, trim: true, maxlength: 200, default: null },
        note: { type: String, trim: true, maxlength: 2000, default: null },
        enquiry: { type: Schema.Types.ObjectId, ref: ENQUIRY, default: null },
    },
    { timestamps: true }
);
DealSchema.index(
    { enquiry: 1 },
    { unique: true, partialFilterExpression: { enquiry: { $type: 'objectId' } } }
);
DealSchema.index({ client: 1 });
DealSchema.index({ stage: 1, opened: -1 });

export type Deal = InferSchemaType<typeof DealSchema> & { _id: Types.ObjectId };
