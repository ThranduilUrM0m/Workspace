import type { ClientRow } from '@repo/schemas';
import { drift, group, silence, standing, turn, verb } from './derive';

const TODAY = '2026-11-14';

let seq = 0;
function client(over: Partial<ClientRow> = {}): ClientRow {
    seq += 1;
    return {
        id: String(seq).padStart(24, '0'),
        name: `Client ${seq}`,
        company: `Co ${seq}`,
        email: `c${seq}@example.ma`,
        status: 'lead',
        language: 'fr',
        self: false,
        phone: null,
        website: null,
        since: '2026-10-01',
        projects: [],
        lastTheirs: null,
        firstContact: null,
        contacts: 0,
        ...over,
    };
}
const p = (status: ClientRow['projects'][number]['status']) => ({ id: 'p', name: 'P', status });

describe('standing and drift', () => {
    it('lead until something is signed; live while signed work moves; past after', () => {
        expect(standing(client({ projects: [p('intake_pending')] }))).toBe('lead');
        expect(standing(client({ projects: [p('in_progress'), p('completed')] }))).toBe('live');
        expect(standing(client({ projects: [p('completed')] }))).toBe('past');
    });

    it('shows drift when the stored word disagrees with the work', () => {
        expect(drift(client({ status: 'active', projects: [p('completed')] }))).toBe(true);
        expect(drift(client({ status: 'active', projects: [p('review')] }))).toBe(false);
        expect(drift(client({ self: true, status: 'active' }))).toBe(false);
    });
});

describe('silence and whose turn', () => {
    it('their reply stops the clock; never answered counts from the first entry; nothing logged is null', () => {
        expect(silence(client({ lastTheirs: '2026-11-10', firstContact: '2026-10-01' }), TODAY)).toBe(4);
        expect(silence(client({ firstContact: '2026-11-01' }), TODAY)).toBe(13);
        expect(silence(client(), TODAY)).toBeNull();
    });

    it('a lead needs you after 7 quiet days or if never contacted; a live client after 21', () => {
        expect(turn(client({ lastTheirs: '2026-11-10' }), TODAY)).toBe('ok');
        expect(turn(client({ lastTheirs: '2026-11-07' }), TODAY)).toBe('mine');
        expect(turn(client(), TODAY)).toBe('mine');
        const busy = { projects: [p('in_progress')] };
        expect(turn(client({ ...busy, lastTheirs: '2026-11-01' }), TODAY)).toBe('ok');
        expect(turn(client({ ...busy, lastTheirs: '2026-10-20' }), TODAY)).toBe('mine');
        expect(turn(client({ projects: [p('completed')] }), TODAY)).toBe('none');
        expect(turn(client({ self: true }), TODAY)).toBe('ok');
    });

    it('needs you ranks the longest silence first; the verb starts a project for an empty lead', () => {
        const never = client({ name: 'Never' });
        const long = client({ name: 'Long', lastTheirs: '2026-10-01' });
        const short = client({ name: 'Short', lastTheirs: '2026-11-01' });
        expect(group([short, long, never], TODAY).mine.map((c) => c.name)).toEqual(['Never', 'Long', 'Short']);
        expect(verb(never, TODAY)?.label).toBe('Start project');
        expect(verb(client({ projects: [p('intake_pending')] }), TODAY)?.label).toBe('Chase');
        expect(verb(client({ lastTheirs: TODAY }), TODAY)).toBeNull();
    });
});
