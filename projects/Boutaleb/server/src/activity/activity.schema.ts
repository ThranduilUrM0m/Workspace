import { Schema, type InferSchemaType } from 'mongoose';

// Settings › Activity (spec items 11, 11b): who did what, to which record,
// before → after, when. Append-only: nothing in the app updates or deletes
// an entry, and the model refuses it if asked. Routine entries (reads,
// health) expire; notable and critical ones are kept.
export const ACTIVITY = 'ActivityEvent';

export const KINDS = ['change', 'access', 'view', 'export', 'system'] as const;
export type Kind = (typeof KINDS)[number];

export const WEIGHTS = ['routine', 'notable', 'critical'] as const;
export type Weight = (typeof WEIGHTS)[number];

/**
 * How long a routine entry is kept. PROVISIONAL: tracking a helper's reads
 * and sign-ins is employee monitoring under loi 09-08 and needs a stated
 * retention limit; confirm the figure with the legal professional (HANDOFF §8).
 */
export const ROUTINE_DAYS = 90;

const Actor = new Schema(
    {
        member: { type: Schema.Types.ObjectId, ref: 'Member' },
        clerkUserId: { type: String },
        // Copied, not joined: the log keeps the name a person had at the time.
        name: { type: String },
    },
    { _id: false },
);

export const ActivitySchema = new Schema(
    {
        at: { type: Date, default: () => new Date(), index: true },
        actor: { type: Actor },
        kind: { type: String, enum: KINDS, required: true },
        weight: { type: String, enum: WEIGHTS, required: true },
        /** What happened, as a stable code: "sign_in", "denied", "GET /me", "project.update". */
        action: { type: String, required: true, maxlength: 200 },
        section: { type: String },
        target: { type: new Schema({ type: String, id: String, label: String }, { _id: false }) },
        before: { type: Schema.Types.Mixed },
        after: { type: Schema.Types.Mixed },
        // Path only, never the query string: it can carry tokens or search terms.
        request: { type: new Schema({ method: String, path: String, status: Number, ip: String, userAgent: String }, { _id: false }) },
        sessionId: { type: String },
        expireAt: { type: Date },
    },
    { versionKey: false },
);

ActivitySchema.index({ 'actor.member': 1, at: -1 });
ActivitySchema.index({ kind: 1, weight: 1, at: -1 });
// TTL: Mongo deletes an entry once expireAt passes. Only routine ones carry it.
ActivitySchema.index({ expireAt: 1 }, { expireAfterSeconds: 0 });

const refuse = function () {
    throw new Error('ActivityEvent is append-only');
};
for (const op of ['updateOne', 'updateMany', 'findOneAndUpdate', 'replaceOne', 'deleteOne', 'deleteMany', 'findOneAndDelete'] as const) {
    ActivitySchema.pre(op, refuse);
}

export type ActivityEvent = InferSchemaType<typeof ActivitySchema>;

// Sessions already seen, so the first request of each one logs a sign-in.
export const SEEN_SESSION = 'SeenSession';

export const SeenSessionSchema = new Schema(
    {
        _id: { type: String },
        clerkUserId: { type: String, required: true },
        // Clerk sessions last at most a week by default; keep a margin.
        at: { type: Date, default: () => new Date(), expires: 60 * 60 * 24 * 30 },
    },
    { versionKey: false },
);
