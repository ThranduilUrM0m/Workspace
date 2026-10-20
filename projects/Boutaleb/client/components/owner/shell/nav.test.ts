import { activeHref, FOOT, initials, NAV } from './nav';

describe('activeHref', () => {
    it('marks the dashboard only on /app itself', () => {
        expect(activeHref('/app')).toBe('/app');
        expect(activeHref('/app/unknown')).toBeUndefined();
    });

    it('marks a section on its own page and on its records', () => {
        expect(activeHref('/app/projects')).toBe('/app/projects');
        expect(activeHref('/app/projects/abc123')).toBe('/app/projects');
        expect(activeHref('/app/finance/invoices/FAC-2026-0001')).toBe('/app/finance/invoices');
    });

    it('does not mistake a prefix for a parent', () => {
        expect(activeHref('/app/projectsx')).toBeUndefined();
    });
});

describe('the taxonomy', () => {
    it('fits the rail: nine entries and three groups above System', () => {
        const top = NAV.filter((i) => !('group' in i));
        expect(top).toHaveLength(9);
        expect(NAV.filter((i) => 'group' in i).map((g) => (g as { group: string }).group)).toEqual(['Workspace', 'Business', 'Content']);
        expect(FOOT.some((i) => 'group' in i && i.group === 'System')).toBe(true);
    });
});

describe('initials', () => {
    it('takes up to two', () => {
        expect(initials('Zakariae Boutaleb')).toBe('ZB');
        expect(initials('zakariaeboutaleb')).toBe('Z');
        expect(initials('  ')).toBe('');
    });
});
