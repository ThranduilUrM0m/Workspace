import { abilityFor } from './abilities.js';

describe('abilityFor', () => {
    it('lets the owner do everything', () => {
        const a = abilityFor({ owner: true, levels: {}, rights: {} });
        expect(a.can('edit', 'settings')).toBe(true);
        expect(a.can('issueInvoices', 'finance')).toBe(true);
    });

    it('gives nothing by default', () => {
        const a = abilityFor({ levels: {}, rights: {} });
        expect(a.can('view', 'projects')).toBe(false);
    });

    it('reads View as view only and Edit as both', () => {
        const a = abilityFor({ levels: { clients: 'view', projects: 'edit' }, rights: {} });
        expect(a.can('view', 'clients')).toBe(true);
        expect(a.can('edit', 'clients')).toBe(false);
        expect(a.can('view', 'projects')).toBe(true);
        expect(a.can('edit', 'projects')).toBe(true);
        expect(a.can('view', 'finance')).toBe(false);
    });

    it('grants a right only with Edit on its section', () => {
        expect(abilityFor({ levels: { finance: 'view' }, rights: { issueInvoices: true } }).can('issueInvoices', 'finance')).toBe(false);
        expect(abilityFor({ levels: { finance: 'edit' }, rights: { issueInvoices: true } }).can('issueInvoices', 'finance')).toBe(true);
        expect(abilityFor({ levels: { finance: 'edit' }, rights: {} }).can('issueInvoices', 'finance')).toBe(false);
    });

    it('never lets Edit imply a right', () => {
        const a = abilityFor({ levels: { content: 'edit' }, rights: {} });
        expect(a.can('publishContent', 'content')).toBe(false);
    });
});
