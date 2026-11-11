import { Schema, type InferSchemaType, type Types } from 'mongoose';
import { PROJECT } from '../projects/project.schema.js';

// A milestone is a phase of one project's plan (T7.5c). `order` is the
// owner's sequence; `due` is stored as a calendar day string (YYYY-MM-DD),
// because a deadline is a day, not an instant, and a Date would shift it
// across a time zone. Tickets attach to it later (M9); it owns none.
export const MILESTONE = 'Milestone';

export const MilestoneSchema = new Schema(
    {
        project: { type: Schema.Types.ObjectId, ref: PROJECT, required: true },
        name: { type: String, required: true, trim: true, maxlength: 120 },
        due: { type: String, default: null, match: /^\d{4}-\d{2}-\d{2}$/ },
        done: { type: Boolean, default: false },
        order: { type: Number, required: true },
    },
    { timestamps: true },
);
MilestoneSchema.index({ project: 1, order: 1 });

export type Milestone = InferSchemaType<typeof MilestoneSchema> & { _id: Types.ObjectId };
