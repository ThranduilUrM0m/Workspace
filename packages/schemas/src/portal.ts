import { z } from 'zod';
import type { Language } from './projects';
import { BRIEF_PARTS } from './briefs';

// The client's portal (T8.4): a magic link per project, and the intake
// questionnaire behind it. Nothing here needs a login; the link is the key.
//
// The link is `/p/<token>`: 32 random bytes, base64url, 43 characters. The
// API stores only its SHA-256 hash.

export const PORTAL_TOKEN = /^[A-Za-z0-9_-]{43}$/;

/** What the owner's Intake tab knows about the link. The link itself is never readable again. */
export interface PortalLinkStatus {
    live: boolean;
    issuedAt: string | null;
    emailedAt: string | null;
    /** The last studio day (YYYY-MM-DD) the client opened it. */
    lastOpen: string | null;
}

/** Answer to issuing: the one and only time the link is shown. */
export interface PortalLinkIssued extends PortalLinkStatus {
    url: string;
    sent: boolean;
}

export const portalIssue = z.object({ send: z.boolean().default(false) });
export type PortalIssue = z.infer<typeof portalIssue>;

/**
 * What the client's page shows. `open`: answering. `sent_back`: answering
 * again, with the owner's reason. `done`: submitted or approved, nothing to
 * edit. Question wording is the site's (EN/FR/AR), keyed by `BRIEF_PARTS`.
 */
export type PortalState = 'open' | 'sent_back' | 'done';

export interface PortalView {
    state: PortalState;
    project: string;
    /** Who the page speaks to: the company, else the person. */
    who: string;
    language: Language;
    reason: string | null;
    answers: Record<string, string>;
}

const answer = z.string().trim().max(4000, 'tooLong');
const known = new Set(BRIEF_PARTS.map((p) => p.key));

/** Only known prompts; an empty one stays empty. */
export const portalAnswers = z
    .object({ answers: z.record(z.string(), answer) })
    .superRefine((v, ctx) => {
        for (const k of Object.keys(v.answers)) if (!known.has(k)) ctx.addIssue({ code: 'custom', path: ['answers', k], message: 'unknown' });
    });
export type PortalAnswers = z.infer<typeof portalAnswers>;

/** A send needs at least one answer: a blank answer is allowed, a blank form is not. */
export const portalSubmit = portalAnswers.superRefine((v, ctx) => {
    if (!Object.values(v.answers).some((a) => a.trim())) ctx.addIssue({ code: 'custom', path: ['answers'], message: 'required' });
});
