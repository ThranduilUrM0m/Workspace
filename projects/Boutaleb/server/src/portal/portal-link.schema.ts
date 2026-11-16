import { Schema, type InferSchemaType, type Types } from 'mongoose';
import { PROJECT } from '../projects/project.schema.js';

// The magic link behind a project's intake (T8.4). One record per project:
// a project has one client, so (client, project) is the project. Only
// SHA-256 hashes are stored; a token itself exists in the response that
// issued it and in the email, nowhere else.
//
// Two slots. `hash` is the link the owner issued; only the owner replacing it
// (re-issue) kills it. `resentHash` is the link "email me my access link"
// sent (T8.5): a request for a new one replaces only that slot. So anyone who
// merely knows a client's address can never kill the link the owner sent,
// and the one they can replace was just emailed to the client anyway.
export const PORTAL_LINK = 'PortalLink';

export const PortalLinkSchema = new Schema(
    {
        project: { type: Schema.Types.ObjectId, ref: PROJECT, required: true, unique: true },
        hash: { type: String, required: true, unique: true },
        resentHash: { type: String, default: null },
        issuedAt: { type: Date, required: true },
        emailedAt: { type: Date, default: null },
        /** Studio day (YYYY-MM-DD) of the last first-open that was logged. */
        lastOpenDay: { type: String, default: null },
    },
    { timestamps: true },
);
PortalLinkSchema.index({ resentHash: 1 }, { unique: true, partialFilterExpression: { resentHash: { $type: 'string' } } });

export type PortalLink = InferSchemaType<typeof PortalLinkSchema> & { _id: Types.ObjectId };
