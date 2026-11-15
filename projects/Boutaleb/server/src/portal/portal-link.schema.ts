import { Schema, type InferSchemaType, type Types } from 'mongoose';
import { PROJECT } from '../projects/project.schema.js';

// The magic link behind a project's intake (T8.4). One per project: a
// project has one client, so (client, project) is the project. Only the
// SHA-256 hash of the token is stored; the token itself exists in the
// response that issued it and in the email, nowhere else. Re-issuing
// replaces the hash, which is how the old link dies.
export const PORTAL_LINK = 'PortalLink';

export const PortalLinkSchema = new Schema(
    {
        project: { type: Schema.Types.ObjectId, ref: PROJECT, required: true, unique: true },
        hash: { type: String, required: true, unique: true },
        issuedAt: { type: Date, required: true },
        emailedAt: { type: Date, default: null },
        /** Studio day (YYYY-MM-DD) of the last first-open that was logged. */
        lastOpenDay: { type: String, default: null },
    },
    { timestamps: true },
);

export type PortalLink = InferSchemaType<typeof PortalLinkSchema> & { _id: Types.ObjectId };
