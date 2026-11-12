import { activeHref, FOOT, initials, NAV, visibleNav, type NavItem } from './nav';

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

describe('visibleNav', () => {
    const labels = (items: NavItem[]) => items.map((i) => ('group' in i ? `#${i.group}` : 'sub' in i ? `${i.label}[${i.sub.map((s) => s.label).join(',')}]` : i.label));
    const only = (...sections: string[]) => (s: string) => sections.includes(s);

    it('the owner, who can view everything, sees the whole taxonomy', () => {
        expect(visibleNav(NAV, () => true)).toEqual(NAV);
        expect(visibleNav(FOOT, () => true)).toEqual(FOOT);
    });

    it('a helper on projects only keeps Workspace, drops Business and Content headings with nothing under them', () => {
        expect(labels(visibleNav(NAV, only('projects')))).toEqual(['#Workspace', 'Dashboard', 'Work', 'Projects']);
    });

    it('Settings keeps Preferences for every member, and the rest only with the settings section', () => {
        expect(labels(visibleNav(FOOT, only()))).toEqual(['#System', 'Settings[Preferences]']);
        expect(labels(visibleNav(FOOT, only('settings')))).toEqual(['#System', 'Settings[Business,People,Automations,Preferences,Activity]']);
    });

    it('a parent whose own section is out of reach goes, subs and all', () => {
        expect(labels(visibleNav(NAV, only('finance')))).toEqual(['#Workspace', 'Dashboard', '#Business', 'Finance[Invoices,Expenses,Period]']);
    });
});
