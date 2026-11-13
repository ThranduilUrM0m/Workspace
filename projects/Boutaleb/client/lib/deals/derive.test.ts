import type { DealView } from '@repo/schemas';
import { group, kind, matches, next, overdue, pipeline, turn, wait } from './derive';

const TODAY = '2026-11-13';

let seq = 0;
function deal(over: Partial<DealView> = {}): DealView {
    seq += 1;
    return {
        id: String(seq).padStart(24, '0'),
        title: `Deal ${seq}`,
        stage: 'lead',
        source: 'site',
        value: null,
        priced: false,
        opened: '2026-11-01',
        sent: null,
        decided: null,
        lostWhy: null,
        note: null,
        client: {
            id: 'c'.repeat(24),
            name: 'Sara Alaoui',
            company: 'Atlas Riads',
            email: 'sara@atlas.ma',
            language: 'fr',
            self: false,
        },
        enquiry: null,
        ...over,
    };
}

describe('whose turn, and the verb', () => {
    it('a lead is always yours: draft the proposal', () => {
        const d = deal();
        expect(turn(d, TODAY)).toBe('mine');
        expect(next(d, TODAY)).toBe('Draft proposal');
        expect(wait(d, TODAY)).toBeNull();
    });

    it('a sent proposal is theirs for 7 days, then yours to chase', () => {
        const fresh = deal({ stage: 'proposal', sent: '2026-11-08', priced: true, value: 1 });
        expect(turn(fresh, TODAY)).toBe('theirs');
        expect(next(fresh, TODAY)).toBeNull();
        const stale = deal({ stage: 'proposal', sent: '2026-11-06', priced: true, value: 1 });
        expect(turn(stale, TODAY)).toBe('mine');
        expect(overdue(stale, TODAY)).toBe(true);
        expect(next(stale, TODAY)).toBe('Chase reply');
    });

    it('a contract gets 5 days; an unsent one is late in your own drawer', () => {
        expect(next(deal({ stage: 'contract', sent: '2026-11-08' }), TODAY)).toBe(
            'Chase signature'
        );
        const drawer = deal({ stage: 'contract' });
        expect(next(drawer, TODAY)).toBe('Send contract');
        expect(overdue(drawer, TODAY)).toBe(false);
    });

    it('closed deals have no verb and no turn', () => {
        expect(turn(deal({ stage: 'won', decided: TODAY }), TODAY)).toBe('closed');
        expect(next(deal({ stage: 'lost', decided: TODAY }), TODAY)).toBeNull();
    });
});

describe('the list', () => {
    it('your move ranks rot first, then age; closed newest first', () => {
        const young = deal({ opened: '2026-11-10' });
        const old = deal({ opened: '2026-10-01' });
        const rotting = deal({ stage: 'proposal', sent: '2026-10-20' });
        const lostOld = deal({ stage: 'lost', decided: '2026-09-01' });
        const lostNew = deal({ stage: 'lost', decided: '2026-11-01' });
        const g = group([young, old, rotting, lostOld, lostNew], TODAY);
        expect(g.mine.map((d) => d.id)).toEqual([rotting.id, old.id, young.id]);
        expect(g.closed.map((d) => d.id)).toEqual([lostNew.id, lostOld.id]);
    });

    it('the pipeline counts open deals; no number counts as nothing and is counted apart', () => {
        const p = pipeline([
            deal({ value: 10_000 }),
            deal({ value: 5_000, priced: true, stage: 'proposal' }),
            deal(),
            deal({ stage: 'won', value: 99_000, priced: true }),
        ]);
        expect(p).toEqual({ count: 3, value: 15_000, priced: 5_000, unvalued: 1 });
    });

    it('filters by title, client name or company', () => {
        const d = deal({ title: 'Spa site and booking' });
        expect(matches(d, 'spa')).toBe(true);
        expect(matches(d, 'atlas')).toBe(true);
        expect(matches(d, 'zellige')).toBe(false);
    });

    it('says what kind of number it is', () => {
        expect(kind(deal())).toBe('estimate');
        expect(kind(deal({ priced: true, stage: 'proposal' }))).toBe('offered');
        expect(kind(deal({ priced: true, stage: 'won' }))).toBe('agreed');
    });
});
