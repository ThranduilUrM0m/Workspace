import { CONTACT_KINDS } from '@repo/schemas';
import { Schema, type InferSchemaType, type Types } from 'mongoose';
import { PROJECT } from '../projects/project.schema.js';
import { CLIENT } from './client.schema.js';

// The contact log (projects-data.js CommunicationLog). Append-only: every
// touchpoint with a client, typed or written by the system. An entry always
// names its client; `project` optionally narrows it to one piece of their
// work. (The wireframe derived the client from the project; storing it on
// every row costs one field and saves a join on every list read.)
//
// `at` is a calendar day in studio time: silence is counted in days, and a
// call at 23:50 belongs to the day it happened in Casablanca.
export const CONTACT = 'Contact';

export const ContactSchema = new Schema(
    {
        client: { type: Schema.Types.ObjectId, ref: CLIENT, required: true },
        project: { type: Schema.Types.ObjectId, ref: PROJECT, default: null },
        at: { type: String, required: true, match: /^\d{4}-\d{2}-\d{2}$/ },
        kind: { type: String, enum: CONTACT_KINDS, required: true },
        text: { type: String, required: true, trim: true, maxlength: 500 },
        /** Who logged it: a member id, or null for the system (site enquiry, magic link). */
        by: { type: String, default: null },
    },
    { timestamps: true },
);
ContactSchema.index({ client: 1, at: -1 });

export type Contact = InferSchemaType<typeof ContactSchema> & { _id: Types.ObjectId };
