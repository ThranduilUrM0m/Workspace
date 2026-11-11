import type { ProjectStatus, ProjectView } from '@repo/schemas';
import { action, cash, clock, daysFrom, dueFrom, EMPTY_FACTS, group, initials, isStalled, matches, nextMilestone, pipeline, position, recordClock, silence, todayIso, turn, type ProjectFacts } from './derive';

const TODAY = '2026-11-07';

let seq = 0;
function project(status: ProjectStatus, over: Partial<ProjectView> = {}): ProjectView {
    seq += 1;
    return {
        id: String(seq).padStart(24, '0'),
        name: `Project ${seq}`,
        slug: `project-${seq}`,
        status,
        client: { id: 'c'.repeat(24), name: 'Omar Fassi', company: 'Villa Zerhoun', email: 'omar@example.ma', language: 'fr', self: false },
        internal: false,
        governingLanguage: 'fr',
        note: null,
        currency: 'MAD',
        modules: ['quotes', 'invoices', 'payments'],
        assetOwnership: [],
        archivedAt: null,
        createdAt: '2026-10-01T09:00:00.000Z',
        updatedAt: '2026-10-01T09:00:00.000Z',
        ...over,
    };
}
const facts = (over: Partial<ProjectFacts>): ProjectFacts => ({ ...EMPTY_FACTS, ...over });

describe('days', () => {
    it('counts calendar days in the studio time zone', () => {
        expect(daysFrom('2026-11-10', TODAY)).toBe(3);
        expect(daysFrom('2026-11-01', TODAY)).toBe(-6);
        // 23:30 UTC on the 6th is already the 7th in Casablanca (UTC+1).
        expect(todayIso(new Date('2026-11-06T23:30:00Z'))).toBe('2026-11-07');
    });

    it('formats money with a non-breaking thousands space and the currency', () => {
        expect(cash(184000)).toBe('184 000 MAD');
        expect(cash(1200, 'EUR')).toBe('1 200 EUR');
    });

    it('phrases a due date the way the board does', () => {
        expect(dueFrom('2026-11-06', TODAY)).toEqual({ txt: '1 day late', state: 'late' });
        expect(dueFrom('2026-11-07', TODAY)).toEqual({ txt: 'Due today', state: 'soon' });
        expect(dueFrom('2026-11-12', TODAY)).toEqual({ txt: 'Due in 5 days', state: 'soon' });
        expect(dueFrom('2026-11-20', TODAY)).toEqual({ txt: 'Fri 20 Nov', state: '' });
    });
});

describe('silence and stalling', () => {
    it('their reply stops the clock; your chasing does not reset it', () => {
        expect(silence(EMPTY_FACTS, TODAY)).toBeNull();
        const chased = facts({ log: [
            { at: '2026-10-30', kind: 'token', text: 'Intake sent' },
            { at: '2026-11-06', kind: 'mail', text: 'Reminder' },
        ] });
        expect(silence(chased, TODAY)).toBe(8);
        const answered = facts({ log: [...chased.log, { at: '2026-11-05', kind: 'reply', text: 'Will fill it in' }] });
        expect(silence(answered, TODAY)).toBe(2);
    });

    it('intake stalls at 3 days, review at 7, building never', () => {
        const quiet4 = facts({ log: [{ at: '2026-11-03', kind: 'token', text: 'sent' }] });
        expect(isStalled(project('intake_pending'), quiet4, TODAY)).toBe(true);
        expect(isStalled(project('review'), quiet4, TODAY)).toBe(false);
        expect(isStalled(project('in_progress'), quiet4, TODAY)).toBe(false);
    });
});

describe('whose turn', () => {
    it('with no facts yet: waiting states are theirs, parked states parked, the rest mine', () => {
        expect(turn(project('intake_pending'), EMPTY_FACTS, TODAY)).toBe('theirs');
        expect(turn(project('review'), EMPTY_FACTS, TODAY)).toBe('theirs');
        expect(turn(project('idea'), EMPTY_FACTS, TODAY)).toBe('parked');
        expect(turn(project('on_hold'), EMPTY_FACTS, TODAY)).toBe('parked');
        expect(turn(project('planning'), EMPTY_FACTS, TODAY)).toBe('mine');
        expect(turn(project('in_progress'), EMPTY_FACTS, TODAY)).toBe('mine');
    });

    it('late money pulls even a completed project into Your move', () => {
        const owing = facts({ money: { value: 40000, invoiced: 30000, outstanding: 18000, dueOn: '2026-10-20' } });
        const p = project('completed');
        expect(turn(p, owing, TODAY)).toBe('mine');
        expect(clock(p, owing, TODAY)).toEqual({ kind: 'late', days: 18 });
        expect(action(p, owing, TODAY)).toMatchObject({ label: 'Chase payment', chase: true });
    });

    it('a stalled intake is yours, with a red clock and Resend link', () => {
        const p = project('intake_pending');
        const f = facts({ log: [{ at: '2026-11-01', kind: 'token', text: 'sent' }] });
        expect(turn(p, f, TODAY)).toBe('mine');
        expect(clock(p, f, TODAY)).toEqual({ kind: 'silent', days: 6 });
        expect(action(p, f, TODAY)).toMatchObject({ label: 'Resend link', chase: true });
    });
});

describe('the row', () => {
    it('says what is honestly known when nothing is logged yet', () => {
        expect(clock(project('intake_pending'), EMPTY_FACTS, TODAY)).toEqual({ kind: 'quiet', text: 'No reply yet' });
        expect(clock(project('in_progress'), EMPTY_FACTS, TODAY)).toEqual({ kind: 'quiet', text: 'No milestone set' });
        expect(clock(project('idea'), EMPTY_FACTS, TODAY)).toEqual({ kind: 'none' });
    });

    it('names the next milestone, dated before undated', () => {
        const f = facts({ milestones: [
            { name: 'Sitemap', due: null, done: false },
            { name: 'Design', due: '2026-11-09', done: false },
            { name: 'Kickoff', due: '2026-10-01', done: true },
        ] });
        expect(nextMilestone(f)?.name).toBe('Design');
        expect(clock(project('in_progress'), f, TODAY)).toEqual({ kind: 'milestone', name: 'Design', due: { txt: 'Due in 2 days', state: 'soon' } });
    });

    it('one verb, only in Your move; planning goes to the plan tab', () => {
        const plan = project('planning');
        expect(action(plan, EMPTY_FACTS, TODAY)).toEqual({ label: 'Plan phases', href: `/app/projects/${plan.id}?tab=plan`, chase: false });
        expect(action(project('in_progress'), EMPTY_FACTS, TODAY)).toMatchObject({ label: 'Open board' });
        expect(action(project('review'), EMPTY_FACTS, TODAY)).toBeNull();
        expect(action(project('idea'), EMPTY_FACTS, TODAY)).toBeNull();
    });
});

describe('the list', () => {
    it('groups, folds Completed, and orders each group', () => {
        const a = project('in_progress', { name: 'Bravo' });
        const b = project('in_progress', { name: 'Alpha' });
        const stalled = project('intake_pending', { name: 'Zulu' });
        const done = project('completed');
        const idea = project('idea');
        const g = group(
            [
                { p: a, f: EMPTY_FACTS },
                { p: b, f: facts({ milestones: [{ name: 'Launch', due: '2026-11-20', done: false }] }) },
                { p: stalled, f: facts({ log: [{ at: '2026-10-01', kind: 'token', text: 'sent' }] }) },
                { p: done, f: EMPTY_FACTS },
                { p: idea, f: EMPTY_FACTS },
            ],
            TODAY,
        );
        // Stalled first, then the dated milestone, then the undated.
        expect(g.mine.map((r) => r.p.name)).toEqual(['Zulu', 'Alpha', 'Bravo']);
        expect(g.parked.map((r) => r.p.id)).toEqual([idea.id]);
        expect(g.done.map((r) => r.p.id)).toEqual([done.id]);
        expect(g.theirs).toEqual([]);
    });

    it('searches name, client name and company', () => {
        const p = project('planning', { name: 'Riad booking' });
        expect(matches(p, 'BOOK')).toBe(true);
        expect(matches(p, 'zerhoun')).toBe(true);
        expect(matches(p, 'atlas')).toBe(false);
        expect(matches({ ...p, client: null }, 'zerhoun')).toBe(false);
    });

    it('counts the pipeline in funnel order, skipping empty stages', () => {
        const ps = [project('in_progress'), project('idea'), project('in_progress'), project('review')];
        expect(pipeline(ps)).toEqual([
            { status: 'idea', n: 1 },
            { status: 'in_progress', n: 2 },
            { status: 'review', n: 1 },
        ]);
    });

    it('the strip sums money and finds the soonest milestone; empty when nothing is known', () => {
        expect(position([{ p: project('planning'), f: EMPTY_FACTS }], TODAY)).toEqual({ owed: 0, owedCount: 0, late: 0, active: 0, soonest: null });
        const pos = position(
            [
                { p: project('in_progress'), f: facts({ money: { value: 50000, invoiced: 25000, outstanding: 10000, dueOn: '2026-11-01' }, milestones: [{ name: 'Launch', due: '2026-11-11', done: false }] }) },
                { p: project('on_hold'), f: facts({ money: { value: 9000, invoiced: 9000, outstanding: 0, dueOn: null } }) },
            ],
            TODAY,
        );
        expect(pos).toEqual({ owed: 10000, owedCount: 1, late: 10000, active: 50000, soonest: { name: 'Launch', due: { txt: 'in 4 days', state: 'soon' } } });
    });
});

describe('the record', () => {
    it('ranks its clock exactly as the list does: late money, then silence, then the milestone', () => {
        const p = project('intake_pending');
        const late = facts({ money: { value: 9000, invoiced: 9000, outstanding: 4000, dueOn: '2026-10-29' }, log: [{ at: '2026-10-01', kind: 'mail', text: 'Intake sent' }] });
        expect(recordClock(p, late, TODAY)).toEqual({ label: 'Attention', kind: 'late', days: 9 });
        const silent = facts({ log: [{ at: '2026-11-01', kind: 'mail', text: 'Intake sent' }] });
        expect(recordClock(p, silent, TODAY)).toEqual({ label: 'Attention', kind: 'silent', days: 6 });
        const b = project('in_progress');
        expect(recordClock(b, EMPTY_FACTS, TODAY)).toEqual({ label: 'Next milestone', kind: 'none' });
        expect(recordClock(b, facts({ milestones: [{ name: 'Mockups', due: null, done: false }] }), TODAY).kind).toBe('undated');
        expect(recordClock(b, facts({ milestones: [{ name: 'Mockups', due: '2026-11-09', done: false }] }), TODAY)).toEqual({ label: 'Next milestone', kind: 'due', due: { txt: 'in 2 days', state: 'soon' } });
    });

    it('initials: the deliverable after the dash, letters only, two at most', () => {
        expect(initials('Villa Zerhoun — Site vitrine')).toBe('SV');
        expect(initials('Café Andalou')).toBe('CA');
        expect(initials('Studio')).toBe('S');
        expect(initials('2026 — ')).toBe('');
    });
});
