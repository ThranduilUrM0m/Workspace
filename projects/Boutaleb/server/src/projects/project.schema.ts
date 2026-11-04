import { ASSET_HOLDERS, ASSET_TRANSFERS, CURRENCIES, LANGUAGES, MODULES, PROJECT_STATUSES } from '@repo/schemas';
import { Schema, type InferSchemaType, type Types } from 'mongoose';
import { CLIENT } from '../clients/client.schema.js';

// A project (T7.1). Shape: wireframes/shell/projects-data.js plus the
// council additions in boutaleb.md. What is NOT stored, on purpose:
// - whose turn it is / attention: derived from the communication log;
// - internal: derived from the client's `self` flag;
// - money (value, invoiced, paid, outstanding): derived from Finance (M10);
// - brief, plan, milestones, wireframe rounds: their own records (T7.5).
// Two stored copies of one fact drift; derivations cannot.
export const PROJECT = 'Project';

const AssetOwnership = new Schema(
    {
        asset: { type: String, required: true, trim: true, maxlength: 60 },
        holder: { type: String, enum: ASSET_HOLDERS, required: true },
        renews: { type: Date, default: null },
        transfer: { type: String, enum: ASSET_TRANSFERS, default: 'none' },
    },
    { _id: false },
);

export const ProjectSchema = new Schema(
    {
        name: { type: String, required: true, trim: true, maxlength: 120 },
        /** Stored, not computed: a display name does not survive a URL round trip. */
        slug: { type: String, required: true, unique: true, lowercase: true, trim: true, maxlength: 80 },
        /** Null only while the project is an idea nobody has asked for yet. */
        client: { type: Schema.Types.ObjectId, ref: CLIENT, default: null, index: true },
        status: { type: String, enum: PROJECT_STATUSES, required: true, index: true },
        governingLanguage: { type: String, enum: LANGUAGES, required: true },
        note: { type: String, trim: true, maxlength: 2000 },
        currency: { type: String, enum: CURRENCIES, default: 'MAD' },
        modules: { type: [String], enum: MODULES, default: () => [...MODULES] },
        assetOwnership: { type: [AssetOwnership], default: () => [] },
        /** Archived projects leave every list but stay whole; restore undoes it. */
        archivedAt: { type: Date, default: null, index: true },
    },
    { timestamps: true },
);
ProjectSchema.index({ name: 'text', slug: 'text' });

export type Project = InferSchemaType<typeof ProjectSchema> & { _id: Types.ObjectId };
