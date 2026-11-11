import { z } from 'zod';

// Milestones (T7.5c; wireframes/shell/project-plan.js, structure spec
// §8.05). A PHASE IS A MILESTONE, not a layer above one: a separate Phase
// entity would give two records the same job and make "which one is late"
// ambiguous. Order is the owner's, not the calendar's: phases have a
// sequence even when none is dated, and sorting by date would overrule
// an order set by hand. "What is soonest" is a different question, which
// nextMilestone answers from the dates.

const ISO_DAY = /^\d{4}-\d{2}-\d{2}$/;
const day = z
    .string()
    .regex(ISO_DAY, 'date')
    .refine((s) => !Number.isNaN(Date.parse(`${s}T00:00:00Z`)), 'date');

export const milestoneCreate = z.object({
    name: z.string().trim().min(1, 'required').max(120, 'tooLong'),
    /** A phase without a date is a real phase: an order decided, a commitment not yet made. */
    due: day.nullable().default(null),
});
export type MilestoneCreate = z.infer<typeof milestoneCreate>;

export const milestoneUpdate = z
    .object({
        name: z.string().trim().min(1, 'required').max(120, 'tooLong'),
        due: day.nullable(),
        done: z.boolean(),
    })
    .partial()
    .refine((v) => Object.keys(v).length > 0, 'empty');
export type MilestoneUpdate = z.infer<typeof milestoneUpdate>;

export const milestoneMove = z.object({ direction: z.enum(['up', 'down']) });
export type MilestoneMove = z.infer<typeof milestoneMove>;

export interface MilestoneView {
    id: string;
    projectId: string;
    name: string;
    /** YYYY-MM-DD, a calendar day: no time, no zone. */
    due: string | null;
    done: boolean;
    order: number;
}
