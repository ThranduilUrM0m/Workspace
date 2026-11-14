import { z } from 'zod';
import { CLIENT_STATUSES, clientCreate, type ClientPick, type ProjectStatus } from './projects';

// Clients (T8.3): the list, the record, New client, and the contact log
// they all read. Source of the shape: Blueprinting/wireframes/shell/
// projects-data.js (Clients, CommunicationLog), projects-lib.js (standing,
// silence, clientTurn), clients.js, client.js, client-new.js.

/**
 * What a log entry records. `reply` and `call` are the client acting: only
 * those stop the silence clock. `sent` and `note` are you; `token` is a
 * magic link going out (written by the system, never typed).
 */
export const CONTACT_KINDS = ['sent', 'reply', 'call', 'note', 'token'] as const;
export type ContactKind = (typeof CONTACT_KINDS)[number];
/** The kinds a person can log by hand. */
export const CONTACT_TYPED = ['reply', 'call', 'sent', 'note'] as const;

const day = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'invalid');
const objectId = z.string().regex(/^[a-f0-9]{24}$/, 'invalid');

/** Log contact, on the client's Communication tab. `at` defaults to today on the server. */
export const contactCreate = z.object({
    kind: z.enum(CONTACT_TYPED, 'required'),
    text: z.string().trim().min(1, 'required').max(300, 'tooLong'),
    at: day.optional(),
    projectId: objectId.optional(),
});
export type ContactCreate = z.infer<typeof contactCreate>;

/** New client: the inline fields, plus the stored judgement and an optional first entry. */
export const clientNew = clientCreate.extend({
    status: z.enum(CLIENT_STATUSES).optional(),
    firstEntry: z.string().trim().max(500, 'tooLong').optional(),
});
export type ClientNew = z.infer<typeof clientNew>;

/** One entry in a client's history, newest first. */
export interface ContactView {
    id: string;
    /** Calendar day, studio time. */
    at: string;
    kind: ContactKind;
    text: string;
    project: { id: string; name: string } | null;
}

/** One entry in the list's "Recent contact" rail: across everyone, so it names the client. */
export interface RecentContact extends ContactView {
    client: { id: string; name: string };
}

/**
 * A client with the facts the list and record derive from. The server sends
 * facts, never verdicts: standing, silence and whose turn it is are worked
 * out on screen (lib/clients/derive.ts), one file for all three screens.
 */
export interface ClientRow extends ClientPick {
    phone: string | null;
    website: string | null;
    /** Day the record was made. */
    since: string;
    projects: { id: string; name: string; status: ProjectStatus }[];
    /** Day of their last reply or call; null if they never answered. */
    lastTheirs: string | null;
    /** Day of the first entry of any kind; null if nothing was ever logged. */
    firstContact: string | null;
    contacts: number;
}

/** The New client form's typed fields (chips live beside it). */
export const clientNewForm = z.object({
    name: z.string(),
    company: z.string(),
    email: z.string(),
    phone: z.string(),
    website: z.string(),
    firstEntry: z.string(),
});
export type ClientNewForm = z.infer<typeof clientNewForm>;

/** Log contact's typed fields. */
export const contactForm = z.object({ text: z.string(), at: z.string() });
export type ContactForm = z.infer<typeof contactForm>;
