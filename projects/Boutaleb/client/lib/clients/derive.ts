import type { ClientRow, ClientStatus, ContactKind, Language } from '@repo/schemas';
import { ago, PARKED } from '@/lib/projects/derive';

// Every derivation the Clients list, the client record and New client share
// (wireframes/shell/projects-lib.js, "clients"). One file, so a number cannot
// change when you click from the list into the record.
//
// Money is Finance's and arrives with M10. Until then a client has no
// money facts, so nothing is late and Owed prints "—": "no source of truth,
// no display", the rule every list already follows.

export const CLIENT_STATUS: Record<ClientStatus, string> = {
    lead: 'Lead',
    active: 'Active',
    inactive: 'Inactive',
};

export const LANG: Record<Language, string> = { fr: 'French', en: 'English', ar: 'Arabic' };

export const KIND: Record<ContactKind, string> = {
    reply: 'Reply',
    call: 'Call',
    sent: 'Sent',
    note: 'Note',
    token: 'Link',
};

/**
 * When a relationship has gone quiet (not when a project stalled). An
 * unconverted lead is comparison-shopping, so it is chased after a week; a
 * signed client after three.
 */
export const CLIENT_QUIET = { lead: 7, live: 21 } as const;

/** Signed: anything past intake. An issued intake is a hope, not work. */
const SIGNED = ['planning', 'in_progress', 'review', 'on_hold', 'completed'];

export type Standing = 'lead' | 'live' | 'past';
export type ClientTurn = 'mine' | 'ok' | 'none';

/**
 * What the work says, as opposed to `status`, the judgement you stored.
 * Both are shown, never reconciled: a client filed Active whose last project
 * shipped in May is a fact you want to walk into.
 */
export function standing(c: ClientRow): Standing {
    const signed = c.projects.filter((p) => SIGNED.includes(p.status));
    if (!signed.length) return 'lead';
    return signed.some((p) => !PARKED.includes(p.status)) ? 'live' : 'past';
}

/** The stored word the derived standing agrees with; anything else is drift worth printing. */
export const AGREES: Record<Standing, ClientStatus> = { live: 'active', lead: 'lead', past: 'inactive' };
export const DERIVED: Record<Standing, string> = {
    live: 'live work',
    lead: 'nothing signed',
    past: 'no live work',
};
export const drift = (c: ClientRow) => !c.self && AGREES[standing(c)] !== c.status;

/**
 * Days since they last replied or called. Your chasing does not stop the
 * clock. Never answered: days since the first entry. Nothing logged: null.
 */
export function silence(c: ClientRow, today: string): number | null {
    if (c.lastTheirs) return ago(c.lastTheirs, today);
    if (c.firstContact) return ago(c.firstContact, today);
    return null;
}

/** Live projects: signed or not, anything not parked. */
export const live = (c: ClientRow) => c.projects.filter((p) => !PARKED.includes(p.status));

/**
 * Whose turn, at the relationship level. Deliberately not the project turn
 * summed up: an ordinary build in progress is Tuesday, not a client
 * problem. What a client needs you for is neglect, and only neglect.
 */
export function turn(c: ClientRow, today: string): ClientTurn {
    if (c.self) return 'ok';
    const s = standing(c);
    const q = silence(c, today);
    if (s === 'lead') return q === null || q >= CLIENT_QUIET.lead ? 'mine' : 'ok';
    if (s === 'past') return 'none';
    return q !== null && q >= CLIENT_QUIET.live ? 'mine' : 'ok';
}

/** Gone quiet past the limit (as opposed to never contacted). */
export function silent(c: ClientRow, today: string): boolean {
    const q = silence(c, today);
    return q !== null && q >= CLIENT_QUIET[standing(c) === 'lead' ? 'lead' : 'live'];
}

/**
 * Needs you / Running / No live work. Needs you ranks by silence, longest
 * first; Running too; No live work by name. Fixed orders: no sort control.
 */
export function group(cs: ClientRow[], today: string) {
    // The studio's own record sits last: it is in the list, but it is not a relationship.
    const by = (a: ClientRow, b: ClientRow) =>
        Number(a.self) - Number(b.self) ||
        (silence(b, today) ?? Infinity) - (silence(a, today) ?? Infinity) ||
        a.name.localeCompare(b.name);
    const mine = cs.filter((c) => turn(c, today) === 'mine').sort(by);
    const ok = cs.filter((c) => turn(c, today) === 'ok').sort(by);
    const none = cs
        .filter((c) => turn(c, today) === 'none')
        .sort((a, b) => a.name.localeCompare(b.name));
    return { mine, ok, none };
}

/** The row's verb, in Needs you only. A lead with nothing started: start it. Otherwise: get back in touch. */
export function verb(c: ClientRow, today: string): { label: string; href: string } | null {
    if (turn(c, today) !== 'mine') return null;
    if (standing(c) === 'lead' && !c.projects.length)
        return { label: 'Start project', href: `/app/projects/new?client=${c.id}` };
    return { label: 'Chase', href: `/app/clients/${c.id}?tab=log` };
}

export function matches(c: ClientRow, q: string): boolean {
    if (!q) return true;
    return `${c.name} ${c.company} ${c.email}`.toLowerCase().includes(q.toLowerCase());
}

export const days = (n: number) => `${n} day${n === 1 ? '' : 's'}`;
export const agoText = (n: number) => (n === 0 ? 'today' : `${days(n)} ago`);
