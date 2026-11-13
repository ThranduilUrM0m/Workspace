import { DEAL_OPEN, type DealSource, type DealStage, type DealView } from '@repo/schemas';
import { ago } from '@/lib/projects/derive';

// Every derivation the Deals list, the deal record and the create form share
// (wireframes/shell/projects-lib.js, "deals"). One file, so the three
// screens cannot disagree about a deal they are all reading: whose turn it
// is, what the verb is, how long it has waited.

export const STAGE: Record<DealStage, string> = {
    lead: 'Lead',
    proposal: 'Proposal',
    contract: 'Contract',
    won: 'Won',
    lost: 'Lost',
};

export const SOURCE: Record<DealSource, { label: string; note: string }> = {
    site: { label: 'Site', note: 'Your own site, unprompted.' },
    referral: { label: 'Referral', note: 'Somebody sent them.' },
    repeat: { label: 'Repeat', note: 'You have worked together before.' },
    direct: { label: 'Direct', note: 'They found you some other way.' },
};

/** Referral and repeat are what your relationships produced: the only sources you can make more of. */
export const EARNED: readonly DealSource[] = ['referral', 'repeat'];

/**
 * How long a document may sit unanswered before the deal is yours again. A
 * contract gets less rope: signing is a smaller decision than buying, so
 * silence on it means something went wrong.
 */
export const QUIET: Partial<Record<DealStage, number>> = { proposal: 7, contract: 5 };

/** The three nav doors onto the one list. */
export const DOORS = {
    leads: { stage: 'lead', title: 'Leads', kicker: 'Someone asked. Nothing is signed.' },
    proposals: {
        stage: 'proposal',
        title: 'Proposals',
        kicker: 'What you offered, and what they have not answered.',
    },
    contracts: {
        stage: 'contract',
        title: 'Contracts',
        kicker: 'Signed, and what it committed you to.',
    },
} as const satisfies Record<string, { stage: DealStage; title: string; kicker: string }>;
export type Door = keyof typeof DOORS;
export const isDoor = (k: string): k is Door => k in DOORS;

export type DealTurn = 'mine' | 'theirs' | 'closed';

export const isOpen = (d: DealView) => DEAL_OPEN.includes(d.stage);
export const age = (d: DealView, today: string) => ago(d.opened, today);
/** Days since the document went out. null is not zero: nothing has gone out at all. */
export const wait = (d: DealView, today: string) => (d.sent ? ago(d.sent, today) : null);

export function turn(d: DealView, today: string): DealTurn {
    if (!isOpen(d)) return 'closed';
    if (d.stage === 'lead') return 'mine';
    const w = wait(d, today);
    if (w === null) return 'mine';
    return w >= (QUIET[d.stage] ?? Infinity) ? 'mine' : 'theirs';
}

/** Your turn only because they went quiet, as opposed to your turn because nothing was sent. Only one of them is rotting. */
export function overdue(d: DealView, today: string): boolean {
    const w = wait(d, today);
    return isOpen(d) && w !== null && w >= (QUIET[d.stage] ?? Infinity);
}

/**
 * THE VERB. One function, so the row, the rail and the record cannot offer
 * three different next actions. null when the ball is genuinely not in your
 * court: an empty cell is the right answer, not a button that invents work.
 */
export function next(d: DealView, today: string): string | null {
    if (!isOpen(d)) return null;
    if (d.stage === 'lead') return 'Draft proposal';
    const w = wait(d, today);
    if (w === null) return d.stage === 'proposal' ? 'Send proposal' : 'Send contract';
    if (overdue(d, today)) return d.stage === 'proposal' ? 'Chase reply' : 'Chase signature';
    return null;
}

/** Open deals only: a won deal's money is Finance's from the day it is signed. No number counts as 0. */
export function pipeline(deals: DealView[]) {
    const open = deals.filter(isOpen);
    return {
        count: open.length,
        value: open.reduce((n, d) => n + (d.value ?? 0), 0),
        priced: open.filter((d) => d.priced).reduce((n, d) => n + (d.value ?? 0), 0),
        unvalued: open.filter((d) => d.value === null).length,
    };
}

/**
 * Your move / Waiting on them / Closed, each in its fixed order. Your move
 * ranks by rot: gone quiet first, longest first, then the drafts by how long
 * you have had them. Waiting: longest wait first. Closed: newest decision.
 */
export function group(deals: DealView[], today: string) {
    const mine = deals.filter((d) => turn(d, today) === 'mine');
    const theirs = deals.filter((d) => turn(d, today) === 'theirs');
    const closed = deals.filter((d) => turn(d, today) === 'closed');
    mine.sort((a, b) => {
        const oa = overdue(a, today);
        const ob = overdue(b, today);
        if (oa !== ob) return oa ? -1 : 1;
        if (oa && ob) return wait(b, today)! - wait(a, today)!;
        return age(b, today) - age(a, today);
    });
    theirs.sort((a, b) => wait(b, today)! - wait(a, today)!);
    closed.sort((a, b) => String(b.decided).localeCompare(String(a.decided)));
    return { mine, theirs, closed };
}

export function matches(d: DealView, q: string): boolean {
    if (!q) return true;
    return `${d.title} ${d.client.name} ${d.client.company}`
        .toLowerCase()
        .includes(q.toLowerCase());
}

/** "estimate" while you can still change the number; "offered" once someone has seen it; "agreed" once closed. */
export function kind(d: DealView): 'estimate' | 'offered' | 'agreed' {
    if (!d.priced) return 'estimate';
    return isOpen(d) ? 'offered' : 'agreed';
}

export const days = (n: number) => `${n} day${n === 1 ? '' : 's'}`;

/** The labels a site enquiry's details carry, in words. */
export const DETAIL_WORDS: Record<string, Record<string, string>> = {
    projectType: {
        website: 'Website',
        erp: 'ERP / internal tool',
        both: 'Website and ERP',
        'not-sure': 'Not sure yet',
    },
    category: { new: 'New project', refresh: 'Refresh / redesign', 'not-sure': 'Not sure yet' },
    budget: {
        'under-2k': 'Under $2k',
        '2k-5k': '$2k–$5k',
        '5k-15k': '$5k–$15k',
        '15k-plus': '$15k+',
        'not-sure': 'Not sure yet',
    },
    timeline: { asap: 'ASAP', months: 'Within a few months', flexible: 'Flexible / no rush' },
    via: { email: 'Email', phone: 'Phone', call: 'Call' },
    stage: { idea: 'Just an idea', direction: 'Have some direction', ready: 'Ready to start' },
};

export const DETAIL_LABELS: Record<string, string> = {
    projectType: 'Asked for',
    category: 'Asked for',
    company: 'Company',
    phone: 'Phone',
    site: 'Website',
    budget: 'Budget',
    timeline: 'Timeline',
    via: 'Prefers',
    timezone: 'Timezone',
    stage: 'Stage',
    outcome: 'Desired outcome',
    heard: 'Found the site through',
    refs: 'References',
    followUp: 'Added later',
};
