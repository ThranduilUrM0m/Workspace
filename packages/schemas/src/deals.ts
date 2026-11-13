import { z } from 'zod';
import { clientCreate, type ClientSummary } from './projects';

// Deals (T8.2): everything before a Project exists. One record per thing
// somebody asked for, always hanging off a Client (a deal is a counterparty).
// A public enquiry creates one by itself; "Log an enquiry" is the manual
// path for the phone call and the referral over coffee.
//
// Source of the shape: Blueprinting/wireframes/shell/projects-data.js
// (DEALS), projects-lib.js (stages, turn, verb), deal-new.js (what create
// asks for).

/** lead -> proposal -> contract -> won | lost. */
export const DEAL_STAGES = ['lead', 'proposal', 'contract', 'won', 'lost'] as const;
export type DealStage = (typeof DEAL_STAGES)[number];

/** The three stages where the deal is still alive. */
export const DEAL_OPEN: readonly DealStage[] = ['lead', 'proposal', 'contract'];

/** Where the work came from. Referral and repeat are earned; site and direct are weather. */
export const DEAL_SOURCES = ['site', 'referral', 'repeat', 'direct'] as const;
export type DealSource = (typeof DEAL_SOURCES)[number];

const text = (max: number) => z.string().trim().max(max, 'tooLong');
const objectId = z.string().regex(/^[a-f0-9]{24}$/, 'invalid');

/**
 * Log an enquiry. Who it is for is either a picked client or a new one
 * (saved to Clients as a lead), never neither. Value is optional and a
 * guess; source is required and deliberately not defaulted.
 */
export const dealCreate = z
    .object({
        clientId: objectId.optional(),
        newClient: clientCreate.optional(),
        title: text(120).min(3, 'required'),
        /** MAD, whole dirhams. */
        value: z.number().int().positive().max(100_000_000).nullable().default(null),
        source: z.enum(DEAL_SOURCES, 'required'),
        note: text(2000).optional(),
    })
    .refine((v) => Boolean(v.clientId) !== Boolean(v.newClient), {
        message: 'required',
        path: ['clientId'],
    });
export type DealCreate = z.infer<typeof dealCreate>;

/** Close as lost. The reason is the only field on a dead deal worth reading again, so it is required. */
export const dealLose = z.object({ lostWhy: text(200).min(1, 'required') });
export type DealLose = z.infer<typeof dealLose>;

/** GET /deals filters. */
export const dealListQuery = z.object({
    stage: z.enum(DEAL_STAGES).optional(),
    clientId: objectId.optional(),
});
export type DealListQuery = z.infer<typeof dealListQuery>;

/** What the site form said, when the deal came from one: shown on the record, never edited. */
export interface DealEnquiry {
    id: string;
    ref: string;
    source: 'footer' | 'contact';
    message: string;
    details: Record<string, string>;
    receivedAt: string;
}

/**
 * A deal as every screen reads it. Calendar days (`opened`, `sent`,
 * `decided`) are YYYY-MM-DD; `value` null means nobody has put a number on
 * it yet. `priced` false means the number is your estimate, not an offer.
 */
export interface DealView {
    id: string;
    title: string;
    stage: DealStage;
    source: DealSource;
    value: number | null;
    priced: boolean;
    opened: string;
    sent: string | null;
    decided: string | null;
    lostWhy: string | null;
    note: string | null;
    client: ClientSummary;
    enquiry: DealEnquiry | null;
}

/**
 * The Log an enquiry form's typed fields. The client picker, the language
 * chips and the source options live beside it; the requirement line and the
 * server's dealCreate are what judge it.
 */
export const dealNewForm = z.object({
    title: z.string(),
    value: z.string(),
    note: z.string(),
    clientName: z.string(),
    clientEmail: z.string(),
    clientCompany: z.string(),
});
export type DealNewForm = z.infer<typeof dealNewForm>;
