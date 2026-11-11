import { ROUND_STATES } from '@repo/schemas';
import { Schema, type InferSchemaType, type Types } from 'mongoose';
import { PROJECT } from '../projects/project.schema.js';

// A wireframe round (T7.5d, structure spec §2 WireframeRound). `sourceKey`
// is the storage prefix of the working folder last uploaded; `bundleKey` is
// the frozen copy made when the round was sent, never written again. Pages
// are READ from the folder (top-level .html, named by <title>), never typed.
// Comments hang off a page by name, or off the round when page is null.
export const WIREFRAME_ROUND = 'WireframeRound';

const PageSchema = new Schema(
    {
        name: { type: String, required: true },
        file: { type: String, required: true },
        snapKey: { type: String, default: null },
    },
    { _id: false },
);

const CommentSchema = new Schema(
    {
        page: { type: String, default: null },
        at: { type: Date, required: true },
        body: { type: String, required: true },
    },
    { _id: false },
);

export const WireframeRoundSchema = new Schema(
    {
        project: { type: Schema.Types.ObjectId, ref: PROJECT, required: true },
        v: { type: Number, required: true, min: 1 },
        state: { type: String, enum: ROUND_STATES, required: true, default: 'draft' },
        note: { type: String, default: null },
        sourceKey: { type: String, default: null },
        sourceName: { type: String, default: null },
        bundleKey: { type: String, default: null },
        sentAt: { type: Date, default: null },
        decidedAt: { type: Date, default: null },
        pages: { type: [PageSchema], default: [] },
        comments: { type: [CommentSchema], default: [] },
    },
    { timestamps: true },
);
// One round number per project, ever: two "round 2"s would make "what did they approve" ambiguous.
WireframeRoundSchema.index({ project: 1, v: 1 }, { unique: true });

export type WireframeRound = InferSchemaType<typeof WireframeRoundSchema> & { _id: Types.ObjectId };
