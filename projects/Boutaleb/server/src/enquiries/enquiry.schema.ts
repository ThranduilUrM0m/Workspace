import { Schema, type InferSchemaType, type Types } from 'mongoose';

// A public enquiry (T8.1, ADR-017): someone wrote through the footer form
// or /contact. It is NOT a client, a project or a lead in the pipeline:
// a human reads it and decides (T8.2). `details` holds what the form asked
// beyond name/email/message (project type; on /contact budget, timeline,
// stage…), so the create screen can pre-fill from it.
//
// `ref` is what the visitor's receipt links back with ("Add budget and
// timeline"): random, so it cannot be guessed to reach someone else's
// enquiry. `keys` holds every idempotency key that wrote here (the footer
// send, then its /contact addition); the unique index makes a retried
// send find its first answer instead of writing twice.
export const ENQUIRY = 'Enquiry';

export const ENQUIRY_SOURCES = ['footer', 'contact'] as const;
export type EnquirySource = (typeof ENQUIRY_SOURCES)[number];

export const EnquirySchema = new Schema(
    {
        ref: { type: String, required: true, unique: true },
        source: { type: String, enum: ENQUIRY_SOURCES, required: true },
        name: { type: String, required: true, maxlength: 120 },
        email: { type: String, required: true, maxlength: 254 },
        message: { type: String, required: true, maxlength: 5000 },
        details: { type: Schema.Types.Mixed, default: {} },
        /** When a /contact send added to a footer enquiry. */
        detailsAddedAt: { type: Date, default: null },
        keys: { type: [String], required: true },
        locale: { type: String, default: 'fr' },
    },
    { timestamps: true, minimize: false },
);
EnquirySchema.index({ keys: 1 }, { unique: true });
EnquirySchema.index({ createdAt: -1 });

export type Enquiry = InferSchemaType<typeof EnquirySchema> & { _id: Types.ObjectId; createdAt: Date; updatedAt: Date };
