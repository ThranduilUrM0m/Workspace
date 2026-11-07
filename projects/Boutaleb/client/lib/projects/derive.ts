import type { ProjectStatus, ProjectView } from '@repo/schemas';

// The derivations every Projects surface shares (wireframes/shell/
// projects-lib.js). The list and the record must never disagree about whose
// turn it is, because the record is what you reach by clicking the list.
//
// Pure: nothing here fetches or touches the DOM, and "today" is passed in.
//
// A project's own record says little about urgency. The facts that do are
// owned by other modules and arrive with them: the contact log (M8), the
// plan's milestones (T7.5), money (M10), the board's tickets (M9). Until
// then every project has EMPTY_FACTS, and each derivation answers honestly
// from that: no log means no silence, no money means nothing late. "No
// source of truth, no display" is the rule the wireframe already follows.

export type Turn = 'mine' | 'theirs' | 'parked';

/** A touchpoint. A reply or a call is the client acting; mail and tokens are you. */
export interface LogEntry {
    at: string;
    kind: 'call' | 'reply' | 'token' | 'mail';
    text: string;
}

export interface Milestone {
    name: string;
    due: string | null;
    done: boolean;
}

/** Value = accepted quotes. Outstanding = issued invoices minus payments. dueOn = oldest unpaid invoice. */
export interface Money {
    value: number;
    outstanding: number;
    dueOn: string | null;
}

export interface ProjectFacts {
    log: LogEntry[];
    milestones: Milestone[];
    money: Money | null;
    tickets: { done: number; total: number } | null;
}

export const EMPTY_FACTS: ProjectFacts = { log: [], milestones: [], money: null, tickets: null };

/* ---------- lifecycle ---------- */

/** `short` names the pipeline segment and its legend. `idea` ranks first: it is where it sits in the funnel. */
export const STATUS: Record<ProjectStatus, { label: string; short: string; rank: number }> = {
    idea: { label: 'Idea', short: 'idea', rank: -1 },
    intake_pending: { label: 'Intake pending', short: 'intake', rank: 0 },
    planning: { label: 'Planning', short: 'planning', rank: 1 },
    in_progress: { label: 'In progress', short: 'building', rank: 2 },
    review: { label: 'Review', short: 'review', rank: 3 },
    on_hold: { label: 'On hold', short: 'parked', rank: 4 },
    completed: { label: 'Completed', short: 'done', rank: 5 },
};

/** Nothing is asking for you. Only `completed` folds away; an idea you can no longer see is an idea abandoned. */
export const PARKED: ProjectStatus[] = ['idea', 'on_hold', 'completed'];

/** Genuinely waiting on someone else. A quiet client during in_progress is a working condition, not a warning. */
export const WAITING: ProjectStatus[] = ['intake_pending', 'review'];

/** An unsigned lead goes cold fast; a signed client chased on day 3 reads as anxious. Spec §4.4. */
export const STALL_DAYS: Partial<Record<ProjectStatus, number>> = { intake_pending: 3, review: 7 };

/* ---------- days ---------- */

/** Today in the studio's time zone, as YYYY-MM-DD. */
export function todayIso(now = new Date()): string {
    return new Intl.DateTimeFormat('en-CA', { timeZone: 'Africa/Casablanca' }).format(now);
}

const utc = (iso: string) => Date.UTC(+iso.slice(0, 4), +iso.slice(5, 7) - 1, +iso.slice(8, 10));

/** Whole days from today to `iso` (negative = past). Calendar days, so no DST or hour drift. */
export const daysFrom = (iso: string, today: string) => Math.round((utc(iso) - utc(today)) / 86_400_000);
export const ago = (iso: string, today: string) => -daysFrom(iso, today);

/** "184 000 MAD": French grouping with a non-breaking space, so it never wraps in the money column. */
export function cash(n: number, currency = 'MAD'): string {
    return `${new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 0 }).format(n).replace(/[   ]/g, ' ')} ${currency}`;
}

/* ---------- derivations ---------- */

/**
 * Days since the CLIENT last did something. If they never have, the clock
 * runs from your first attempt: chasing must not reset it, or the rot
 * hides behind your own diligence. null = nothing logged at all.
 */
export function silence(f: ProjectFacts, today: string): number | null {
    if (!f.log.length) return null;
    const theirs = f.log.filter((l) => l.kind === 'reply' || l.kind === 'call').sort((a, b) => b.at.localeCompare(a.at));
    if (theirs.length) return ago(theirs[0]!.at, today);
    const first = [...f.log].sort((a, b) => a.at.localeCompare(b.at))[0]!;
    return ago(first.at, today);
}

export function isStalled(p: ProjectView, f: ProjectFacts, today: string): boolean {
    const limit = STALL_DAYS[p.status];
    if (limit === undefined) return false;
    const s = silence(f, today);
    return s !== null && s >= limit;
}

/** Earliest undone milestone; a dated one outranks an undated one, so an undated-only project still names it. */
export function nextMilestone(f: ProjectFacts): Milestone | null {
    const open = f.milestones.filter((m) => !m.done);
    if (!open.length) return null;
    const dated = open.filter((m) => m.due).sort((a, b) => a.due!.localeCompare(b.due!));
    return dated[0] ?? open[0]!;
}

export type DueState = '' | 'soon' | 'late';

const shortDate = (iso: string) =>
    new Intl.DateTimeFormat('en-GB', { weekday: 'short', day: 'numeric', month: 'short', timeZone: 'UTC' }).format(utc(iso));

/** Same thresholds as the board, so a date never reads "soon" on one screen and neutral on another. */
export function dueFrom(iso: string, today: string): { txt: string; state: DueState } {
    const n = daysFrom(iso, today);
    if (n < 0) return { txt: `${-n} day${n === -1 ? '' : 's'} late`, state: 'late' };
    if (n === 0) return { txt: 'Due today', state: 'soon' };
    if (n === 1) return { txt: 'Due tomorrow', state: 'soon' };
    if (n <= 7) return { txt: `Due in ${n} days`, state: 'soon' };
    return { txt: shortDate(iso), state: '' };
}

/** The strip's phrasing: "in 4 days", "tomorrow", "3 days late". */
export function relDue(iso: string, today: string): { txt: string; state: DueState } {
    const n = daysFrom(iso, today);
    if (n < 0) return { txt: `${-n} days late`, state: 'late' };
    if (n === 0) return { txt: 'today', state: 'soon' };
    if (n === 1) return { txt: 'tomorrow', state: 'soon' };
    return { txt: `in ${n} days`, state: n <= 7 ? 'soon' : '' };
}

/** Money that should already have arrived: outstanding, past the oldest unpaid invoice's due date. */
export function lateMoney(f: ProjectFacts, today: string): { amount: number; days: number } | null {
    const m = f.money;
    if (!m || !m.outstanding || !m.dueOn) return null;
    const n = ago(m.dueOn, today);
    return n > 0 ? { amount: m.outstanding, days: n } : null;
}

/**
 * Whose turn it is. Derived, never stored. Late money outranks everything,
 * Parked included: a completed project with an unpaid invoice is still your
 * move. A stalled row is yours too, because the next action is to chase.
 */
export function turn(p: ProjectView, f: ProjectFacts, today: string): Turn {
    if (lateMoney(f, today)) return 'mine';
    if (PARKED.includes(p.status)) return 'parked';
    if (isStalled(p, f, today)) return 'mine';
    if (WAITING.includes(p.status)) return 'theirs';
    return 'mine';
}

/** Completed and nothing owed: folds into the Completed group. Late money keeps it in Your move. */
export const isDone = (p: ProjectView, f: ProjectFacts, today: string) => p.status === 'completed' && turn(p, f, today) === 'parked';

/* ---------- the row ---------- */

/** One clock per row, chosen by state (spec §6.2). Late money beats a deadline you might still make. */
export type Clock =
    | { kind: 'late'; days: number }
    | { kind: 'silent'; days: number }
    | { kind: 'quiet'; text: string }
    | { kind: 'milestone'; name: string; due: { txt: string; state: DueState } | null }
    | { kind: 'none' };

export function clock(p: ProjectView, f: ProjectFacts, today: string): Clock {
    const late = lateMoney(f, today);
    if (late) return { kind: 'late', days: late.days };
    const where = turn(p, f, today);
    if (where === 'parked') return { kind: 'none' };
    if (isStalled(p, f, today)) return { kind: 'silent', days: silence(f, today)! };
    if (where === 'theirs') {
        const s = silence(f, today);
        return { kind: 'quiet', text: s === null ? 'No reply yet' : `Waiting ${s} day${s === 1 ? '' : 's'}` };
    }
    const ms = nextMilestone(f);
    if (!ms) return { kind: 'quiet', text: 'No milestone set' };
    return { kind: 'milestone', name: ms.name, due: ms.due ? dueFrom(ms.due, today) : null };
}

/** One verb, and only in Your move. An empty cell is the right answer for the other groups (spec §6.5). */
export function action(p: ProjectView, f: ProjectFacts, today: string): { label: string; href: string; chase: boolean } | null {
    if (turn(p, f, today) !== 'mine') return null;
    const record = `/app/projects/${p.id}`;
    const stalled = isStalled(p, f, today);
    if (lateMoney(f, today)) return { label: 'Chase payment', href: record, chase: true };
    if (stalled && p.status === 'intake_pending') return { label: 'Resend link', href: record, chase: true };
    if (stalled) return { label: 'Chase', href: record, chase: true };
    if (p.status === 'planning') return { label: 'Plan phases', href: `${record}?tab=plan`, chase: false };
    return { label: 'Open board', href: record, chase: false };
}

/* ---------- the list ---------- */

export interface Row {
    p: ProjectView;
    f: ProjectFacts;
}

/** Name, client name and company, case-folded. The search box filters this one list and nothing else. */
export function matches(p: ProjectView, q: string): boolean {
    if (!q) return true;
    const hay = `${p.name} ${p.client ? `${p.client.name} ${p.client.company}` : ''}`.toLowerCase();
    return hay.includes(q.trim().toLowerCase());
}

const dueKey = (f: ProjectFacts) => nextMilestone(f)?.due ?? '9999-99-99';

/**
 * The three groups, plus Completed. Order inside a group is fixed and
 * meaningful, which is why there is no sort control (spec §4.5): Your move
 * puts the stalled first (longest silence first), then the nearest
 * milestone; Waiting puts the longest silence first; the rest go by name.
 */
export function group(rows: Row[], today: string): Record<Turn | 'done', Row[]> {
    const out: Record<Turn | 'done', Row[]> = { mine: [], theirs: [], parked: [], done: [] };
    for (const r of rows) out[isDone(r.p, r.f, today) ? 'done' : turn(r.p, r.f, today)].push(r);
    const byName = (a: Row, b: Row) => a.p.name.localeCompare(b.p.name);
    const sil = (r: Row) => silence(r.f, today) ?? 0;
    out.mine.sort((a, b) => {
        const sa = isStalled(a.p, a.f, today);
        const sb = isStalled(b.p, b.f, today);
        if (sa !== sb) return sa ? -1 : 1;
        if (sa) return sil(b) - sil(a) || byName(a, b);
        return dueKey(a.f).localeCompare(dueKey(b.f)) || byName(a, b);
    });
    out.theirs.sort((a, b) => sil(b) - sil(a) || byName(a, b));
    out.parked.sort(byName);
    out.done.sort(byName);
    return out;
}

/** Stage counts for the pipeline bar, in funnel order. A zero stage draws nothing. */
export function pipeline(projects: ProjectView[]): { status: ProjectStatus; n: number }[] {
    return (Object.keys(STATUS) as ProjectStatus[])
        .map((status) => ({ status, n: projects.filter((p) => p.status === status).length }))
        .filter((s) => s.n > 0)
        .sort((a, b) => STATUS[a.status].rank - STATUS[b.status].rank);
}

/** The strip: the facts between the rows that no single row can show. */
export function position(rows: Row[], today: string) {
    const owed = rows.reduce((n, r) => n + (r.f.money?.outstanding ?? 0), 0);
    const owedCount = rows.filter((r) => (r.f.money?.outstanding ?? 0) > 0).length;
    const late = rows.reduce((n, r) => n + (lateMoney(r.f, today)?.amount ?? 0), 0);
    const active = rows.filter((r) => !PARKED.includes(r.p.status)).reduce((n, r) => n + (r.f.money?.value ?? 0), 0);
    const soonest = rows
        .flatMap((r) => r.f.milestones.filter((m) => !m.done && m.due))
        .sort((a, b) => a.due!.localeCompare(b.due!))[0];
    return { owed, owedCount, late, active, soonest: soonest ? { name: soonest.name, due: relDue(soonest.due!, today) } : null };
}
