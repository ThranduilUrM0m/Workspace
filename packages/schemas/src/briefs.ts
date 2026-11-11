import { z } from 'zod';

// The brief (T7.5b; wireframes/shell/project-intake.js, structure spec
// §7). ONE submission per project: a thin answer is never bounced back to
// the client ("we don't ask them twice"); the owner fills the gap with a
// note. Send back survives for one purpose only: a brief you actively
// disagree with, with a written reason.
//
// Two ways a brief comes to exist: the client answers the questionnaire
// behind their magic link (M8), or the owner writes it, which is the only
// way for a project with nobody to ask (an idea, or internal work).

export const BRIEF_STATES = ['none', 'awaiting', 'submitted', 'approved', 'sent_back'] as const;
export type BriefState = (typeof BRIEF_STATES)[number];

/**
 * The five reading sections and the eleven prompts the owner writes
 * against. One thing per box: a single box per section makes you hold
 * three thoughts at once and answer whichever came first.
 */
export const BRIEF_AREAS = [
    {
        key: 'discovery',
        label: 'Discovery',
        parts: [
            { key: 'what', label: 'What the business does', hint: 'What it sells, to whom, how it makes money today.' },
            { key: 'who', label: 'Who it is for', hint: 'The people who will actually use this, not the market it sits in.' },
            { key: 'broken', label: 'What is broken today', hint: 'The thing that made this project worth starting.' },
        ],
    },
    {
        key: 'strategy',
        label: 'Strategy',
        parts: [
            { key: 'success', label: 'What success looks like in a year', hint: 'Stated so that it could turn out false.' },
            { key: 'measure', label: 'How we will know it worked', hint: 'The number, the behaviour or the phone call that proves it.' },
        ],
    },
    {
        key: 'requirements',
        label: 'Requirements',
        parts: [
            { key: 'day1', label: 'What it must do on day one', hint: 'One line each. Everything here becomes work.' },
            { key: 'out', label: 'What is deliberately out of scope', hint: 'Writing this down now is what stops it arriving later as an assumption.' },
        ],
    },
    {
        key: 'ux',
        label: 'Experience',
        parts: [
            { key: 'feel', label: 'How it should feel', hint: 'A few words, not a paragraph. Tone, pace, restraint.' },
            { key: 'wrong', label: 'What people get wrong today', hint: 'Where they hesitate, misread, or give up.' },
        ],
    },
    {
        key: 'erp',
        label: 'Operations',
        parts: [
            { key: 'runs', label: 'Who runs it after launch', hint: 'By name, and how comfortable they are with a computer.' },
            { key: 'needs', label: 'What they will need from you', hint: 'Training, a handover document, a support arrangement, nothing.' },
        ],
    },
] as const;

export type BriefAreaKey = (typeof BRIEF_AREAS)[number]['key'];
export const BRIEF_AREA_KEYS = BRIEF_AREAS.map((a) => a.key) as [BriefAreaKey, ...BriefAreaKey[]];

/** "discovery.what", … : every prompt across every area, flattened once. */
export const BRIEF_PARTS = BRIEF_AREAS.flatMap((a) => a.parts.map((p) => ({ area: a.key as BriefAreaKey, key: `${a.key}.${p.key}`, label: p.label, hint: p.hint })));

/** Under this many characters an answer gives nothing to plan against. A stand-in for judgement on content, not length. */
export const THIN_CHARS = 60;
export const isThin = (a: string | null | undefined) => !a || a.trim().length < THIN_CHARS;

/** Fewer than this and a send-back reason cannot say what to change. */
export const REASON_MIN = 16;

const answer = z.string().trim().max(4000, 'tooLong');

/** The owner writes the brief: any subset of the eleven prompts; an empty prompt stays empty. */
export const briefWrite = z
    .object({ answers: z.record(z.string(), answer) })
    .superRefine((v, ctx) => {
        const known = new Set(BRIEF_PARTS.map((p) => p.key));
        for (const k of Object.keys(v.answers)) if (!known.has(k)) ctx.addIssue({ code: 'custom', path: ['answers', k], message: 'unknown' });
        if (!Object.values(v.answers).some((a) => a.trim())) ctx.addIssue({ code: 'custom', path: ['answers'], message: 'required' });
    });
export type BriefWrite = z.infer<typeof briefWrite>;

export const briefSendBack = z.object({ reason: z.string().trim().min(REASON_MIN, 'tooShort').max(2000, 'tooLong') });
export type BriefSendBack = z.infer<typeof briefSendBack>;

/** A note on one area: what you know that they did not say. Empty clears it. */
export const briefNote = z.object({ note: z.string().trim().max(2000, 'tooLong') });
export type BriefNote = z.infer<typeof briefNote>;

export interface BriefQA {
    q: string;
    a: string;
}

export interface BriefArea {
    key: BriefAreaKey;
    qs: BriefQA[];
    note: string | null;
}

/** The read-back of a client submission (M12 drafts it); null for a brief you wrote. */
export interface BriefReading {
    summary: string;
    risks: string[];
    assumptions: string[];
}

export interface BriefView {
    projectId: string;
    state: BriefState;
    /** Whose words: true when the owner wrote it, so there is nobody to send it back to. */
    mine: boolean;
    /** What they said when they got in touch, or what you wrote when you started it. */
    seed: string | null;
    sentAt: string | null;
    submittedAt: string | null;
    decidedAt: string | null;
    reason: string | null;
    /** How many times it was submitted: a sent-back brief comes back as the next revision. */
    revision: number;
    reading: BriefReading | null;
    areas: BriefArea[];
}
