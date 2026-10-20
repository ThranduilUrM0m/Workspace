import { Schema, type InferSchemaType, type Types } from 'mongoose';
import { LEVELS, RIGHTS, SECTIONS } from './abilities.js';

// A role is the owner's own record (Settings spec item 6): one level per
// section plus two rights. The owner's role is fixed and cannot be edited.
export const ROLE = 'Role';

const levels = Object.fromEntries(SECTIONS.map((s) => [s, { type: String, enum: LEVELS, default: 'none' }]));
const rights = Object.fromEntries(Object.keys(RIGHTS).map((r) => [r, { type: Boolean, default: false }]));

export const RoleSchema = new Schema(
    {
        name: { type: String, required: true, trim: true, maxlength: 60 },
        owner: { type: Boolean, default: false },
        levels: { type: new Schema(levels, { _id: false }), default: () => ({}) },
        rights: { type: new Schema(rights, { _id: false }), default: () => ({}) },
    },
    { timestamps: true },
);
// One owner role, at most.
RoleSchema.index({ owner: 1 }, { unique: true, partialFilterExpression: { owner: true } });

export type Role = InferSchemaType<typeof RoleSchema> & { _id: Types.ObjectId };

// A person with access. Clerk holds their sign-in; this holds their role.
// Revoked people stay, so history keeps their name (spec item 8).
export const MEMBER = 'Member';

export const MemberSchema = new Schema(
    {
        clerkUserId: { type: String, required: true, unique: true },
        name: { type: String, required: true, trim: true, maxlength: 120 },
        email: { type: String, required: true, trim: true, lowercase: true, maxlength: 254 },
        role: { type: Schema.Types.ObjectId, ref: ROLE, required: true },
        status: { type: String, enum: ['active', 'revoked'], default: 'active' },
        revokedAt: { type: Date },
    },
    { timestamps: true },
);

export type Member = InferSchemaType<typeof MemberSchema> & { _id: Types.ObjectId };
