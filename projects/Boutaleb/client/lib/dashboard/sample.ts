// SAMPLE DATA. The Dashboard's shape, filled from the wireframe
// (wireframes/shell/dash-v4.js) until the API serves the real thing:
// enquiries with T8.1, projects and clients with their tickets, money with
// Finance. Each source swaps its fetcher in dashboard/queries.ts, not here.

export type Fam = 'build' | 'craft' | 'money' | 'admin';
export type Prio = 'critical' | 'high' | 'medium' | 'low';

export interface Kpi {
    label: string;
    icon: 'ledger' | 'coins' | 'inbox' | 'hourglass';
    /** Shown as is; a leading number counts up on load. */
    value: string;
    /** Good or bad, not the arithmetic sign: more owed to you is bad. */
    sentiment?: 'up' | 'down';
    delta?: string;
    context: string;
    /** People or projects behind the number, as circles beside it. */
    stack?: { name: string; fam?: Fam }[];
    /** The one tinted card: money in. */
    money?: boolean;
    /** Which source it comes from, so a failed source blanks only its own. */
    source: 'work' | 'money';
}

export interface WorkData {
    needs: string[];
    projects: { name: string; desc: string; stage: string; fam: Fam; pct: number; amount: number }[];
    deadlines: { date: string; title: string; sub: string; prio: Prio; rel: string }[];
    clients: { name: string; sub: string; since: string }[];
}

export interface MoneyData {
    revenueMtd: number;
    cashInHand: number;
    /** Revenue by month, oldest first, with its labels. */
    series: { month: string; value: number }[];
    avgProject: number;
    avgMonths: number;
}

export const MAD = (n: number) => `${n.toLocaleString('en-US')} MAD`;

export const WORK: WorkData = {
    needs: [
        'Café Andalou balance <b>18,000 MAD</b> is 12 days overdue',
        '<b>Villa Anfa</b> moodboard was due yesterday',
        'Atlas Spa proposal expires <b>in 2 days</b>',
    ],
    projects: [
        { name: 'Villa Anfa — full interior', desc: 'Casablanca · 6 rooms · handover Sep', stage: 'Execution', fam: 'build', pct: 72, amount: 184000 },
        { name: 'Café Andalou — fit-out', desc: 'Rabat · front of house', stage: 'Sourcing', fam: 'money', pct: 45, amount: 96000 },
        { name: 'Atlas Spa — concept', desc: 'Marrakech · concept + moodboard', stage: 'Design', fam: 'craft', pct: 20, amount: 58000 },
    ],
    deadlines: [
        { date: '2026-09-04', title: 'Villa Anfa — client handover', sub: 'Site walkthrough, 10:00', prio: 'critical', rel: 'in 1 day' },
        { date: '2026-09-09', title: 'Café Andalou — lighting spec', sub: 'Supplier cut-off', prio: 'high', rel: 'in 6 days' },
        { date: '2026-09-18', title: 'Atlas Spa — concept present', sub: 'Deck + moodboard', prio: 'medium', rel: 'in 15 days' },
    ],
    clients: [
        { name: 'Nadia Benali', sub: 'Villa Anfa', since: 'Since Mar 2026' },
        { name: 'Café Andalou', sub: 'Youssef Alami', since: 'Since Jun 2026' },
        { name: 'Atlas Spa Group', sub: 'Salma Cherkaoui', since: 'Since Aug 2026' },
    ],
};

export const MONEY: MoneyData = {
    revenueMtd: 62400,
    cashInHand: 31800,
    series: ['Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep'].map((month, i) => ({ month, value: [22, 30, 26, 41, 38, 52, 47, 64][i]! * 1000 })),
    avgProject: 112000,
    avgMonths: 4.5,
};

/* The four numbers, left to right one chain from first contact to money in
   the bank: someone asked → work is done → it is billed → it is paid.
   Chosen 2026-10-24 over Active projects / Next deadline, which repeated
   the panels further down. */
export const KPIS: Kpi[] = [
    {
        label: 'Enquiries waiting',
        icon: 'inbox',
        value: '2',
        sentiment: 'down',
        delta: '+1',
        context: 'oldest 3 days',
        source: 'work',
        stack: [{ name: 'Karim Tazi' }, { name: 'Hotel Lamia' }],
    },
    { label: 'Unbilled work', icon: 'hourglass', value: MAD(36500), sentiment: 'down', delta: '+8,000', context: '3 projects · oldest 19 days', source: 'money' },
    { label: 'Owed to you', icon: 'ledger', value: MAD(48200), sentiment: 'down', delta: '+15%', context: '2 invoices · oldest 41 days', source: 'money' },
    { label: 'Revenue, MTD', icon: 'coins', value: MAD(62400), sentiment: 'up', delta: '+12%', context: 'vs. August', money: true, source: 'money' },
];

/* The first day: zeros, and a line saying what will land there. Deltas hide
   when there is no history. */
export const KPIS_EMPTY: Record<string, Pick<Kpi, 'value' | 'context'>> = {
    'Enquiries waiting': { value: '0', context: 'Site enquiries land here' },
    'Unbilled work': { value: MAD(0), context: 'Finished work not yet invoiced' },
    'Owed to you': { value: MAD(0), context: 'Nothing invoiced yet' },
    'Revenue, MTD': { value: MAD(0), context: 'Starts with the first payment' },
};

export const EMPTY_WORK: WorkData = { needs: [], projects: [], deadlines: [], clients: [] };
export const EMPTY_MONEY: MoneyData = { revenueMtd: 0, cashInHand: 0, series: [], avgProject: 0, avgMonths: 0 };
