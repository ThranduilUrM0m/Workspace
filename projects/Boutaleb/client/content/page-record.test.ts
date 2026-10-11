import { pickLocale, type PageRecord } from './page-record';

const copy = (title: string) => ({ title, description: `${title}.`, blocks: {} });

describe('pickLocale', () => {
    it('renders the URL language when it exists', () => {
        const record: PageRecord<object> = { id: 'a', kind: 'page', slug: '/a', locales: { fr: copy('Fr'), en: copy('En') } };
        expect(pickLocale(record, 'en')).toMatchObject({ lang: 'en', translated: ['fr', 'en'] });
    });

    it('falls back to French, then English, and says which', () => {
        const both: PageRecord<object> = { id: 'a', kind: 'page', slug: '/a', locales: { fr: copy('Fr'), en: copy('En') } };
        expect(pickLocale(both, 'ar').lang).toBe('fr');
        const english: PageRecord<object> = { id: 'b', kind: 'page', slug: '/b', locales: { en: copy('En') } };
        expect(pickLocale(english, 'fr')).toMatchObject({ lang: 'en', translated: ['en'] });
    });

    it('refuses a record with no copy at all', () => {
        expect(() => pickLocale({ id: 'c', kind: 'page', slug: '/c', locales: {} }, 'fr')).toThrow('no copy');
    });
});
