import { BRIEF_AREA_KEYS, BRIEF_STATES } from '@repo/schemas';
import { Schema, type InferSchemaType, type Types } from 'mongoose';
import { PROJECT } from '../projects/project.schema.js';

// One brief per project (T7.5b). Its own record, not a field on Project:
// it has a lifecycle of its own (sent, submitted, ruled on, reopened) and
// a revision counter, and the plan reads it, not the project.
//
// `areas` keeps the question text with each answer, not a key: the
// client's questionnaire is written for each project (M12), so the
// question asked is part of what was answered.
export const BRIEF = 'Brief';

const QA = new Schema({ q: { type: String, required: true, maxlength: 400 }, a: { type: String, default: '', maxlength: 4000 } }, { _id: false });

const Area = new Schema(
    {
        key: { type: String, enum: BRIEF_AREA_KEYS, required: true },
        qs: { type: [QA], default: () => [] },
        /** What you know that they did not say. Never a second question to them. */
        note: { type: String, default: null, maxlength: 2000 },
    },
    { _id: false },
);

const Reading = new Schema(
    {
        summary: { type: String, required: true },
        risks: { type: [String], default: () => [] },
        assumptions: { type: [String], default: () => [] },
    },
    { _id: false },
);

export const BriefSchema = new Schema(
    {
        project: { type: Schema.Types.ObjectId, ref: PROJECT, required: true, unique: true },
        state: { type: String, enum: BRIEF_STATES, default: 'none' },
        mine: { type: Boolean, default: false },
        seed: { type: String, default: null, maxlength: 4000 },
        sentAt: { type: Date, default: null },
        submittedAt: { type: Date, default: null },
        decidedAt: { type: Date, default: null },
        reason: { type: String, default: null, maxlength: 2000 },
        revision: { type: Number, default: 0 },
        reading: { type: Reading, default: null },
        areas: { type: [Area], default: () => [] },
    },
    { timestamps: true },
);

export type Brief = InferSchemaType<typeof BriefSchema> & { _id: Types.ObjectId };
